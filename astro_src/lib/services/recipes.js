import { ApiService } from './api';

export const RecipeService = {
    getAll: async (params = {}, fetchOptions = {}) => {
        const searchParams = new URLSearchParams();
        if (params.cursor) searchParams.append('cursor', params.cursor);
        if (params.limit) searchParams.append('limit', params.limit);

        // Explicitly handle "search" or other legacy params if needed, 
        // but the API docs only mention cursor and limit for GET /recipes without search?
        // Checking docs... getRecipes only lists cursor and limit.
        // However, if there was filter logic, it might be separate. 
        // For now, we stick to the docs provided.

        const queryString = searchParams.toString();
        const endpoint = queryString ? `/recipes?${queryString}` : '/recipes';

        return ApiService.request(endpoint, {
            method: 'GET',
            ...fetchOptions,
        });
    },

    getById: async (publicId, token) => {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return ApiService.request(`/recipes/${publicId}`, {
            method: 'GET',
            headers,
        });
    },

    create: async (data, token) => {
        return ApiService.request('/recipes', {
            method: 'POST',
            body: data,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },

    update: async (publicId, data, token) => {
        return ApiService.request(`/recipes/${publicId}`, {
            method: 'PATCH',
            body: data,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },

    delete: async (publicId, token) => {
        return ApiService.request(`/recipes/${publicId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },

    generate: async (prompt, token) => {
        return ApiService.request('/recipes/generate', {
            method: 'POST',
            body: { prompt },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
};
