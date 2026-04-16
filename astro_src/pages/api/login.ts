import type { APIRoute } from 'astro';
import { AuthService } from '@/lib/services/auth';

const TOKEN_NAME = 'auth_token';
const MAX_AGE = 60 * 60 * 24 * 7;

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        const { email, password } = body;

        const data = await AuthService.login({ email, password });

        const responseData = data.data || data;
        const token = responseData.token;

        const user = responseData.user || {
            id: responseData.id,
            name: responseData.name,
            email: responseData.email,
        };

        if (!token) {
            return new Response(JSON.stringify({ message: 'La respuesta de la API no incluyó un token.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        cookies.set(TOKEN_NAME, token, {
            httpOnly: true,
            secure: import.meta.env.PROD,
            maxAge: MAX_AGE,
            path: '/',
            sameSite: 'lax',
        });

        return new Response(JSON.stringify({ user }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        if (error.status) {
            return new Response(JSON.stringify({ message: error.message || 'Error de autenticación' }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return new Response(JSON.stringify({ message: 'Error interno del servidor', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
