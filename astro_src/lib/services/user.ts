import { ApiService } from './api';

export const UserService = {
    getProfile: async (token: string) => {
        return ApiService.request('/users/me', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    updateProfile: async (token: string, data: any) => {
        return ApiService.request('/users/me', {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
            body: data,
        });
    },

    changePassword: async (token: string, data: any) => {
        return ApiService.request('/users/me/password', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: data,
        });
    },

    deactivateAccount: async (token: string) => {
        return ApiService.request('/users/me', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
    }
};
