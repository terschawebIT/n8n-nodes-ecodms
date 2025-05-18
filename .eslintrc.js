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
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': 'error',
    'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'off',
    'no-unused-vars': process.env.NODE_ENV === 'production' ? 'error' : 'warn'
  },
}; 