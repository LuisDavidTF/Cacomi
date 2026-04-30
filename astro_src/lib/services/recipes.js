import { ApiService } from './api';

export const RecipeService = {
    getAll: async (params = {}, fetchOptions = {}) => {
        const searchParams = new URLSearchParams();
        if (params.cursor) searchParams.append('cursor', params.cursor);
        if (params.limit) searchParams.append('limit', params.limit);

        const queryString = searchParams.toString();
        const endpoint = queryString ? `/recipes?${queryString}` : '/recipes';

        return ApiService.request(endpoint, {
            method: 'GET',
            ...fetchOptions,
        });
    },

    searchByName: async (name, page = 0, size = 10, fetchOptions = {}) => {
        const searchParams = new URLSearchParams();
        searchParams.append('name', name);
        searchParams.append('page', page);
        searchParams.append('size', size);
        
        return ApiService.request(`/recipes/search/name?${searchParams.toString()}`, {
            method: 'GET',
            ...fetchOptions,
        });
    },

    searchByCategory: async (category, page = 0, size = 10, fetchOptions = {}) => {
        const searchParams = new URLSearchParams();
        searchParams.append('category', category);
        searchParams.append('page', page);
        searchParams.append('size', size);
        
        return ApiService.request(`/recipes/search/category?${searchParams.toString()}`, {
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
