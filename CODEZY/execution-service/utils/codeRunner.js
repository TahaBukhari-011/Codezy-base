import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import { dockerConfig } from '../config/docker-config.js';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

const docker = new Docker();

/**
 * Execute code in a Docker container with strict resource limits
 * @param {string} language - 'python', 'java', or 'cpp'
 * @param {string} code - Source code to execute
 * @param {string} stdin - Input to provide to the program
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number, error: null|string}>}
 */
export async function executeCode(language, code, stdin = '') {
  const executionId = uuidv4();
  const containerName = `${dockerConfig.containerPrefix}${executionId}`;
  
  let container = null;
  let tempDir = null;

  try {
    // Validate code size
    if (code.length > dockerConfig.security.maxCodeSize) {
      throw new Error(`Code exceeds maximum size of ${dockerConfig.security.maxCodeSize} bytes`);
    }

    // Create temporary directory for code
    tempDir = path.join(os.tmpdir(), `codezy-${executionId}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Get execution details based on language
    const execDetails = await getExecutionDetails(language, code, tempDir, stdin);

    // Create container
    container = await docker.createContainer({
      Image: dockerConfig.images[language],
      name: containerName,
      Cmd: execDetails.cmd,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      HostConfig: {
        Memory: parseMemoryLimit(dockerConfig.limits.memory),
        NanoCpus: dockerConfig.limits.cpus * 1e9,
        PidsLimit: dockerConfig.limits.pids,
        NetworkMode: dockerConfig.security.networkDisabled ? 'none' : 'bridge',
        ReadonlyRootfs: false, // Need writable for compilation
        CapDrop: dockerConfig.security.capDrop,
        SecurityOpt: dockerConfig.security.securityOpt,
        AutoRemove: true,
        Binds: execDetails.binds
      },
      WorkingDir: '/app'
    });

    // Attach to container output streams BEFORE starting
    const stream = await container.attach({
      stream: true,
      stdout: true,
      stderr: true
    });

    // Collect output
    let outputBuffer = Buffer.alloc(0);
    stream.on('data', (chunk) => {
      outputBuffer = Buffer.concat([outputBuffer, chunk]);
    });

    // Start container (stdin embedded in command)
    await container.start();

    // Wait for execution with timeout
    const result = await Promise.race([
      waitForContainer(container),
      timeout(dockerConfig.limits.timeout)
    ]);

    // Wait a bit for stream to flush
    await new Promise(resolve => setTimeout(resolve, 100));

    // Parse collected output
    const output = parseDockerLogs(outputBuffer);

    return {
      stdout: output.stdout,
      stderr: output.stderr,
      exitCode: result.StatusCode,
      executionTime: result.executionTime,
      error: null
    };

  } catch (error) {
    return {
      stdout: '',
      stderr: error.message,
      exitCode: -1,
      executionTime: 0,
      error: error.message
    };
  } finally {
    // Cleanup
    try {
      if (container) {
        await container.remove({ force: true }).catch(() => {});
      }
      if (tempDir) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
}

/**
 * Get execution command and bindings based on language
 */
async function getExecutionDetails(language, code, tempDir, stdin = '') {
  // Escape stdin for shell (replace single quotes)
  const escapedStdin = stdin.replace(/'/g, "'\\''");
  const stdinCmd = stdin ? `printf '%s\\n' '${escapedStdin}' | ` : '';

  switch (language) {
    case 'python':
      const pythonFile = path.join(tempDir, 'main.py');
      await fs.writeFile(pythonFile, code);
      return {
        cmd: ['/bin/sh', '-c', `${stdinCmd}python3 /app/main.py`],
        binds: [`${pythonFile}:/app/main.py:ro`]
      };

    case 'java':
      // Extract class name from code
      const classNameMatch = code.match(/public\s+class\s+(\w+)/);
      const className = classNameMatch ? classNameMatch[1] : 'Main';
      const javaFile = path.join(tempDir, `${className}.java`);
      await fs.writeFile(javaFile, code);
      return {
        cmd: ['/bin/sh', '-c', `cp /app/${className}.java /tmp/ && cd /tmp && javac ${className}.java && ${stdinCmd}java ${className}`],
        binds: [`${javaFile}:/app/${className}.java:ro`]
      };

    case 'cpp':
      const cppFile = path.join(tempDir, 'main.cpp');
      await fs.writeFile(cppFile, code);
      return {
        cmd: ['/bin/sh', '-c', `g++ -o /tmp/main /app/main.cpp && ${stdinCmd}/tmp/main`],
        binds: [`${cppFile}:/app/main.cpp:ro`]
      };

    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

/**
 * Wait for container to finish execution
 */
async function waitForContainer(container) {
  const startTime = Date.now();
  const result = await container.wait();
  const executionTime = Date.now() - startTime;
  return { ...result, executionTime };
}

/**
 * Timeout promise
 */
function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Execution timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Parse Docker logs (they come with headers)
 */
function parseDockerLogs(buffer) {
  let stdout = '';
  let stderr = '';
  
  let offset = 0;
  while (offset < buffer.length) {
    // Docker log format: [8 bytes header][payload]
    const header = buffer.slice(offset, offset + 8);
    if (header.length < 8) break;
    
    const streamType = header[0]; // 1=stdout, 2=stderr
    const payloadLength = header.readUInt32BE(4);
    const payload = buffer.slice(offset + 8, offset + 8 + payloadLength).toString('utf8');
    
    if (streamType === 1) {
      stdout += payload;
    } else if (streamType === 2) {
      stderr += payload;
    }
    
    offset += 8 + payloadLength;
  }
  
  return { stdout: stdout.trim(), stderr: stderr.trim() };
}

/**
 * Parse memory limit string to bytes
 */
function parseMemoryLimit(memStr) {
  const units = { k: 1024, m: 1024 ** 2, g: 1024 ** 3 };
  const match = memStr.toLowerCase().match(/^(\d+)([kmg]?)$/);
  if (!match) return 256 * 1024 * 1024; // default 256MB
  return parseInt(match[1]) * (units[match[2]] || 1);
}

/**
 * Escape code for shell execution
 */
function escapeCode(code) {
  return code.replace(/'/g, "'\\''").replace(/\n/g, '\\n');
}

/**
 * Build Docker images (should be run on service startup)
 */
export async function buildDockerImages() {
  const languages = ['python', 'java', 'cpp'];
  
  console.log('Building Docker images for code execution...');
  
  for (const lang of languages) {
    try {
      const dockerfilePath = path.resolve(`./dockerfiles/Dockerfile.${lang}`);
      const imageName = dockerConfig.images[lang];
      
      console.log(`Building ${imageName}...`);
      
      const stream = await docker.buildImage({
        context: path.dirname(dockerfilePath),
        src: [path.basename(dockerfilePath)]
      }, {
        t: imageName,
        dockerfile: path.basename(dockerfilePath)
      });

      // Wait for build to complete
      await new Promise((resolve, reject) => {
        docker.modem.followProgress(stream, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
      
      console.log(`✓ ${imageName} built successfully`);
    } catch (error) {
      console.error(`✗ Failed to build ${lang} image:`, error.message);
      throw error;
    }
  }
  
  console.log('All Docker images built successfully!');
}
