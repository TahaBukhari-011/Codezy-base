# Quick Start - Code Execution Service

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ Docker Desktop running (for Windows)
- ✅ npm or yarn installed

## Quick Start (3 Commands)

### Step 1: Start Execution Service (Terminal 1)
```powershell
cd "d:\New folder\CODEZY\execution-service"
npm start
```
**Wait for**: "Ready to execute code! 🚀" message  
**Time**: ~2-3 minutes on first start (builds Docker images)

### Step 2: Start Main Backend (Terminal 2)
```powershell
cd "d:\New folder\CODEZY\backend"
npm start
```
**Wait for**: "Server running on port 5000" message

### Step 3: Start Frontend (Terminal 3)
```powershell
cd "d:\New folder\CODEZY\codezy"
npm run dev
```
**Wait for**: "Local: http://localhost:5173" message

## Quick Test

Once all services are running, test the execution service:

```powershell
# Test 1: Health Check
curl http://localhost:5001/health

# Test 2: Quick Python Execution
curl -X POST http://localhost:5001/api/execute/quick `
  -H "Content-Type: application/json" `
  -d "{\"code\":\"print('Hello World')\",\"language\":\"python\"}"

# Test 3: Through Main Backend
curl http://localhost:5000/api/code-execution/languages
```

## What's Running?

- **Port 5001**: Code Execution Service (Docker-based)
- **Port 5000**: Main Backend (Express + MongoDB)
- **Port 5173**: Frontend (React + Vite)

## First Time Setup Checklist

- [ ] Docker Desktop is running
- [ ] All npm dependencies installed
- [ ] `.env` files configured
- [ ] MongoDB connection working
- [ ] Docker images built successfully

## Common Issues

### "Docker is not running"
**Solution**: Open Docker Desktop and wait for it to start

### "Port already in use"
**Solution**: 
```powershell
# Find process using port
netstat -ano | findstr :5001
# Kill process (replace PID)
taskkill /F /PID <PID>
```

### "Cannot connect to execution service"
**Solution**: 
1. Check execution service is running on port 5001
2. Verify `EXECUTION_SERVICE_URL=http://localhost:5001` in backend/.env

## Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Student/Teacher UI |
| Backend API | http://localhost:5000 | Main API |
| Execution Service | http://localhost:5001 | Code execution |
| Execution Health | http://localhost:5001/health | Service status |

## Next Steps After Startup

1. Login as a student
2. Navigate to a lab with tasks
3. Write some code
4. Click "Run Code" to test
5. Click "Submit" to save

## Stopping Services

Press `Ctrl+C` in each terminal to stop the services gracefully.

## Need Help?

- Check logs in each terminal
- Review `IMPLEMENTATION_SUMMARY.md` for full details
- See `EXAMPLES.md` for code samples
- Read `INTEGRATION_GUIDE.md` for frontend integration
