module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2019,
  },
  rules: {
    'no-unused-vars':  'warn',
    'no-mixed-operators':  'warn',
    'no-underscore-dangle':  'off',
    'consistent-return': 'warn',
    'max-len': 'off',
    'indent': 'off',
    'no-console': 'off',
  },
};
