@echo off
title BRWSR - Standalone Surgical Browser
echo Launching BRWSR (Surgical & Anti-Telemetry Browser)...
npm start
if errorlevel 1 (
    echo.
    echo Press any key to exit...
    pause >nul
)
