@echo off
setlocal
cd /d "%~dp0"
set "PFOLIO=%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$f = Join-Path $env:PFOLIO 'last-server-url.txt'; if (Test-Path -LiteralPath $f) { $u = (Get-Content -LiteralPath $f -Raw).Trim(); if ($u) { Start-Process $u; exit 0 } }; Start-Process 'http://127.0.0.1:8765/'"
endlocal
