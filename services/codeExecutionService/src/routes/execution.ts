import { Router, Request, Response } from 'express';
import { CodeExecutionService } from '../services/CodeExecutionService';
import { CodeExecutionRequest, SupportedLanguage } from '../types/execution';

export const executionRoutes = Router();

const codeExecutionService = new CodeExecutionService();

// Function to get test cases from question service
async function getTestCasesFromQuestionService(questionId: string) {
  try {
    // Make HTTP request to question service to get the question with test cases
    const questionServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:4010';
    
    console.log(`Getting test cases for question ${questionId} from ${questionServiceUrl}`);
    
    const response = await fetch(`${questionServiceUrl}/${questionId}/execute`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch question: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json() as any;
    
    if (!responseData?.success || !responseData?.question?.test_cases) {
      throw new Error('No test cases found in question data');
    }
    
    const questionData = responseData.question;
    console.log(`Found ${questionData.test_cases.length} test cases for question: ${questionData.title}`);
    
    return questionData.test_cases;
    
  } catch (error) {
    console.error(`Failed to get test cases for question ${questionId}:`, error);
    // Return empty array to allow service to continue (though execution will fail)
    return [];
  }
}

/**
 * POST /execute
 * Execute code against test cases
 * 
 * Body:
 * {
 *   "questionId": "string",
 *   "language": "python" | "javascript" | "java" | "cpp",
 *   "codeText": "string",
 *   "isFullSubmission": boolean // optional, defaults to false
 * }
 */
executionRoutes.post('/execute', async (req: Request, res: Response) => {
  try {
    const { questionId, language, codeText, isFullSubmission = false } = req.body;

    // Validate request
    if (!questionId || !language || !codeText) {
      return res.status(400).json({
        error: 'Missing required fields: questionId, language, codeText'
      });
    }

    // Validate language
    if (!Object.values(SupportedLanguage).includes(language)) {
      return res.status(400).json({
        error: `Unsupported language: ${language}. Supported languages: ${Object.values(SupportedLanguage).join(', ')}`
      });
    }

    const executionRequest: CodeExecutionRequest = {
      questionId,
      language,
      codeText,
      isFullSubmission
    };

    // Get test cases from question service
    const testCases = await getTestCasesFromQuestionService(questionId);

    // Execute code
    const result = await codeExecutionService.executeCode(executionRequest, testCases);

    res.json(result);

  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      error: 'Internal server error during code execution',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
executionRoutes.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'code-execution-service'
  });
});

/**
 * GET /languages
 * Get supported languages
 */
executionRoutes.get('/languages', (req: Request, res: Response) => {
  res.json({
    supported_languages: Object.values(SupportedLanguage)
  });
});