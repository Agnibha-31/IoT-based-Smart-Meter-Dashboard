
# Smart Meter IoT Dashboard

Industrial monitoring stack for smart energy meters. The workspace now ships with:

- **Frontend**: Vite + React + TypeScript (`src/`)
- **Backend**: Express 5 + sql.js (file-backed SQLite) (`backend/`)
- **Device firmware**: ESP32 sketch (`IOTSmartMeter_new/IOTSmartMeter_new.ino`)

The backend exposes authenticated REST endpoints, live Server-Sent Events (SSE), analytics, and data-export APIs. The frontend consumes those APIs for live dashboards, analytics, settings, and secure downloads.

---

## Backend setup (`backend/`)

```powershell
cd backend
npm install
```

Create `backend/.env` (values shown are sane defaults):

```env
BACKEND_PORT=5000
DB_FILE=./storage/smartmeter.sqlite
DEVICE_ID=meter-001
DEVICE_API_KEY=REPLACE_WITH_A_STRONG_KEY
JWT_SECRET=REPLACE_WITH_A_STRONG_SECRET
JWT_EXPIRY=12h
CORS_ORIGIN=http://localhost:5173
BASE_TARIFF_PER_KWH=6.5
```

> The first run automatically provisions the database file under `backend/storage/`.

### Seed an admin user and demo telemetry

```powershell
cd backend
npm run seed
```

This script creates:

- Admin user: `admin@smartmeter.local / Admin@123`
- Demo telemetry for the last 48 hours

### Start the backend

```powershell
cd backend
npm run dev
```

The API becomes available at `http://localhost:5000`. Endpoints of interest:

| HTTP | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Issue JWT for dashboard users |
| `POST` | `/api/readings` | Device ingestion (requires `x-api-key`) |
| `GET` | `/api/stream` | SSE stream of latest readings (requires `token` query param = JWT) |
| `GET` | `/api/analytics/summary` | Derived KPIs, peaks, load factors |
| `GET` | `/api/export/preview` | Sample dataset for a given range |
| `GET` | `/api/export/readings` | CSV/Excel export (supports sampling + filters) |

---

## Frontend setup (`/`)

```powershell
cd "Smart Meter"
npm install
```

Create `.env` at the project root:

```env
VITE_API_BASE=http://localhost:5000
```

Start Vite:

```powershell
npm run dev
```

Open the printed URL (default `http://localhost:5173`). Log in with the admin credentials seeded above, or create a new user via the onboarding flow (first user only).

---

## Connecting the ESP32 smart meter

1. Flash `IOTSmartMeter_new/IOTSmartMeter_new.ino` to the ESP32.
2. Update the sketch with your Wi-Fi credentials and backend URL:

```cpp
HTTPClient http;
http.begin("http://<backend-host>:5000/api/readings");
http.addHeader("x-api-key", "<DEVICE_API_KEY>");
http.addHeader("Content-Type", "application/json");
http.POST(payloadJson);
```

3. Set `DEVICE_API_KEY` in `backend/.env` to the same value.
4. Each POST body can include `voltage`, `current`, `power`, `energy`, `frequency`, `timestamp`, `power_factor`, etc. The backend auto-computes derived metrics (apparent/reactive power, kWh totals, load factors) and broadcasts live updates via SSE to the dashboard.

> Tip: regenerate the API key in `.env` if the device is compromised, then redeploy both backend and firmware with the new key.

---

## Data export & history

The Data Download page now uses real API calls:

- Preview up to 500 sampled points via `/api/export/preview`.
- Download CSV or Excel with `/api/export/readings`.
- Supports metric selection, sampling windows (`all`, `1min`, `5min`, etc.), and optional metadata sheets (Excel).
- Client-side gzip compression is available on Chromium-based browsers; enable it in the UI to receive `.gz` files.

All export activity is logged in the `exports` table for auditing.

---

## Production build checklist

1. **Frontend**
   ```powershell
   npm run build
   ```
   Deploy the `dist/` folder behind a static host (Netlify, Vercel, nginx, etc.).

2. **Backend**
   - Set strong `JWT_SECRET` and `DEVICE_API_KEY`.
   - Point `CORS_ORIGIN` to the deployed frontend URL.
   - Run `npm run start` (or use a process manager like PM2/systemd).
   - Persist `backend/storage/smartmeter.sqlite`.
   - Terminate TLS at the reverse proxy (nginx/Caddy) and forward to the Node process.

3. **Devices**
   - Make sure firewalls allow the ESP32 to reach the backend ingest endpoint.
   - Monitor `/api/health` for uptime probes.

With these steps the dashboard is ready for a production pilot, providing authenticated access, live analytics, historical downloads, and device telemetry synchronized with the ESP32 firmware.
  