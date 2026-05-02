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

        // Handle Auth Token Cookie for Middleware
        cookies.set(TOKEN_NAME, accessToken, {
            httpOnly: true,
            secure: import.meta.env.PROD,
            maxAge: MAX_AGE,
            path: '/',
            sameSite: 'lax', // Use lax for better cross-page transitions
        });

        // Handle Refresh Token Cookie from backend
        const backendCookies = response.headers.get('set-cookie');
        if (backendCookies) {
            if (backendCookies.includes('refreshToken=')) {
                const match = backendCookies.match(/refreshToken=([^;]+)/);
                if (match) {
                    cookies.set('refreshToken', match[1], {
                        httpOnly: true,
                        secure: import.meta.env.PROD,
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
