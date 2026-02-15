/**
 * Test script for structural constraint fixes
 */

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

const testData = {
  code: testCode,
  language: 'python',
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

// Make HTTP POST request to the execution service
fetch('http://localhost:5001/api/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
  .then(response => response.json())
  .then(data => {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('              FULL RESPONSE');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('              STRUCTURAL CONSTRAINT TEST');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('🏗️  STRUCTURAL CONSTRAINTS:');
    console.log('───────────────────────────────────────────────────────');
    
    if (data.structural && data.structural.results) {
      data.structural.results.forEach(result => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`${icon} ${result.constraint} (${result.type}): ${result.passed ? '✓ PASSED' : '✗ FAILED'}`);
        console.log(`   ${result.message}\n`);
      });
      
      console.log(`Summary: ${data.structural.passed}/${data.structural.total} passed`);
    }
    
    console.log('───────────────────────────────────────────────────────');
    console.log(`\n🎯 FINAL SCORE: ${data.finalScore} / ${data.maxScore}\n`);
    console.log('   Breakdown:');
    console.log(`   • Test Cases (70%): ${(data.testCases.score * 0.7 * 10).toFixed(1)}/7.0`);
    console.log(`   • Structural (30%): ${(data.structural.score * 0.3 * 10).toFixed(1)}/3.0`);
    console.log('═══════════════════════════════════════════════════════\n');
  })
  .catch(error => {
    console.error('Error:', error);
  });
