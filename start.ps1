Set-Location $PSScriptRoot
$ps = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
if (-not (Test-Path -LiteralPath $ps)) { $ps = 'powershell.exe' }

Start-Process -FilePath $ps -ArgumentList @(
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', (Join-Path $PSScriptRoot 'serve-static.ps1'),
    '-OpenBrowser'
) -WindowStyle Normal

Write-Host 'Started "Portfolio web server" — browser should open. Close that window to stop.' -ForegroundColor Green
