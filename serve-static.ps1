param(
    [int[]]$TryPorts = @(8765, 8766, 8767, 8080, 5500),
    [switch]$OpenBrowser
)

$ErrorActionPreference = 'Stop'
$repoRoot = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($repoRoot) -and $MyInvocation.MyCommand.Path) {
    $repoRoot = Split-Path -Parent -LiteralPath $MyInvocation.MyCommand.Path
}
if ([string]::IsNullOrWhiteSpace($repoRoot)) {
    $repoRoot = (Get-Location).Path
}
$repoRootNorm = [System.IO.Path]::GetFullPath($repoRoot).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
$projectDir = Join-Path $repoRootNorm 'project'
$indexInProject = Join-Path $projectDir 'index.html'
$indexAtRoot = Join-Path $repoRootNorm 'index.html'
if (Test-Path -LiteralPath $indexInProject -PathType Leaf) {
    $rootNorm = [System.IO.Path]::GetFullPath($projectDir).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
} elseif (Test-Path -LiteralPath $indexAtRoot -PathType Leaf) {
    $rootNorm = $repoRootNorm
} else {
    Write-Host "index.html not found. Expected either:" -ForegroundColor Red
    Write-Host "  $indexInProject" -ForegroundColor Yellow
    Write-Host "  or $indexAtRoot" -ForegroundColor Yellow
    Read-Host 'Press Enter to exit'
    exit 1
}

Add-Type -AssemblyName System.Web

function Get-MimeType([string]$ext) {
    switch ($ext.ToLowerInvariant()) {
        '.html' { return 'text/html; charset=utf-8' }
        '.htm'  { return 'text/html; charset=utf-8' }
        '.css'  { return 'text/css; charset=utf-8' }
        '.js'   { return 'application/javascript; charset=utf-8' }
        '.json' { return 'application/json; charset=utf-8' }
        '.png'  { return 'image/png' }
        '.jpg'  { return 'image/jpeg' }
        '.jpeg' { return 'image/jpeg' }
        '.gif'  { return 'image/gif' }
        '.svg'  { return 'image/svg+xml' }
        '.ico'  { return 'image/x-icon' }
        '.pdf'  { return 'application/pdf' }
        '.txt'  { return 'text/plain; charset=utf-8' }
        default { return 'application/octet-stream' }
    }
}

$listener = $null
$activePort = 0

foreach ($port in $TryPorts) {
    $l = New-Object System.Net.HttpListener
    $l.Prefixes.Add("http://127.0.0.1:$port/")
    try {
        $l.Start()
        $listener = $l
        $activePort = $port
        break
    } catch {
        try { $l.Close() } catch { }
    }
}

if (-not $listener) {
    Write-Host "Could not start a server on ports: $($TryPorts -join ', ')" -ForegroundColor Red
    Write-Host "Close other apps using those ports, then try again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

$url = "http://127.0.0.1:$activePort/"
$urlFile = Join-Path $repoRootNorm 'last-server-url.txt'
try {
    [System.IO.File]::WriteAllText($urlFile, $url.Trim())
} catch { }

Write-Host "Serving folder: $rootNorm" -ForegroundColor Cyan
Write-Host "Open this URL:  $url" -ForegroundColor Green
Write-Host "Press Ctrl+C here to stop the server." -ForegroundColor DarkGray

if ($OpenBrowser) {
    Start-Process $url
}

$sep = [System.IO.Path]::DirectorySeparatorChar

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        $req = $ctx.Request
        $res = $ctx.Response
        try {
            $raw = $req.Url.AbsolutePath.TrimStart([char[]]@('/', '\'))
            if ([string]::IsNullOrEmpty($raw)) { $raw = 'index.html' }
            $decoded = [System.Web.HttpUtility]::UrlDecode($raw)
            if ($decoded.Equals('favicon.ico', [StringComparison]::OrdinalIgnoreCase)) {
                $decoded = 'icon.svg'
            }
            if ([System.IO.Path]::IsPathRooted($decoded)) {
                throw (New-Object System.InvalidOperationException 'Absolute paths not allowed')
            }
            $rel = $decoded -replace '/', $sep
            $full = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($rootNorm + $sep, $rel))
            $prefixOk = $full.StartsWith($rootNorm + $sep, [StringComparison]::OrdinalIgnoreCase)

            if (-not $prefixOk) {
                $res.StatusCode = 403
                $body = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
                $res.ContentType = 'text/plain; charset=utf-8'
                $res.ContentLength64 = $body.LongLength
                $res.OutputStream.Write($body, 0, $body.Length)
            }
            elseif (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
                $res.StatusCode = 404
                $body = [System.Text.Encoding]::UTF8.GetBytes('Not found')
                $res.ContentType = 'text/plain; charset=utf-8'
                $res.ContentLength64 = $body.LongLength
                $res.OutputStream.Write($body, 0, $body.Length)
            }
            else {
                $body = [System.IO.File]::ReadAllBytes($full)
                $res.StatusCode = 200
                $res.ContentType = Get-MimeType ([System.IO.Path]::GetExtension($full))
                $res.ContentLength64 = $body.LongLength
                $res.OutputStream.Write($body, 0, $body.Length)
            }
        } catch {
            try {
                $res.StatusCode = 500
                $body = [System.Text.Encoding]::UTF8.GetBytes('Server error')
                $res.ContentType = 'text/plain; charset=utf-8'
                $res.ContentLength64 = $body.LongLength
                $res.OutputStream.Write($body, 0, $body.Length)
            } catch { }
        } finally {
            try { $res.OutputStream.Close() } catch { }
            try { $res.Close() } catch { }
        }
    }
} finally {
    if ($listener) {
        try { $listener.Stop() } catch { }
        try { $listener.Close() } catch { }
    }
}
