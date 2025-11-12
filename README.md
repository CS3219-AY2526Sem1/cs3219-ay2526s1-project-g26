[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/QUdQy4ix)

# CS3219 Project (PeerPrep) - AY2526S1

## Group: G26

## AI Use Summary

- `/frontend/src/components/collaboration_space/StyledPanelResizeHandle.tsx`.
  - Date: 2025-10-23
  - Tool: Gemini 2.5 Pro
  - Prompt: Generate a .tsx file of ResizeHandle UI with styledcomponent, it should be compatible with `react-resizable-panels` library.
  - Output Summary: A .tsx file that includes the UI implementation of a ResizeHandle.
  - Action Taken: Modified.
  - Author Notes: Modified the output to match the prettier style format.
- `/frontend/src/components/common/LoadingSkeleton.tsx`.
  - Date: 2025-09-24
  - Tool: Gemini 2.5 Pro
  - Prompt: Generate a .tsx file of a full-screen LoadingSkeleton UI with MUI.
  - Output Summary: A .tsx file that includes the UI implementation of a LoadingSkeleton.
  - Action Taken: Modified.
  - Author Notes: Modified the output to match the prettier style format.
- `/services/questionService/questionGenerator/inputs/*` and `/services/questionService/questionGenerator/questions.json`.

  - Date: The files were continuously generated across many different days.
  - Tool: Gemini 2.5 Pro
  - Prompt (with attachments of `two_sum.cpp`, `two_sum.in` and `questions.json` under `/services/questionService/questionGenerator/**/*`):

    ```markdown
    You are a software engineer who is currently developing a backend system to support pair coding. You are developing question microservice which stores a pool of questions in the database. Your task is to generate more questions in the database. Luckily, the other developer created a utility that helps you to create a question easily. It works as follows:

    1. Add a question into `questions.json`.

    2. Create an input file, the input filename should be the same as `title` attribute in `questions.json`, but replace all upper-case letters with lower-case letters, and replace all spaces with underscore. The file extension should be `.in`. Example: if the title is `Two Sum`, then the input filename should be `two_sum.in`. In this input file, it should have more than 50 test cases, each test case should be seperated by an empty line.

    3. Create a cpp solution file, the solution filename should be the same as `title` attribute in `questions.json`, but replace all upper-case letters with lower-case letters, and replace all spaces with underscore. The file extension should be `.cpp`. Example: if the title is `Two Sum`, then the solution filename should be `two_sum.cpp`.

    The `questions.json` file attached contains all the questions in the current database, and `two_sum.in` is the input file based on `Two Sum` problem in `questions.json`, and `two_sum.cpp` is the solution file based on `Two Sum` problem in `questions.json`.

    Your task is to generate a question from LeetCode, that is `Merge K Sorted Lists` with a new element in `questions.json`, a input file and a solution file. Question should have only one difficulty level among ('easy', 'medium', 'hard) and multiple categories among ('array', 'string', 'linked-list', 'tree', 'graph', 'sorting', 'dynamic-programming', 'binary-search', 'hash-table', 'greedy').
    ```

  - Output Summary: A new element in `questions.json`, an input file and a solution file in cpp.
  - Action Taken: Accepted.

- `/services/questionService/src/services/questionService.ts`.
  - Date: from 2025‑09-24 to 2025-10-23
  - Tool: Gemini 2.5 Pro
  - Prompt (Summary): Generate endpoints implementation for `getQuestionTestCases`, `getAllQuestions`, `getAllCategoryAndDifficulty`, `updateQuestion`, `createQuestion`, `deleteQuestion`.
  - Output Summary: A .ts file with implementation with all these endpoints.
  - Action Taken: Modified.
  - Author Notes: Modified the output to match the prettier style format.

- `/services/codeExecutionService/src/services/codeExecutionService.ts`.
  - Date: 2025-10-24
  - Tool: Github Copilot (Claude Sonnet 4.5)
  - Prompt (with attachments of `services/codeExecutionService/src/types/index.ts` and `services/codeExecutionService/src/utils/codeExecutor.ts`):
    ```markdown
    Create a `validateCode` async function that orchestrates code execution against test cases. Requirements:

    1. Function signature: `validateCode(testCases: TestCase[], language: Language, code_text: string): Promise<SubmissionResult>`

    2. Implementation flow:
       - Generate unique temp file with UUID for the submission
       - Write source code to temp file with appropriate extension (.cpp/.py/.cjs)
       - For C++: compile with g++ first, handle compilation errors
       - Loop through each test case: call `executeCode` utility with test case input
       - Compare actual output with expected output (string comparison)
       - Track passed_tests count, total execution time, and max memory usage
       - Return early on first failure with appropriate status

    3. Status determination priority: Compilation Error > Time Limit Exceeded > Runtime Error > Wrong Answer

    4. Return SubmissionResult with: status, passed_tests, total_tests, execution_time, memory_used, error (if any), test_case_details (input, expected_output, actual_output)

    5. Clean up temp files after execution
    
    Use the TypeScript interfaces from the attached types file for type safety.
    ```
  - Output Summary: A .ts file with core business logic implementing the `validateCode` function with test case execution loop, basic string equality for output comparison, and initial error handling structure.
  - Action Taken: Modified.
  - Author Notes: Added `normalizeOutput` and `compareOutputs` helper functions for robust multi-line and order-independent output comparison.

- `/services/codeExecutionService/src/utils/codeExecutor.ts`.
  - Date: 2025-10-24
  - Tool: Github Copilot (Claude Sonnet 4.5)
  - Prompt (with attachments of `services/codeExecutionService/src/types/index.ts`):
    ```markdown
    Implement an `executeCode` async function as the low-level execution engine. Requirements:

    1. Function signature: `executeCode(filename: string, language: Language, input: string, timeLimit: number): Promise<CodeExecutionOutput>`

    2. Create a LANGUAGE_CONFIG object mapping each language to:
       - extension: '.cpp' for C++, '.py' for Python, '.cjs' for JavaScript
       - compileCmd: function returning g++ command for C++, null for Python/JS
       - executeCmd: function returning execution command (./executable for C++, python/node for others)

    3. Implementation:
       - Use child_process to spawn processes (separate for compilation and execution)
       - For C++: spawn g++ compilation process first
       - Spawn execution process and write input to stdin stream
       - Capture stdout and stderr in real-time
       - Implement timeout mechanism: kill process if execution exceeds timeLimit milliseconds
       - Track execution time from start to finish

    4. Return CodeExecutionOutput with: success (boolean), output (stdout string), error (stderr/error message), executionTime (in ms)

    5. Handle three error types: compilation errors, timeout errors, runtime errors
    
    Use the CodeExecutionOutput and Language types from the attached types file.
    ```
  - Output Summary: A .ts file with low-level code execution engine implementing the `executeCode` function and basic timeout handling with setTimeout.
  - Action Taken: Modified.
  - Author Notes: added `pidusage` for memory monitoring, tested with edge cases.

- `/frontend/src/pages/SubmissionDetail.tsx`.
  - Date: 2025-10-17
  - Tool: Github Copilot (Claude Sonnet 4.5)
  - Prompt (with attachments of Figma prototype screenshots for submission detail page):
    ```markdown
    Create `SubmissionDetail` page component. Fetch submission by ID from URL params, show loading/error states. UI: problem title with difficulty chip, status chip with test case count, performance metrics (time/memory), Monaco Editor for code display, failing test case details if applicable. Use MUI components, styled-components, responsive design, color-coded statuses.
    ```
  - Output Summary: A .tsx file with SubmissionDetail component including styled-components (StyledCard, ProblemTitle, StatusText), useEffect data fetching, getDifficultyColor function, and Monaco Editor integration.
  - Action Taken: Modified.
  - Author Notes: Enhanced styled-components with custom color schemes and spacing.

- `/frontend/src/components/common/QuestionPanel.tsx`.
  - Date: 2025-10-08
  - Tool: Github Copilot (Claude Sonnet 4.5)
  - Prompt (with attachments of Figma prototype screenshots for question display panel and `services/questionService/src/database/init/questions_output.json`):
    ```markdown
    Create `QuestionPanel` component following the question schema in attached JSON file. Props: question, loading, error, onQuestionChange. Display question title with difficulty chip, category tags, description, MUI Accordions for examples (input/output/explanation) and constraints/hints. Include loading spinner and error alert.
    ```
  - Output Summary: A .tsx file implementing the QuestionPanel component with basic MUI layout, ReactMarkdown integration, and accordion structure for examples/constraints.
  - Action Taken: Modified.
  - Author Notes: Enhanced markdown rendering with custom styles for code blocks and lists and refined category chip layout and colors.

- `/docs/api-reference/openapi.json`.
  - Date: 2025-11-08
  - Tool: Github Copilot (Claude Sonnet 4.5)
  - Prompt:
    Create API documentation openapi.json on Mintlify for PeerPrep. The document should follow the OpenAPI specification 3.0+. Generate complete API reference structure for four microservices: userservice, questionservice, historyservice, and aiservice. Include all endpoints with request/response schemas, authentication requirements, and list corresponding service implementation files for me to check. After generation, verify the JSON structure for errors.
  - Output Summary: A .json file with OpenAPI 3.0 specification including server configurations, tags for four services, paths for all endpoints request/response schemas.
  - Action Taken: Modified.
  - Author Notes: Tested API requests with "try it" button, traced corresponding implementation files to debug errors, refined details such as password requirements. (.json files do not support comments, so AI usage disclosure is documented here in README only.)

- `services/historyService/src/services/submissionHistoryService.ts`.
  - Date: Between Sep and Oct 2025
  - Tool: Github Copilot (Calude Sonnet 4.5)
  - Prompt (paraphrased, summarised): Break down what the existing code committed by others does, and (later on) modify the code to filter by run mode.
  - Output Summary: The relevant explanation, and a .tsx file with the changes made
  - Action Taken: Confirmed with Google, and rejected due to it not working.
  - Author Notes: Also modified with attempted code to run and asking for debugging assistance, but it did not work here.

- `services\userService\src\services\authService.ts`.
  - Date: Between Sep and Oct 2025
  - Tool: Github Copilot (Calude Sonnet 4.5)
  - Prompt (summarised): suggest an alternative to the regex that doesn't trip the security flags for polynomial backtracking.
  - Output Summary: The code separated out into a function for later use.
  - Action Taken: Modified.
  - Author Notes: The generated code did not quite have the same behaviour as before, and needed to change to ensure sync between frontend and backend.
