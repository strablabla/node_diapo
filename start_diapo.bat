@echo off
rem --- start_diapo.bat ---
rem Starts node_diapo from this folder (Windows). The Desktop shortcut made by
rem install.js sets NODE to the absolute path of node.exe; by hand, the node
rem of the PATH is used. On an error the window waits, so that it stays readable.
cd /d "%~dp0"
if not defined NODE set "NODE=node"
"%NODE%" html_app.js
if errorlevel 1 pause
