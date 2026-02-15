/**
 * Main Execution Service
 * Orchestrates code execution, test case evaluation, and structural analysis
 */

import { executeCode } from '../utils/codeRunner.js';
import { evaluateAllTestCases, calculateTestCaseScore } from './testCaseEvaluator.js';
import { analyzeStructure, calculateStructuralScore } from './structuralAnalyzer.js';

/**
 * Execute code and evaluate against test cases and structural constraints
 * @param {Object} params - Execution parameters
 * @returns {Promise<Object>} Complete evaluation results with score
 */
export async function executeAndEvaluate({
  code,
  language,
  testCases = [],
  structuralConstraints = [],
  taskMarks = 10
}) {
  const results = {
    success: true,
    language,
    executedAt: new Date().toISOString(),
    testCases: {
      results: [],
      score: 0,
      passed: 0,
      failed: 0,
      total: 0
    },
    structural: {
      results: [],
      score: 0,
      passed: 0,
      failed: 0,
      total: 0
    },
    finalScore: 0,
    maxScore: 10,
    output: '',
    error: null
  };

  try {
    // 1. Structural Analysis (before execution)
    if (structuralConstraints.length > 0) {
      const structuralResults = analyzeStructure(code, language, structuralConstraints);
      const structuralScoreData = calculateStructuralScore(structuralResults);
      
      results.structural.results = structuralResults;
      results.structural.score = structuralScoreData.score;
      results.structural.passed = structuralScoreData.passed;
      results.structural.failed = structuralScoreData.failed;
      results.structural.total = structuralScoreData.total;
    }

    // 2. Test Case Evaluation (with execution)
    if (testCases.length > 0) {
      // Create execution function for test cases
      const executeWithInput = async (input) => {
        return await executeCode(language, code, input);
      };

      const testCaseResults = await evaluateAllTestCases(testCases, executeWithInput);
      const testCaseScoreData = calculateTestCaseScore(testCaseResults);
      
      results.testCases.results = testCaseResults;
      results.testCases.score = testCaseScoreData.score;
      results.testCases.passed = testCaseScoreData.passed;
      results.testCases.failed = testCaseScoreData.failed;
      results.testCases.total = testCaseScoreData.total;
      
      // Capture output from first test case for display
      if (testCaseResults.length > 0) {
        results.output = testCaseResults[0].actualOutput;
      }
    } else {
      // If no test cases, just run the code once
      const execution = await executeCode(language, code, '');
      results.output = execution.stdout || execution.stderr;
      
      if (execution.error || execution.exitCode !== 0) {
        results.error = execution.error || 'Runtime error';
        results.success = false;
      }
    }

    // 3. Calculate Final Score (out of 10)
    results.finalScore = calculateFinalScore(
      results.testCases.score,
      results.structural.score,
      testCases.length,
      structuralConstraints.length
    );
    
    results.maxScore = 10;

  } catch (error) {
    results.success = false;
    results.error = error.message;
    results.output = error.message;
  }

  return results;
}

/**
 * Calculate final score out of 10
 * Weighted average: 70% test cases, 30% structural constraints
 */
function calculateFinalScore(testCaseScore, structuralScore, testCaseCount, structuralCount) {
  // If only test cases exist
  if (testCaseCount > 0 && structuralCount === 0) {
    return Math.round(testCaseScore * 10 * 10) / 10;
  }
  
  // If only structural constraints exist
  if (structuralCount > 0 && testCaseCount === 0) {
    return Math.round(structuralScore * 10 * 10) / 10;
  }
  
  // Both exist: weighted average (70% functional, 30% structural)
  if (testCaseCount > 0 && structuralCount > 0) {
    const weighted = (testCaseScore * 0.7) + (structuralScore * 0.3);
    return Math.round(weighted * 10 * 10) / 10;
  }
  
  // Nothing to evaluate
  return 0;
}

/**
 * Format results for terminal display
 */
export function formatTerminalOutput(results) {
  const lines = [];
  
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('              CODE EXECUTION RESULTS');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');
  
  // Output Section
  if (results.output) {
    lines.push('📤 OUTPUT:');
    lines.push('───────────────────────────────────────────────────────');
    lines.push(results.output);
    lines.push('───────────────────────────────────────────────────────');
    lines.push('');
  }
  
  // Error Section
  if (results.error) {
    lines.push('❌ ERROR:');
    lines.push('───────────────────────────────────────────────────────');
    lines.push(results.error);
    lines.push('───────────────────────────────────────────────────────');
    lines.push('');
  }
  
  // Test Cases Section
  if (results.testCases.total > 0) {
    lines.push('🧪 TEST CASES:');
    lines.push('───────────────────────────────────────────────────────');
    
    results.testCases.results.forEach((tc, idx) => {
      const status = tc.passed ? '✓ PASSED' : '✗ FAILED';
      const icon = tc.passed ? '✅' : '❌';
      
      lines.push(`${icon} Test Case ${idx + 1}: ${status}`);
      
      if (!tc.isHidden) {
        lines.push(`   Input: ${tc.input || '(empty)'}`);
        lines.push(`   Expected: ${tc.expectedOutput}`);
        lines.push(`   Got: ${tc.actualOutput}`);
      } else {
        lines.push(`   [Hidden Test Case]`);
      }
      
      lines.push(`   ${tc.message}`);
      lines.push('');
    });
    
    lines.push(`Summary: ${results.testCases.passed}/${results.testCases.total} passed`);
    lines.push('───────────────────────────────────────────────────────');
    lines.push('');
  }
  
  // Structural Constraints Section
  if (results.structural.total > 0) {
    lines.push('🏗️  STRUCTURAL CONSTRAINTS:');
    lines.push('───────────────────────────────────────────────────────');
    
    results.structural.results.forEach((sc) => {
      const status = sc.passed ? '✓ PASSED' : '✗ FAILED';
      const icon = sc.passed ? '✅' : '❌';
      
      lines.push(`${icon} ${sc.constraint} (${sc.type}): ${status}`);
      lines.push(`   ${sc.message}`);
      lines.push('');
    });
    
    lines.push(`Summary: ${results.structural.passed}/${results.structural.total} passed`);
    lines.push('───────────────────────────────────────────────────────');
    lines.push('');
  }
  
  // Final Score
  lines.push('🎯 FINAL SCORE:');
  lines.push('───────────────────────────────────────────────────────');
  lines.push(`   ${results.finalScore} / ${results.maxScore}`);
  
  // Score breakdown
  if (results.testCases.total > 0 && results.structural.total > 0) {
    lines.push('');
    lines.push('   Breakdown:');
    lines.push(`   • Test Cases (70%): ${(results.testCases.score * 7).toFixed(1)}/7.0`);
    lines.push(`   • Structural (30%): ${(results.structural.score * 3).toFixed(1)}/3.0`);
  }
  
  lines.push('═══════════════════════════════════════════════════════');
  
  return lines.join('\n');
}

/**
 * Format results for JSON API response
 */
export function formatAPIResponse(results) {
  return {
    success: results.success,
    score: results.finalScore,
    maxScore: results.maxScore,
    output: results.output,
    error: results.error,
    testCases: {
      passed: results.testCases.passed,
      failed: results.testCases.failed,
      total: results.testCases.total,
      details: results.testCases.results.map(tc => ({
        index: tc.testCaseIndex,
        passed: tc.passed,
        message: tc.message,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: tc.actualOutput,
        hidden: tc.isHidden,
        executionTime: tc.executionTime
      }))
    },
    structural: {
      passed: results.structural.passed,
      failed: results.structural.failed,
      total: results.structural.total,
      details: results.structural.results.map(sc => ({
        constraint: sc.constraint,
        type: sc.type,
        count: sc.count,
        passed: sc.passed,
        message: sc.message
      }))
    },
    terminal: formatTerminalOutput(results)
  };
}
