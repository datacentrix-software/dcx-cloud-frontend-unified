// ESLint Configuration - Build Compatible
const { FlatCompat } = require('@eslint/eslintrc')

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

module.exports = [
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Basic security rules as warnings
      'no-eval': 'warn',
      'no-console': 'warn',
      'no-debugger': 'warn',
    }
  },
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'public/',
      'coverage/',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      'scripts/',
      '__tests__/',
    ]
  }
]