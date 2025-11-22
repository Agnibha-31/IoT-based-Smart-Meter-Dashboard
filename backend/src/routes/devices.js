import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { listDevices, createDevice, getDeviceByIdAndUser, regenerateDeviceApiKey } from '../services/deviceService.js';
import config from '../config.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const devices = await listDevices(req.user.id);
    res.json({ devices });
  }),
);

const createSchema = z.object({
  name: z.string().min(3),
  timezone: z.string().optional(),
  location: z.string().optional(),
});

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = createSchema.parse(req.body);
    const device = await createDevice({ ...payload, userId: req.user.id });
    res.status(201).json({ device });
  }),
);

// Get single device details with API key
router.get(
  '/:deviceId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const device = await getDeviceByIdAndUser(req.params.deviceId, req.user.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found or access denied' });
    }
    res.json({ device });
  }),
);

// Regenerate device API key
router.post(
  '/:deviceId/regenerate-key',
  requireAuth,
  asyncHandler(async (req, res) => {
    const device = await getDeviceByIdAndUser(req.params.deviceId, req.user.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found or access denied' });
    }
    const updatedDevice = await regenerateDeviceApiKey(req.params.deviceId);
    res.json({ 
      device: updatedDevice,
      message: 'API key regenerated successfully. Update your ESP32 firmware with the new key.' 
    });
  }),
);

// Get ESP32 connection instructions
router.get(
  '/:deviceId/esp32-config',
  requireAuth,
  asyncHandler(async (req, res) => {
    const device = await getDeviceByIdAndUser(req.params.deviceId, req.user.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found or access denied' });
    }
    
    // Determine backend URL
    const backendUrl = process.env.NODE_ENV === 'production'
      ? process.env.BACKEND_URL || 'https://iot-based-smart-meter-dashboard-backend.onrender.com'
      : `http://localhost:${config.port}`;
    
    const esp32Code = `// ESP32 Configuration for ${device.name}
// Generated: ${new Date().toISOString()}

const char* serverURL = "${backendUrl}/api/readings";
const char* deviceAPIKey = "${device.api_key}";
const char* deviceID = "${device.id}";

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// In your HTTP request, add these headers:
// headers: {
//   "Content-Type": "application/json",
//   "x-api-key": deviceAPIKey
// }

// POST request body format:
// {
//   "voltage": 230.5,
//   "current": 1.23,
//   "power": 283.5,
//   "energy": 0.14,
//   "frequency": 50.0
// }`;
    
    res.json({ 
      device: {
        id: device.id,
        name: device.name,
        api_key: device.api_key
      },
      config: {
        endpoint: `${backendUrl}/api/readings`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': device.api_key
        },
        samplePayload: {
          voltage: 230.5,
          current: 1.23,
          power: 283.5,
          energy: 0.14,
          frequency: 50.0
        }
      },
      esp32Code
    });
  }),
);

export default router;

