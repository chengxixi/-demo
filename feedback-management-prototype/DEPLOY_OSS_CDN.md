# 阿里云 OSS 部署说明

本项目是 Vue3 + Vite 单页应用。业务页面主要在 `src/**/*.vue` 中维护，`index.html` 是 Vite 入口壳文件；构建后会生成 `dist/index.html` 和 `dist/assets/*`。

## 需要的信息

部署到阿里云 OSS 需要：

- `AccessKeyId`
- `AccessKeySecret`
- `SecurityToken`，如果使用 STS 临时凭证才需要
- OSS Region，例如 `cn-shanghai`
- OSS Bucket 名称

建议使用临时 RAM/STS 凭据，并只授权目标 Bucket 的读写权限。

## 一键部署

在项目目录运行：

```powershell
cd D:\code\produce_iteration_system\produce_iteration_system-main\feedback-management-prototype
.\deploy-oss-cdn.ps1 `
  -AccessKeyId "your-access-key-id" `
  -AccessKeySecret "your-access-key-secret" `
  -SecurityToken "your-sts-token" `
  -Region "cn-shanghai" `
  -Bucket "your-bucket-name"
```

如果不用 STS，去掉 `-SecurityToken` 即可。

如果 Bucket 还不存在，并且当前凭据有创建 Bucket 权限：

```powershell
.\deploy-oss-cdn.ps1 -CreateBucket
```

## 修改页面

日常开发优先改：

- `src/components/*.vue`
- `src/stores/*.ts`
- `src/services/*.ts`
- `src/styles/index.css`

然后重新执行：

```powershell
npm run build
.\deploy-oss-cdn.ps1 -SkipBuild
```

如果只想查看构建后的 HTML，文件在：

```text
dist/index.html
```

但不要直接长期编辑 `dist/index.html`，下一次构建会覆盖它。

## 缓存策略

脚本会设置：

- `index.html`: `Cache-Control:no-cache`
- `assets/*`: `Cache-Control:public,max-age=31536000,immutable`

这样每次重新部署后，团队成员刷新入口页面即可拿到新的资源引用。
