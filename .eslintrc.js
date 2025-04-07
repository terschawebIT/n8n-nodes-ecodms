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
  plugins: [
    'n8n-nodes-base',
  ],
  extends: [
    'plugin:n8n-nodes-base/recommended',
  ],
  rules: {
    'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'off',
    'n8n-nodes-base/node-resource-description-missing-subtitle': 'off',
    'n8n-nodes-base/node-param-description-missing-for-return-all': 'off',
    'n8n-nodes-base/node-param-description-wrong-for-dynamic-options': 'off',
    'n8n-nodes-base/node-param-description-missing-for-dynamic-options': 'off',
  },
}; 