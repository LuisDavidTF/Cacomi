import type { APIRoute } from 'astro';
import { RecipeService } from '@/lib/services/recipes';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();

    if (!query) {
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const results: any[] = [];

        // 1. Search Recipes from Database API
        try {
            const recipes = await RecipeService.searchByName(query, 0, 5);
            if (Array.isArray(recipes)) {
                recipes.forEach((recipe: any) => {
                    results.push({
                        type: 'recipe',
                        id: recipe.publicId || recipe.id,
                        name: recipe.name,
                        imageUrl: recipe.imageUrl,
                        category: recipe.mealType || recipe.type || 'Receta',
                        slug: recipe.publicId || recipe.id
                    });
                });
            }
        } catch (err) {
            console.error("Error searching recipes:", err);
        }

        // 2. Search Blog Articles from content collection
        try {
            const blogs = await getCollection('blog');
            const matchingBlogs = blogs.filter(post => 
                post.data.title.toLowerCase().includes(query) ||
                post.data.description.toLowerCase().includes(query) ||
                post.id.toLowerCase().includes(query)
            ).slice(0, 3);

            matchingBlogs.forEach(post => {
                results.push({
                    type: 'article',
                    id: post.id,
                    name: post.data.title,
                    imageUrl: post.data.image,
                    category: post.data.tags?.[0] || 'Artículo',
                    slug: post.id
                });
            });
        } catch (err) {
            console.error("Error searching articles:", err);
        }

        // 3. Search Magazine Editions from content collection
        try {
            const revistas = await getCollection('revista');
            const matchingRevistas = revistas.filter(rev => 
                rev.data.title.toLowerCase().includes(query) ||
                rev.data.description.toLowerCase().includes(query) ||
                rev.id.toLowerCase().includes(query)
            ).slice(0, 3);

            matchingRevistas.forEach(rev => {
                results.push({
                    type: 'magazine',
                    id: rev.id,
                    name: rev.data.title,
                    imageUrl: rev.data.image,
                    category: 'Revista',
                    slug: rev.id
                });
            });
        } catch (err) {
            console.error("Error searching magazines:", err);
        }

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("Unified search error:", error);
        return new Response(JSON.stringify({ message: 'Error al realizar la búsqueda' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
