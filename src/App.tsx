import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import LoginPage from './components/LoginPage';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './components/Dashboard';
import { SettingsProvider } from './components/SettingsContext';
import { fetchCurrentUser, login as apiLogin, register as apiRegister, setAccessToken } from './utils/apiClient';

type ViewState = 'checking' | 'login' | 'loading' | 'dashboard';

export default function App() {
  const [view, setView] = useState<ViewState>('checking');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const result = await fetchCurrentUser();
        setUser(result.user);
        setView('dashboard');
      } catch {
        setUser(null);
        setAccessToken(null);
        setView('login');
      }
    };
    hydrate();
  }, []);

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    setView('loading');
    try {
      const result = await apiLogin(email, password);
      setUser(result.user);
      setView('dashboard');
    } catch (err: any) {
      setView('login');
      toast.error(err?.message || 'Authentication failed');
    }
  };

  const handleRegister = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    setView('loading');
    try {
      const result = await apiRegister(email, password, name);
      setUser(result.user);
      toast.success('Account created successfully!');
      setView('dashboard');
      
      // Request location permission after successful registration
      setTimeout(() => {
        requestLocationPermission();
      }, 1000);
    } catch (err: any) {
      setView('login');
      toast.error(err?.message || 'Registration failed');
    }
  };

  const requestLocationPermission = async () => {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const { latitude, longitude } = position.coords;
        
        // Get timezone, weather, and location info from coordinates
        await updateLocationBasedSettings(latitude, longitude);
        
        toast.success('Location access granted! Settings updated automatically.');
      } catch (error: any) {
        if (error.code === 1) {
          toast.info('Location access denied. You can set location manually in Settings.');
        } else {
          console.error('Location error:', error);
        }
      }
    }
  };

  const updateLocationBasedSettings = async (latitude: number, longitude: number) => {
    try {
      // Get timezone from coordinates using timezone API
      const timezoneResponse = await fetch(
        `https://api.timezonedb.com/v2.1/get-time-zone?key=demo&format=json&by=position&lat=${latitude}&lng=${longitude}`
      );
      
      if (timezoneResponse.ok) {
        const timezoneData = await timezoneResponse.json();
        const detectedTimezone = timezoneData.zoneName || 'UTC';
        
        // Map to our timezone format
        const timezoneMapping: Record<string, string> = {
          'America/New_York': 'UTC-5',
          'America/Chicago': 'UTC-6',
          'America/Denver': 'UTC-7',
          'America/Los_Angeles': 'UTC-8',
          'Europe/London': 'UTC+0',
          'Europe/Paris': 'UTC+1',
          'Asia/Dubai': 'UTC+4',
          'Asia/Kolkata': 'UTC+5.5',
          'Asia/Shanghai': 'UTC+8',
          'Asia/Tokyo': 'UTC+9',
          'Australia/Sydney': 'UTC+10',
        };
        
        const mappedTimezone = timezoneMapping[detectedTimezone] || 'UTC+0';
        
        // Get location name using reverse geocoding
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
        );
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          const city = geocodeData.address?.city || geocodeData.address?.town || geocodeData.address?.village || '';
          const country = geocodeData.address?.country || '';
          const locationString = city && country ? `${city}, ${country}` : country || 'Unknown';
          
          // Update user settings via API
          const updateResponse = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/profile`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
              timezone: mappedTimezone,
              location: locationString
            })
          });
          
          if (updateResponse.ok) {
            const updatedUser = await updateResponse.json();
            setUser(updatedUser.user);
          }
        }
      }
    } catch (error) {
      console.error('Failed to update location-based settings:', error);
    }
  };

  const handleLogout = () => {
    setAccessToken(null);
    setUser(null);
    setView('login');
  };

  const initialSettings = user
    ? {
        language: user.language,
        timezone: user.timezone,
        currency: user.currency,
        location: user.location,
      }
    : undefined;

  return (
    <SettingsProvider initialSettings={initialSettings}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800" style={{ fontFamily: 'Arial, sans-serif' }}>
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          expand={false}
          duration={3000}
        />
        <AnimatePresence mode="wait">
          {(view === 'checking' || view === 'loading') && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <LoadingScreen />
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <LoginPage onLogin={handleLogin} onRegister={handleRegister} />
            </motion.div>
          )}

          {view === 'dashboard' && user && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
            >
              <Dashboard user={user} onLogout={handleLogout} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SettingsProvider>
  );
}
