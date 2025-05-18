import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import n8nNodesBase from 'eslint-plugin-n8n-nodes-base';

export default [
  js.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint,
      'n8n-nodes-base': n8nNodesBase,
    },
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 2020,
      },
      globals: {
        console: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        args: 'none',
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'prefer-const': 'warn',
      'no-console': ['warn', { 
        allow: ['warn', 'error', 'info', 'debug', 'log'] 
      }],
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
]; 