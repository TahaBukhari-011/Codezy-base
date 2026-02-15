import { analyzeStructure } from './services/structuralAnalyzer.js';

const testCode = `
import java.util.Scanner;

public class SumOfEvens {
    
    // Method to calculate sum of even numbers
    public static int sumOfEvens(int[] numbers) {
        int total = 0;
        for (int i = 0; i < numbers.length; i++) {
            if (numbers[i] % 2 == 0) {
                total = total + numbers[i];
            }
        }
        return total;
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String[] input = scanner.nextLine().split(" ");
        int[] nums = new int[input.length];
        
        for (int i = 0; i < input.length; i++) {
            nums[i] = Integer.parseInt(input[i]);
        }
        
        System.out.println(sumOfEvens(nums));
    }
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

console.log('Testing Java structural analyzer...\n');

const results = analyzeStructure(testCode, 'java', constraints);

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
