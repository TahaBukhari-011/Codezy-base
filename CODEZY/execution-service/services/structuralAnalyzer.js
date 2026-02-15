/**
 * Structural Code Analyzer
 * Uses pattern matching to check structural constraints (functions, loops, arrays, etc.)
 */

/**
 * Analyze code structure based on language
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @param {Array} constraints - Array of structural constraints
 * @returns {Array} Results for each constraint
 */
export function analyzeStructure(code, language, constraints) {
  const analyzer = getAnalyzer(language);
  
  if (!analyzer) {
    return constraints.map(c => ({
      constraint: c.construct,
      type: c.type,
      passed: false,
      message: `Structural analysis not supported for ${language}`
    }));
  }
  
  try {
    const structure = analyzer(code);
    return constraints.map(constraint => evaluateConstraint(structure, constraint, language));
  } catch (error) {
    return constraints.map(c => ({
      constraint: c.construct,
      type: c.type,
      passed: false,
      message: `Analysis error: ${error.message}`
    }));
  }
}

/**
 * Get appropriate analyzer for language
 */
function getAnalyzer(language) {
  switch (language) {
    case 'python':
      return analyzePythonStructure;
    case 'java':
      return analyzeJavaStructure;
    case 'cpp':
      return analyzeCppStructure;
    default:
      return null;
  }
}

/**
 * Normalize constraint names to match structure keys
 * Maps user-friendly constraint names to internal structure keys
 */
function normalizeConstraintName(constraint, language) {
  const mappings = {
    python: {
      'Custom Function/Method': 'function',
      'function': 'function',
      'Function': 'function',
      'LOOP': 'loop',
      'Loop': 'loop',
      'loop': 'loop',
      'for loop': 'for loop',
      'For Loop': 'for loop',
      'while loop': 'while loop',
      'While Loop': 'while loop',
      'if statement': 'if statement',
      'If Statement': 'if statement',
      'if-else statement': 'if statement',
      'If-Else Statement': 'if statement',
      'Array/List': 'list',
      'List': 'list',
      'list': 'list',
      'Dictionary': 'dictionary',
      'dictionary': 'dictionary',
      'class': 'class',
      'Class': 'class',
      'recursion': 'recursion',
      'Recursion': 'recursion',
      'try-except': 'try-except',
      'Try-Except': 'try-except',
      'with statement': 'with statement',
      'With Statement': 'with statement'
    },
    java: {
      'Custom Function/Method': 'method',
      'method': 'method',
      'Method': 'method',
      'function': 'method',
      'Function': 'method',
      'LOOP': 'loop',
      'Loop': 'loop',
      'loop': 'loop',
      'for loop': 'for loop',
      'For Loop': 'for loop',
      'while loop': 'while loop',
      'While Loop': 'while loop',
      'do-while loop': 'do-while loop',
      'Do-While Loop': 'do-while loop',
      'if statement': 'if statement',
      'If Statement': 'if statement',
      'if-else statement': 'if statement',
      'If-Else Statement': 'if statement',
      'Array/List': 'array',
      'Array': 'array',
      'array': 'array',
      'ArrayList': 'ArrayList',
      'HashMap': 'HashMap',
      'class': 'class',
      'Class': 'class',
      'recursion': 'recursion',
      'Recursion': 'recursion',
      'try-catch': 'try-catch',
      'Try-Catch': 'try-catch'
    },
    cpp: {
      'Custom Function/Method': 'function',
      'function': 'function',
      'Function': 'function',
      'LOOP': 'loop',
      'Loop': 'loop',
      'loop': 'loop',
      'for loop': 'for loop',
      'For Loop': 'for loop',
      'while loop': 'while loop',
      'While Loop': 'while loop',
      'do-while loop': 'do-while loop',
      'Do-While Loop': 'do-while loop',
      'if statement': 'if statement',
      'If Statement': 'if statement',
      'if-else statement': 'if statement',
      'If-Else Statement': 'if statement',
      'Array/List': 'array',
      'Array': 'array',
      'array': 'array',
      'vector': 'vector',
      'Vector': 'vector',
      'map': 'map',
      'Map': 'map',
      'class': 'class',
      'Class': 'class',
      'struct': 'struct',
      'Struct': 'struct',
      'pointer': 'pointer',
      'Pointer': 'pointer',
      'recursion': 'recursion',
      'Recursion': 'recursion',
      'try-catch': 'try-catch',
      'Try-Catch': 'try-catch'
    }
  };

  const languageMap = mappings[language] || {};
  return languageMap[constraint] || constraint;
}

/**
 * Evaluate a single structural constraint
 */
function evaluateConstraint(structure, constraint, language) {
  const { type, construct, specifics } = constraint;
  
  // Normalize the constraint name to match structure keys
  const normalizedConstruct = normalizeConstraintName(construct, language);
  const count = structure[normalizedConstruct] || 0;
  
  // Determine minimum required count (default to 1 for Required type)
  const minRequired = specifics?.minDepth || (type === 'Required' ? 1 : 0);
  const maxDepth = specifics?.maxDepth || Infinity;
  
  let passed = false;
  let message = '';
  
  if (type === 'Required') {
    passed = count >= minRequired;
    if (passed) {
      message = `Found ${count} ${construct}(s) (required: ${minRequired})`;
    } else {
      message = `Missing ${construct}. Found ${count}, required at least ${minRequired}`;
    }
  } else if (type === 'Forbidden') {
    passed = count === 0;
    message = passed 
      ? `No ${construct} found (as required)` 
      : `Found ${count} ${construct}(s), but they are forbidden`;
  }
  
  // Check depth constraints if applicable
  if (passed && maxDepth < Infinity && count > maxDepth) {
    passed = false;
    message = `Too many ${construct}(s). Found ${count}, maximum allowed: ${maxDepth}`;
  }
  
  return {
    constraint: construct,
    type,
    count,
    passed,
    message
  };
}

/**
 * Analyze Python code structure
 * Uses pattern matching (since Python AST is complex without a parser)
 */
function analyzePythonStructure(code) {
  const structure = {
    'for loop': 0,
    'while loop': 0,
    'loop': 0,
    'if statement': 0,
    'function': 0,
    'class': 0,
    'recursion': 0,
    'list': 0,
    'dictionary': 0,
    'try-except': 0,
    'with statement': 0
  };
  
  // Count for loops
  structure['for loop'] = (code.match(/\bfor\s+\w+\s+in\s+/g) || []).length;
  
  // Count while loops
  structure['while loop'] = (code.match(/\bwhile\s+.+:/g) || []).length;
  
  // Count all loops (for + while)
  structure['loop'] = structure['for loop'] + structure['while loop'];
  
  // Count if statements (includes if-else)
  structure['if statement'] = (code.match(/\bif\s+.+:/g) || []).length;
  
  // Count function definitions
  const funcMatches = code.match(/\bdef\s+(\w+)\s*\(/g) || [];
  structure['function'] = funcMatches.length;
  
  // Check for recursion (function calling itself)
  const funcNames = (code.match(/\bdef\s+(\w+)\s*\(/g) || []).map(m => m.match(/\bdef\s+(\w+)/)[1]);
  funcNames.forEach(name => {
    const funcBody = extractFunctionBody(code, name);
    if (funcBody && funcBody.includes(`${name}(`)) {
      structure['recursion']++;
    }
  });
  
  // Count classes
  structure['class'] = (code.match(/\bclass\s+\w+/g) || []).length;
  
  // Count list usage (literal lists or list operations)
  const listLiterals = (code.match(/\[.*?\]/g) || []).length;
  const listCalls = (code.match(/\.append\(|\.extend\(|list\(/g) || []).length;
  structure['list'] = listLiterals + listCalls;
  
  // Count dictionary usage
  structure['dictionary'] = (code.match(/\{.*?:.*?\}/g) || []).length;
  
  // Count try-except blocks
  structure['try-except'] = (code.match(/\btry\s*:/g) || []).length;
  
  // Count with statements
  structure['with statement'] = (code.match(/\bwith\s+.+:/g) || []).length;
  
  return structure;
}

/**
 * Analyze Java code structure
 */
function analyzeJavaStructure(code) {
  const structure = {
    'for loop': 0,
    'while loop': 0,
    'do-while loop': 0,
    'loop': 0,
    'if statement': 0,
    'method': 0,
    'class': 0,
    'recursion': 0,
    'array': 0,
    'ArrayList': 0,
    'HashMap': 0,
    'try-catch': 0
  };
  
  // Count for loops
  structure['for loop'] = (code.match(/\bfor\s*\(/g) || []).length;
  
  // Count while loops
  structure['while loop'] = (code.match(/\bwhile\s*\(/g) || []).length;
  
  // Count do-while loops
  structure['do-while loop'] = (code.match(/\bdo\s*\{/g) || []).length;
  
  // Count all loops (for + while + do-while)
  structure['loop'] = structure['for loop'] + structure['while loop'] + structure['do-while loop'];
  
  // Count if statements
  structure['if statement'] = (code.match(/\bif\s*\(/g) || []).length;
  
  // Count methods
  const methodMatches = code.match(/\b(public|private|protected|static|\s)+[\w<>\[\]]+\s+(\w+)\s*\([^)]*\)\s*\{/g) || [];
  structure['method'] = methodMatches.length;
  
  // Count classes
  structure['class'] = (code.match(/\bclass\s+\w+/g) || []).length;
  
  // Count primitive arrays
  const primitiveArrays = (code.match(/\w+\[\s*\]/g) || []).length + (code.match(/new\s+\w+\[/g) || []).length;
  
  // Count ArrayList
  structure['ArrayList'] = (code.match(/ArrayList</g) || []).length;
  
  // Combined array count (primitive arrays + ArrayList for general "Array/List" constraint)
  structure['array'] = primitiveArrays + structure['ArrayList'];
  
  // Count HashMap
  structure['HashMap'] = (code.match(/HashMap</g) || []).length;
  
  // Count try-catch
  structure['try-catch'] = (code.match(/\btry\s*\{/g) || []).length;
  
  // Check recursion (simplified)
  const methods = extractJavaMethods(code);
  methods.forEach(({ name, body }) => {
    if (body.includes(`${name}(`)) {
      structure['recursion']++;
    }
  });
  
  return structure;
}

/**
 * Analyze C++ code structure
 */
function analyzeCppStructure(code) {
  const structure = {
    'for loop': 0,
    'while loop': 0,
    'do-while loop': 0,
    'loop': 0,
    'if statement': 0,
    'function': 0,
    'class': 0,
    'struct': 0,
    'recursion': 0,
    'array': 0,
    'vector': 0,
    'map': 0,
    'pointer': 0,
    'try-catch': 0
  };
  
  // Count for loops
  structure['for loop'] = (code.match(/\bfor\s*\(/g) || []).length;
  
  // Count while loops
  structure['while loop'] = (code.match(/\bwhile\s*\(/g) || []).length;
  
  // Count do-while loops
  structure['do-while loop'] = (code.match(/\bdo\s*\{/g) || []).length;
  
  // Count all loops (for + while + do-while)
  structure['loop'] = structure['for loop'] + structure['while loop'] + structure['do-while loop'];
  
  // Count if statements
  structure['if statement'] = (code.match(/\bif\s*\(/g) || []).length;
  
  // Count functions
  const funcMatches = code.match(/\b\w+\s+\w+\s*\([^)]*\)\s*\{/g) || [];
  structure['function'] = funcMatches.length;
  
  // Count classes
  structure['class'] = (code.match(/\bclass\s+\w+/g) || []).length;
  
  // Count structs
  structure['struct'] = (code.match(/\bstruct\s+\w+/g) || []).length;
  
  // Count C-style arrays
  const cStyleArrays = (code.match(/\w+\s+\w+\[\s*\d*\s*\]/g) || []).length;
  
  // Count vectors
  structure['vector'] = (code.match(/vector</g) || []).length;
  
  // Combined array count (C-style arrays + vectors for general "Array/List" constraint)
  structure['array'] = cStyleArrays + structure['vector'];
  
  // Count maps
  structure['map'] = (code.match(/\bmap</g) || []).length;
  
  // Count pointers
  structure['pointer'] = (code.match(/\*\s*\w+/g) || []).length;
  
  // Count try-catch
  structure['try-catch'] = (code.match(/\btry\s*\{/g) || []).length;
  
  // Check recursion (simplified)
  const functions = extractCppFunctions(code);
  functions.forEach(({ name, body }) => {
    if (body.includes(`${name}(`)) {
      structure['recursion']++;
    }
  });
  
  return structure;
}

/**
 * Helper: Extract function body for Python
 */
function extractFunctionBody(code, funcName) {
  const regex = new RegExp(`def\\s+${funcName}\\s*\\([^)]*\\):[\\s\\S]*?(?=\\ndef\\s|\\nclass\\s|$)`, 'g');
  const match = regex.exec(code);
  return match ? match[0] : null;
}

/**
 * Helper: Extract Java methods
 */
function extractJavaMethods(code) {
  const methods = [];
  const regex = /\b(public|private|protected|static|\s)+[\w<>\[\]]+\s+(\w+)\s*\([^)]*\)\s*\{/g;
  let match;
  
  while ((match = regex.exec(code)) !== null) {
    const name = match[2];
    const startIdx = match.index + match[0].length;
    const body = extractBracedBlock(code, startIdx);
    methods.push({ name, body });
  }
  
  return methods;
}

/**
 * Helper: Extract C++ functions
 */
function extractCppFunctions(code) {
  const functions = [];
  const regex = /\b\w+\s+(\w+)\s*\([^)]*\)\s*\{/g;
  let match;
  
  while ((match = regex.exec(code)) !== null) {
    const name = match[1];
    const startIdx = match.index + match[0].length;
    const body = extractBracedBlock(code, startIdx);
    functions.push({ name, body });
  }
  
  return functions;
}

/**
 * Helper: Extract code block enclosed in braces
 */
function extractBracedBlock(code, startIdx) {
  let depth = 1;
  let idx = startIdx;
  
  while (idx < code.length && depth > 0) {
    if (code[idx] === '{') depth++;
    if (code[idx] === '}') depth--;
    idx++;
  }
  
  return code.substring(startIdx, idx - 1);
}

/**
 * Calculate structural constraint score
 */
export function calculateStructuralScore(results) {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  
  return {
    score: total > 0 ? (passed / total) : 0,
    total,
    passed,
    failed: total - passed
  };
}
