import pluginVue from 'eslint-plugin-vue';
import { vueTsConfigs } from '@vue/eslint-config-typescript';
import prettierConfig from '@vue/eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  ...vueTsConfigs.recommended,
  ...pluginVue.configs['flat/recommended'],
  prettierConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'vue/multi-word-component-names': 'off',
    },
  },
  // 确保 .vue 文件使用 vue-eslint-parser，script 部分委托给 @typescript-eslint/parser
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
];
