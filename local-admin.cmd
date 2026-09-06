@echo off
cd /d "%~dp0"
node "%~dp0local-admin.js"
if errorlevel 1 pause
