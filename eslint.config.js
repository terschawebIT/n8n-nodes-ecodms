const js = require('@eslint/js');
const globals = require('globals');
const typescriptParser = require('@typescript-eslint/parser');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const n8nNodesBase = require('eslint-plugin-n8n-nodes-base');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'n8n-nodes-base': n8nNodesBase,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'error',
      'n8n-nodes-base/node-class-description-missing-subtitle': 'error',
      'n8n-nodes-base/node-class-description-display-name-wrong-for-regular-node': 'error',
      'n8n-nodes-base/node-class-description-icon-not-svg': 'error',
      'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'error',
      'n8n-nodes-base/node-resource-description-filename-against-convention': 'error',
      'n8n-nodes-base/node-param-description-missing-for-return-all': 'error',
      'n8n-nodes-base/node-param-description-wrong-for-limit': 'error',
      'n8n-nodes-base/node-param-description-missing-for-simplify': 'error',
      'n8n-nodes-base/node-param-description-missing-for-upsert': 'error',
      'n8n-nodes-base/node-param-default-missing': 'error',
      'n8n-nodes-base/node-param-default-wrong': 'error',
      'n8n-nodes-base/node-param-description-missing': 'error',
      'n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options': 'error',
      'n8n-nodes-base/node-param-operation-without-no-data-expression': 'error',
      'n8n-nodes-base/node-param-option-name-containing-star': 'error',
      'n8n-nodes-base/node-param-option-name-wrong-for-get-all': 'error',
      'n8n-nodes-base/node-param-option-name-wrong-for-upsert': 'error',
      'n8n-nodes-base/node-param-option-value-wrong-for-get-all': 'error',
      'n8n-nodes-base/node-param-required-false': 'error',
    },
  },
]; 