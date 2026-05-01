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
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  fetchAuth: async (url, options = {}) => {
    // Helper to get fresh headers with the latest token
    const getHeaders = () => {
      const { accessToken } = get();
      const h = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      if (accessToken) {
        h['Authorization'] = `Bearer ${accessToken}`;
      }
      return h;
    };

    let res = await fetch(url, { ...options, headers: getHeaders() });

    // Handle 401: Attempt silent refresh
    if (res.status === 401) {
      try {
        // Wait for any ongoing refresh or start a new one
        const newAccessToken = await get().refreshSession();
        
        if (newAccessToken) {
          // IMPORTANT: Re-read headers to ensure we use the NEW token
          res = await fetch(url, { ...options, headers: getHeaders() });
        }
      } catch (refreshError) {
        console.error("Silent refresh failed:", refreshError);
      }
    }

    return res;
  },

  // Helper to prevent multiple concurrent refreshes
  refreshPromise: null,

  refreshSession: async () => {
    // If a refresh is already in progress, return the existing promise
    const currentPromise = get().refreshPromise;
    if (currentPromise) return currentPromise;

    const newPromise = (async () => {
      try {
        const res = await fetch('/api/refresh', { method: 'POST' });
        if (!res.ok) throw new Error('Refresh failed');
        
        const { accessToken } = await res.json();
        set({ accessToken, isAuthenticated: true });
        return accessToken;
      } catch (error) {
        set({ user: null, accessToken: null, isAuthenticated: false });
        return null;
      } finally {
        // Clear the promise when done
        set({ refreshPromise: null });
      }
    })();

    set({ refreshPromise: newPromise });
    return newPromise;
  },

  checkUserSession: async () => {
    set({ isLoading: true });
    try {
      const { fetchAuth } = get();
      const res = await fetchAuth('/api/me');

      if (res.status === 409) {
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('Cacomi_user_session');
          window.location.assign('/login');
        }
        return;
      }

      if (res.status === 401) {
        // If we reach here, refresh also failed or wasn't possible
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
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
          set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
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

    const { accessToken, user } = data;

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      profile_photo: user.profile_photo_url || user.profile_photo,
      role: extractRole(user)
    };
    localStorage.setItem('Cacomi_user_session', JSON.stringify(safeUser));

    set({ user: safeUser, accessToken, isAuthenticated: true });
    return safeUser;
  },

  setPassword: async (password) => {
    const { fetchAuth } = get();
    const res = await fetchAuth('/api/set-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Error al establecer contraseña');
    }

    return await res.json();
  },


  logout: async (options = {}) => {
    const { returnUrl } = options;

    // Limpiamos el estado del cliente antes de navegar
    set({ user: null, accessToken: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('Cacomi_user_session');
      if (!returnUrl) {
        CacheManager.clearAll();
      }

      // Hit the logout endpoint first to clear cookies on server
      await fetch('/api/logout', { method: 'POST' }).catch(() => {});

      const logoutUrl = returnUrl
        ? `/login?callbackUrl=${encodeURIComponent(returnUrl)}`
        : '/login';

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
