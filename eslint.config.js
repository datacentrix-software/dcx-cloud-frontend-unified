// ESLint Configuration with Security Rules
import js from '@eslint/js'
import security from 'eslint-plugin-security'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      security
    },
    rules: {
      // Security rules from eslint-plugin-security
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-pseudo-random-bytes': 'error',
      'security/detect-possible-timing-attacks': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      
      // Additional security-focused rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      
      // Prevent dangerous HTML
      'no-inner-html': 'off', // Would need custom rule for React
      
      // Console restrictions for production
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      
      // Strict equality
      'eqeqeq': ['error', 'always'],
      
      // Prevent prototype pollution
      'no-prototype-builtins': 'error',
      
      // Require safe regex
      'require-unicode-regexp': 'error'
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        process: 'readonly'
      }
    }
  },
  {
    // Test files have different security considerations
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*'],
    rules: {
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-regexp': 'off',
      'no-console': 'off'
    }
  }
]