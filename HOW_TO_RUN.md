# IMPORTANT: How to Run the Dashboard

## The dashboard requires BOTH backend and frontend to be running!

### Quick Start (Recommended)
Double-click `start-all.bat` to start both servers automatically.

### Manual Start

#### Option 1: Start Backend First (Terminal 1)
```bash
cd backend
npm start
```
Backend runs on: http://localhost:5000

#### Option 2: Start Frontend (Terminal 2)
```bash
npm run dev
```
Frontend runs on: http://localhost:3000

## Troubleshooting Blank Screen

If you see a blank white screen:

1. **Check if backend is running**
   - Open http://localhost:5000/api/health
   - Should see: `{"status":"ok"}`

2. **Check if frontend is running**
   - Open http://localhost:3000
   - Should see the login page

3. **Check browser console** (F12)
   - Look for network errors to http://localhost:5000

## Multi-User System

- **Login**: Enter email and password
- **Register**: Click "Register Now" link below password field
- Each user gets their own account and data isolation
- Auto-login after 1.5 seconds when credentials are entered

## Production Deployment

For Vercel (frontend) and Render (backend), ensure:
- Backend env: `JWT_SECRET`, `DEVICE_API_KEY`
- Frontend env: `VITE_API_BASE` pointing to your backend URL
