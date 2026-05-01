import type { APIRoute } from 'astro';
import { AuthService } from '@/lib/services/auth';
import { decodeJwtPayload } from '../../middleware';

const TOKEN_NAME = 'auth_token';

export const GET: APIRoute = async ({ request, cookies }) => {
    // 1. Prioritize Authorization header from frontend
    const authHeader = request.headers.get('Authorization');
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    } else {
        // 2. Fallback to legacy cookie
        token = cookies.get('auth_token')?.value || '';
    }

    if (!token || token === 'undefined') {
        return new Response(JSON.stringify({ message: 'No autorizado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const user = await AuthService.me(token);

        // Merge JWT Claims (roles/authorities) into the user object
        const payload = decodeJwtPayload(token);
        
        if (payload) {
            user.roles = payload.roles || payload.authorities || [];
            if (payload.role) user.role = payload.role;
        }

        return new Response(JSON.stringify({ user }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        // If it's 401, we just return it. The frontend interceptor will handle the refresh call.
        const status = error.status || 500;
        const message = error.message || 'Error de servidor';
        
        return new Response(JSON.stringify({ message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
