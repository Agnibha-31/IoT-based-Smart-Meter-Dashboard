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
      
      // Request location permission after successful login
      console.log('App.tsx: Scheduling location permission request after login');
      setTimeout(() => {
        console.log('App.tsx: Triggering location permission request');
        requestLocationPermission();
      }, 1500);
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
      console.log('App.tsx: Scheduling location permission request after registration');
      setTimeout(() => {
        console.log('App.tsx: Triggering location permission request');
        requestLocationPermission();
      }, 1500);
    } catch (err: any) {
      setView('login');
      toast.error(err?.message || 'Registration failed');
    }
  };

  const requestLocationPermission = async () => {
    console.log('App.tsx: requestLocationPermission called');
    if ('geolocation' in navigator) {
      console.log('App.tsx: Geolocation is available, requesting permission...');
      toast.info('Requesting location permission...');
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
      console.log('Getting location info for:', latitude, longitude);
      
      // Get location name and timezone using reverse geocoding from Nominatim
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
        {
          headers: {
            'User-Agent': 'SmartMeterDashboard/1.0'
          }
        }
      );
      
      if (!geocodeResponse.ok) {
        throw new Error('Geocoding failed');
      }
      
      const geocodeData = await geocodeResponse.json();
      const city = geocodeData.address?.city || geocodeData.address?.town || geocodeData.address?.village || '';
      const state = geocodeData.address?.state || '';
      const country = geocodeData.address?.country || '';
      const countryCode = geocodeData.address?.country_code?.toUpperCase() || '';
      
      let locationString = '';
      if (city && state && country) {
        locationString = `${city}, ${state}, ${country}`;
      } else if (city && country) {
        locationString = `${city}, ${country}`;
      } else if (country) {
        locationString = country;
      } else {
        locationString = 'Unknown Location';
      }
      
      console.log('Detected location:', locationString);
      
      // Calculate timezone based on longitude (rough approximation)
      // This is a fallback method that works without external API
      const timezoneOffset = Math.round(longitude / 15);
      let mappedTimezone = 'UTC+0';
      
      if (timezoneOffset > 0) {
        mappedTimezone = `UTC+${timezoneOffset}`;
      } else if (timezoneOffset < 0) {
        mappedTimezone = `UTC${timezoneOffset}`;
      }
      
      // Better timezone detection based on country/region (GMT format)
      const countryTimezones: Record<string, string> = {
        'US': 'GMT-5:00',     // Eastern
        'CA': 'GMT-5:00',     // Eastern
        'GB': 'GMT+0:00',     // London
        'IE': 'GMT+0:00',     // Dublin
        'FR': 'GMT+1:00',     // Paris
        'DE': 'GMT+1:00',     // Berlin
        'ES': 'GMT+1:00',     // Madrid
        'IT': 'GMT+1:00',     // Rome
        'IN': 'GMT+5:30',     // India
        'CN': 'GMT+8:00',     // China
        'JP': 'GMT+9:00',     // Japan
        'AU': 'GMT+10:00',    // Sydney
        'NZ': 'GMT+12:00',    // Wellington
        'BR': 'GMT-3:00',     // Brasilia
        'AR': 'GMT-3:00',     // Buenos Aires
        'AE': 'GMT+4:00',     // Dubai
        'SA': 'GMT+3:00',     // Riyadh
        'RU': 'GMT+3:00',     // Moscow
      };
      
      if (countryCode && countryTimezones[countryCode]) {
        mappedTimezone = countryTimezones[countryCode];
      }
      
      console.log('Detected timezone:', mappedTimezone);
      
      // Update user settings via API
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No access token found');
        return;
      }
      
      // Store GPS coordinates in localStorage for live weather
      localStorage.setItem('smartmeter_geo_coords', JSON.stringify({ lat: latitude, lon: longitude }));
      
      const updateResponse = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          timezone: mappedTimezone,
          location: locationString
        })
      });
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Failed to update profile:', errorText);
        throw new Error('Profile update failed');
      }
      
      const updatedData = await updateResponse.json();
      console.log('Profile updated successfully:', updatedData);
      
      if (updatedData.user) {
        // Fetch fresh user data from backend to ensure complete sync
        try {
          const freshUser = await fetchCurrentUser();
          if (freshUser.user) {
            // Update user state which will trigger SettingsProvider update via key prop
            setUser({
              ...freshUser.user,
              timezone: mappedTimezone,
              location: locationString
            });
            
            // Force complete state update by setting user to null briefly then back
            const currentUser = freshUser.user;
            setUser(null);
            setTimeout(() => {
              setUser(currentUser);
              toast.success(`Location updated!\n${locationString}\nTimezone: ${mappedTimezone}`, {
                duration: 5000
              });
              
              // Reload the page to ensure all components update
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }, 100);
          }
        } catch (err) {
          console.error('Failed to refresh user data:', err);
          // Still update local state even if refresh fails
          setUser({
            ...user,
            timezone: mappedTimezone,
            location: locationString
          });
          toast.success(`Location updated: ${locationString}\nTimezone: ${mappedTimezone}`);
          
          // Reload to ensure update
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Failed to update location-based settings:', error);
      toast.error('Failed to update location settings');
    }
  };

  const handleLogout = () => {
    setAccessToken(null);
    setUser(null);
    setView('login');
  };

  const initialSettings = React.useMemo(() => {
    console.log('App.tsx: Creating initialSettings from user:', user);
    return user
      ? {
          language: user.language,
          timezone: user.timezone,
          currency: user.currency,
          location: user.location,
        }
      : undefined;
  }, [user?.language, user?.timezone, user?.currency, user?.location]);

  return (
    <SettingsProvider key={`${user?.timezone}-${user?.location}`} initialSettings={initialSettings}>
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
