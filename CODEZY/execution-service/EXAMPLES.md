# Code Execution Service - Example Usage

## Quick Test Examples

### Python Example

**Code**:
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

n = int(input())
print(fibonacci(n))
```

**Test Case**:
```json
{
  "input": "5",
  "expectedOutput": "5",
  "comparisonMode": "Exact"
}
```

**Structural Constraints**:
```json
{
  "type": "Required",
  "construct": "recursion",
  "specifics": { "minDepth": 1 }
}
```

### Java Example

**Code**:
```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        
        int sum = 0;
        for (int num : arr) {
            sum += num;
        }
        
        System.out.println(sum);
    }
}
```

**Test Case**:
```json
{
  "input": "3\n1 2 3",
  "expectedOutput": "6",
  "comparisonMode": "Exact"
}
```

**Structural Constraints**:
```json
[
  {
    "type": "Required",
    "construct": "array",
    "specifics": { "minDepth": 1 }
  },
  {
    "type": "Required",
    "construct": "for loop",
    "specifics": { "minDepth": 1 }
  }
]
```

### C++ Example

**Code**:
```cpp
#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    
    return -1;
}

int main() {
    int n, target;
    cin >> n;
    
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    
    cin >> target;
    cout << binarySearch(arr, target) << endl;
    
    return 0;
}
```

**Test Case**:
```json
{
  "input": "5\n1 2 3 4 5\n3",
  "expectedOutput": "2",
  "comparisonMode": "Exact"
}
```

**Structural Constraints**:
```json
[
  {
    "type": "Required",
    "construct": "function",
    "specifics": { "minDepth": 1 }
  },
  {
    "type": "Required",
    "construct": "while loop",
    "specifics": { "minDepth": 1 }
  },
  {
    "type": "Required",
    "construct": "vector",
    "specifics": { "minDepth": 1 }
  }
]
```

## Full API Request Examples

### 1. Full Execution with Evaluation

```bash
curl -X POST http://localhost:5001/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def add(a, b):\n    return a + b\n\nprint(add(2, 3))",
    "language": "python",
    "testCases": [
      {
        "input": "",
        "expectedOutput": "5",
        "comparisonMode": "Exact",
        "isHidden": false
      }
    ],
    "structuralConstraints": [
      {
        "type": "Required",
        "construct": "function",
        "specifics": { "minDepth": 1, "maxDepth": 99 }
      }
    ],
    "taskMarks": 10
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "score": 10,
  "maxScore": 10,
  "output": "5",
  "error": null,
  "testCases": {
    "passed": 1,
    "failed": 0,
    "total": 1,
    "details": [
      {
        "index": 0,
        "passed": true,
        "message": "Output matches exactly",
        "input": "",
        "expected": "5",
        "actual": "5",
        "hidden": false,
        "executionTime": 234
      }
    ]
  },
  "structural": {
    "passed": 1,
    "failed": 0,
    "total": 1,
    "details": [
      {
        "constraint": "function",
        "type": "Required",
        "count": 1,
        "passed": true,
        "message": "Found 1 function(s) (required: 1)"
      }
    ]
  },
  "terminal": "... formatted output ..."
}
```

### 2. Quick Execution (No Tests)

```bash
curl -X POST http://localhost:5001/api/execute/quick \
  -H "Content-Type: application/json" \
  -d '{
    "code": "for i in range(5):\n    print(i)",
    "language": "python",
    "input": ""
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "output": "0\n1\n2\n3\n4",
  "error": null,
  "exitCode": 0,
  "executionTime": 187
}
```

### 3. Error Handling Example

**Invalid Code**:
```bash
curl -X POST http://localhost:5001/api/execute/quick \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(undefined_variable)",
    "language": "python"
  }'
```

**Response**:
```json
{
  "success": false,
  "output": "",
  "error": "name 'undefined_variable' is not defined",
  "exitCode": 1,
  "executionTime": 156
}
```

## Common Lab Templates

### Template 1: Basic Function Implementation

```json
{
  "title": "Calculate Average",
  "language": "python",
  "description": "Write a function that calculates the average of numbers",
  "testCases": [
    {
      "input": "5\n1 2 3 4 5",
      "expectedOutput": "3.0",
      "comparisonMode": "IgnoreWhitespace"
    }
  ],
  "structuralConstraints": [
    {
      "type": "Required",
      "construct": "function",
      "specifics": { "minDepth": 1 }
    }
  ]
}
```

### Template 2: Loop Practice

```json
{
  "title": "Print Pattern",
  "language": "cpp",
  "description": "Print a triangle pattern using nested loops",
  "testCases": [
    {
      "input": "3",
      "expectedOutput": "*\n**\n***",
      "comparisonMode": "Exact"
    }
  ],
  "structuralConstraints": [
    {
      "type": "Required",
      "construct": "for loop",
      "specifics": { "minDepth": 2 }
    }
  ]
}
```

### Template 3: Data Structures

```json
{
  "title": "Array Operations",
  "language": "java",
  "description": "Implement array search and sort",
  "testCases": [
    {
      "input": "5\n5 2 8 1 9",
      "expectedOutput": "1 2 5 8 9",
      "comparisonMode": "IgnoreWhitespace"
    }
  ],
  "structuralConstraints": [
    {
      "type": "Required",
      "construct": "array",
      "specifics": { "minDepth": 1 }
    },
    {
      "type": "Forbidden",
      "construct": "ArrayList",
      "specifics": {}
    }
  ]
}
```

## Scoring Examples

### Example 1: Full Score
- Test Cases: 3/3 passed ✓
- Structural: 2/2 passed ✓
- **Score**: (1.0 × 0.7 + 1.0 × 0.3) × 10 = **10/10**

### Example 2: Partial Score
- Test Cases: 2/3 passed (66%)
- Structural: 1/2 passed (50%)
- **Score**: (0.66 × 0.7 + 0.50 × 0.3) × 10 = **6.1/10**

### Example 3: Failed
- Test Cases: 0/3 passed
- Structural: 2/2 passed ✓
- **Score**: (0.0 × 0.7 + 1.0 × 0.3) × 10 = **3.0/10**

## Performance Benchmarks

| Language | Simple Code | Complex Code | With I/O |
|----------|-------------|--------------|----------|
| Python   | ~200ms      | ~500ms       | ~300ms   |
| Java     | ~400ms      | ~800ms       | ~600ms   |
| C++      | ~300ms      | ~600ms       | ~400ms   |

*Includes compilation, execution, and cleanup time*

## Error Messages

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Execution timed out" | Code runs >30s | Check for infinite loops |
| "Code exceeds maximum size" | Code >50KB | Reduce code size |
| "Invalid language" | Wrong language ID | Use: python, java, cpp |
| "Service unavailable" | Execution service down | Start execution-service |
| "Compilation error" | Syntax error | Check code syntax |

## Testing Checklist

Before deploying:

- [ ] Test all three languages (Python, Java, C++)
- [ ] Test with empty input
- [ ] Test with large input (stress test)
- [ ] Test timeout behavior
- [ ] Test structural constraints
- [ ] Test multiple test cases
- [ ] Test hidden test cases
- [ ] Test error handling
- [ ] Test concurrent executions
- [ ] Verify container cleanup

## Advanced Features

### Custom Input Handling

If your code needs multiple inputs:

```python
# Python
line1 = input()
line2 = input()
numbers = list(map(int, input().split()))
```

```java
// Java
Scanner sc = new Scanner(System.in);
int n = sc.nextInt();
String str = sc.next();
```

```cpp
// C++
int n;
string str;
cin >> n >> str;
```

### File I/O (Currently Disabled)

For security, file I/O is restricted. Use stdin/stdout only.

### Network Access (Currently Disabled)

Network is disabled in containers. For API calls, consider adding a whitelist feature.

## Monitoring

### Health Check
```bash
watch -n 5 curl http://localhost:5001/health
```

### Container Stats
```bash
docker stats $(docker ps -q --filter "name=codezy-exec")
```

### Service Logs
```bash
# In execution-service directory
npm run dev
# Watch logs in terminal
```
