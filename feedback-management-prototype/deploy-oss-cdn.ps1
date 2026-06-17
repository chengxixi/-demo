<#
PowerShell 部署脚本（本地运行并在提示时输入临时凭证）
用途：构建项目并将 dist 上传至阿里云 OSS，辅助生成可访问的静态站点 URL
说明（简要）：
  - 需在能上网的 Windows 环境执行
  - 要求：已安装 Node.js（用于 npm run build）；或已生成好 dist 文件
  - 脚本可自动下载 ossutil（官方发布的二进制），并用临时 STS 凭证上传
  - CDN 建议在阿里云控制台完成，脚本提供必要的信息与建议步骤
#>

param()

function Read-Secret([string]$prompt) {
  Write-Host $prompt -NoNewline
  $sec = Read-Host -AsSecureString
  return [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}

Write-Host "=== 反馈管理系统：OSS 上传与 CDN 辅助脚本 ==="
$projectDir = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
Set-Location $projectDir

# 建议的构建步骤
if (Test-Path "dist") {
  Write-Host "检测到 dist/ 目录，跳过构建。"
} else {
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "正在执行 npm run build..."
    npm run build
    if ($LASTEXITCODE -ne 0) { Write-Error "npm run build 失败，请先在本地确保能成功构建。"; exit 1 }
  } else {
    Write-Warning "未检测到 npm。请先在本地生成 dist/ 或安装 Node.js 并运行 npm run build。脚本将继续，但不会上传。"
  }
}

# 读取临时凭证（可粘贴或输入）
$accessKeyId = Read-Host "输入临时 AccessKeyId"
$accessKeySecret = Read-Secret "输入临时 AccessKeySecret（以安全方式输入）: "
$securityToken = Read-Secret "输入 SecurityToken（如无可回车跳过）: "
if ([string]::IsNullOrWhiteSpace($securityToken)) { $securityToken = $null }

# 选择地域与桶名
$region = Read-Host "输入 OSS 区域（例如 cn-shenzhen）"
$bucket = Read-Host "输入要上传的 OSS Bucket 名称（会创建或覆盖同名对象）"

# 检查或下载 ossutil
$toolsDir = Join-Path $projectDir 'tools'
if (!(Test-Path $toolsDir)) { New-Item -ItemType Directory -Path $toolsDir | Out-Null }
$ossutilPath = Join-Path $toolsDir 'ossutil.exe'
if (!(Test-Path $ossutilPath)) {
  Write-Host "未检测到 ossutil，正在下载官方推荐的 ossutil64.exe（请保证能联网）..."
  $downloadUrl = 'https://gosspublic.alicdn.com/ossutil/1.7.9/ossutil64.exe'
  try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $ossutilPath -UseBasicParsing -ErrorAction Stop
    Write-Host "下载完成：$ossutilPath"
  } catch {
    Write-Warning "自动下载失败，请手动从 https://help.aliyun.com/document_detail/32007.html 获取 ossutil 并放置到 $toolsDir 下。"
    Write-Host "继续但不会上传。"
  }
}

# 设定临时凭证为环境变量（ossutil 支持通过环境变量读取 STS）
if ($accessKeyId) { $env:OSS_ACCESS_KEY_ID = $accessKeyId }
if ($accessKeySecret) { $env:OSS_ACCESS_KEY_SECRET = $accessKeySecret }
if ($securityToken) { $env:OSS_STS_TOKEN = $securityToken }

# 确认 dist/ 存在
$distPath = Join-Path $projectDir 'dist'
if (!(Test-Path $distPath)) { Write-Error "未找到 dist/，请先在本地构建项目（npm run build）。"; exit 1 }

# 上传文件到 OSS
if (Test-Path $ossutilPath) {
  Write-Host "开始上传 dist 到 oss://$bucket/ （仅上传变更文件）..."
  & $ossutilPath cp -r $distPath "oss://$bucket/" --update --acl public-read
  if ($LASTEXITCODE -ne 0) { Write-Error "上传失败，请检查凭证与网络。"; exit 1 }
  Write-Host "上传完成。"

  # 设置 CORS（允许任何源 GET）
  $corsJson = '{"CORSRules":[{"AllowedOrigin":["*"],"AllowedMethod":["GET"],"AllowedHeader":["*"],"ExposeHeader":[],"MaxAgeSeconds":500}]}'
  $corsFile = Join-Path $toolsDir 'cors.json'
  $corsJson | Out-File -FilePath $corsFile -Encoding UTF8
  & $ossutilPath cors set $corsFile "oss://$bucket/"

  # 列出 Bucket 内容预览
  & $ossutilPath ls "oss://$bucket/"

  # 打印访问 URL（基于默认 endpoint 规则）
  $publicUrl = "http://$bucket.oss-$region.aliyuncs.com/index.html"
  Write-Host "静态站点已上传，示例访问地址（如果对象为公开读）："
  Write-Host $publicUrl
  Write-Host "建议：在阿里云 CDN 控制台创建加速域名并将源站类型设置为 OSS，源站域名为：$bucket.oss-$region.aliyuncs.com 。开启 HTTPS 与缓存规则以提升可访问性与速度。"
} else {
  Write-Warning "ossutil 未就绪，上传未执行。请按 README 中说明手动上传 dist/ 到 OSS。"
}

Write-Host "完成。若需我代为配置 CDN，请通过企业私密通道提供临时 RAM/STStoken，或在控制台按 README 步骤操作。"
