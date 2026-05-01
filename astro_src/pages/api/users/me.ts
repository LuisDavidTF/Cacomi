import type { APIRoute } from 'astro';
import { UserService } from '@/lib/services/user';

const TOKEN_NAME = 'auth_token';

const getToken = (request: Request, cookies: any) => {
    // 1. Prioritize Authorization header from frontend
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    // 2. Fallback to legacy cookie
    return cookies.get(TOKEN_NAME)?.value;
};

export const GET: APIRoute = async ({ request, cookies }) => {
    const token = getToken(request, cookies);
    if (!token || token === 'undefined') {
        return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    try {
        const data = await UserService.getProfile(token);
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
        return new Response(JSON.stringify({ message: error.message || 'Error', error }), { status: error.status || 500 });
    }
};

export const PATCH: APIRoute = async ({ request, cookies }) => {
    const token = getToken(request, cookies);
    if (!token || token === 'undefined') {
        return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    try {
        const body = await request.json();
        const data = await UserService.updateProfile(token, body);
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
        return new Response(JSON.stringify({ message: error.message || 'Error', error }), { status: error.status || 500 });
    }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
    const token = getToken(request, cookies);
    if (!token || token === 'undefined') {
        return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    try {
        const data = await UserService.deactivateAccount(token);
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
        return new Response(JSON.stringify({ message: error.message || 'Error', error }), { status: error.status || 500 });
    }
};
