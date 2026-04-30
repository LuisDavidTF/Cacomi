import type { APIRoute } from 'astro';
import { RecipeService } from '@/lib/services/recipes';

export const GET: APIRoute = async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';

    if (!category) {
        return new Response(JSON.stringify({ message: 'El parámetro "category" es requerido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const data = await RecipeService.searchByCategory(category, parseInt(page, 10), parseInt(size, 10));
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
