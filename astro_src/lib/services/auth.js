import { ApiService } from './api';

export const AuthService = {
    login: async (credentials) => {
        return ApiService.request('/auth/login', {
            method: 'POST',
            body: credentials,
            fullResponse: true
        });
    },

    refresh: async (cookieHeader) => {
        return ApiService.request('/auth/refresh', {
            method: 'POST',
            headers: cookieHeader ? { Cookie: cookieHeader } : {},
            fullResponse: true
        });
    },

    setPassword: async (password, token) => {
        return ApiService.request('/auth/set-password', {
            method: 'POST',
            body: { password },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },

    logout: async (cookieHeader) => {
        return ApiService.request('/auth/logout', {
            method: 'POST',
            headers: cookieHeader ? { Cookie: cookieHeader } : {},
        });
    },

    me: async (token) => {
        return ApiService.request('/auth/me', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
};
