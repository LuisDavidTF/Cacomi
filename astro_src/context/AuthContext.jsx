'use client'

import React, { useEffect } from 'react';
import { create } from 'zustand';
import { CacheManager } from '@utils/cacheManager';

const extractRole = (u) => {
  // Check authorities first for elevated privileges
  if (u.roles && Array.isArray(u.roles)) {
      if (u.roles.some(r => r === 'ROLE_ADMIN' || r?.authority === 'ROLE_ADMIN')) return 'ADMIN';
  }
  if (u.role) return u.role;
  return 'USER';
};

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
          localStorage.removeItem('Cacomi_user_session');
          window.location.assign('/login');
        }
        return;
      }

      if (res.status === 401) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('Cacomi_user_session');
        }
        return;
      }

      if (!res.ok) {
        throw new Error('No autenticado o Error de Servidor');
      }

      const { user } = await res.json();
      
      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_photo: user.profile_photo_url || user.profile_photo,
        role: extractRole(user)
      };
      
      localStorage.setItem('Cacomi_user_session', JSON.stringify(safeUser));
      set({ user: safeUser, isAuthenticated: true, isLoading: false });

    } catch (error) {
      console.warn("Session check failed (Network/Server):", error);
      if (typeof window !== 'undefined') {
        const cachedUser = localStorage.getItem('Cacomi_user_session');
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
      profile_photo: data.user.profile_photo_url || data.user.profile_photo,
      role: extractRole(data.user)
    };
    localStorage.setItem('Cacomi_user_session', JSON.stringify(safeUser));

    set({ user: safeUser, isAuthenticated: true });
    return safeUser;
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

    // Limpiamos el estado del cliente antes de navegar
    set({ user: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('Cacomi_user_session');
      if (!returnUrl) {
        CacheManager.clearAll();
      }

      // Navegamos al endpoint GET /api/logout que borra la cookie y redirige a /login
      // en una sola respuesta HTTP. Esto es más fiable que un fetch POST + redirect manual
      // porque elimina la condición de carrera donde la cookie persiste entre dos requests.
      const logoutUrl = returnUrl
        ? `/api/logout?callbackUrl=${encodeURIComponent(returnUrl)}`
        : '/api/logout';

      window.location.assign(logoutUrl);
    }
  }
}));

export const AuthProvider = ({ children }) => {
  useEffect(() => {
    useAuth.getState().checkUserSession();
  }, []);

  return <>{children}</>;
};
