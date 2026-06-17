# 反馈管理系统 Demo

本项目是 Vue3 + Vite + Pinia + TypeScript 原型工程，已包含：

- Vue 单文件组件统一使用 `<script setup lang="ts">` 与组合式 API。
- Pinia 管理跨组件状态，避免 Props/Emit 层层透传。
- Axios 统一封装，包含请求拦截器、响应拦截器与错误归一化。
- TailwindCSS 原子类优先的样式实现。
- ESLint + Prettier 统一代码风格：2 空格、单引号、分号、尾逗号。

## 本地运行

```bash
npm install
npm run dev
```

## 质量检查

```bash
npm run lint
npm run build
```

## 部署

根目录已提供 `vercel.json`，Vercel 可从仓库根目录构建：

- Build Command: `npm run build`
- Output Directory: `feedback-management-prototype/dist`

如需接入真实后端接口，设置 `VITE_API_BASE_URL`，并将 `VITE_USE_MOCK=false`。
