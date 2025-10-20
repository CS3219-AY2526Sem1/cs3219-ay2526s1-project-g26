import fs from 'fs-extra';
import path from 'path';
import { BaseExecutor } from './BaseExecutor';
import { CompilationResult } from '../types/execution';

export class CppExecutor extends BaseExecutor {
  async compile(codeText: string): Promise<CompilationResult> {
    try {
      const sourceFile = path.join(this.workingDir, 'solution.cpp');
      const executableFile = path.join(this.workingDir, 'solution');
      
      await fs.writeFile(sourceFile, codeText);
      
      const compileCommand = `g++ -std=c++17 -O2 -o solution solution.cpp`;
      const { stderr } = await this.runWithTimeout(compileCommand, 10000);
      
      if (stderr) {
        return { success: false, error: stderr };
      }
      
      // Check if executable was created
      const executableExists = await fs.pathExists(executableFile);
      if (!executableExists) {
        return { success: false, error: 'Compilation failed: no executable generated' };
      }
      
      return { success: true, executable: executableFile };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Compilation failed' };
    }
  }

  async execute(input: string, executable?: string): Promise<{ stdout: string; stderr: string; timeTaken: number; memoryUsage: number }> {
    if (!executable) {
      throw new Error('No executable provided for C++ execution');
    }
    
    const inputFile = path.join(this.workingDir, 'input.txt');
    await fs.writeFile(inputFile, input);
    
    const command = `./solution < input.txt`;
    
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