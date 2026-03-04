import { API_URL } from './config';

export class ApiService {
    static async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
        };

        const config = {
            ...options,
            headers,
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);

            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || data.error || 'Error en la petición a la API',
                    data: data,
                };
            }

            return data;
        } catch (error) {
            // Re-throw if it's already our structured error
            if (error.status) throw error;

            // Handle network errors
            throw {
                status: 500,
                message: error.message || 'Error de conexión con la API',
                error: error
            };
        }
    }
}
