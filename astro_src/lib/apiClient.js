import { API_URL, getApiUrl } from '@/lib/services/config';

export const API_BASE_URL = API_URL;


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
    const baseUrl = typeof getApiUrl === 'function' ? getApiUrl() : API_URL;
    const url = `${baseUrl}${path}`;
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

  // User Profile Endpoints
  getUserProfile = () => this._request('GET', '/users/me');
  updateUserProfile = (data) => this._request('PATCH', '/users/me', data);
  changePassword = (data) => this._request('POST', '/users/me/password', data);
  deactivateAccount = () => this._request('DELETE', '/users/me');

  syncPantry = (items) => this._request('POST', '/pantry', { items });
}

export const createApiClient = () => new ApiClient();