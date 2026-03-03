import type { APIRoute } from 'astro';
import { RecipeService } from '@/lib/services/recipes';

const TOKEN_NAME = 'auth_token';

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
    const tokenCookie = cookies.get(TOKEN_NAME);

    if (!tokenCookie || !id) {
        return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const data = await RecipeService.update(id, body, tokenCookie.value);
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

export const DELETE: APIRoute = async ({ params, cookies }) => {
    const { id } = params;
    const tokenCookie = cookies.get(TOKEN_NAME);

    if (!tokenCookie || !id) {
        return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401 });
    }

    try {
        await RecipeService.delete(id, tokenCookie.value);
        return new Response(null, { status: 204 });
    } catch (error: any) {
        const status = error.status || 500;
        return new Response(JSON.stringify({ message: error.message || 'Error al eliminar la receta' }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
