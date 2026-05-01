import type { APIRoute } from 'astro';
import { RecipeService } from '@/lib/services/recipes';

const TOKEN_NAME = 'auth_token';

const getToken = (request: Request, cookies: any) => {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return cookies.get(TOKEN_NAME)?.value;
};

export const GET: APIRoute = async ({ params }) => {
    const { id } = params;
    if (!id) return new Response(null, { status: 400 });

    try {
        const data = await RecipeService.getById(id);
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        const status = error.status || 500;
        return new Response(JSON.stringify({ message: error.message || 'Error al obtener la receta' }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
    const { id } = params;
    const token = getToken(request, cookies);

    if (!token || token === 'undefined' || !id) {
        return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const data = await RecipeService.update(id, body, token);
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        const status = error.status || 500;
        return new Response(JSON.stringify({ message: error.message || 'Error al actualizar la receta' }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
    const { id } = params;
    const token = getToken(request, cookies);

    if (!token || token === 'undefined' || !id) {
        return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401 });
    }

    try {
        await RecipeService.delete(id, token);
        return new Response(null, { status: 204 });
    } catch (error: any) {
        const status = error.status || 500;
        return new Response(JSON.stringify({ message: error.message || 'Error al eliminar la receta' }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
