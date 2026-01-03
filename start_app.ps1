# Check if running in the correct directory
if (-not (Test-Path "backend\server.py")) {
    Write-Host "Error: Please run this script from the 'data-to-narrative' directory." -ForegroundColor Red
    exit 1
}

Write-Host "=== DataNarrator Setup & Run Script ===" -ForegroundColor Cyan

# 1. Setup Backend
Write-Host "`n[1/4] Setting up Backend..." -ForegroundColor Yellow
cd backend
# Use python -m pip to avoid PATH issues
python -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing Python dependencies. Check if Python is installed and added to PATH." -ForegroundColor Red
    cd ..
    pause
    exit 1
}
cd ..

# 2. Setup Frontend
Write-Host "`n[2/4] Setting up Frontend..." -ForegroundColor Yellow
cd frontend
# Check if node_modules exists to skip install if possible (faster re-runs), 
# but for now let's just install to be safe
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing Node dependencies. Check if Node.js is installed." -ForegroundColor Red
    cd ..
    pause
    exit 1
}
cd ..

# 3. Start Servers
Write-Host "`n[3/4] Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {cd backend; python server.py}"

Write-Host "`n[4/4] Starting Frontend Server..." -ForegroundColor Green
# Wait a bit for backend to initialize
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {cd frontend; npm run dev}"

Write-Host "`n✅ Application starting! Check the opened windows." -ForegroundColor Cyan
Write-Host "If the windows close immediately, there was an error."
