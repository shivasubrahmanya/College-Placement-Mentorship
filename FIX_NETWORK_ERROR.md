# Fix Network Error - Multiple Backend Processes

## 🔴 Problem
You have **4 backend processes** running on port 8000, causing connection conflicts.

## ✅ Solution

### Step 1: Kill All Backend Processes

**Option A: Double-click `KILL_BACKEND.bat`** (easiest)

**Option B: PowerShell Command**
```powershell
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Option C: Task Manager**
1. Press `Ctrl+Shift+Esc`
2. Find all `python.exe` processes
3. Right-click → End Task (for each one)

### Step 2: Verify Port is Free
```powershell
netstat -ano | findstr ":8000"
```
Should return **nothing** (port is free)

### Step 3: Start Backend Fresh
```bash
cd backend
python run.py
```

Wait for: `INFO:     Uvicorn running on http://0.0.0.0:8000`

### Step 4: Test
1. Go to http://localhost:5173/test-connection
2. Click "Run Connection Tests"
3. All tests should show ✅

## 🎯 Why This Happens

When you start the backend multiple times without stopping the previous one, multiple processes compete for port 8000. This causes:
- Connection refused errors
- CORS issues
- Network errors
- Requests hitting the wrong process

## ✅ Prevention

**Always stop the backend before starting a new one:**
- Press `Ctrl+C` in the terminal where backend is running
- Or use `KILL_BACKEND.bat` before starting

## 🔍 Verify It's Fixed

After restarting, check:
1. Only ONE process on port 8000: `netstat -ano | findstr ":8000"`
2. Test connection page shows all ✅
3. Signup/Login works without network errors

