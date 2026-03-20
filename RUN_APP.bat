@echo off
echo ==============================================
echo   Starting Know Your Animal App
echo ==============================================
echo.

echo Starting the Python Backend Server...
start "Backend (Flask)" cmd /k "python app.py"

echo Starting the React Frontend...
start "Frontend (React)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Please wait a few seconds, then open http://localhost:8081 in your browser.
echo You can close this window at any time.
pause
