@echo off
title DTN India Customer Application Portal - Server
echo ========================================================
echo  Starting DTN India Customer Application Portal
echo  Digital Telco Network India Pvt. Ltd.
echo ========================================================
echo.

cd /d "%~dp0server"
call npm.cmd run dev
pause
