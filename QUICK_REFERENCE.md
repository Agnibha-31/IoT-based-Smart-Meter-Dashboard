# Smart Meter Dashboard - Quick Reference

## Quick Start Commands

### Start Development (Windows)
```powershell
# Option 1: Use the start script
.\start-dev.ps1

# Option 2: Use batch file
start-dev.bat
```

### Manual Start

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

## Access URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health

## Default Credentials

After running the seed script (`npm run seed` in backend/):
- **Email:** admin@smartmeter.local
- **Password:** Admin@123

## Common Tasks

### Install Dependencies
```powershell
# Frontend
npm install

# Backend
cd backend
npm install
```

### Build for Production
```powershell
# Frontend only
npm run build
# Output: dist/ folder

# Backend runs without build
cd backend
node src/index.js
```

### Seed Demo Data
```powershell
cd backend
npm run seed
```

### Check TypeScript Errors
```powershell
npm run lint
```

## API Testing

### Login and Get Token
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body (@{email="admin@smartmeter.local"; password="Admin@123"} | ConvertTo-Json) -ContentType "application/json"
$token = $response.token
```

### Send Test Reading (Device)
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-Device-Key" = "CHANGE_ME_DEVICE_KEY"
}
$body = @{
    voltage = 230.5
    current = 5.2
    power = 1198.6
    energy = 0.01
    frequency = 50.0
    power_factor = 0.98
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/readings" -Method POST -Headers $headers -Body $body
```

### Get Latest Reading
```powershell
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:5000/api/readings/latest" -Headers $headers
```

### Get Analytics Summary
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/analytics/summary?period=day" -Headers $headers
```

## Troubleshooting

### Frontend won't connect
```powershell
# Check if backend is running
Test-NetConnection -ComputerName localhost -Port 5000

# Check .env file
Get-Content .env

# Clear browser cache and localStorage
# Open DevTools (F12) > Application > Clear storage
```

### Backend database error
```powershell
# Check if storage directory exists
Test-Path backend\storage

# Create it if missing
New-Item -ItemType Directory -Path backend\storage -Force

# Check database file
Test-Path backend\storage\smartmeter.sqlite
```

### Port already in use
```powershell
# Find process using port 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object -Property State, OwningProcess

# Kill the process (replace PID)
Stop-Process -Id <PID> -Force

# Or change port in backend/.env
# PORT=5001
```

### Build errors
```powershell
# Clear and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# For backend
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## File Locations

### Configuration Files
- Frontend config: `.env`
- Backend config: `backend/.env`
- TypeScript: `tsconfig.json`
- Vite: `vite.config.ts`
- Tailwind: `tailwind.config.js`

### Database
- SQLite file: `backend/storage/smartmeter.sqlite`

### Logs
- Check terminal output
- Backend errors appear in the backend terminal
- Frontend errors in browser console (F12)

## Key Environment Variables

### Frontend (.env)
```env
VITE_API_BASE=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Backend (backend/.env)
```env
PORT=5000
JWT_SECRET=your-secret-key
DEVICE_API_KEY=your-device-key
DB_FILE=./storage/smartmeter.sqlite
BASE_TARIFF_PER_KWH=6.5
```

## Development Workflow

1. **Start servers** using start-dev script
2. **Open browser** to http://localhost:3000
3. **Make changes** to files
4. **See updates** automatically (hot reload)
5. **Check console** for errors
6. **Test API** with curl or PowerShell
7. **Commit changes** to git

## Production Checklist

- [ ] Build frontend: `npm run build`
- [ ] Set strong JWT_SECRET
- [ ] Set strong DEVICE_API_KEY
- [ ] Update CORS_ORIGIN to production URL
- [ ] Enable HTTPS/SSL
- [ ] Configure database backups
- [ ] Set up monitoring
- [ ] Test all features
- [ ] Review security settings

## Support Files

- **Full Deployment Guide:** DEPLOYMENT.md
- **Project Overview:** README.md
- **This Reference:** QUICK_REFERENCE.md
