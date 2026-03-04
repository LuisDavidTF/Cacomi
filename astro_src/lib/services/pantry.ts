import { ApiService } from './api';

export const PantryService = {
    get: async (token: string) => {
        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return ApiService.request(`/pantry`, {
            method: 'GET',
            headers,
        });
    },

    sync: async (changes: any[], token: string) => {
        return ApiService.request('/pantry', {
            method: 'POST',
            body: { changes },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
};
