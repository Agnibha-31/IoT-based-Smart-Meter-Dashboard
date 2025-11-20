import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Database } from 'lucide-react';
import { useSettings } from './SettingsContext';

interface LoginProps {
  onLogin: (payload: { email: string; password: string }) => Promise<void> | void;
}

export default function LoginPage({ onLogin }: LoginProps) {
  const { translate } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const debounceTimer = useRef<number | null>(null);
  const lastTried = useRef<{ email: string; password: string } | null>(null);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault?.();
    if (!email || !password) {
      setShowError('Please provide both email and password');
      return;
    }
    setShowError(null);
    setIsSubmitting(true);
    try {
      await onLogin({ email, password });
      lastTried.current = { email, password };
    } catch (err: any) {
      setShowError(err?.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Auto-authenticate as the user types (debounced to reduce spam)
  useEffect(() => {
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    // Only attempt when both fields have some value and not already submitting
    if (!email || !password || isSubmitting) return;
    // Avoid duplicate immediate retries for the exact same credentials
    if (lastTried.current &&
        lastTried.current.email === email &&
        lastTried.current.password === password) {
      return;
    }
    debounceTimer.current = window.setTimeout(() => {
      // Fire and forget; handleSubmit manages state and errors
      void handleSubmit();
    }, 700);
    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, [email, password, isSubmitting]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4"
          >
            <Zap className="h-10 w-10 text-white" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-medium text-white mb-2"
          >
            {translate('smart_iot_meter')}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-300 text-sm"
          >
            {translate('welcome_advanced_iot')}
          </motion.p>
        </div>

        {/* Login Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20"
        >
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white/90 text-sm mb-6">{translate('enter_credentials')}</p>
            </div>
            
            <div>
              <label className="block text-white/90 text-sm mb-2 text-center">{translate('username')}</label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setUsernameFocused(true)}
                onBlur={() => setUsernameFocused(false)}
                className="w-4/5 mx-auto block px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center"
                placeholder={usernameFocused || email ? '' : translate('enter_username')}
                autoComplete="username"
              />
            </div>
            
            <div>
              <label className="block text-white/90 text-sm mb-2 text-center">{translate('password')}</label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="w-4/5 mx-auto block px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center"
                placeholder={passwordFocused || password ? '' : 'Enter your password'}
                autoComplete="current-password"
              />
            </div>

            {/* status area intentionally removed for cleaner UI */}

            {showError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-400 text-sm text-center"
              >
                {showError}
              </motion.div>
            )}
          </div>
        </motion.form>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="grid grid-cols-3 gap-4 text-center"
        >
          <div className="text-white/70">
            <Database className="h-6 w-6 mx-auto mb-1" />
            <p className="text-xs">Real-time Data</p>
          </div>
          <div className="text-white/70">
            <Zap className="h-6 w-6 mx-auto mb-1" />
            <p className="text-xs">Smart Analytics</p>
          </div>
          <div className="text-white/70">
            <Shield className="h-6 w-6 mx-auto mb-1" />
            <p className="text-xs">Secure Access</p>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <p className="text-white/60 text-xs">
            © 2025 Advanced IoT Solutions. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}