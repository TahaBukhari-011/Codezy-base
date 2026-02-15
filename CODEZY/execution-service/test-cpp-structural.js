import { analyzeStructure } from './services/structuralAnalyzer.js';

const testCode = `
#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

// Function to calculate sum of even numbers
int sumOfEvens(vector<int> numbers) {
    int total = 0;
    for (int i = 0; i < numbers.size(); i++) {
        if (numbers[i] % 2 == 0) {
            total = total + numbers[i];
        }
    }
    return total;
}

int main() {
    string line;
    getline(cin, line);
    istringstream iss(line);
    
    vector<int> nums;
    int num;
    
    while (iss >> num) {
        nums.push_back(num);
    }
    
    cout << sumOfEvens(nums) << endl;
    return 0;
}
`;

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

console.log('Testing C++ structural analyzer...\n');

const results = analyzeStructure(testCode, 'cpp', constraints);

console.log('Results:');
results.forEach(result => {
  const icon = result.passed ? '✅' : '❌';
  console.log(`\n${icon} ${result.constraint} (${result.type}):`);
  console.log(`  Count: ${result.count}`);
  console.log(`  Passed: ${result.passed}`);
  console.log(`  Message: ${result.message}`);
});

console.log('\n' + '='.repeat(50));
console.log(`Overall: ${results.filter(r => r.passed).length}/${results.length} passed`);
