import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { executeAndEvaluate, formatAPIResponse } from './services/executionService.js';
import { buildDockerImages } from './utils/codeRunner.js';
import { executionConfig } from './config/docker-config.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'codezy-execution-service',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/execute
 * Execute code with test cases and structural constraints
 * 
 * Body:
 * {
 *   code: string,
 *   language: 'python' | 'java' | 'cpp',
 *   testCases: Array<{input, expectedOutput, comparisonMode, isHidden}>,
 *   structuralConstraints: Array<{type, construct, specifics}>,
 *   taskMarks: number (optional, default 10)
 * }
 */
app.post('/api/execute', async (req, res) => {
  try {
    const { code, language, testCases, structuralConstraints, taskMarks } = req.body;

    // Validation
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code and language'
      });
    }

    if (!['python', 'java', 'cpp'].includes(language)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language. Must be python, java, or cpp'
      });
    }

    console.log(`[${new Date().toISOString()}] Executing ${language} code...`);
    console.log(`  Test cases: ${testCases?.length || 0}`);
    console.log(`  Structural constraints: ${structuralConstraints?.length || 0}`);

    // Execute and evaluate
    const results = await executeAndEvaluate({
      code,
      language,
      testCases: testCases || [],
      structuralConstraints: structuralConstraints || [],
      taskMarks: taskMarks || 10
    });

    // Format response
    const response = formatAPIResponse(results);
    
    console.log(`  Result: ${response.score}/${response.maxScore}`);

    res.json(response);

  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      terminal: `Error: ${error.message}`
    });
  }
});

/**
 * POST /api/execute/quick
 * Quick execution without test cases (for testing/debugging)
 * 
 * Body:
 * {
 *   code: string,
 *   language: 'python' | 'java' | 'cpp',
 *   input: string (optional)
 * }
 */
app.post('/api/execute/quick', async (req, res) => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code and language'
      });
    }

    if (!['python', 'java', 'cpp'].includes(language)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language. Must be python, java, or cpp'
      });
    }

    console.log(`[${new Date().toISOString()}] Quick execution: ${language}`);

    const { executeCode } = await import('./utils/codeRunner.js');
    const result = await executeCode(language, code, input || '');

    res.json({
      success: result.exitCode === 0 && !result.error,
      output: result.stdout,
      error: result.stderr || result.error,
      exitCode: result.exitCode,
      executionTime: result.executionTime
    });

  } catch (error) {
    console.error('Quick execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/languages
 * Get supported languages
 */
app.get('/api/languages', (req, res) => {
  res.json({
    languages: [
      { id: 'python', name: 'Python', version: '3.11' },
      { id: 'java', name: 'Java', version: '17' },
      { id: 'cpp', name: 'C++', version: 'C++17' }
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Initialize and start server
async function start() {
  try {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║   Codezy Code Execution Service                    ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('');
    
    // Build Docker images
    console.log('Building Docker images...');
    await buildDockerImages();
    console.log('');
    
    // Start server
    const port = executionConfig.port;
    app.listen(port, () => {
      console.log('✓ Service started successfully!');
      console.log('');
      console.log(`  Local:    http://localhost:${port}`);
      console.log(`  Health:   http://localhost:${port}/health`);
      console.log('');
      console.log('Endpoints:');
      console.log(`  POST /api/execute        - Full execution with evaluation`);
      console.log(`  POST /api/execute/quick  - Quick execution without tests`);
      console.log(`  GET  /api/languages      - List supported languages`);
      console.log('');
      console.log('Ready to execute code! 🚀');
      console.log('════════════════════════════════════════════════════');
    });
    
  } catch (error) {
    console.error('Failed to start service:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the service
start();
