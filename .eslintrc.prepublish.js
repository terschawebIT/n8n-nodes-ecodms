module.exports = {
  extends: ['./.eslintrc.js'],
  rules: {
    // Strikte Regeln für die Veröffentlichung
    'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'error',
    'n8n-nodes-base/node-resource-description-missing-subtitle': 'error',
    'n8n-nodes-base/node-param-description-missing-for-return-all': 'error',
    'n8n-nodes-base/node-param-description-wrong-for-dynamic-options': 'error',
    'n8n-nodes-base/node-param-description-missing-for-dynamic-options': 'error',
  },
}; 