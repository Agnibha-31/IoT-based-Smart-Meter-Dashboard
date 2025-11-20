# Smart Meter Backend

Express + SQLite backend for your Smart Meter dashboard with:
- Real-time Server-Sent Events (SSE)
- User authentication (JWT)
- Metrics/analytics endpoints (peak/avg/min, RMS, load factor, distribution)
- CSV/Excel exports

## Setup

1. Install deps
```bash
cd server
npm i
```

2. Configure env (optional). Create a `.env` in `server/`:
```env
PORT=4000
DB_PATH=smart_meter.db
DEVICE_ID=device-001
DEVICE_API_KEY=CHANGE_ME_SECURE_API_KEY
CORS_ORIGIN=*
JWT_SECRET=REPLACE_WITH_STRONG_SECRET
JWT_TTL_SECONDS=28800
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SetAStrongPassword
```

3. Run
```bash
npm run dev
```

Backend will run at `http://localhost:4000`.

## API (high-level)

- GET `/api/health` → `{ ok, time }`
- POST `/api/auth/login` → `{ token, user }` (use `Authorization: Bearer <token>` for protected routes)
- GET `/api/auth/me` → current user
- POST `/api/auth/change-password` → change own password

- GET `/api/readings/latest?device_id=...` → latest reading (auth required)
- GET `/api/readings/history?device_id=...&since=<epoch_seconds>&until=<epoch_seconds>&limit=<N>` → readings list (auth required)
- POST `/api/readings` (headers: `x-api-key: <DEVICE_API_KEY>`) body JSON:
```json
{
  "voltage": 230.12,
  "current": 1.23,
  "power": 256.7,
  "energy": 12.34,
  "frequency": 49.98,
  "power_factor": 0.93
}
```
Returns `{ success, reading }`.

- GET `/api/stream?token=...` → SSE stream sending each new reading as JSON `data: {...}` (auth required; token may be in query)

- GET `/api/metrics/summary?start=<epoch>&end=<epoch>` → aggregate metrics (auth required)
- GET `/api/metrics/voltage-history?start=<epoch>&end=<epoch>` → voltage history (auth required)
- GET `/api/export.csv?start=<epoch>&end=<epoch>` → CSV export (auth required)
- GET `/api/export.xlsx?start=<epoch>&end=<epoch>` → Excel export (auth required)

## ESP32/ESP8266 (Arduino) example
Replace Blynk/ThingSpeak writes with a direct HTTP POST to your backend:

```cpp
// For ESP32:
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI";
const char* pass = "YOUR_PASS";

const char* serverUrl = "http://<YOUR_PC_IP>:4000/api/readings"; // e.g., http://192.168.1.50:4000/api/readings
const char* apiKey = "CHANGE_ME_SECURE_API_KEY"; // must match backend .env DEVICE_API_KEY

void postReading(float volts, float amps, float watts, float kwh, float hz, float pf) {
  if (WiFi.status() != WL_CONNECTED) return;
  WiFiClient client;
  HTTPClient http;
  http.begin(client, serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", apiKey);
  String body = String("{\"voltage\":") + String(volts, 3) +
                ",\"current\":" + String(amps, 3) +
                ",\"power\":" + String(watts, 3) +
                ",\"energy\":" + String(kwh, 3) +
                ",\"frequency\":" + String(hz, 2) +
                ",\"power_factor\":" + String(pf, 3) + "}";
  int code = http.POST(body);
  http.end();
}
```

On your existing loop, after reading from PZEM, call `postReading(...)` instead of Blynk/ThingSpeak.

## Frontend
Set `VITE_API_BASE` in your root `.env` (beside your frontend `package.json`) so the app can reach the backend:
```env
VITE_API_BASE=http://localhost:4000
```

The dashboard subscribes to `/api/stream` and updates live stats automatically.

For the frontend, set `VITE_API_BASE` in your root `.env` so it can reach the backend, and login via the dashboard to obtain a token.
