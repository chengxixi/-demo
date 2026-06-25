import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            imports: ['vue', 'vue-router', 'pinia'],
            dts: 'src/auto-imports.d.ts',
            eslintrc: { enabled: true },
        }),
        Components({
            resolvers: [AntDesignVueResolver({ importStyle: false })],
            dts: 'src/components.d.ts',
            dirs: ['src/components'],
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
    },
    build: {
        target: 'es2020',
        chunkSizeWarningLimit: 500,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-vue': ['vue', 'vue-router', 'pinia'],
                    'vendor-ui': ['ant-design-vue', '@ant-design/icons-vue'],
                    'vendor-charts': ['echarts'],
                    'vendor-utils': ['axios', 'dayjs'],
                },
            },
        },
    },
    css: {
        preprocessorOptions: {
            scss: { api: 'modern-compiler' as const },
        },
    },
});
