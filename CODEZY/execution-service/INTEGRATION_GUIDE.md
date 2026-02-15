# Code Execution Service - Integration Guide

## Overview
This guide shows how to integrate the code execution service with the Codezy frontend (React) to enable students to run and submit code.

## Architecture Flow

```
Student Browser (React)
    ↓ run code
Backend API (Express) :5000
    ↓ proxy request
Execution Service (Docker) :5001
    ↓ results
Backend API
    ↓ formatted response
Student Browser
```

## Setup Steps

### 1. Install Dependencies

**Backend**:
```bash
cd backend
npm install
```

**Execution Service**:
```bash
cd execution-service
npm install
```

### 2. Start Services

**Terminal 1 - Main Backend**:
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

**Terminal 2 - Execution Service**:
```bash
cd execution-service
npm start
# Runs on http://localhost:5001
# Docker images will build on first start
```

**Terminal 3 - Frontend**:
```bash
cd codezy
npm run dev
# Runs on http://localhost:5173
```

### 3. Configure Environment

Ensure backend `.env` has:
```env
EXECUTION_SERVICE_URL=http://localhost:5001
```

## Frontend Integration

### API Service Helper

Create `src/services/codeExecution.js`:

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/code-execution';

/**
 * Run code without saving (for testing)
 */
export async function runCode(code, language, labId, taskId, studentId) {
  try {
    const response = await axios.post(`${API_URL}/run`, {
      code,
      language,
      labId,
      taskId,
      studentId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * Submit code solution (saves submission)
 */
export async function submitCode(code, language, labId, taskId, studentId) {
  try {
    const response = await axios.post(`${API_URL}/submit`, {
      code,
      language,
      labId,
      taskId,
      studentId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * Quick test execution
 */
export async function quickRun(code, language, input = '') {
  try {
    const response = await axios.post(`${API_URL}/quick`, {
      code,
      language,
      input
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * Get supported languages
 */
export async function getSupportedLanguages() {
  try {
    const response = await axios.get(`${API_URL}/languages`);
    return response.data.languages;
  } catch (error) {
    return [
      { id: 'python', name: 'Python', version: '3.11' },
      { id: 'java', name: 'Java', version: '17' },
      { id: 'cpp', name: 'C++', version: 'C++17' }
    ];
  }
}
```

### Example LabSession Component Updates

Add to your existing `LabSession.jsx`:

```jsx
import { runCode, submitCode } from '../../services/codeExecution';

// Inside LabSession component:
const [isRunning, setIsRunning] = useState(false);
const [executionResult, setExecutionResult] = useState(null);
const [selectedLanguage, setSelectedLanguage] = useState('python');

// Run code handler
const handleRunCode = async () => {
  const currentTaskId = labData.tasks[activeTaskIndex].id;
  const code = taskCodes[currentTaskId];

  if (!code.trim()) {
    alert('Please write some code first!');
    return;
  }

  setIsRunning(true);
  setExecutionResult(null);

  try {
    const result = await runCode(
      code,
      selectedLanguage,
      labId,
      currentTaskId,
      studentId // Get from auth context
    );

    setExecutionResult(result);
  } catch (error) {
    setExecutionResult({
      success: false,
      error: error.error || 'Execution failed',
      terminal: error.error || 'An error occurred'
    });
  } finally {
    setIsRunning(false);
  }
};

// Submit code handler
const handleSubmitCode = async () => {
  if (!confirm('Are you sure you want to submit? This will be graded.')) {
    return;
  }

  const currentTaskId = labData.tasks[activeTaskIndex].id;
  const code = taskCodes[currentTaskId];

  setIsRunning(true);

  try {
    const result = await submitCode(
      code,
      selectedLanguage,
      labId,
      currentTaskId,
      studentId
    );

    alert(`Submitted! Score: ${result.evaluation.score}/10. XP gained: ${result.xpGained}`);
    setExecutionResult(result.evaluation);
  } catch (error) {
    alert(`Submission failed: ${error.error || 'Unknown error'}`);
  } finally {
    setIsRunning(false);
  }
};
```

### UI Components

#### Language Selector
```jsx
<select 
  value={selectedLanguage}
  onChange={(e) => setSelectedLanguage(e.target.value)}
  className="px-3 py-1.5 bg-slate-800 rounded border border-slate-700"
>
  <option value="python">Python</option>
  <option value="java">Java</option>
  <option value="cpp">C++</option>
</select>
```

#### Run Button
```jsx
<button 
  onClick={handleRunCode}
  disabled={isRunning}
  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
>
  {isRunning ? (
    <>
      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
      Running...
    </>
  ) : (
    <>
      <Play size={16} />
      Run Code
    </>
  )}
</button>
```

#### Terminal Output Display
```jsx
{executionResult && (
  <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
    {/* Score */}
    <div className="mb-4 pb-4 border-b border-slate-700">
      <div className="text-2xl font-bold">
        Score: {executionResult.score}/{executionResult.maxScore}
      </div>
    </div>

    {/* Terminal Output */}
    {executionResult.terminal && (
      <pre className="text-slate-300 whitespace-pre-wrap">
        {executionResult.terminal}
      </pre>
    )}

    {/* Error Display */}
    {executionResult.error && (
      <div className="text-red-400 mt-2">
        Error: {executionResult.error}
      </div>
    )}
  </div>
)}
```

#### Test Cases Summary
```jsx
{executionResult?.testCases && (
  <div className="mt-4">
    <h3 className="text-lg font-bold mb-2">Test Cases</h3>
    <div className="space-y-2">
      {executionResult.testCases.details.map((tc, idx) => (
        <div 
          key={idx}
          className={`p-3 rounded-lg border ${
            tc.passed 
              ? 'bg-green-900/20 border-green-700' 
              : 'bg-red-900/20 border-red-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {tc.passed ? (
              <CheckCircle2 size={16} className="text-green-500" />
            ) : (
              <XCircle size={16} className="text-red-500" />
            )}
            <span className="font-medium">
              Test Case {idx + 1}: {tc.passed ? 'PASSED' : 'FAILED'}
            </span>
          </div>
          {!tc.hidden && (
            <div className="mt-2 text-xs text-slate-400">
              <div>Input: {tc.input || '(empty)'}</div>
              <div>Expected: {tc.expected}</div>
              <div>Got: {tc.actual}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}
```

#### Structural Constraints Summary
```jsx
{executionResult?.structural && executionResult.structural.total > 0 && (
  <div className="mt-4">
    <h3 className="text-lg font-bold mb-2">Structural Constraints</h3>
    <div className="space-y-2">
      {executionResult.structural.details.map((sc, idx) => (
        <div 
          key={idx}
          className={`p-3 rounded-lg border ${
            sc.passed 
              ? 'bg-green-900/20 border-green-700' 
              : 'bg-red-900/20 border-red-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {sc.passed ? (
              <ShieldCheck size={16} className="text-green-500" />
            ) : (
              <AlertTriangle size={16} className="text-red-500" />
            )}
            <span className="font-medium">
              {sc.constraint} ({sc.type})
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {sc.message}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

## Testing the Integration

### 1. Create a Lab with Test Cases

In the teacher dashboard, create a lab with:
- Task title: "Sum of Two Numbers"
- Language: Python
- Test cases:
  ```
  Input: 2 3
  Expected Output: 5
  Comparison Mode: Exact
  ```
- Structural constraints:
  - Type: Required
  - Construct: function
  - Min Depth: 1

### 2. Write Student Code

In the lab session, write:
```python
def add(a, b):
    return a + b

numbers = input().split()
result = add(int(numbers[0]), int(numbers[1]))
print(result)
```

### 3. Run & Verify

Click "Run Code" and verify:
- ✅ Test case passes
- ✅ Structural constraint passes  
- ✅ Score: 10/10

## Debugging

### Check Service Health
```bash
# Main backend
curl http://localhost:5000/api/code-execution/languages

# Execution service
curl http://localhost:5001/health
```

### View Docker Containers
```bash
docker ps -a | grep codezy
```

### Check Service Logs
```bash
# In execution-service terminal
# Logs will show each execution request
```

## Production Deployment

For production:
1. Deploy execution service on separate server/container
2. Update `EXECUTION_SERVICE_URL` to production URL
3. Add authentication between backend and execution service
4. Consider using Docker Swarm or Kubernetes for scaling
5. Set up monitoring (Prometheus, Grafana)
6. Implement rate limiting

## Security Considerations

✅ Container isolation  
✅ Resource limits enforced  
✅ Network disabled by default  
✅ Non-root execution  
✅ Code size limits  
✅ Execution timeout  

⚠️ For production: Add API authentication between services  
⚠️ Consider adding rate limiting per student  
⚠️ Monitor for abuse/malicious code  

## Next Steps

1. ✅ Test with all three languages
2. ✅ Add loading states and error handling
3. ✅ Implement code editor syntax highlighting
4. ✅ Add execution history/logs
5. ✅ Implement auto-save for code
6. ✅ Add keyboard shortcuts (Ctrl+Enter to run)

## Support

For issues or questions:
- Check logs in both services
- Verify Docker is running
- Ensure all environment variables are set
- Check network connectivity between services
