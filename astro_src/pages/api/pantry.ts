import type { APIRoute } from 'astro';
import { PantryService } from '@/lib/services/pantry';

const TOKEN_NAME = 'auth_token';

export const GET: APIRoute = async ({ request, cookies }) => {
    // 1. Prioritize Authorization header from frontend
    const authHeader = request.headers.get('Authorization');
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    } else {
        // 2. Fallback to legacy cookie
        token = cookies.get(TOKEN_NAME)?.value || '';
    }

    if (!token || token === 'undefined') {
        console.warn("[PANTRY API] No token found in headers or cookies");
        return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    console.log(`[PANTRY API] Fetching pantry data with token: ${token.substring(0, 10)}...`);

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
    // 1. Prioritize Authorization header from frontend
    const authHeader = request.headers.get('Authorization');
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    } else {
        // 2. Fallback to legacy cookie
        token = cookies.get(TOKEN_NAME)?.value || '';
    }

    if (!token || token === 'undefined') {
        return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
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
