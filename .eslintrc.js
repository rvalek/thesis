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
    'consistent-return': 'warn',
    'max-len': 'warn'
  },
};
