param(
  [string]$AccessKeyId,
  [string]$AccessKeySecret,
  [string]$SecurityToken,
  [string]$Region,
  [string]$Bucket,
  [string]$Prefix = '',
  [switch]$SkipBuild,
  [switch]$CreateBucket,
  [bool]$PublicRead = $true,
  [string]$NodeDir = 'D:\code\.tools\node-v20.19.3-win-x64'
)

$ErrorActionPreference = 'Stop'

function Read-SecretValue([string]$Prompt) {
  Write-Host $Prompt -NoNewline
  $secureValue = Read-Host -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)

  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
}

function Read-Required([string]$CurrentValue, [string]$Prompt) {
  if (![string]::IsNullOrWhiteSpace($CurrentValue)) {
    return $CurrentValue
  }

  return Read-Host $Prompt
}

function Invoke-Ossutil([string[]]$Arguments) {
  & $script:OssutilPath @Arguments

  if ($LASTEXITCODE -ne 0) {
    throw "ossutil failed: $($Arguments -join ' ')"
  }
}

$ProjectDir = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
$DistDir = Join-Path $ProjectDir 'dist'
$ToolsDir = Join-Path $ProjectDir 'tools'
$script:OssutilPath = Join-Path $ToolsDir 'ossutil.exe'

Set-Location $ProjectDir

$AccessKeyId = Read-Required $AccessKeyId 'AccessKeyId'
if ([string]::IsNullOrWhiteSpace($AccessKeySecret)) {
  $AccessKeySecret = Read-SecretValue 'AccessKeySecret: '
}
if ([string]::IsNullOrWhiteSpace($SecurityToken)) {
  $SecurityToken = Read-SecretValue 'SecurityToken (press Enter if not using STS): '
}
$Region = Read-Required $Region 'OSS region, for example cn-shanghai'
$Bucket = Read-Required $Bucket 'OSS bucket name'

if (!(Test-Path $script:OssutilPath)) {
  throw "ossutil.exe was not found at $script:OssutilPath"
}

if (!$SkipBuild) {
  $nodePath = Join-Path $NodeDir 'node.exe'
  $npmPath = Join-Path $NodeDir 'npm.cmd'

  if ((Test-Path $nodePath) -and (Test-Path $npmPath)) {
    $env:Path = "$NodeDir;$env:Path"
  }

  Write-Host 'Building Vite project...'
  npm run build

  if ($LASTEXITCODE -ne 0) {
    throw 'npm run build failed.'
  }
}

if (!(Test-Path $DistDir)) {
  throw 'dist/ was not found. Run npm run build first or remove -SkipBuild.'
}

$endpoint = "oss-$Region.aliyuncs.com"
$ossTarget = if ([string]::IsNullOrWhiteSpace($Prefix)) {
  "oss://$Bucket/"
} else {
  "oss://$Bucket/$Prefix/"
}

$commonArgs = @(
  '--endpoint', $endpoint,
  '--access-key-id', $AccessKeyId,
  '--access-key-secret', $AccessKeySecret
)

if (![string]::IsNullOrWhiteSpace($SecurityToken)) {
  $commonArgs += @('--sts-token', $SecurityToken)
}

if ($CreateBucket) {
  Write-Host "Creating bucket if needed: $Bucket"
  $acl = if ($PublicRead) { 'public-read' } else { 'private' }
  $mbArgs = @('mb', "oss://$Bucket", '--acl', $acl) + $commonArgs
  Invoke-Ossutil $mbArgs
}

Write-Host "Uploading dist/ to $ossTarget"
$uploadArgs = @('cp', $DistDir, $ossTarget, '--recursive', '--force', '--update') + $commonArgs
Invoke-Ossutil $uploadArgs

if ($PublicRead) {
  Write-Host 'Setting uploaded objects to public-read...'
  $aclArgs = @('set-acl', $ossTarget, 'public-read', '--recursive', '--force') + $commonArgs
  Invoke-Ossutil $aclArgs
}

Write-Host 'Setting cache policy...'
$indexMetaArgs = @(
  'set-meta',
  "${ossTarget}index.html",
  'Cache-Control:no-cache',
  '--update',
  '--force'
) + $commonArgs
Invoke-Ossutil $indexMetaArgs

$assetsMetaArgs = @(
  'set-meta',
  "${ossTarget}assets/",
  'Cache-Control:public,max-age=31536000,immutable',
  '--update',
  '--recursive',
  '--force'
) + $commonArgs
Invoke-Ossutil $assetsMetaArgs

$websiteXml = Join-Path $ToolsDir 'website.xml'
@'
<?xml version="1.0" encoding="UTF-8"?>
<WebsiteConfiguration>
  <IndexDocument>
    <Suffix>index.html</Suffix>
  </IndexDocument>
  <ErrorDocument>
    <Key>index.html</Key>
  </ErrorDocument>
</WebsiteConfiguration>
'@ | Set-Content -Path $websiteXml -Encoding UTF8

Write-Host 'Configuring static website fallback...'
$websiteArgs = @('website', '--method', 'put', "oss://$Bucket", $websiteXml) + $commonArgs
Invoke-Ossutil $websiteArgs

$path = if ([string]::IsNullOrWhiteSpace($Prefix)) { 'index.html' } else { "$Prefix/index.html" }
$publicUrl = "https://$Bucket.$endpoint/$path"
$websiteUrl = "https://$Bucket.$endpoint/$path"

Write-Host ''
Write-Host 'Deployment complete.'
Write-Host "Object URL:  $publicUrl"
Write-Host "Website URL: $websiteUrl"
