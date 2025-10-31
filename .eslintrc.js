module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'script'
  },
  globals: {
    // ServiceNow globals
    'gs': 'readonly',
    'GlideQuery': 'readonly',
    'GlideRecord': 'readonly',
    'GlideElement': 'readonly',
    'GlideSysAttachment': 'readonly',
    'GlideAggregate': 'readonly',
    'JSON': 'readonly',
    'JSUtil': 'readonly'
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-console': 'warn',
    'no-unused-vars': 'warn'
  }
};
