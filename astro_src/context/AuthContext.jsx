'use client'

import React, { useEffect } from 'react';
import { create } from 'zustand';
import { CacheManager } from '@utils/cacheManager';

export const useAuth = create((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  checkUserSession: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/me');

      if (res.status === 409) {
        // Cuenta desactivada: limpiar sesión y redirigir a login
        set({ user: null, isAuthenticated: false, isLoading: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('culina_user_session');
          window.location.assign('/login');
        }
        return;
      }

      if (res.status === 401) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('culina_user_session');
        }
        return;
      }

      if (!res.ok) {
        throw new Error('No autenticado o Error de Servidor');
      }

      const { user } = await res.json();
      set({ user, isAuthenticated: true, isLoading: false });

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_photo: user.profile_photo_url || user.profile_photo
      };
      localStorage.setItem('culina_user_session', JSON.stringify(safeUser));

    } catch (error) {
      console.warn("Session check failed (Network/Server):", error);
      if (typeof window !== 'undefined') {
        const cachedUser = localStorage.getItem('culina_user_session');
        if (cachedUser) {
          set({ user: JSON.parse(cachedUser), isAuthenticated: true, isLoading: false });
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    }
  },

  login: async (email, password) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }

    const safeUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      profile_photo: data.user.profile_photo_url || data.user.profile_photo
    };
    localStorage.setItem('culina_user_session', JSON.stringify(safeUser));

    set({ user: data.user, isAuthenticated: true });
    return data.user;
  },

  register: async (name, email, password, passwordConfirmation) => {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw {
        message: data.message || 'Error en el registro',
        status: res.status
      };
    }

    return data;
  },

  logout: async (options = {}) => {
    const { returnUrl } = options;
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
    } finally {
      set({ user: null, isAuthenticated: false });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('culina_user_session');
        if (!returnUrl) {
          CacheManager.clearAll();
        }
      }

      const loginUrl = returnUrl
        ? `/login?callbackUrl=${encodeURIComponent(returnUrl)}`
        : '/login';

      window.location.assign(loginUrl);
    }
  }
}));

export const AuthProvider = ({ children }) => {
  useEffect(() => {
    useAuth.getState().checkUserSession();
  }, []);

  return <>{children}</>;
};