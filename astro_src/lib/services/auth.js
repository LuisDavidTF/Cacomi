import { ApiService } from './api';

export const AuthService = {
    login: async (credentials) => {
        return ApiService.request('/auth/login', {
            method: 'POST',
            body: credentials,
        });
    },

    register: async (data) => {
        return ApiService.request('/auth/register', {
            method: 'POST',
            body: data,
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
