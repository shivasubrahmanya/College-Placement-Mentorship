# ⚠️ CORS ERROR - Backend Needs Restart

## 🔴 Problem
The backend is **NOT sending CORS headers**. The request is being made correctly, but CORS is blocking it.

## ✅ Solution: Restart Backend

### Step 1: Stop Backend
Press `Ctrl+C` in the terminal where backend is running, OR:
```powershell
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Step 2: Start Backend Fresh
```bash
cd backend
python run.py
```

Wait for: `INFO:     Uvicorn running on http://0.0.0.0:8000`

### Step 3: Test CORS
After restarting, the CORS headers should be sent. Try signup again.

## 🔍 What's Happening

1. ✅ Frontend is making the request correctly: `POST http://127.0.0.1:8000/auth/signup`
2. ❌ Backend is NOT sending CORS headers
3. ❌ Browser blocks the request

## ✅ After Restart

The backend will send:
- `Access-Control-Allow-Origin: http://localhost:5173`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
- `Access-Control-Allow-Headers: *`

Then signup/login will work!

