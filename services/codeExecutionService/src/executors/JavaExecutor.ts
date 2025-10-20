import fs from 'fs-extra';
import path from 'path';
import { BaseExecutor } from './BaseExecutor';
import { CompilationResult } from '../types/execution';

export class JavaExecutor extends BaseExecutor {
  async compile(codeText: string): Promise<CompilationResult> {
    try {
      // Extract class name from Java code
      const classNameMatch = codeText.match(/public\s+class\s+(\w+)/);
      const className = classNameMatch ? classNameMatch[1] : 'Solution';
      
      const sourceFile = path.join(this.workingDir, `${className}.java`);
      await fs.writeFile(sourceFile, codeText);
      
      const compileCommand = `javac ${className}.java`;
      const { stderr } = await this.runWithTimeout(compileCommand, 10000);
      
      if (stderr) {
        return { success: false, error: stderr };
      }
      
      // Check if class file was created
      const classFile = path.join(this.workingDir, `${className}.class`);
      const classFileExists = await fs.pathExists(classFile);
      if (!classFileExists) {
        return { success: false, error: 'Compilation failed: no class file generated' };
      }
      
      return { success: true, executable: className };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Compilation failed' };
    }
  }

  async execute(input: string, executable?: string): Promise<{ stdout: string; stderr: string; timeTaken: number; memoryUsage: number }> {
    if (!executable) {
      throw new Error('No class name provided for Java execution');
    }
    
    const inputFile = path.join(this.workingDir, 'input.txt');
    await fs.writeFile(inputFile, input);
    
    const command = `java ${executable} < input.txt`;
    
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