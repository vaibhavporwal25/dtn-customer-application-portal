@echo off
title DTN India Customer Application Portal - Frontend (Vite)
echo ========================================================
echo  Starting DTN India Frontend Dev Server (Vite)
echo ========================================================
echo.

cd /d "%~dp0client"
call npm.cmd run dev
pause
