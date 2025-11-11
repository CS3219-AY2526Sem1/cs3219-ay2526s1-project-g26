[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/QUdQy4ix)

# CS3219 Project (PeerPrep) - AY2526S1 G26

## Feature List

- User Profile Related:
  - Sign up
  - Sign in
  - Reset password
  - Update profile
  - Logout
- Matching Related:
  - Start a matching
- Collaboration Session Related:
  - View the question in Markdown format
  - Edit on a shared document
  - Cursor position awareness on the shared document
  - Editor syntax highlighting and auto completion
  - Editor CRDT algorithm
  - Switch programming language
  - Microphone communication
  - Adjust panel ratio
  - Run & Submit the code for verification
  - Translate the code to another programming language
  - View summary of attempted submissions in the collaboration session
  - View a detailed submission in the collaboration session
  - Gracefully exit the collaboration session
- Submission History Related:
  - View summary of all attempted submissions
  - View a detailed submission

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
