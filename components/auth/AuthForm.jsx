
'use client'

// ... imports
import React, { useState } from 'react';

import { useAuth } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';
import { useSettings } from '@context/SettingsContext';
import { FormInput } from '@components/ui/FormInput';
import { Button } from '@components/ui/Button';
import { EyeIcon, EyeOffIcon } from '@components/ui/Icons';

export function AuthForm({ isRegister = false }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', passwordConfirmation: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { login, register } = useAuth();
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

  const validatePasswordStrength = (password) => {
    if (!password) return { strength: 'none', message: t.auth.passwordReq };
    if (password.length < 8) return { strength: 'weak', message: t.auth.passwordWeak };

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (hasUpper && hasLower && hasNumber) return { strength: 'strong', message: t.auth.passwordStrong };
    if ((hasUpper || hasLower) && hasNumber) return { strength: 'medium', message: t.auth.passwordMedium };

    return { strength: 'weak', message: t.auth.passwordRule };
  };

  const PasswordStrengthMeter = ({ password }) => {
    const { strength, message } = validatePasswordStrength(password);
    if (strength === 'none' || !password) return null;

    const colorMap = { weak: 'bg-destructive', medium: 'bg-yellow-500', strong: 'bg-primary' };
    const widthMap = { weak: 'w-1/3', medium: 'w-2/3', strong: 'w-full' };

    return (
      <div>
        <div className="h-1 w-full bg-muted rounded-full mt-1">
          <div className={`h-1 rounded-full ${colorMap[strength]} ${widthMap[strength]} transition-all`}></div>
        </div>
        <p className={`text-xs mt-1 ${strength === 'weak' ? 'text-destructive' : 'text-muted-foreground'}`}>
          {message}
        </p>
      </div>
    );
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
    if (name === 'name' && isRegister && !value) error = t.auth.nameReq;
    if (name === 'password' && isRegister) {
      const { message, strength } = validatePasswordStrength(value);
      if (strength === 'weak' || strength === 'none') error = message;
    }
    if (name === 'passwordConfirmation' && isRegister && value !== formData.password) error = t.auth.passMismatch;

    if (error) setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (isRegister) {
      if (!formData.name) newErrors.name = t.auth.nameReq;
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
      const passStrength = validatePasswordStrength(formData.password);
      if (passStrength.strength === 'weak' || passStrength.strength === 'none') newErrors.password = passStrength.message;
      if (passStrength.strength === 'weak' || passStrength.strength === 'none') newErrors.password = passStrength.message;
      if (formData.password !== formData.passwordConfirmation) newErrors.passwordConfirmation = t.auth.passMismatch;
      if (!termsAccepted) newErrors.terms = t.auth.termsError;
    } else {
      if (!formData.email) newErrors.email = t.auth.emailReq;
      if (!formData.password) newErrors.password = t.auth.passwordReq;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isRegister) {
        await register(formData.name, formData.email, formData.password, formData.passwordConfirmation);
        showToast(t.auth.registerSuccess, 'success');

        window.location.href = '/login';
      } else {
        await login(formData.email, formData.password);
        showToast(t.auth.welcome, 'success');

        const destination = callbackUrl || '/';
        window.location.href = destination;
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-card rounded-lg shadow-xl border border-border transition-colors duration-300">
      <h2 className="text-3xl font-bold text-center text-foreground mb-6">
        {isRegister ? t.auth.registerTitle : t.auth.loginTitle}
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {isRegister && (
          <FormInput id="name" label={t.auth.name} value={formData.name} onChange={handleChange} onBlur={handleBlur} error={errors.name} autoComplete="name" required />
        )}
        <FormInput id="email" label={t.auth.email} type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} autoComplete="email" required />
        <div className="relative">
          <FormInput id="password" label={t.auth.password} type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} onBlur={handleBlur} error={errors.password} autoComplete={isRegister ? 'new-password' : 'current-password'} required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-500">
            {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
        {isRegister && (
          <>
            <PasswordStrengthMeter password={formData.password} />
            <div className="relative">
              <FormInput id="passwordConfirmation" label={t.auth.confirmPassword} type={showPassword ? 'text' : 'password'} value={formData.passwordConfirmation} onChange={handleChange} onBlur={handleBlur} error={errors.passwordConfirmation} autoComplete="new-password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-500">
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </>
        )}

        {apiError && <p className="text-sm text-destructive text-center">{apiError}</p>}
        <div className="pt-2">
          <Button type="submit" isLoading={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-200">
            {isRegister ? t.auth.registerBtn : t.auth.loginBtn}
          </Button>
        </div>
        {isRegister && (
          <div className="flex items-start gap-3 mt-4">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }));
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-900 transition duration-150 ease-in-out cursor-pointer"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="terms" className="font-medium text-foreground cursor-pointer select-none">
                {t.auth.termsAccept}
                <a href="/terms" className="text-primary hover:underline" target="_blank">
                  {t.auth.termsLink}
                </a>
                {t.auth.and}
                <a href="/privacy" className="text-primary hover:underline" target="_blank">
                  {t.auth.privacyLink}
                </a>
              </label>
              {errors.terms && <p className="text-xs text-destructive mt-1">{errors.terms}</p>}
            </div>
          </div>
        )}

      </form>
      <p className="text-sm text-center text-muted-foreground mt-6">
        {isRegister ? t.auth.haveAccount : t.auth.noAccount}

        <a
          href={isRegister ? '/login' : '/register'}
          className="font-medium text-primary hover:text-primary/80 hover:underline ml-1"
        >
          {isRegister ? t.auth.loginLink : t.auth.registerLink}
        </a>
      </p>
    </div>
  );
}