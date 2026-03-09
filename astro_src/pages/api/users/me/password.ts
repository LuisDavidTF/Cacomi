import type { APIRoute } from 'astro';
import { UserService } from '@/lib/services/user';

const TOKEN_NAME = 'auth_token';

export const POST: APIRoute = async ({ request, cookies }) => {
    const tokenCookie = cookies.get(TOKEN_NAME);
    if (!tokenCookie) {
        return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    try {
        const body = await request.json();
        const data = await UserService.changePassword(tokenCookie.value, body);
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
        return new Response(JSON.stringify({ message: error.message || 'Error', error }), { status: error.status || 500 });
    }
};
