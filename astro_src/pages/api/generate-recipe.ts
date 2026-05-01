import type { APIRoute } from 'astro';
import { RecipeService } from '@/lib/services/recipes';

const TOKEN_NAME = 'auth_token';

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
        const { prompt } = body;

        const data = await RecipeService.generate(prompt, token);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("GENERATE RECIPE API ERROR:", error);
        return new Response(JSON.stringify({ message: 'Error al generar la receta' }), {
            status: error.status || 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
