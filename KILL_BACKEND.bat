@echo off
echo Killing all Python processes on port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo Done! Port 8000 should now be free.
echo.
echo Now start the backend with: cd backend && python run.py
pause

