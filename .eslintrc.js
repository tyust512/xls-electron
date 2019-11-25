// module.exports = {
//   root: true,
//   parser: 'babel-eslint',
//   parserOptions: {
//     sourceType: 'module'
//   },
//   env: {
//     browser: true,
//     node: true
//   },
//   extends: 'standard',
//   globals: {
//     __static: true
//   },
//   plugins: [
//     'html'
//   ],
//   'rules': {
//     // allow paren-less arrow functions
//     'arrow-parens': 0,
//     // allow async-await
//     'generator-star-spacing': 0,
//     // allow debugger during development
//     'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
//   }
// }


// https://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  env: {
    browser: true,
    node: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['html'],
  rules: {
    'no-console': "warn", 
    'no-debugger': "warn", 
    eqeqeq: ['error', 'always'], // 强等于
    semi: ['error', 'never'], // 不加引号
    quotes: ['error', 'single'],
    'comma-dangle': [
      'error',
      {
        objects: 'always-multiline',
        arrays: 'never',
      },
    ],
    'block-spacing': "warn", // 双括号两边需空格
  },
};
