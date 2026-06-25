import js from '@eslint/js';
import eslintPluginVue from 'eslint-plugin-vue';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import autoImportConfig from './.eslintrc-auto-import.json' with { type: 'json' };

export default [
    js.configs.recommended,
    ...eslintPluginVue.configs['flat/recommended'],
    prettier,
    autoImportConfig,
    {
        files: ['*.vue', '**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: tsParser,
            },
        },
    },
    {
        files: ['*.ts', '**/*.ts'],
        plugins: {
            '@typescript-eslint': ts,
        },
        languageOptions: {
            parser: tsParser,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },
    {
        ignores: ['dist/**', 'node_modules/**', '*.config.*', 'src/auto-imports.d.ts', 'src/components.d.ts'],
    },
];
