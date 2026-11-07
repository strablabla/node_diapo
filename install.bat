@echo off
rem --- install.bat ---
rem Windows: installs node_diapo and puts a shortcut on the Desktop. Double-click
rem it. The work is done by install.js (the same on every OS); this only finds Node.
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
    echo Node.js is not installed ^(or not in the PATH^): get it from https://nodejs.org ^(20.19 or later^).
    pause
    exit /b 1
)
node install.js %*
pause
