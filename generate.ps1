$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = $PSScriptRoot
$manifestPath = Join-Path $root 'manifest.json'
$buildsDir = Join-Path $root 'builds-for-store'
$extName = 'Slay-Kick-Winline'

if (-not (Test-Path $manifestPath)) {
    throw "manifest.json not found: $manifestPath"
}

New-Item -ItemType Directory -Force -Path $buildsDir | Out-Null

# --- bump version in manifest.json ---
$manifestRaw = Get-Content -Path $manifestPath -Raw -Encoding UTF8

if ($manifestRaw -notmatch '"version"\s*:\s*"(\d+)\.(\d+)\.(\d+)"') {
    throw 'Cannot find "version": "x.y.z" in manifest.json'
}

$major = [int]$Matches[1]
$minor = [int]$Matches[2]
$patch = [int]$Matches[3] + 1
$newVersion = "$major.$minor.$patch"

$manifestRaw = [regex]::Replace(
    $manifestRaw,
    '"version"\s*:\s*"\d+\.\d+\.\d+"',
    ('"version": "' + $newVersion + '"'),
    1
)

Set-Content -Path $manifestPath -Value $manifestRaw -Encoding UTF8 -NoNewline
Write-Host "Version -> $newVersion"

# --- stage package (store build: without local key) ---
$stage = Join-Path ([System.IO.Path]::GetTempPath()) ("$extName-build-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $stage | Out-Null

try {
    $excludeNames = @(
        'builds-for-store',
        'generate.ps1',
        '.git',
        '.gitignore',
        '.DS_Store',
        '.vscode',
        '.idea',
        '_metadata',
        'readme.md',
        'LICENSE'
    )

    Get-ChildItem -Path $root -Force | ForEach-Object {
        if ($excludeNames -contains $_.Name) { return }
        Copy-Item -Path $_.FullName -Destination (Join-Path $stage $_.Name) -Recurse -Force
    }

    $stagedManifestPath = Join-Path $stage 'manifest.json'
    $stagedManifest = Get-Content -Path $stagedManifestPath -Raw -Encoding UTF8
    # Chrome Web Store задаёт ID сам — key из локальной разработки убираем
    $stagedManifest = [regex]::Replace(
        $stagedManifest,
        '\s*"key"\s*:\s*"[^"]*"\s*,?',
        ''
    )
    Set-Content -Path $stagedManifestPath -Value $stagedManifest -Encoding UTF8 -NoNewline

    $zipName = "$extName-$newVersion.zip"
    $zipPath = Join-Path $buildsDir $zipName
    if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

    # Compress-Archive ломается на dotfiles — ZipFile надёжнее
    [System.IO.Compression.ZipFile]::CreateFromDirectory(
        $stage,
        $zipPath,
        [System.IO.Compression.CompressionLevel]::Optimal,
        $false
    )

    Write-Host "Build -> $zipPath"
}
finally {
    if (Test-Path $stage) {
        Remove-Item -Path $stage -Recurse -Force
    }
}
