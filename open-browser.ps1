$ErrorActionPreference = 'SilentlyContinue'
$root = if ($PSScriptRoot) { $PSScriptRoot } elseif ($MyInvocation.MyCommand.Path) {
    Split-Path -Parent -LiteralPath $MyInvocation.MyCommand.Path
} else { (Get-Location).Path }

$urlFile = Join-Path $root 'last-server-url.txt'
if (Test-Path -LiteralPath $urlFile) {
    $u = (Get-Content -LiteralPath $urlFile -Raw).Trim()
    if ($u) {
        try {
            $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 3
            if ($r.StatusCode -eq 200 -and ($r.Content -match 'DOCTYPE|portfolio-theme|hero-name')) {
                Start-Process $u
                exit 0
            }
        } catch { }
    }
}

foreach ($port in @(8765, 8766, 8767, 8080, 5500)) {
    $u = "http://127.0.0.1:$port/"
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200 -and ($r.Content -match 'DOCTYPE|portfolio-theme|hero-name')) {
            Start-Process $u
            exit 0
        }
    } catch { }
}

Write-Host 'No portfolio server found. Run start.bat first, then try again.' -ForegroundColor Yellow
Start-Sleep -Seconds 4
