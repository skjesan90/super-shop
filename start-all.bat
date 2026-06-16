@echo off
cd /d "%~dp0"
cls
echo ========================================
echo   Smart Shop ERP - Starting ALL Services
echo ========================================
echo.

:: 1. Start PHP Backend (opens new window, stays running)
echo [1/3] Starting PHP API on http://localhost:8000 ...
start "PHP Backend" /MIN "C:\xampp\php\php.exe" -S localhost:8000 -t "%~dp0backend" "%~dp0backend\index.php"
echo   [OK] PHP server starting...

:: 2. Install frontend deps if needed
if not exist "%~dp0frontend\node_modules" (
  echo [2/3] Installing frontend dependencies...
  cd /d "%~dp0frontend"
  call npm install
  cd /d "%~dp0"
)

:: 3. Start Frontend (opens new window, stays running)
echo [3/3] Starting React on http://localhost:5173 ...
start "React Frontend" /MIN cmd /c "cd /d "%~dp0frontend" && npm run dev"
echo   [OK] Frontend starting...

echo.
echo ========================================
echo   BOTH SERVERS STARTED in separate windows.
echo   Open: http://localhost:5173
echo   Login: admin@shop.com / admin123
echo ========================================
echo.
echo   Close the server windows when done.
pause
