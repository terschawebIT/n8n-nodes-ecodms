module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // Einfache Basis-Regeln
    'no-console': 'warn',
    'no-debugger': 'error',
  },
}; 