# This script starts both the backend and frontend development servers in separate windows.

Write-Host "Starting DataHub Workspace development environment..."
Write-Host "Two new terminal windows will open."

# 1. Start the Backend Server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Backend...'; cd backend-api; .\mvnw spring-boot:run"

# 2. Start the Frontend Server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Frontend...'; cd frontend; npm run dev"

# 3. Start the Data Emgine Server in a new window
# Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Data-engine...'; cd data-engine; uvicorn main:app --reload --port 8000"

Write-Host "Backend and Frontend servers are starting in separate windows."