'use client'
import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const useApiClient = () => {
  const { logout, fetchAuth } = useAuth();

  const request = useCallback(async (endpoint, options = {}) => {
    const { body, ...customConfig } = options;

    const headers = { 'Content-Type': 'application/json' };

    const config = {
      method: body ? 'POST' : 'GET',
      ...customConfig,
      headers: {
        ...headers,
        ...customConfig.headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    let retries = 3;
    let delay = 2000;

    for (let i = 0; i <= retries; i++) {
      try {
        // Use fetchAuth instead of fetch to include JWT and handle silent refresh
        const response = await fetchAuth(endpoint, config);

        if (response.status === 204) {
          return null;
        }

        const data = await response.json();

        if (response.status === 401) {
          const returnUrl = typeof window !== 'undefined'
            ? window.location.pathname + window.location.search
            : null;
          logout({ returnUrl });
          throw new Error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        }

        if (!response.ok) {
          let errorMessage = 'Error en la solicitud a la API';
          if (data.errors && Array.isArray(data.errors) && data.errors[0]?.message) {
            errorMessage = data.errors[0].message;
          }
          throw new Error(errorMessage);
        }

        return data;

      } catch (error) {
        const isNetworkError = error.message === 'Failed to fetch' || error.name === 'SyntaxError' || error.message.includes('Network request failed');
        // Check if we are offline logic (browser support varies, but helps)
        const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

        // Decide if we should try fallback
        if (isNetworkError || isOffline || error.message === 'Error en la solicitud a la API') {

          // --- MANUAL OFFLINE FALLBACK ---
          if (typeof window !== 'undefined' && 'caches' in window) {
            try {
              const cachedResponse = await caches.match(endpoint);
              if (cachedResponse) {
                return await cachedResponse.json();
              }
            } catch (cacheErr) {
              console.warn("[Offline Fallback] Cache check failed:", cacheErr);
            }
          }
        }

        if (isNetworkError) {
          if (i === retries) {
            throw new Error('Error de Red/CORS. No se pudo conectar a la API.');
          }
          await sleep(delay);
          delay *= 2;
        } else {
          throw error;
        }
      }
    }
  }, [logout]);

  return useMemo(() => ({
    getRecipes: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const queryString = query ? `?${query}` : '';
      return request(`/api/recipes${queryString}`);
    },

    getRecipeById: (id) => request(`/api/recipes/${id}`),

    createRecipe: (recipeData) => request('/api/recipes', { body: recipeData, method: 'POST' }),

    updateRecipe: (id, recipeData) => request(`/api/recipes/${id}`, { body: recipeData, method: 'PATCH' }),

    deleteRecipe: (id) => request(`/api/recipes/${id}`, { method: 'DELETE' }),

    getUserProfile: () => request('/api/users/me'),

    updateUserProfile: (data) => request('/api/users/me', { body: data, method: 'PATCH' }),

    changePassword: (data) => request('/api/users/me/password', { body: data, method: 'POST' }),

    deactivateAccount: () => request('/api/users/me', { method: 'DELETE' }),

    syncPantry: async (changes) => {
      // Offline-first sync with deltas
      return request('/api/pantry', { body: { changes }, method: 'POST' });
    },

    getPantry: () => {
      // Get the absolute truth from the backend
      return request('/api/pantry');
    },
  }), [request]);
};