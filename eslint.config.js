// eslint.config.js
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    // 作用于所有 TS/TSX/JS/JSX 文件
    files: ['*.ts', '*.tsx', '*.js', '*.jsx'],

    // 使用 TypeScript parser
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },

    // 插件
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },

    // 规则
    rules: {
      // Prettier 错误显示为 ESLint 错误
      'prettier/prettier': 'error',

      // TS 特定规则
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // React JSX 规则
      'react/react-in-jsx-scope': 'off', // React 17+ 不需要 import React
    },
  },
];
