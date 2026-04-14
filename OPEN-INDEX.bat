@echo off
REM Opens the portfolio in your default browser without a server (data is embedded in index.html).
cd /d "%~dp0"
start "" "%~dp0index.html"
