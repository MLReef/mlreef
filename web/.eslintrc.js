module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  extends: [
    'airbnb',
  ],
  parser: 'babel-eslint',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'cypress',
  ],
  rules: {
    'no-confusing-arrow': 0,
    'arrow-parens': 0,
    'import/no-unresolved': 0,
    'react/jsx-one-expression-per-line': 0,
    'jsx-a11y/label-has-associated-control': [
      'warn',
      {
        assert: 'either',
      },
    ],
  },
};
