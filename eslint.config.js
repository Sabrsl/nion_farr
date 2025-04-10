const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    ignores: [
      '**/node_modules/**', 
      '**/.next/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/backend/**/*.js'
    ],
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { 
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'react/no-unescaped-entities': 'off',
      'react/jsx-key': 'off',
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: null
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      // TypeScript specific rules here
    }
  }
]; 