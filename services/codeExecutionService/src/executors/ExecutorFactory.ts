import { SupportedLanguage, ExecutionConfig } from '../types/execution';
import { BaseExecutor } from './BaseExecutor';
import { PythonExecutor } from './PythonExecutor';
import { JavascriptExecutor } from './JavascriptExecutor';
import { CppExecutor } from './CppExecutor';
import { JavaExecutor } from './JavaExecutor';

export class ExecutorFactory {
  static createExecutor(language: SupportedLanguage, config: ExecutionConfig): BaseExecutor {
    switch (language) {
      case SupportedLanguage.PYTHON:
        return new PythonExecutor(config);
      case SupportedLanguage.JAVASCRIPT:
        return new JavascriptExecutor(config);
      case SupportedLanguage.CPP:
        return new CppExecutor(config);
      case SupportedLanguage.JAVA:
        return new JavaExecutor(config);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }
}