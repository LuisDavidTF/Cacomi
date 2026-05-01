import type { APIRoute } from 'astro';
import { RecipeService } from '@/lib/services/recipes';

const TOKEN_NAME = 'auth_token';

export const GET: APIRoute = async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    try {
        const data = await RecipeService.getAll(params);
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        const status = error.status || 500;
        return new Response(JSON.stringify({ message: error.message || 'Error interno del servidor', error: error.message }), {
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
        const data = await RecipeService.create(body, token);

        return new Response(JSON.stringify(data), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        const status = error.status || 500;
        return new Response(JSON.stringify({ message: error.message || 'Error interno del servidor', error: error.message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
