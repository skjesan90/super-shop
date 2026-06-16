@echo off
echo ============================================
echo  Smart Super Shop ERP - Deploy to InfinityFree
echo ============================================
echo.

REM --- Step 1: Build React frontend ---
echo [1/5] Building React frontend...
cd /d "%~dp0frontend"
set VITE_API_URL=/api
call npx.cmd vite build
if %errorlevel% neq 0 (
  echo ERROR: Frontend build failed!
  pause
  exit /b 1
)
echo Done.
echo.

REM --- Step 2: Create deploy directory ---
echo [2/5] Preparing deploy folder...
cd /d "%~dp0"
if exist deploy rmdir /s /q deploy
mkdir deploy\api\routes
mkdir deploy\assets
echo Done.
echo.

REM --- Step 3: Copy frontend build ---
echo [3/5] Copying frontend files...
xcopy /e /q "frontend\dist\*" "deploy\" >nul
echo Done.
echo.

REM --- Step 4: Copy backend PHP files ---
echo [4/5] Copying backend API files...
copy "backend\index.php" "deploy\api\" >nul
copy "backend\middleware.php" "deploy\api\" >nul
copy "backend\config.php" "deploy\api\" >nul
copy "backend\.htaccess" "deploy\api\" >nul

REM Copy all route files
for %%r in (auth products customers suppliers employees orders purchases expenses dashboard branches) do (
  if exist "backend\routes\%%r.php" copy "backend\routes\%%r.php" "deploy\api\routes\" >nul
)

REM Copy database schema
copy "backend\database.sql" "deploy\" >nul
copy "backend\seeder.php" "deploy\api\" >nul
echo Done.
echo.

REM --- Step 5: Verify ---
echo [5/5] Verifying deployment...
echo.
echo  Deploy folder structure:
dir deploy /s /b

echo.
echo ============================================
echo  DEPLOYMENT READY!
echo ============================================
echo.
echo  Next steps:
echo  1. Upload everything inside 'deploy\' to
echo     your InfinityFree htdocs folder via FTP
echo.
echo  2. Update deploy\api\config.php with your
echo     InfinityFree MySQL credentials
echo.
echo  3. Import deploy\database.sql via phpMyAdmin
echo     (Create the database first in your panel)
echo.
echo  4. Visit your domain and login with:
echo     admin@shop.com / admin123
echo.
echo ============================================
pause
