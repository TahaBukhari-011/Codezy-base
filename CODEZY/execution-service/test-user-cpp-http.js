/**
 * Test the exact user code via HTTP API
 */

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

const testData = {
  code: testCode,
  language: 'cpp',
  testCases: [
    {
      input: '1 2 3 4 5 6',
      expectedOutput: '12',
      isHidden: false
    }
  ],
  structuralConstraints: [
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
  ],
  taskMarks: 10
};

console.log('\n🧪 Testing User\'s C++ Code via HTTP API...\n');

fetch('http://localhost:5001/api/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
  .then(response => response.json())
  .then(data => {
    console.log('🏗️  STRUCTURAL CONSTRAINTS:');
    console.log('─'.repeat(60));
    
    if (data.structural && data.structural.details) {
      data.structural.details.forEach(result => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`${icon} ${result.constraint} (${result.type}): ${result.passed ? 'PASSED' : 'FAILED'}`);
        console.log(`   ${result.message}\n`);
      });
      
      console.log(`Summary: ${data.structural.passed}/${data.structural.total} passed`);
    }
    
    console.log('─'.repeat(60));
    console.log(`\n🎯 FINAL SCORE: ${data.score} / ${data.maxScore}\n`);
    
    if (data.structural.passed === data.structural.total) {
      console.log('✅ ALL CONSTRAINTS PASSED! The fix is working.\n');
    } else {
      console.log('❌ Some constraints failed. Details above.\n');
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Make sure the execution service is running on http://localhost:5001\n');
  });
