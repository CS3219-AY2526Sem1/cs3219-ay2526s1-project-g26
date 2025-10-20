import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { 
  CompilationResult, 
  ExecutionConfig 
} from '../types/execution';

const execAsync = promisify(exec);

export abstract class BaseExecutor {
  protected readonly workingDir: string;
  protected readonly config: ExecutionConfig;

  constructor(config: ExecutionConfig) {
    this.workingDir = path.join(process.cwd(), 'temp', uuidv4());
    this.config = config;
  }

  abstract compile(codeText: string): Promise<CompilationResult>;
  abstract execute(input: string, executable?: string): Promise<{ stdout: string; stderr: string; timeTaken: number; memoryUsage: number }>;

  async setup(): Promise<void> {
    await fs.ensureDir(this.workingDir);
  }

  async cleanup(): Promise<void> {
    await fs.remove(this.workingDir);
  }

  protected async runWithTimeout(command: string, timeoutMs: number): Promise<{ stdout: string; stderr: string; timeTaken: number }> {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const child = exec(command, { cwd: this.workingDir, maxBuffer: 10 * 1024 * 1024 });
      
      const timeout = setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error('TIME_EXCEEDED'));
      }, timeoutMs);

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data: any) => {
        stdout += data;
      });

      child.stderr?.on('data', (data: any) => {
        stderr += data;
      });

      child.on('close', (code: any) => {
        clearTimeout(timeout);
        const timeTaken = Date.now() - startTime;
        
        if (code === 0) {
          resolve({ stdout: stdout.trim(), stderr: stderr.trim(), timeTaken });
        } else {
          reject(new Error(`Process exited with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error: any) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  protected async getMemoryUsage(pid: number): Promise<number> {
    try {
      // This is a simplified memory usage calculation
      // In production, you'd want more sophisticated memory monitoring
      const { stdout } = await execAsync(`ps -p ${pid} -o rss= 2>/dev/null || echo "0"`);
      return parseInt(stdout.trim()) / 1024; // Convert KB to MB
    } catch {
      return 0;
    }
  }
}