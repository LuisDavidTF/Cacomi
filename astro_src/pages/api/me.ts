import type { APIRoute } from 'astro';
import { AuthService } from '@/lib/services/auth';
import { decodeJwtPayload } from '../../middleware';

const TOKEN_NAME = 'auth_token';

export const GET: APIRoute = async ({ cookies }) => {
    const tokenCookie = cookies.get(TOKEN_NAME);

    if (!tokenCookie) {
        return new Response(JSON.stringify({ message: 'No autorizado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const token = tokenCookie.value;

    try {
        const user = await AuthService.me(token);

        // Merge JWT Claims (roles/authorities) into the user object
        const payload = decodeJwtPayload(token);
        console.log('[API/ME] JWT Payload:', payload);
        
        if (payload) {
            user.roles = payload.roles || payload.authorities || [];
            if (payload.role) user.role = payload.role;
        }

        console.log('[API/ME] Final User Object:', user);

        return new Response(JSON.stringify({ user }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        if (error.status === 401 || error.status === 409) {
            cookies.set(TOKEN_NAME, '', {
                path: '/',
                secure: import.meta.env.PROD,
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 0,
                expires: new Date(0),
            } as any);

            const message = error.status === 409
                ? (error.message || 'Cuenta desactivada')
                : (error.message || 'Token inválido');

            return new Response(JSON.stringify({ message }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const status = error.status || 500;
        return new Response(JSON.stringify({ message: 'Error interno del servidor', error: error.message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
