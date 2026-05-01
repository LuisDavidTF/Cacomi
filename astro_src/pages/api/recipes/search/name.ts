import type { APIRoute } from 'astro';
import { RecipeService } from '@/lib/services/recipes';

export const GET: APIRoute = async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';

    if (!name) {
        return new Response(JSON.stringify({ message: 'El parámetro "name" es requerido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const data = await RecipeService.searchByName(name, parseInt(page, 10), parseInt(size, 10));
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("SEARCH BY NAME API ERROR:", error);
        return new Response(JSON.stringify({ message: 'Error al buscar recetas' }), {
            status: error.status || 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
