import type { APIRoute } from 'astro';
import { PantryService } from '@/lib/services/pantry';

const TOKEN_NAME = 'auth_token';

export const GET: APIRoute = async ({ cookies }) => {
    const tokenCookie = cookies.get(TOKEN_NAME);

    if (!tokenCookie) {
        return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const token = tokenCookie.value;

    try {
        const data = await PantryService.get(token);
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("PANTRY API GET ERROR:", error);
        const status = error.status || 500;
        return new Response(JSON.stringify({ message: error.message || 'Error interno del servidor', error: error.message, details: error }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const POST: APIRoute = async ({ request, cookies }) => {
    const tokenCookie = cookies.get(TOKEN_NAME);

    if (!tokenCookie) {
        return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const token = tokenCookie.value;
    try {
        const body = await request.json();
        // Body will be { changes: [...] }
        const data = await PantryService.sync(body.changes || [], token);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("PANTRY API POST ERROR:", error);
        const status = error.status || 500;
        return new Response(JSON.stringify({ message: error.message || 'Error interno del servidor', error: error.message, details: error }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
