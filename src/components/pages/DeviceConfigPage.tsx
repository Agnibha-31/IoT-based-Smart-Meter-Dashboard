import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Key, Copy, RefreshCw, Eye, EyeOff, Code, CheckCircle, AlertCircle, Wifi, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '../SettingsContext';

interface Device {
  id: string;
  name: string;
  api_key: string;
  timezone: string;
  location: string;
  created_at: number;
  updated_at: number;
  last_seen: number | null;
}

interface ESP32Config {
  endpoint: string;
  method: string;
  headers: {
    'Content-Type': string;
    'x-api-key': string;
  };
  samplePayload: {
    voltage: number;
    current: number;
    power: number;
    energy: number;
    frequency: number;
  };
}

export default function DeviceConfigPage() {
  const { translate } = useSettings();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [esp32Config, setEsp32Config] = useState<ESP32Config | null>(null);
  const [esp32Code, setEsp32Code] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem('smartmeter_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/devices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setDevices(data.devices || []);
      if (data.devices.length > 0 && !selectedDevice) {
        setSelectedDevice(data.devices[0]);
      }
    } catch (error) {
      toast.error('Failed to load devices');
    }
  };

  const fetchESP32Config = async (deviceId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('smartmeter_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/devices/${deviceId}/esp32-config`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setEsp32Config(data.config);
      setEsp32Code(data.esp32Code);
    } catch (error) {
      toast.error('Failed to load ESP32 configuration');
    } finally {
      setLoading(false);
    }
  };

  const regenerateApiKey = async (deviceId: string) => {
    if (!confirm('Are you sure you want to regenerate the API key? Your ESP32 will need to be updated with the new key.')) {
      return;
    }
    
    setRegenerating(deviceId);
    try {
      const token = localStorage.getItem('smartmeter_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/devices/${deviceId}/regenerate-key`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      toast.success('API key regenerated successfully!');
      
      // Update local state
      setDevices(prev => prev.map(d => d.id === deviceId ? data.device : d));
      if (selectedDevice?.id === deviceId) {
        setSelectedDevice(data.device);
        await fetchESP32Config(deviceId);
      }
    } catch (error) {
      toast.error('Failed to regenerate API key');
    } finally {
      setRegenerating(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    fetchESP32Config(device.id);
  };

  const toggleApiKeyVisibility = (deviceId: string) => {
    setShowApiKey(prev => ({ ...prev, [deviceId]: !prev[deviceId] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-blue-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Smartphone className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">ESP32 Device Configuration</h1>
            <p className="text-gray-300 mt-1">Connect your IoT devices with unique API keys</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Your Devices
            </h2>
            <div className="space-y-3">
              {devices.map((device) => (
                <motion.div
                  key={device.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleDeviceSelect(device)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedDevice?.id === device.id
                      ? 'bg-blue-600/30 border-2 border-blue-500'
                      : 'bg-gray-700/30 border border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{device.name}</h3>
                    {device.last_seen && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-green-400">Online</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-gray-400" />
                    <code className="text-xs text-gray-400 font-mono">
                      {showApiKey[device.id] ? device.api_key : '••••••••••••••••'}
                    </code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleApiKeyVisibility(device.id);
                      }}
                      className="p-1 hover:bg-gray-600 rounded"
                    >
                      {showApiKey[device.id] ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Details */}
        <div className="lg:col-span-2">
          {selectedDevice ? (
            <div className="space-y-6">
              {/* Device Details */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-semibold text-white mb-4">Device Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Device Name</label>
                    <p className="text-white font-medium">{selectedDevice.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Device ID</label>
                    <div className="flex items-center gap-2">
                      <code className="text-white font-mono text-sm">{selectedDevice.id}</code>
                      <button
                        onClick={() => copyToClipboard(selectedDevice.id, 'Device ID')}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">API Key</label>
                    <div className="flex items-center gap-2">
                      <code className="text-white font-mono text-sm">
                        {showApiKey[selectedDevice.id] ? selectedDevice.api_key : '••••••••••••••••••••••••••••••••••••'}
                      </code>
                      <button
                        onClick={() => toggleApiKeyVisibility(selectedDevice.id)}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        {showApiKey[selectedDevice.id] ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(selectedDevice.api_key, 'API Key')}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Last Seen</label>
                    <p className="text-white">
                      {selectedDevice.last_seen
                        ? new Date(selectedDevice.last_seen * 1000).toLocaleString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => regenerateApiKey(selectedDevice.id)}
                    disabled={regenerating === selectedDevice.id}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${regenerating === selectedDevice.id ? 'animate-spin' : ''}`} />
                    Regenerate API Key
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fetchESP32Config(selectedDevice.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Code className="w-4 h-4" />
                    Get ESP32 Code
                  </motion.button>
                </div>
              </div>

              {/* ESP32 Configuration */}
              {esp32Config && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-green-400" />
                    ESP32 Configuration
                  </h2>
                  
                  {/* Connection Instructions */}
                  <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2">How to Connect Your ESP32</h3>
                        <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                          <li>Copy the configuration code below</li>
                          <li>Paste it into your ESP32 Arduino sketch</li>
                          <li>Update WiFi SSID and password</li>
                          <li>Upload the firmware to your ESP32</li>
                          <li>Monitor serial output to verify connection</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* API Endpoint Info */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-sm text-gray-400">Endpoint URL</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 bg-gray-900/50 px-3 py-2 rounded text-sm text-green-400 font-mono">
                          {esp32Config.endpoint}
                        </code>
                        <button
                          onClick={() => copyToClipboard(esp32Config.endpoint, 'Endpoint URL')}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
                        >
                          <Copy className="w-4 h-4 text-gray-300" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400">Method</label>
                      <p className="text-white font-mono text-sm mt-1">{esp32Config.method}</p>
                    </div>
                  </div>

                  {/* ESP32 Code */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-400">Arduino Code</label>
                      <button
                        onClick={() => copyToClipboard(esp32Code, 'ESP32 code')}
                        className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </button>
                    </div>
                    <pre className="bg-gray-900/80 p-4 rounded-xl overflow-x-auto text-sm">
                      <code className="text-green-400 font-mono whitespace-pre">{esp32Code}</code>
                    </pre>
                  </div>

                  {/* Sample Payload */}
                  <div className="mt-4">
                    <label className="text-sm text-gray-400 mb-2 block">Sample Data Payload</label>
                    <pre className="bg-gray-900/80 p-4 rounded-xl overflow-x-auto text-sm">
                      <code className="text-blue-400 font-mono">
                        {JSON.stringify(esp32Config.samplePayload, null, 2)}
                      </code>
                    </pre>
                  </div>

                  {/* Success Message */}
                  <div className="mt-4 bg-green-900/30 border border-green-500/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-white mb-1">Testing Your Connection</h3>
                        <p className="text-sm text-gray-300">
                          After uploading the code, your ESP32 should start sending data every 5 seconds. 
                          Check the Home page to see live readings appear on your dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center">
              <Smartphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Device Selected</h3>
              <p className="text-gray-500">Select a device from the list to view its configuration</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
