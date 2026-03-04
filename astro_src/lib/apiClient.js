import { getEnv } from '@/utils/env';

const API_BASE_URL = getEnv('PUBLIC_API_URL') || getEnv('NEXT_PUBLIC_API_URL') || 'http://127.0.0.1:8000/api';


export class ApiClient {
  constructor(token = null) {
    this.token = token;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (this.token) {
      this.headers['Authorization'] = `Bearer ${this.token}`;
    }
  }

  async _request(method, path, body = null) {
    const url = `${API_BASE_URL}${path}`;
    const options = {
      method,
      headers: this.headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido en la API' }));
        throw new Error(errorData.message || `Error en la petición: ${response.statusText}`);
      }

      if (response.status === 204) {
        return {};
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  getRecipes = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return this._request('GET', `/recipes${queryString}`);
  };
  getRecipeById = (id) => this._request('GET', `/recipes/${id}`);
  createRecipe = (recipeData) => this._request('POST', '/recipes', recipeData);
  updateRecipe = (id, recipeData) => this._request('PUT', `/recipes/${id}`, recipeData);
  deleteRecipe = (id) => this._request('DELETE', `/recipes/${id}`);


  login = (credentials) => this._request('POST', '/login', credentials);
  register = (userData) => this._request('POST', '/register', userData);
  logout = () => this._request('POST', '/logout');

  // TODO: Ticket FE-02 - Remove mock data when backend is ready
  syncPantry = async (items) => {
    // return this._request('POST', '/pantry', { items });

    // Mocking latency
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('[Mock API] Syncing pantry items:', items);
    return { success: true, message: 'Pantry synced successfully (Mock)' };
  };
}

export const createApiClient = () => new ApiClient();