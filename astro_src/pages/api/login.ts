import type { APIRoute } from 'astro';
import { AuthService } from '@/lib/services/auth';

const TOKEN_NAME = 'auth_token';
const MAX_AGE = 60 * 60 * 24 * 7;

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        const { email, password } = body;

        const response = await AuthService.login({ email, password });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return new Response(JSON.stringify({ message: errorData.message || 'Error de autenticación' }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await response.json();
        const { accessToken, user } = data;

        if (!accessToken) {
            return new Response(JSON.stringify({ message: 'La respuesta de la API no incluyó un token de acceso.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Handle Refresh Token Cookie from backend
        // We look for the 'set-cookie' header from the backend response
        const backendCookies = response.headers.get('set-cookie');
        if (backendCookies) {
            // We can either parse and re-set it, or if it's already structured, 
            // we manually set our refreshToken cookie if it's not present.
            // For robustness, we'll ensure the refreshToken cookie is set for the frontend.
            
            // Simple check: if backend set a refreshToken, we make sure it's proxied.
            // Note: In some environments, multiple set-cookie headers might be joined by commas.
            if (backendCookies.includes('refreshToken=')) {
                const match = backendCookies.match(/refreshToken=([^;]+)/);
                if (match) {
                    cookies.set('refreshToken', match[1], {
                        httpOnly: true,
                        secure: true,
                        maxAge: 60 * 60 * 24 * 7, // 7 days
                        path: '/',
                        sameSite: 'strict',
                    });
                }
            }
        }

        return new Response(JSON.stringify({ accessToken, user }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("LOGIN API ERROR:", error);
        const status = error.status || 500;
        const message = status === 500 ? 'Error interno del servidor' : (error.message || 'Error de autenticación');
        
        return new Response(JSON.stringify({ message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
