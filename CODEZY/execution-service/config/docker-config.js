import dotenv from 'dotenv';
dotenv.config();

export const dockerConfig = {
  // Docker images to use (will be built from Dockerfiles)
  images: {
    python: 'codezy-python-runner:latest',
    java: 'codezy-java-runner:latest',
    cpp: 'codezy-cpp-runner:latest'
  },

  // Resource limits for containers
  limits: {
    memory: process.env.MEMORY_LIMIT || '256m',
    cpus: process.env.CPU_LIMIT || '1.0',
    timeout: parseInt(process.env.EXECUTION_TIMEOUT) || 30000, // milliseconds
    pids: 50 // max processes
  },

  // Security settings
  security: {
    networkDisabled: process.env.ENABLE_NETWORK !== 'true',
    readOnlyRootfs: true,
    capDrop: ['ALL'], // Drop all capabilities
    securityOpt: ['no-new-privileges'],
    maxCodeSize: parseInt(process.env.MAX_CODE_SIZE) || 50000 // bytes
  },

  // Container naming
  containerPrefix: 'codezy-exec-'
};

export const executionConfig = {
  port: process.env.PORT || 5001,
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000'
};
