@echo off
cd /d "%~dp0"
echo ========================================
echo   Smart Shop ERP - Starting Services
echo ========================================

:: Start PHP backend (separate window, stays alive)
start "PHP Backend" /MIN "C:\xampp\php\php.exe" -S localhost:8000 -t "%~dp0backend" "%~dp0backend\index.php"

:: Start React frontend (separate window, stays alive)
start "React Frontend" /MIN cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo   Open: http://localhost:5173
echo   Login: admin@shop.com / admin123
echo.
pause
