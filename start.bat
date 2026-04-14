@echo off
setlocal
cd /d "%~dp0"

echo.
echo  Starting portfolio (built-in web server, no Python needed)...
echo.

set "PS_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if not exist "%PS_EXE%" set "PS_EXE=powershell.exe"

REM New window: serves files and opens your browser to the correct port
start "Portfolio web server" "%PS_EXE%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-static.ps1" -OpenBrowser

echo  A new window titled "Portfolio web server" should appear with the site URL.
echo  Your browser should open automatically. If not, double-click OPEN-BROWSER.bat
echo  or paste the URL into Chrome/Edge/Firefox — do NOT type the URL in PowerShell.
echo.
echo  To stop: close the "Portfolio web server" window or press Ctrl+C in it.
echo.
pause
