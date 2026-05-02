import type { APIRoute } from 'astro';
import { AuthService } from '@/lib/services/auth';

export const POST: APIRoute = async ({ cookies }) => {
    try {
        const refreshToken = cookies.get('refreshToken')?.value;

        if (!refreshToken) {
            return new Response(JSON.stringify({ message: 'No refresh token found' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Hit the backend refresh endpoint
        // We pass the refreshToken in the Cookie header to the backend
        const response = await AuthService.refresh(`refreshToken=${refreshToken}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return new Response(JSON.stringify({ message: errorData.message || 'Error refreshing token' }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await response.json();
        const { accessToken } = data;

        // Update Auth Token Cookie for Middleware
        cookies.set('auth_token', accessToken, {
            httpOnly: true,
            secure: import.meta.env.PROD,
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            sameSite: 'lax',
        });

        // If the backend returned a new refresh token (optional but good practice)
        const backendCookies = response.headers.get('set-cookie');
        if (backendCookies && backendCookies.includes('refreshToken=')) {
            const match = backendCookies.match(/refreshToken=([^;]+)/);
            if (match) {
                cookies.set('refreshToken', match[1], {
                    httpOnly: true,
                    secure: true,
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/',
                    sameSite: 'strict',
                });
            }
        }

        return new Response(JSON.stringify({ accessToken }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("REFRESH API ERROR:", error);
        return new Response(JSON.stringify({ message: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
