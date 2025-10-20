import { 
  CodeExecutionRequest, 
  SubmissionResult, 
  SubmissionResultType, 
  TestCase, 
  TestCaseResult,
  ExecutionConfig 
} from '../types/execution';
import { ExecutorFactory } from '../executors/ExecutorFactory';

export class CodeExecutionService {
  private readonly defaultConfig: ExecutionConfig = {
    timeLimit: 5000, // 5 seconds
    memoryLimit: 256 // 256 MB
  };

  async executeCode(
    request: CodeExecutionRequest, 
    testCases: TestCase[]
  ): Promise<SubmissionResult> {
    const config = this.defaultConfig;
    const executor = ExecutorFactory.createExecutor(request.language, config);
    
    try {
      await executor.setup();
      
      // Compile the code
      const compilationResult = await executor.compile(request.codeText);
      if (!compilationResult.success) {
        return {
          type: SubmissionResultType.COMPILE_ERROR,
          additionalInfo: compilationResult.error
        };
      }

      // Filter test cases based on submission type
      const filteredTestCases = request.isFullSubmission 
        ? testCases 
        : testCases.filter(tc => !tc.is_hidden);

      if (filteredTestCases.length === 0) {
        return {
          type: SubmissionResultType.PASSED,
          testCaseResults: []
        };
      }

      // Execute test cases
      const testCaseResults: TestCaseResult[] = [];
      let totalTimeTaken = 0;
      let maxMemoryUsage = 0;

      for (let i = 0; i < filteredTestCases.length; i++) {
        const testCase = filteredTestCases[i];
        
        try {
          const startTime = Date.now();
          const executionResult = await executor.execute(testCase.input, compilationResult.executable);
          const endTime = Date.now();
          
          const timeTaken = endTime - startTime;
          totalTimeTaken += timeTaken;
          maxMemoryUsage = Math.max(maxMemoryUsage, executionResult.memoryUsage);

          // Check if time limit exceeded
          if (timeTaken > config.timeLimit) {
            return {
              type: SubmissionResultType.TIME_EXCEEDED,
              timeTaken: totalTimeTaken,
              memoryUsage: maxMemoryUsage,
              testCaseResults: testCaseResults
            };
          }

          // Check if memory limit exceeded
          if (executionResult.memoryUsage > config.memoryLimit) {
            return {
              type: SubmissionResultType.MEMORY_EXCEEDED,
              timeTaken: totalTimeTaken,
              memoryUsage: maxMemoryUsage,
              testCaseResults: testCaseResults
            };
          }

          // Compare output
          const actualOutput = executionResult.stdout.trim();
          const expectedOutput = testCase.output.trim();
          const passed = actualOutput === expectedOutput;

          const testCaseResult: TestCaseResult = {
            testCaseIndex: i,
            passed,
            actualOutput,
            expectedOutput,
            timeTaken,
            memoryUsage: executionResult.memoryUsage
          };

          testCaseResults.push(testCaseResult);

          // If any test case fails, return wrong answer
          if (!passed) {
            return {
              type: SubmissionResultType.WRONG_ANSWER,
              timeTaken: totalTimeTaken,
              memoryUsage: maxMemoryUsage,
              testCaseResults: testCaseResults,
              additionalInfo: `Test case ${i + 1} failed. Expected: "${expectedOutput}", Got: "${actualOutput}"`
            };
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          if (errorMessage.includes('TIME_EXCEEDED')) {
            return {
              type: SubmissionResultType.TIME_EXCEEDED,
              timeTaken: totalTimeTaken,
              memoryUsage: maxMemoryUsage,
              testCaseResults: testCaseResults,
              additionalInfo: `Time limit exceeded on test case ${i + 1}`
            };
          }

          return {
            type: SubmissionResultType.RUNTIME_ERROR,
            timeTaken: totalTimeTaken,
            memoryUsage: maxMemoryUsage,
            testCaseResults: testCaseResults,
            additionalInfo: errorMessage
          };
        }
      }

      // All test cases passed
      return {
        type: SubmissionResultType.PASSED,
        timeTaken: totalTimeTaken,
        memoryUsage: maxMemoryUsage,
        testCaseResults: testCaseResults
      };

    } finally {
      await executor.cleanup();
    }
  }
}