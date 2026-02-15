import { analyzeStructure } from './services/structuralAnalyzer.js';

const testCode = `def sum_of_evens(numbers):
    total = 0
   for num in numbers:
        if num % 2 == 0:
            total = total + num
    return total

data = input().split()
nums = []

for val in data:
    nums.append(int(val))

print(sum_of_evens(nums))`;

const constraints = [
  {
    type: 'Required',
    construct: 'Custom Function/Method'
  },
  {
    type: 'Required',
    construct: 'for loop'
  },
  {
    type: 'Required',
    construct: 'Array/List'
  },
  {
    type: 'Required',
    construct: 'if-else statement'
  }
];

console.log('Testing structural analyzer directly...\n');
console.log('Code to analyze:');
console.log('---');
console.log(testCode);
console.log('---\n');

const results = analyzeStructure(testCode, 'python', constraints);

console.log('Results:');
results.forEach(result => {
  console.log(`\n${result.constraint} (${result.type}):`);
  console.log(`  Count: ${result.count}`);
  console.log(`  Passed: ${result.passed}`);
  console.log(`  Message: ${result.message}`);
});
