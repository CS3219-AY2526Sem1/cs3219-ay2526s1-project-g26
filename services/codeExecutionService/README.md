# Code Execution Service

A microservice for executing and verifying user-submitted code against test cases. Supports Python, JavaScript/Node.js, Java, and C++.

## Features

- **Multi-language Support**: Python, JavaScript/Node.js, Java, C++
- **Secure Execution**: Isolated code execution in containers
- **Test Case Validation**: Automatic verification against expected outputs
- **Resource Limits**: Configurable time and memory limits
- **Comprehensive Results**: Detailed execution results including performance metrics

## API Endpoints

### POST /api/execute
Execute code against test cases.

**Request Body:**
```json
{
  "questionId": "string",
  "language": "python" | "javascript" | "java" | "cpp",
  "codeText": "string",
  "isFullSubmission": boolean // optional, defaults to false
}
```

**Response:**
```json
{
  "type": "COMPILE_ERROR" | "RUNTIME_ERROR" | "TIME_EXCEEDED" | "MEMORY_EXCEEDED" | "WRONG_ANSWER" | "PASSED",
  "timeTaken": number, // milliseconds
  "memoryUsage": number, // MB
  "additionalInfo": "string", // error details if applicable
  "testCaseResults": [
    {
      "testCaseIndex": number,
      "passed": boolean,
      "actualOutput": "string",
      "expectedOutput": "string",
      "timeTaken": number,
      "memoryUsage": number,
      "error": "string" // if applicable
    }
  ]
}
```

### GET /api/health
Health check endpoint.

### GET /api/languages
Get list of supported programming languages.

## Supported Languages

### Python
- Version: Python 3.x
- File extension: `.py`
- Execution: `python solution.py < input.txt`

### JavaScript/Node.js
- Version: Node.js 20.x
- File extension: `.js`
- Execution: `node wrapper.js`
- Note: Includes readline interface simulation for competitive programming

### Java
- Version: OpenJDK 17
- File extension: `.java`
- Compilation: `javac ClassName.java`
- Execution: `java ClassName < input.txt`

### C++
- Compiler: g++
- Standard: C++17
- Compilation: `g++ -std=c++17 -O2 -o solution solution.cpp`
- Execution: `./solution < input.txt`

## Development

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- Python 3.x
- Java JDK 17+
- GCC/G++ compiler

### Setup

1. **Clone and navigate to the service:**
   ```bash
   cd services/codeExecutionService
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   ```

4. **Run in development mode:**
   ```bash
   npm run dev
   ```

### Docker Development

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Run in production mode:**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

### Testing the Service

**Test with curl:**

```bash
# Health check
curl http://localhost:4040/api/health

# Get supported languages
curl http://localhost:4040/api/languages

# Execute Python code
curl -X POST http://localhost:4040/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "two-sum",
    "language": "python",
    "codeText": "n, target = map(int, input().split())\nnums = list(map(int, input().split()))\nfor i in range(n):\n    for j in range(i+1, n):\n        if nums[i] + nums[j] == target:\n            print(i, j)\n            break\n    else:\n        continue\n    break",
    "isFullSubmission": false
  }'
```

## Architecture

### Components

1. **BaseExecutor**: Abstract base class for all language executors
2. **Language-specific Executors**: PythonExecutor, JavascriptExecutor, JavaExecutor, CppExecutor
3. **ExecutorFactory**: Factory pattern for creating appropriate executors
4. **CodeExecutionService**: Main service orchestrating the execution process
5. **API Routes**: Express.js routes handling HTTP requests

### Execution Flow

1. **Request Validation**: Validate input parameters
2. **Executor Creation**: Create language-specific executor
3. **Setup**: Prepare isolated working directory
4. **Compilation**: Compile code (if needed)
5. **Test Execution**: Run code against each test case
6. **Result Collection**: Aggregate results and performance metrics
7. **Cleanup**: Remove temporary files and directories

### Security Considerations

- **Process Isolation**: Each execution runs in isolated processes
- **Resource Limits**: Configurable CPU time and memory limits
- **File System Isolation**: Temporary directories for each execution
- **Input Sanitization**: Validation of all input parameters

## Configuration

Environment variables can be configured in `.env`:

- `PORT`: Service port (default: 4040)
- `DEFAULT_TIME_LIMIT_MS`: Default time limit in milliseconds (default: 5000)
- `DEFAULT_MEMORY_LIMIT_MB`: Default memory limit in MB (default: 256)
- `QUESTION_SERVICE_URL`: URL of the question service for fetching test cases
- `MAX_CODE_SIZE_BYTES`: Maximum allowed code size (default: 1MB)

## Integration

This service is designed to integrate with the existing CS3219 project microservices:

- **Question Service**: Fetches test cases for questions
- **User Service**: Potentially for user authentication/authorization
- **Frontend**: Receives execution requests from the frontend application

## Error Handling

The service provides detailed error information:

- **COMPILE_ERROR**: Code compilation failed
- **RUNTIME_ERROR**: Code crashed during execution
- **TIME_EXCEEDED**: Execution exceeded time limit
- **MEMORY_EXCEEDED**: Execution exceeded memory limit
- **WRONG_ANSWER**: Output doesn't match expected result
- **PASSED**: All test cases passed successfully

## Performance

- **Concurrent Execution**: Multiple requests handled concurrently
- **Resource Management**: Automatic cleanup of temporary files
- **Optimized Compilation**: Compiler optimizations enabled for better performance

## Future Enhancements

- **Additional Languages**: Support for more programming languages
- **Advanced Security**: Sandboxing with containers or chroot
- **Caching**: Compilation caching for faster execution
- **Metrics**: Detailed performance monitoring
- **Load Balancing**: Horizontal scaling support