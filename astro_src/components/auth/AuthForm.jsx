
'use client'

import React, { useState } from 'react';

import { useAuth } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';
import { useSettings } from '@context/SettingsContext';
import { FormInput } from '@components/ui/FormInput';
import { Button } from '@components/ui/Button';
import { EyeIcon, EyeOffIcon, GoogleIcon } from '@components/ui/Icons';

export function AuthForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const { t } = useSettings();
  const callbackUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('callbackUrl') : null;
  const { showToast } = useToast();

  const validateEmail = (email) => {
    if (!email) return t.auth.emailReq;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return t.auth.emailInvalid;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (apiError) setApiError(null);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';
    if (name === 'email') error = validateEmail(value);
    if (error) setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = t.auth.emailReq;
    if (!formData.password) newErrors.password = t.auth.passwordReq;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      showToast(t.auth.welcome, 'success');
      const destination = callbackUrl || '/';
      window.location.href = destination;
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="max-w-md w-full mx-auto p-8 bg-card rounded-[32px] shadow-2xl border border-border/50 backdrop-blur-xl relative overflow-hidden group">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors duration-700" />
      
      <div className="text-center mb-10 relative z-10">
        <h2 className="text-4xl font-black tracking-tight text-foreground mb-3">
          {t.auth.unifiedTitle}
        </h2>
        <p className="text-sm text-muted-foreground font-medium max-w-[280px] mx-auto leading-relaxed">
          {t.auth.unifiedSubtitle}
        </p>
      </div>

      <div className="space-y-6 relative z-10">
        <Button 
          type="button" 
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full flex items-center justify-center gap-3 h-12 border-2 hover:bg-muted/50 transition-all duration-200"
        >
          <GoogleIcon className="w-5 h-5" />
          <span className="font-semibold">{t.auth.googleLogin}</span>
        </Button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase tracking-widest font-bold">O</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormInput 
            id="email" 
            label={t.auth.email} 
            type="email" 
            value={formData.email} 
            onChange={handleChange} 
            onBlur={handleBlur} 
            error={errors.email} 
            autoComplete="email" 
            required 
          />
          
          <div className="relative">
            <FormInput 
              id="password" 
              label={t.auth.password} 
              type={showPassword ? 'text' : 'password'} 
              value={formData.password} 
              onChange={handleChange} 
              error={errors.password} 
              autoComplete="current-password" 
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          {apiError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center animate-in fade-in slide-in-from-top-1">
              {apiError}
            </div>
          )}

          <Button 
            type="submit" 
            isLoading={isLoading} 
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            {t.auth.loginBtn}
          </Button>
        </form>
      </div>
    </div>
  );
}