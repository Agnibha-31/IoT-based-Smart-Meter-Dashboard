# Smart Meter IoT Dashboard - Deployment Guide

## Prerequisites

- Node.js v18+ and npm
- Git (for version control)
- Modern web browser (Chrome, Firefox, Edge, Safari)

## Local Development Setup

### 1. Install Dependencies

**Frontend:**
```bash
cd "Smart Meter"
npm install
```

**Backend:**
```bash
cd "Smart Meter/backend"
npm install
```

### 2. Configure Environment Variables

**Frontend (.env):**
```env
VITE_API_BASE=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**Backend (backend/.env):**
```env
PORT=5000
JWT_SECRET=your-secure-secret-key-change-this
JWT_EXPIRY=12h
DB_FILE=./storage/smartmeter.sqlite
DEVICE_ID=meter-001
DEVICE_API_KEY=your-secure-device-key
BASE_TARIFF_PER_KWH=6.5
CORS_ORIGIN=*
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd "Smart Meter/backend"
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd "Smart Meter"
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 4. First-Time Setup

1. Open http://localhost:3000 in your browser
2. Click "Register" to create the first admin account
3. After registration, only that account can log in (registration is disabled)
4. The backend will create a SQLite database at `backend/storage/smartmeter.sqlite`

## Production Deployment

### Build for Production

**Frontend:**
```bash
cd "Smart Meter"
npm run build
```
This creates an optimized build in the `dist/` directory.

**Backend:**
The backend runs directly with Node.js (no build step needed).

### Deployment Options

#### Option 1: VPS/Cloud Server (DigitalOcean, AWS EC2, etc.)

1. **Prepare the server:**
```bash
# Install Node.js v18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

2. **Upload your application:**
```bash
# Clone or upload your repository
git clone <your-repo-url>
cd "Smart Meter"
npm install
cd backend
npm install
cd ..
```

3. **Configure production environment:**
   - Update `.env` with production URLs
   - Set strong JWT_SECRET and DEVICE_API_KEY
   - Set CORS_ORIGIN to your frontend domain

4. **Start backend with PM2:**
```bash
cd backend
pm2 start src/index.js --name smart-meter-backend
pm2 save
pm2 startup
```

5. **Serve frontend:**
```bash
cd ..
npm run build
# Serve the dist/ folder with nginx or serve
```

6. **Setup Nginx (recommended):**
```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/Smart Meter/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Option 2: Heroku

1. **Backend:**
```bash
cd backend
echo "web: node src/index.js" > Procfile
heroku create smart-meter-backend
heroku config:set JWT_SECRET=your-secret
heroku config:set DEVICE_API_KEY=your-key
git push heroku main
```

2. **Frontend:**
```bash
cd ..
npm run build
# Deploy dist/ folder to Netlify, Vercel, or AWS S3
```

#### Option 3: Docker

**Create Dockerfile for backend:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./
EXPOSE 5000
CMD ["node", "src/index.js"]
```

**Create Dockerfile for frontend:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - JWT_SECRET=${JWT_SECRET}
      - DEVICE_API_KEY=${DEVICE_API_KEY}
    volumes:
      - ./backend/storage:/app/storage

  frontend:
    build: .
    ports:
      - "3000:80"
    depends_on:
      - backend
```

### Security Checklist for Production

- [ ] Change JWT_SECRET to a strong random value
- [ ] Change DEVICE_API_KEY to a secure random key
- [ ] Set CORS_ORIGIN to your specific frontend domain
- [ ] Enable HTTPS with SSL certificates (Let's Encrypt)
- [ ] Set secure cookie flags if using sessions
- [ ] Configure firewall rules
- [ ] Set up database backups for SQLite file
- [ ] Monitor application logs
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure rate limiting on API endpoints

### Database Backup

The SQLite database is at `backend/storage/smartmeter.sqlite`. Backup regularly:

```bash
# Manual backup
cp backend/storage/smartmeter.sqlite backend/storage/backup-$(date +%Y%m%d).sqlite

# Automated daily backup (crontab)
0 2 * * * cp /path/to/backend/storage/smartmeter.sqlite /path/to/backups/smartmeter-$(date +\%Y\%m\%d).sqlite
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register first user (disabled after first user)
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user info
- `PATCH /api/auth/preferences` - Update user preferences
- `POST /api/auth/change-password` - Change password

### Readings
- `POST /api/readings` - Ingest new reading (requires device API key)
- `GET /api/readings/latest` - Get latest reading
- `GET /api/readings/history` - Get historical readings

### Analytics
- `GET /api/analytics/summary` - Get summary statistics
- `GET /api/analytics/voltage-history` - Get voltage history
- `GET /api/analytics/cost` - Get cost projections

### Export
- `GET /api/export/preview` - Preview export data
- `GET /api/export/readings` - Export readings as CSV/Excel

### Devices
- `GET /api/devices` - List all devices
- `POST /api/devices` - Create new device (admin only)

## Device Integration

Send readings to the backend using the device API key:

```bash
curl -X POST http://localhost:5000/api/readings \
  -H "Content-Type: application/json" \
  -H "X-Device-Key: your-device-api-key" \
  -d '{
    "voltage": 230.5,
    "current": 5.2,
    "power": 1198.6,
    "energy": 0.01,
    "frequency": 50.0,
    "power_factor": 0.98
  }'
```

## Monitoring & Maintenance

### Health Check
```bash
curl http://localhost:5000/api/health
```

### View Logs (PM2)
```bash
pm2 logs smart-meter-backend
pm2 monit
```

### Database Maintenance
```bash
# Vacuum database to optimize
sqlite3 backend/storage/smartmeter.sqlite "VACUUM;"

# Check database integrity
sqlite3 backend/storage/smartmeter.sqlite "PRAGMA integrity_check;"
```

## Troubleshooting

### Frontend won't connect to backend
- Check VITE_API_BASE in frontend .env
- Ensure backend is running on correct port
- Check browser console for CORS errors
- Verify CORS_ORIGIN in backend .env

### Database errors
- Ensure storage directory exists and is writable
- Check file permissions on smartmeter.sqlite
- Verify DB_FILE path in backend .env

### Authentication issues
- Clear browser localStorage
- Verify JWT_SECRET is set correctly
- Check token expiry (default 12h)

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version (requires v18+)
- Ensure all dependencies are installed

## Support

For issues and questions:
1. Check the console for error messages
2. Review backend logs
3. Verify environment configuration
4. Check database file exists and has data

## Version Information

- Node.js: v18+
- React: v18.3
- Express: v4.19
- Vite: v6.0
- TypeScript: v5.3
