import fs from 'fs-extra';
import path from 'path';
import { BaseExecutor } from './BaseExecutor';
import { CompilationResult } from '../types/execution';

export class JavascriptExecutor extends BaseExecutor {
  async compile(codeText: string): Promise<CompilationResult> {
    try {
      const filePath = path.join(this.workingDir, 'solution.js');
      await fs.writeFile(filePath, codeText);
      
      // Check for syntax errors
      const { stderr } = await this.runWithTimeout(`node --check solution.js`, 5000);
      
      if (stderr) {
        return { success: false, error: stderr };
      }
      
      return { success: true, executable: filePath };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Compilation failed' };
    }
  }

  async execute(input: string, executable?: string): Promise<{ stdout: string; stderr: string; timeTaken: number; memoryUsage: number }> {
    const inputFile = path.join(this.workingDir, 'input.txt');
    await fs.writeFile(inputFile, input);
    
    // Create a wrapper that reads from stdin
    const wrapperCode = `
const fs = require('fs');
const input = fs.readFileSync('input.txt', 'utf8').trim();
const lines = input.split('\\n');
let lineIndex = 0;

// Mock readline interface for competitive programming
const readline = {
  createInterface: () => ({
    on: (event, callback) => {
      if (event === 'line') {
        lines.forEach(line => callback(line));
      }
    },
    close: () => {}
  })
};

// Your solution code starts here
${await fs.readFile(path.join(this.workingDir, 'solution.js'), 'utf8')}
`;
    
    await fs.writeFile(path.join(this.workingDir, 'wrapper.js'), wrapperCode);
    
    const command = `node wrapper.js`;
    
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