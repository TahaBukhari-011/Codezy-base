import { analyzeStructure } from './services/structuralAnalyzer.js';

const testCode = `#include <iostream>
#include <vector>
using namespace std;

int sum_of_evens(vector<int> numbers) {
    int total = 0;
    for (int num : numbers) {
        if (num % 2 == 0) {
            total = total + num;
        }
    }
    return total;
}

int main() {
    vector<int> nums;
    int x;

    while (cin >> x) {
        nums.push_back(x);
    }

    cout << sum_of_evens(nums) << endl;
    return 0;
}`;

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

console.log('Testing user\'s C++ code...\n');
console.log('Code:');
console.log(testCode);
console.log('\n' + '='.repeat(60) + '\n');

const results = analyzeStructure(testCode, 'cpp', constraints);

console.log('Results:');
results.forEach(result => {
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.constraint} (${result.type}):`);
  console.log(`   Count: ${result.count}`);
  console.log(`   Passed: ${result.passed}`);
  console.log(`   Message: ${result.message}\n`);
});

console.log('='.repeat(60));
console.log(`Overall: ${results.filter(r => r.passed).length}/${results.length} passed`);
