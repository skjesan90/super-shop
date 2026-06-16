Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Smart Shop ERP - Starting Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "[1/2] Starting PHP API server on http://localhost:8000 ..." -NoNewline
$phpJob = Start-Job -ScriptBlock {
  param($php, $docRoot, $router)
  & $php -S localhost:8000 -t $docRoot $router
} -ArgumentList "C:\xampp\php\php.exe", "$PSScriptRoot\backend", "$PSScriptRoot\backend\index.php"
Start-Sleep -Seconds 2
Write-Host " OK (Job ID: $($phpJob.Id))" -ForegroundColor Green

Write-Host "[2/2] Starting React frontend on http://localhost:5173 ..." -NoNewline
$npmJob = Start-Job -ScriptBlock {
  param($frontendDir)
  Set-Location $frontendDir
  npm run dev
} -ArgumentList "$PSScriptRoot\frontend"
Start-Sleep -Seconds 3
Write-Host " OK (Job ID: $($npmJob.Id))" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " Open http://localhost:5173 in your browser" -ForegroundColor Yellow
Write-Host " Login: admin@shop.com / admin123" -ForegroundColor Yellow
Write-Host " Press Ctrl+C to stop both servers" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan

# Keep running to prevent job termination
while ($true) {
  Start-Sleep -Seconds 10
  $phpRunning = Receive-Job -Job $phpJob -ErrorAction SilentlyContinue
  $npmRunning = Receive-Job -Job $npmJob -ErrorAction SilentlyContinue
  if (-not $phpRunning -and -not $npmRunning) {
    Write-Host "Both servers stopped." -ForegroundColor Red
    break
  }
}
