import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Database } from 'lucide-react';
import { useSettings } from './SettingsContext';

interface LoginProps {
  onLogin: (payload: { email: string; password: string }) => Promise<void> | void;
  onRegister: (payload: { email: string; password: string; name: string }) => Promise<void> | void;
}

export default function LoginPage({ onLogin, onRegister }: LoginProps) {
  const { translate } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean | null>(null);
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);
  const debounceTimer = useRef<number | null>(null);
  const lastTried = useRef<{ email: string; password: string } | null>(null);

  // Check if this is first time user (no users exist yet)
  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/check-first-user`);
        const data = await response.json();
        setIsFirstTimeUser(data.isFirstUser || false);
      } catch {
        setIsFirstTimeUser(false);
      }
    };
    checkFirstTime();
  }, []);

  // Full name validation - at least 2 words, each starting with capital letter
  const validateName = (fullName: string) => {
    const trimmed = fullName.trim();
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);
    
    return {
      hasTwoWords: words.length >= 2,
      allCapitalized: words.every(word => /^[A-Z]/.test(word)),
      isValid: words.length >= 2 && words.every(word => /^[A-Z]/.test(word))
    };
  };

  // Email validation - proper email format with valid domain
  const validateEmail = (emailStr: string) => {
    const trimmed = emailStr.trim();
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const hasValidFormat = emailRegex.test(trimmed);
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'protonmail.com', 'aol.com', 'mail.com'];
    const domain = trimmed.split('@')[1]?.toLowerCase();
    
    return {
      hasValidFormat: hasValidFormat,
      hasAtSymbol: trimmed.includes('@'),
      hasDomain: trimmed.split('@').length === 2 && trimmed.split('@')[1].includes('.'),
      isCommonDomain: domain ? commonDomains.includes(domain) : false,
      isValid: hasValidFormat
    };
  };

  // Password validation
  const validatePassword = (pwd: string) => {
    return {
      minLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  };

  const nameValidation = validateName(name);
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  const isPasswordValid = Object.values(passwordValidation).every(v => v);
  const isFormValid = isFirstTimeUser 
    ? (nameValidation.isValid && emailValidation.isValid && isPasswordValid)
    : (emailValidation.isValid && password.length >= 6);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault?.();
    if (!email || !password) {
      setShowError('Please provide email and password');
      return;
    }
    if (isFirstTimeUser && !name) {
      setShowError('Please provide your name');
      return;
    }
    if (isFirstTimeUser && !isPasswordValid) {
      setShowError('Password does not meet requirements');
      return;
    }
    setShowError(null);
    setIsSubmitting(true);
    try {
      if (isFirstTimeUser) {
        await onRegister({ email, password, name });
      } else {
        await onLogin({ email, password });
      }
      lastTried.current = { email, password };
    } catch (err: any) {
      setShowError(err?.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Auto-authenticate for existing users only (not first-time registration)
  useEffect(() => {
    if (isFirstTimeUser) return; // Disable auto-login for registration
    
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (!email || !password || isSubmitting) return;
    if (lastTried.current &&
        lastTried.current.email === email &&
        lastTried.current.password === password) {
      return;
    }
    debounceTimer.current = window.setTimeout(() => {
      void handleSubmit();
    }, 700);
    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, [email, password, isSubmitting, isFirstTimeUser]);

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
              <p className="text-white/90 text-sm mb-6">
                {isFirstTimeUser ? 'Create your admin account' : translate('enter_credentials')}
              </p>
            </div>
            
            {isFirstTimeUser && (
              <div className="relative">
                <label className="block text-white/90 text-sm mb-2 text-center">Full Name</label>
                <div className="relative w-4/5 mx-auto">
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    style={{ paddingLeft: '4.5rem', paddingRight: '5.0rem' }}
                    className="w-full py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center"
                    placeholder={nameFocused || name ? '' : 'Enter your full name'}
                    autoComplete="name"
                  />
                  {name && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center"
                    >
                      {nameValidation.isValid ? (
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
                {name && !nameValidation.isValid && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 text-center mt-1"
                  >
                    {!nameValidation.hasTwoWords && "Enter at least 2 words"}
                    {nameValidation.hasTwoWords && !nameValidation.allCapitalized && "Each word must start with a capital letter"}
                  </motion.p>
                )}
              </div>
            )}
            
            <div className="relative">
              <label className="block text-white/90 text-sm mb-2 text-center">{isFirstTimeUser ? 'Mail Id' : translate('username')}</label>
              <div className="relative w-4/5 mx-auto">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  style={{ paddingLeft: '3.5rem', paddingRight: '3rem' }}
                  className="w-full py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center"
                  placeholder={usernameFocused || email ? '' : (isFirstTimeUser ? 'Enter your email address' : translate('enter_username'))}
                  autoComplete="username"
                  disabled={isFirstTimeUser ? !nameValidation.isValid : false}
                />
                {isFirstTimeUser && email && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center"
                  >
                    {emailValidation.isValid ? (
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              {isFirstTimeUser && email && !emailValidation.isValid && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 text-center mt-1"
                >
                  {!emailValidation.hasAtSymbol && "Email must contain @ symbol"}
                  {emailValidation.hasAtSymbol && !emailValidation.hasDomain && "Enter a valid email domain (e.g., @gmail.com)"}
                  {emailValidation.hasDomain && !emailValidation.hasValidFormat && "Enter a valid email format"}
                </motion.p>
              )}
            </div>
            
            <div className="relative">
              <label className="block text-white/90 text-sm mb-2 text-center">{isFirstTimeUser ? 'Create Password' : translate('password')}</label>
              <div className="relative w-4/5 mx-auto">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => {
                    setPasswordFocused(true);
                    if (isFirstTimeUser) setShowPasswordHelp(true);
                  }}
                  onBlur={() => {
                    setPasswordFocused(false);
                    setTimeout(() => setShowPasswordHelp(false), 200);
                  }}
                  style={{ paddingLeft: '2.0rem', paddingRight: '1.0rem' }}
                  className="w-full py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center"
                  placeholder={passwordFocused || password ? '' : 'Enter your password'}
                  autoComplete={isFirstTimeUser ? 'new-password' : 'current-password'}
                  disabled={isFirstTimeUser ? !emailValidation.isValid : false}
                />
                {isFirstTimeUser && password && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center"
                  >
                    {isPasswordValid ? (
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              
              {/* Password Requirements Tooltip */}
              {isFirstTimeUser && showPasswordHelp && password && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-slate-800 border border-white/20 rounded-lg p-4 shadow-xl z-50"
                >
                  <p className="text-white text-xs font-medium mb-2">Password Requirements:</p>
                  <ul className="space-y-1 text-xs">
                    <li className={passwordValidation.minLength ? 'text-green-400' : 'text-red-400'}>
                      {passwordValidation.minLength ? '✓' : '✗'} At least 8 characters
                    </li>
                    <li className={passwordValidation.hasUpper ? 'text-green-400' : 'text-red-400'}>
                      {passwordValidation.hasUpper ? '✓' : '✗'} One uppercase letter (A-Z)
                    </li>
                    <li className={passwordValidation.hasLower ? 'text-green-400' : 'text-red-400'}>
                      {passwordValidation.hasLower ? '✓' : '✗'} One lowercase letter (a-z)
                    </li>
                    <li className={passwordValidation.hasNumber ? 'text-green-400' : 'text-red-400'}>
                      {passwordValidation.hasNumber ? '✓' : '✗'} One number (0-9)
                    </li>
                    <li className={passwordValidation.hasSpecial ? 'text-green-400' : 'text-red-400'}>
                      {passwordValidation.hasSpecial ? '✓' : '✗'} One special character (!@#$%^&*)
                    </li>
                  </ul>
                </motion.div>
              )}
            </div>

            {isFirstTimeUser && (
              <motion.button
                whileHover={{ scale: isFormValid ? 1.05 : 1 }}
                whileTap={{ scale: isFormValid ? 0.95 : 1 }}
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className={`w-4/5 mx-auto block py-3 rounded-lg font-medium shadow-lg transition-all duration-300 ${
                  isFormValid && !isSubmitting
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-xl cursor-pointer'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                }`}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Admin Account'}
              </motion.button>
            )}

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