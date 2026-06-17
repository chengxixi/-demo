module.exports = {
  root: true,
  env: { node: true, browser: true },
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-typescript',
    'plugin:prettier/recommended',
  ],
  parserOptions: { ecmaVersion: 2020 },
  rules: {
    'prettier/prettier': [
      'error',
      { singleQuote: true, semi: true, trailingComma: 'all', tabWidth: 2 },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'vue/require-explicit-emits': 'error',
  },
};
