import fs from 'fs-extra';
import path from 'path';
import { BaseExecutor } from './BaseExecutor';
import { CompilationResult } from '../types/execution';

export class PythonExecutor extends BaseExecutor {
  async compile(codeText: string): Promise<CompilationResult> {
    try {
      const filePath = path.join(this.workingDir, 'solution.py');
      await fs.writeFile(filePath, codeText);
      
      console.log(`Python code written to: ${filePath}`);
      console.log(`Code content: ${codeText}`);
      
      // First check if Python is available
      try {
        const { stderr: pythonStderr, stdout: pythonStdout } = await this.runWithTimeout(`python3 --version`, 2000);
        console.log(`Python version check - stdout: ${pythonStdout}, stderr: ${pythonStderr}`);
      } catch (pythonError) {
        console.log(`Python version check failed: ${pythonError}`);
        return { success: false, error: `Python not available: ${pythonError instanceof Error ? pythonError.message : 'Unknown error'}` };
      }
      
      // Check for syntax errors by trying to compile
      const { stderr, stdout } = await this.runWithTimeout(`python3 -m py_compile solution.py`, 5000);
      
      console.log(`Python compilation - stderr: ${stderr}, stdout: ${stdout}`);
      
      if (stderr) {
        return { success: false, error: stderr };
      }
      
      return { success: true, executable: filePath };
    } catch (error) {
      console.log(`Python compilation error: ${error}`);
      return { success: false, error: error instanceof Error ? error.message : 'Compilation failed' };
    }
  }

  async execute(input: string, executable?: string): Promise<{ stdout: string; stderr: string; timeTaken: number; memoryUsage: number }> {
    // Write input to a file so Python script can read it via stdin
    const inputFile = path.join(this.workingDir, 'input.txt');
    await fs.writeFile(inputFile, input);
    
    // Execute Python script with input redirected from file
    const command = `python3 solution.py < input.txt`;
    
    try {
      const result = await this.runWithTimeout(command, this.config.timeLimit);
      return {
        ...result,
        memoryUsage: 0 // Simplified memory tracking
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'TIME_EXCEEDED') {
        throw error;
      }
      throw new Error(`RUNTIME_ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}