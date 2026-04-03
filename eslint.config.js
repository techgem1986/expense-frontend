import js from '@eslint/js';
import react from 'eslint-plugin-react';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import jsxA11y from 'eslint-plugin-jsx-a11y';

// Exclude config and test files from main linting
const ignorePatterns = ['eslint.config.js', '.eslintrc.js', 'jest.config.js', 'vite.config.*', 'node_modules/', 'build/', 'dist/', '**/*.test.*', '**/*.spec.*'];

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  {
    ignores: ignorePatterns,
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        // Jest globals for test files
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'jsx-a11y': jsxA11y,
      'react': react,
    },
    rules: {
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'jsx-a11y/anchor-is-valid': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
