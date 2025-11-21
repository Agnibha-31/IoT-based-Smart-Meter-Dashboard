import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Lock, MapPin, Trash2, User, Bell, Database, Eye, EyeOff, LogOut, Save, AlertCircle, CheckCircle, Clock, Globe, DollarSign } from 'lucide-react';
import { useSettings, TIMEZONES, LOCATIONS, LANGUAGES, CURRENCIES } from '../SettingsContext';
import { toast } from 'sonner';
import { updatePreferences, changePassword as changePasswordApi, deleteHistoryBefore, fetchCurrentUser } from '../../utils/apiClient';

interface SettingsPageProps {
  onLogout: () => void;
}

export default function SettingsPage({ onLogout }: SettingsPageProps) {
  const { 
    language, 
    location, 
    timezone, 
    currency,
    setLanguage, 
    setLocation, 
    setTimezone, 
    setCurrency,
    translate, 
    getCurrentTime,
    getLocationName,
    getWeatherData,
    getCurrencyInfo
  } = useSettings();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('smartmeter_notifications');
    return saved ? JSON.parse(saved) : {
      email: true,
      alerts: true,
      reports: false,
      maintenance: true,
      powerOutage: true,
      lowVoltage: false,
      highUsage: true,
      weeklyReport: false
    };
  });
  const [dataRetention, setDataRetention] = useState(() => {
    return localStorage.getItem('smartmeter_data_retention') || '1year';
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [autoSave, setAutoSave] = useState(() => {
    return localStorage.getItem('smartmeter_autosave') === 'true';
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('smartmeter_theme') || 'dark';
  });
  const [refreshRate, setRefreshRate] = useState(() => {
    return localStorage.getItem('smartmeter_refresh_rate') || '5';
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);

  const persistPreferences = async (updates: Record<string, any>, silent = false) => {
    setIsSavingPreferences(true);
    try {
      await updatePreferences(updates);
      setUnsavedChanges(false);
      if (!silent) toast.success('Settings saved');
    } catch (error: any) {
      toast.error(error?.message || 'Unable to save settings');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [getCurrentTime]);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('smartmeter_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Save other settings to localStorage
  useEffect(() => {
    localStorage.setItem('smartmeter_data_retention', dataRetention);
  }, [dataRetention]);

  useEffect(() => {
    localStorage.setItem('smartmeter_autosave', autoSave.toString());
  }, [autoSave]);

  useEffect(() => {
    localStorage.setItem('smartmeter_theme', theme);
  }, [theme]);

  // Apply theme to document root and handle system changes when in 'auto'
  useEffect(() => {
    const applyTheme = () => {
      const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const useDark = theme === 'dark' || (theme === 'auto' && prefersDark);
      document.documentElement.classList.toggle('dark', useDark);
      const useLight = theme === 'light' || (theme === 'auto' && !prefersDark);
      document.documentElement.classList.toggle('theme-light', useLight);
    };
    applyTheme();
    const media = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const onChange = () => { if (theme === 'auto') applyTheme(); };
    if (media) {
      // Support older browsers
      // @ts-ignore
      if (media.addEventListener) media.addEventListener('change', onChange);
      // @ts-ignore
      else if (media.addListener) media.addListener(onChange);
    }
    return () => {
      if (media) {
        // @ts-ignore
        if (media.removeEventListener) media.removeEventListener('change', onChange);
        // @ts-ignore
        else if (media.removeListener) media.removeListener(onChange);
      }
    };
  }, [theme]);

  // Hydrate theme and notifications from server user profile on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { user } = await fetchCurrentUser();
        if (!mounted) return;
        if (user?.theme) {
          setTheme(user.theme);
        }
        if (user?.notifications && typeof user.notifications === 'object') {
          setNotifications((prev: any) => ({ ...prev, ...user.notifications }));
        }
        if (typeof user?.autosave === 'boolean') {
          setAutoSave(user.autosave);
        }
        if (typeof user?.refresh_rate === 'number') {
          setRefreshRate(String(user.refresh_rate));
        }
        if (typeof user?.data_retention === 'string') {
          setDataRetention(user.data_retention);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem('smartmeter_refresh_rate', refreshRate);
  }, [refreshRate]);

  const retentionOptions = [
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: '90days', label: '90 Days' },
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' },
    { value: '2years', label: '2 Years' },
    { value: 'forever', label: 'Forever' }
  ];

  const retentionDurations: Record<string, number | null> = {
    '7days': 7 * 86400,
    '30days': 30 * 86400,
    '90days': 90 * 86400,
    '6months': 182 * 86400,
    '1year': 365 * 86400,
    '2years': 730 * 86400,
    forever: null,
  };

  const refreshRateOptions = [
    { value: '1', label: '1 Second' },
    { value: '2', label: '2 Seconds' },
    { value: '5', label: '5 Seconds' },
    { value: '10', label: '10 Seconds' },
    { value: '30', label: '30 Seconds' },
    { value: '60', label: '1 Minute' }
  ];

  const themeOptions = [
    { value: 'dark', label: 'Dark Theme' },
    { value: 'light', label: 'Light Theme' },
    { value: 'auto', label: 'Auto (System)' }
  ];

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return requirements;
  };

  const passwordValidation = validatePassword(newPassword);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handlePasswordChange = () => {
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(translate('password_mismatch'));
      return;
    }
    if (!isPasswordValid) {
      toast.error('Password does not meet security requirements');
      return;
    }
    
    setIsChangingPassword(true);
    changePasswordApi(currentPassword, newPassword)
      .then(() => {
        toast.success(translate('password_updated'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      })
      .catch((error: any) => {
        toast.error(error?.message || 'Unable to update password');
      })
      .finally(() => setIsChangingPassword(false));
  };

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    setUnsavedChanges(true);
    toast.success(`Location updated to ${LOCATIONS.find(loc => loc.code === newLocation)?.name}`);
    
    if (autoSave) {
      persistPreferences({ location: newLocation }, true);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setUnsavedChanges(true);
    toast.success(`Language changed to ${LANGUAGES.find(lang => lang.code === newLanguage)?.nativeName}`);
    
    if (autoSave) {
      persistPreferences({ language: newLanguage }, true);
    }
  };

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
    setUnsavedChanges(true);
    toast.success(`Timezone updated to ${newTimezone}`);
    
    if (autoSave) {
      persistPreferences({ timezone: newTimezone }, true);
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    setUnsavedChanges(true);
    const currencyInfo = CURRENCIES.find(curr => curr.code === newCurrency);
    toast.success(`Currency updated to ${currencyInfo?.name} (${currencyInfo?.symbol})`);
    
    if (autoSave) {
      persistPreferences({ currency: newCurrency }, true);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

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
      console.log('Got GPS coordinates:', latitude, longitude);

      // Store GPS coordinates in localStorage
      localStorage.setItem('smartmeter_geo_coords', JSON.stringify({ lat: latitude, lon: longitude }));
      
      // Clear weather cache to force fresh fetch
      localStorage.removeItem('smartmeter_weather_cache');

      // Get location details from reverse geocoding
      toast.info('Getting location details...');
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

      // Map timezone based on country (GMT format)
      const countryTimezones: Record<string, string> = {
        'US': 'GMT-5:00', 'CA': 'GMT-5:00', 'GB': 'GMT+0:00', 'IE': 'GMT+0:00',
        'FR': 'GMT+1:00', 'DE': 'GMT+1:00', 'ES': 'GMT+1:00', 'IT': 'GMT+1:00',
        'IN': 'GMT+5:30', 'CN': 'GMT+8:00', 'JP': 'GMT+9:00', 'AU': 'GMT+10:00',
        'NZ': 'GMT+12:00', 'BR': 'GMT-3:00', 'AR': 'GMT-3:00', 'AE': 'GMT+4:00',
        'SA': 'GMT+3:00', 'RU': 'GMT+3:00',
      };

      // Map currency based on country
      const countryCurrencies: Record<string, string> = {
        'US': 'USD', 'CA': 'CAD', 'GB': 'GBP', 'IE': 'EUR',
        'FR': 'EUR', 'DE': 'EUR', 'ES': 'EUR', 'IT': 'EUR',
        'IN': 'INR', 'CN': 'CNY', 'JP': 'JPY', 'AU': 'AUD',
        'NZ': 'NZD', 'BR': 'BRL', 'AR': 'ARS', 'AE': 'AED',
        'SA': 'SAR', 'RU': 'RUB',
      };

      const mappedTimezone = countryTimezones[countryCode] || 'GMT+0:00';
      const mappedCurrency = countryCurrencies[countryCode] || 'USD';

      // Update backend
      await persistPreferences({
        timezone: mappedTimezone,
        location: locationString,
        currency: mappedCurrency
      });

      // Update local state
      setLocation(locationString);
      setTimezone(mappedTimezone);
      setCurrency(mappedCurrency);

      toast.success(`Location updated!\n${locationString}\nTimezone: ${mappedTimezone}\nCurrency: ${mappedCurrency}`, {
        duration: 5000
      });

      // Reload page to ensure all components update
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Location error:', error);
      if (error.code === 1) {
        toast.error('Location access denied. Please enable location permissions in your browser settings.');
      } else if (error.code === 2) {
        toast.error('Location unavailable. Please try again.');
      } else if (error.code === 3) {
        toast.error('Location request timed out. Please try again.');
      } else {
        toast.error('Failed to get current location. Please try again.');
      }
    }
  };

  const handleDeleteData = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    setIsDeletingData(true);
    const duration = retentionDurations[dataRetention];
    const before = duration
      ? Math.floor(Date.now() / 1000) - duration
      : Math.floor(Date.now() / 1000);
    deleteHistoryBefore(before)
      .then(() => {
        toast.success('Historical data has been successfully deleted.');
        setShowDeleteConfirm(false);
      })
      .catch((error: any) => {
        toast.error(error?.message || 'Failed to delete data');
      })
      .finally(() => setIsDeletingData(false));
  };

  const handleExportSettings = () => {
    const settings = {
      language,
      location,
      timezone,
      currency,
      notifications,
      dataRetention,
      autoSave,
      theme,
      refreshRate,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartmeter-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Settings exported successfully');
  };

  const handleImportSettings = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        
        // Apply imported settings
        if (importedSettings.language) setLanguage(importedSettings.language);
        if (importedSettings.location) setLocation(importedSettings.location);
        if (importedSettings.timezone) setTimezone(importedSettings.timezone);
        if (importedSettings.currency) setCurrency(importedSettings.currency);
        if (importedSettings.notifications) setNotifications(importedSettings.notifications);
        if (importedSettings.dataRetention) setDataRetention(importedSettings.dataRetention);
        if (importedSettings.autoSave !== undefined) setAutoSave(importedSettings.autoSave);
        if (importedSettings.theme) setTheme(importedSettings.theme);
        if (importedSettings.refreshRate) setRefreshRate(importedSettings.refreshRate);
        
        toast.success('Settings imported successfully');
      } catch (error) {
        toast.error('Invalid settings file');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const handleSaveChanges = () => {
    persistPreferences({
      language,
      location,
      timezone,
      currency,
    });
  };

  const handleSignOut = () => {
    toast.success('Signing out...');
    setTimeout(() => {
      onLogout();
    }, 1000);
  };

  const weatherData = getWeatherData();
  const currencyInfo = getCurrencyInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-500 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-medium text-white">{translate('settings')}</h1>
            <p className="text-gray-400">{translate('manage_account')}</p>
          </div>
        </div>
        
        {/* Live Info Display */}
        <div className="flex items-center space-x-4">
          <motion.div
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-right"
          >
            <div className="text-white font-medium">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-gray-400 text-sm">
              {getLocationName()} • {weatherData.temperature}°C
            </div>
          </motion.div>
          
          {unsavedChanges && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleSaveChanges}
              disabled={isSavingPreferences}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">
                {isSavingPreferences ? 'Saving...' : 'Save Changes'}
              </span>
            </motion.button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Password Change */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="w-5 h-5 text-red-400" />
              <h3 className="text-white text-lg font-medium">{translate('security')}</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">{translate('current_password')}</label>
                <div className="relative">
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                    placeholder={translate('current_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">{translate('new_password')}</label>
                <div className="relative">
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                    placeholder={translate('new_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(passwordValidation).map(([key, isValid]) => (
                      <div key={key} className={`flex items-center space-x-2 text-xs ${isValid ? 'text-green-400' : 'text-gray-400'}`}>
                        {isValid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        <span>
                          {key === 'length' && '8+ characters'}
                          {key === 'uppercase' && 'Uppercase letter'}
                          {key === 'lowercase' && 'Lowercase letter'}
                          {key === 'number' && 'Number'}
                          {key === 'special' && 'Special character'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">{translate('confirm_password')}</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                    confirmPassword && newPassword !== confirmPassword 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-600 focus:ring-red-500'
                  }`}
                  placeholder={translate('confirm_password')}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !currentPassword || !isPasswordValid || newPassword !== confirmPassword}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? 'Updating...' : translate('update_password')}
              </motion.button>
            </div>
          </div>

          {/* Location & Currency Settings */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="w-5 h-5 text-blue-400" />
              <h3 className="text-white text-lg font-medium">Location & Currency</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">{translate('region')}</label>
                <div className="text-white px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg">
                  {getLocationName()}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUseCurrentLocation}
                  className="mt-2 w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Use Current Location (GPS)</span>
                </motion.button>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">{translate('timezone')}</label>
                <div className="text-white px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg">
                  {timezone ? `${timezone} (Auto-detected)` : 'Not set'}
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  Timezone is automatically set based on your GPS location
                </p>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">{translate('language')}</label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.nativeName} ({lang.name})</option>
                  ))}
                </motion.select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Currency</label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  {CURRENCIES.map(curr => (
                    <option key={curr.code} value={curr.code}>{curr.symbol} {curr.name} ({curr.code})</option>
                  ))}
                </motion.select>
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  <span>Current: {currencyInfo.symbol} {currencyInfo.name}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Notifications */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-5 h-5 text-yellow-400" />
              <h3 className="text-white text-lg font-medium">{translate('notifications')}</h3>
            </div>
            
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                >
                  <span className="text-white text-sm">
                    {key === 'email' && 'Email Notifications'}
                    {key === 'alerts' && 'System Alerts'}
                    {key === 'reports' && 'Weekly Reports'}
                    {key === 'maintenance' && 'Maintenance Notices'}
                    {key === 'powerOutage' && 'Power Outage Alerts'}
                    {key === 'lowVoltage' && 'Low Voltage Warnings'}
                    {key === 'highUsage' && 'High Usage Alerts'}
                    {key === 'weeklyReport' && 'Weekly Summary'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => {
                        const next = { ...notifications, [key]: e.target.checked };
                        setNotifications(next);
                        toast.success('Notification preference updated');
                        // Persist notification preferences to backend (best-effort)
                        updatePreferences({ notifications: next }).catch(() => {});
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </motion.div>
              ))}
            </div>
          </div>

          {/* App Preferences */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="w-5 h-5 text-purple-400" />
              <h3 className="text-white text-lg font-medium">App Preferences</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Theme</label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  value={theme}
                  onChange={(e) => {
                    setTheme(e.target.value);
                    toast.success(`Theme changed to ${e.target.value}`);
                    // Persist theme to backend (best-effort)
                    updatePreferences({ theme: e.target.value }).catch(() => {});
                  }}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  {themeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </motion.select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Data Refresh Rate</label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  value={refreshRate}
                  onChange={(e) => {
                    setRefreshRate(e.target.value);
                    toast.success(`Refresh rate set to ${e.target.value} second(s)`);
                    const rr = parseInt(e.target.value, 10);
                    if (rr > 0) updatePreferences({ refresh_rate: rr }).catch(() => {});
                  }}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  {refreshRateOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </motion.select>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <span className="text-white text-sm">Auto-save Settings</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => {
                      setAutoSave(e.target.checked);
                      toast.success(e.target.checked ? 'Auto-save enabled' : 'Auto-save disabled');
                      updatePreferences({ autosave: e.target.checked }).catch(() => {});
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-6">
              <Database className="w-5 h-5 text-green-400" />
              <h3 className="text-white text-lg font-medium">{translate('data_management')}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">{translate('data_retention_period')}</label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  value={dataRetention}
                  onChange={(e) => {
                    setDataRetention(e.target.value);
                    toast.success(`Data retention set to ${e.target.value.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                    updatePreferences({ data_retention: e.target.value }).catch(() => {});
                  }}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                >
                  {retentionOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </motion.select>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportSettings}
                  className="w-full px-4 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 font-medium rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                >
                  Export Settings
                </motion.button>

                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-green-500/20 border border-green-500/30 text-green-400 font-medium rounded-lg hover:bg-green-500/30 transition-all duration-300"
                  >
                    Import Settings
                  </motion.button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-600">
                <div className="flex items-start space-x-3 mb-4">
                  <Trash2 className="w-5 h-5 text-red-400 mt-1" />
                  <div>
                    <h4 className="text-white font-medium">{translate('delete_historical_data')}</h4>
                    <p className="text-gray-400 text-sm">
                      This will permanently delete all stored meter readings and historical data.
                    </p>
                  </div>
                </div>

                {showDeleteConfirm ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
                  >
                    <p className="text-red-400 text-sm mb-4">
                      Are you sure you want to delete all historical data? This action is irreversible.
                    </p>
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDeleteData}
                        disabled={isDeletingData}
                        className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {isDeletingData ? 'Deleting...' : `${translate('yes')}, Delete All Data`}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-500 transition-colors"
                      >
                        {translate('cancel')}
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeletingData}
                    className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 font-medium rounded-lg hover:bg-red-500/30 transition-all duration-300 disabled:opacity-50"
                  >
                    {isDeletingData ? 'Deleting...' : translate('delete_historical_data')}
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-3 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}