module.exports = {
  extends: '@servicenow/eslint-config-servicenow',
  env: {
    browser: false,
    node: true,
    es6: false // ServiceNow uses ES5
  },
  parserOptions: {
    ecmaVersion: 5,
    sourceType: 'script'
  },
  globals: {
    // ServiceNow server-side globals
    gs: 'readonly',
    GlideRecord: 'readonly',
    GlideQuery: 'readonly',
    GlideAggregate: 'readonly',
    GlideDateTime: 'readonly',
    GlideDuration: 'readonly',
    GlideSystem: 'readonly',
    GlideSession: 'readonly',
    GlideUser: 'readonly',
    GlideScopedEvaluator: 'readonly',
    current: 'readonly',
    previous: 'readonly',
    answer: 'readonly',

    // ServiceNow client-side globals
    g_form: 'readonly',
    g_list: 'readonly',
    g_user: 'readonly',
    GlideAjax: 'readonly',
    GlideModal: 'readonly',
    GlideDialogWindow: 'readonly',

    // Testing globals
    describe: 'readonly',
    it: 'readonly',
    before: 'readonly',
    after: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    expect: 'readonly',
    assert: 'readonly',
    sinon: 'readonly'
  },
  rules: {
    // ServiceNow-specific rules
    'no-var': 'off', // ServiceNow uses var
    'prefer-const': 'off', // ServiceNow uses var
    'prefer-arrow-callback': 'off', // ServiceNow uses function expressions
    'object-shorthand': 'off', // ServiceNow ES5
    'prefer-template': 'off', // ServiceNow uses string concatenation

    // Code quality
    'no-unused-vars': ['error', {
      vars: 'all',
      args: 'after-used',
      varsIgnorePattern: '^_'
    }],
    'no-undef': 'error',
    'no-console': 'warn',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'brace-style': ['error', '1tbs'],
    'indent': ['error', 2],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],

    // Best practices
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-with': 'error',
    'no-loop-func': 'error',
    'no-new-func': 'error',
    'no-return-assign': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'radix': 'error',
    'yoda': 'error',

    // Performance
    'no-extend-native': 'error',
    'no-iterator': 'error',
    'no-proto': 'error',

    // Security
    'no-script-url': 'error',
    'no-restricted-globals': ['error', 'event', 'fdescribe']
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        mocha: true
      }
    },
    {
      files: ['scripts/**/*.js'],
      env: {
        node: true,
        es6: true
      },
      parserOptions: {
        ecmaVersion: 2020
      },
      rules: {
        'no-var': 'error',
        'prefer-const': 'error',
        'no-console': 'off'
      }
    }
  ]
};
