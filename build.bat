@echo off
title BRWSR // Compile to .exe
echo.
echo  ================================================
echo  BRWSR ^>^> BUILDING WINDOWS EXECUTABLE...
echo  ================================================
echo.

:: Convert PNG icon to ICO (requires ImageMagick, skip if not available)
where magick >nul 2>&1
if %errorlevel% == 0 (
    echo [*] Converting icon.png to icon.ico...
    magick assets\icon.png -define icon:auto-resize=256,128,64,48,32,16 assets\icon.ico
    echo [+] Icon converted.
) else (
    echo [!] ImageMagick not found. Copying PNG as fallback for ICO.
    copy assets\icon.png assets\icon.ico >nul
)

:: Install electron-builder if missing
if not exist node_modules\electron-builder (
    echo [*] Installing electron-builder...
    npm install --save-dev electron-builder
)

echo.
echo [*] Building BRWSR Windows Installer + Portable EXE...
echo     Output will appear in: dist\
echo.
npx electron-builder --win

echo.
echo  ================================================
echo  BUILD COMPLETE -- check dist\ folder
echo  ================================================
pause
