/**
 * Test Case Evaluator
 * Compares actual output with expected output using different comparison modes
 */

/**
 * Evaluate a single test case
 * @param {string} actualOutput - Output from code execution
 * @param {string} expectedOutput - Expected output
 * @param {string} comparisonMode - 'Exact', 'IgnoreWhitespace', or 'Regex'
 * @returns {{passed: boolean, message: string}}
 */
export function evaluateTestCase(actualOutput, expectedOutput, comparisonMode = 'Exact') {
  try {
    switch (comparisonMode) {
      case 'Exact':
        return evaluateExact(actualOutput, expectedOutput);
      
      case 'IgnoreWhitespace':
        return evaluateIgnoreWhitespace(actualOutput, expectedOutput);
      
      case 'Regex':
        return evaluateRegex(actualOutput, expectedOutput);
      
      default:
        return {
          passed: false,
          message: `Unknown comparison mode: ${comparisonMode}`
        };
    }
  } catch (error) {
    return {
      passed: false,
      message: `Evaluation error: ${error.message}`
    };
  }
}

/**
 * Exact string comparison
 */
function evaluateExact(actual, expected) {
  const passed = actual === expected;
  return {
    passed,
    message: passed 
      ? 'Output matches exactly' 
      : `Expected: "${expected}"\nGot: "${actual}"`
  };
}

/**
 * Compare ignoring whitespace differences
 */
function evaluateIgnoreWhitespace(actual, expected) {
  const normalizeWhitespace = (str) => {
    return str
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  };
  
  const normalizedActual = normalizeWhitespace(actual);
  const normalizedExpected = normalizeWhitespace(expected);
  const passed = normalizedActual === normalizedExpected;
  
  return {
    passed,
    message: passed 
      ? 'Output matches (whitespace ignored)' 
      : `Expected (normalized): "${normalizedExpected}"\nGot (normalized): "${normalizedActual}"`
  };
}

/**
 * Regex pattern matching
 */
function evaluateRegex(actual, pattern) {
  try {
    const regex = new RegExp(pattern);
    const passed = regex.test(actual);
    
    return {
      passed,
      message: passed 
        ? 'Output matches regex pattern' 
        : `Output doesn't match pattern: ${pattern}`
    };
  } catch (error) {
    return {
      passed: false,
      message: `Invalid regex pattern: ${error.message}`
    };
  }
}

/**
 * Evaluate all test cases for a task
 * @param {Array} testCases - Array of test case objects
 * @param {Function} executeFunction - Function that executes code with input
 * @returns {Promise<Array>} Results for each test case
 */
export async function evaluateAllTestCases(testCases, executeFunction) {
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    try {
      // Execute code with test case input
      const execution = await executeFunction(testCase.input || '');
      
      // Check for execution errors
      if (execution.error || execution.exitCode !== 0) {
        results.push({
          testCaseIndex: i,
          passed: false,
          input: testCase.isHidden ? '[Hidden]' : testCase.input,
          expectedOutput: testCase.isHidden ? '[Hidden]' : testCase.expectedOutput,
          actualOutput: execution.stdout || execution.stderr,
          message: execution.error || 'Runtime error',
          executionTime: execution.executionTime,
          isHidden: testCase.isHidden
        });
        continue;
      }
      
      // Evaluate output
      const evaluation = evaluateTestCase(
        execution.stdout,
        testCase.expectedOutput,
        testCase.comparisonMode
      );
      
      results.push({
        testCaseIndex: i,
        passed: evaluation.passed,
        input: testCase.isHidden ? '[Hidden]' : testCase.input,
        expectedOutput: testCase.isHidden ? '[Hidden]' : testCase.expectedOutput,
        actualOutput: execution.stdout,
        message: evaluation.message,
        executionTime: execution.executionTime,
        isHidden: testCase.isHidden
      });
      
    } catch (error) {
      results.push({
        testCaseIndex: i,
        passed: false,
        input: testCase.isHidden ? '[Hidden]' : testCase.input,
        expectedOutput: testCase.isHidden ? '[Hidden]' : testCase.expectedOutput,
        actualOutput: '',
        message: `Test execution failed: ${error.message}`,
        executionTime: 0,
        isHidden: testCase.isHidden
      });
    }
  }
  
  return results;
}

/**
 * Calculate test case score
 * @param {Array} results - Test case results
 * @returns {{score: number, total: number, passed: number, failed: number}}
 */
export function calculateTestCaseScore(results) {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  
  return {
    score: total > 0 ? (passed / total) : 0,
    total,
    passed,
    failed
  };
}
