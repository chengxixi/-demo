部署说明（针对非专业人员，中文）

目标：把本地构建的静态站点（dist/）上传到阿里云 OSS，并给出在 CDN 控制台配置的清晰步骤。

先决条件：
- 在一台能联网的 Windows 电脑上执行（推荐项目根目录为 feedback-management-prototype）。
- 已安装 Node.js（用于构建），或已在本地预先生成好 dist/ 目录。
- 建议安装 ossutil（脚本会尝试自动下载到 ./tools/ossutil.exe）。

快速步骤（一键脚本）：
1. 打开 PowerShell，定位到项目目录：
   cd D:\code\produce_iteration_system\produce_iteration_system-main\feedback-management-prototype
2. 运行部署脚本：
   .\deploy-oss-cdn.ps1
3. 按提示输入临时阿里云凭证：AccessKeyId、AccessKeySecret、SecurityToken（SecurityToken 可留空，如果使用临时 STS 一定要填）
4. 输入 OSS 区域（如 cn-shenzhen）与要使用的 Bucket 名称（例如 demo-feedback-bucket）
5. 脚本会：
   - （可选）运行 npm run build（如果本地已安装 Node）
   - 下载 ossutil（如本机未安装）
   - 将 dist/ 文件同步上传到指定 OSS Bucket，并设置为 public-read
   - 设置简单的 CORS 规则
   - 输出示例访问地址： http://{bucket}.oss-{region}.aliyuncs.com/index.html

CDN（阿里云 CDN）配置（控制台手动步骤，非专业人员也可按此操作）：
1. 登录阿里云控制台 → CDN → 域名管理 → 添加域名
2. 输入要使用的展示域名（例如 demo.example.com），选择加速区域（国内）
3. 源站类型选择“OSS”，源站域名填写：{bucket}.oss-{region}.aliyuncs.com
4. 等待域名审核/生效（通常几分钟）
5. 在域名加速配置中：
   - 添加缓存规则（例如：静态资源长期缓存，HTML 页面短缓存或不缓存）
   - 如需 HTTPS，添加证书（可使用阿里云免费证书并自动部署）

常见问题与说明：
- 如果访问出现 403，请确认 Bucket 对象已设为公共读，或在控制台设置 Bucket 权限为公共读（只针对 demo）。
- SPA（单页应用）需要 404 指向 index.html 的回退规则。OSS 可通过 Website 功能设置默认首页与错误页面（index.html）。脚本未强制开启 Website，如需可在控制台或通过 ossutil 设置。

我可以代为操作 CDN 配置：
- 若需要我代为配置 CDN，请在安全私密通道（公司私聊/密码管理器/本地输入）提供临时 RAM/STStoken，或在本地运行脚本并把控制台输出的域名信息贴给我继续执行控制台/API 操作。

安全提示：
- 尽量使用临时 STS（有效期短、权限最小）。
- 不要在公开聊天中粘贴 AccessKey 或 Secret。

如需我把 CDN 自动化命令也写成脚本（需要阿里云 CLI 并更细的权限），回复“自动化 CDN”。
