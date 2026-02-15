# Codezy Code Execution Service

A scalable, Docker-based code execution service for Python, Java, and C++. Supports test case evaluation and structural constraint checking with comprehensive scoring.

## Features

✅ **Multi-Language Support**: Python 3.11, Java 17, C++17  
✅ **Secure Execution**: Isolated Docker containers with resource limits  
✅ **Test Case Evaluation**: Exact, whitespace-ignore, and regex matching  
✅ **Structural Analysis**: AST-based checking for functions, loops, arrays, etc.  
✅ **Scoring System**: Automated scoring out of 10 based on functional and structural criteria  
✅ **Scalable**: Handles multiple concurrent executions  
✅ **Security**: Network isolation, non-root execution, resource constraints  

## Architecture

```
execution-service/
├── server.js                    # Main Express server
├── config/
│   └── docker-config.js         # Docker and execution settings
├── services/
│   ├── executionService.js      # Main orchestration logic
│   ├── testCaseEvaluator.js     # Test case comparison
│   └── structuralAnalyzer.js    # AST-based code analysis
├── utils/
│   └── codeRunner.js            # Docker container management
└── dockerfiles/
    ├── Dockerfile.python        # Python execution environment
    ├── Dockerfile.java          # Java execution environment
    └── Dockerfile.cpp           # C++ execution environment
```

## Prerequisites

- **Node.js** 18+ 
- **Docker** Desktop or Engine (running)
- **npm** or **yarn**

## Installation

1. **Navigate to the service directory**:
   ```bash
   cd execution-service
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** (edit `.env` if needed):
   ```env
   PORT=5001
   EXECUTION_TIMEOUT=30000
   MEMORY_LIMIT=256m
   CPU_LIMIT=1.0
   ```

4. **Ensure Docker is running**:
   ```bash
   docker --version
   ```

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

On first startup, Docker images will be built automatically (~2-3 minutes).

## API Endpoints

### `POST /api/execute`
Execute code with full evaluation (test cases + structural constraints)

**Request Body**:
```json
{
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
}
```

**Response**:
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
    "details": [...]
  },
  "structural": {
    "passed": 1,
    "failed": 0,
    "total": 1,
    "details": [...]
  },
  "terminal": "... formatted terminal output ..."
}
```

### `POST /api/execute/quick`
Quick execution without test cases (for testing/debugging)

**Request Body**:
```json
{
  "code": "print('Hello, World!')",
  "language": "python",
  "input": ""
}
```

**Response**:
```json
{
  "success": true,
  "output": "Hello, World!",
  "error": null,
  "exitCode": 0,
  "executionTime": 234
}
```

### `GET /api/languages`
Get supported programming languages

**Response**:
```json
{
  "languages": [
    { "id": "python", "name": "Python", "version": "3.11" },
    { "id": "java", "name": "Java", "version": "17" },
    { "id": "cpp", "name": "C++", "version": "C++17" }
  ]
}
```

### `GET /health`
Health check endpoint

## Supported Structural Constraints

### Python
- `for loop`, `while loop`
- `if statement`
- `function`, `class`
- `recursion`
- `list`, `dictionary`
- `try-except`, `with statement`

### Java
- `for loop`, `while loop`, `do-while loop`
- `if statement`
- `method`, `class`
- `recursion`
- `array`, `ArrayList`, `HashMap`
- `try-catch`

### C++
- `for loop`, `while loop`, `do-while loop`
- `if statement`
- `function`, `class`, `struct`
- `recursion`
- `array`, `vector`, `map`
- `pointer`, `try-catch`

## Security Features

- ✅ Non-root user execution in containers
- ✅ Network isolation (disabled by default)
- ✅ Resource limits (CPU, memory, PIDs)
- ✅ Execution timeout (30s default)
- ✅ Code size limits (50KB default)
- ✅ Container auto-cleanup

## Configuration

Edit `.env` to customize:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5001 | Service port |
| `EXECUTION_TIMEOUT` | 30000 | Max execution time (ms) |
| `MEMORY_LIMIT` | 256m | Container memory limit |
| `CPU_LIMIT` | 1.0 | Container CPU cores |
| `MAX_CODE_SIZE` | 50000 | Max code size (bytes) |
| `ENABLE_NETWORK` | false | Allow network in containers |

## Scoring Algorithm

- **Test Cases**: 70% weight
- **Structural Constraints**: 30% weight
- **Final Score**: (testCaseScore × 0.7 + structuralScore × 0.3) × 10

If only one criterion exists, it gets 100% weight.

## Integration with Main Backend

The main backend proxies requests to this service via `/api/code-execution/*` routes.

**From main backend** (`http://localhost:5000`):
```javascript
POST /api/code-execution/run      // Run code without saving
POST /api/code-execution/submit   // Run and save submission
POST /api/code-execution/quick    // Quick test execution
GET  /api/code-execution/languages
```

## Troubleshooting

### Docker images not building
```bash
# Rebuild manually
cd dockerfiles
docker build -f Dockerfile.python -t codezy-python-runner:latest .
docker build -f Dockerfile.java -t codezy-java-runner:latest .
docker build -f Dockerfile.cpp -t codezy-cpp-runner:latest .
```

### Service unavailable error
- Ensure execution service is running on port 5001
- Check `EXECUTION_SERVICE_URL` in main backend `.env`

### Execution timeout
- Increase `EXECUTION_TIMEOUT` in `.env`
- Check if code has infinite loops

### Container cleanup issues
```bash
# Force remove all codezy containers
docker ps -a | grep codezy-exec | awk '{print $1}' | xargs docker rm -f
```

## Development

### Adding a new language
1. Create `Dockerfile.{lang}` in `dockerfiles/`
2. Add image name to `config/docker-config.js`
3. Add language support in `utils/codeRunner.js`
4. Add structural analysis in `services/structuralAnalyzer.js`

### Testing
```bash
# Test Python execution
curl -X POST http://localhost:5001/api/execute/quick \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"Hello\")", "language":"python"}'
```

## Performance

- **Cold start**: ~500ms (first execution)
- **Warm execution**: ~200-400ms
- **Concurrent capacity**: 10-50 executions (depends on resources)
- **Container overhead**: ~100-150ms per execution

## License

Part of the Codezy platform.
