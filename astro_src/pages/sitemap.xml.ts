import type { APIRoute } from 'astro';
import { slugify } from '@utils/slugify';
import { RecipeService } from '@/lib/services/recipes';

// Helper to escape XML special characters
function escapeXml(unsafe: string) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

async function getAllRecipes() {
    try {
        let allRecipes: any[] = [];
        let cursor: string | null = null;
        let hasMore = true;

        while (hasMore) {
            const params: any = { limit: 50 };
            if (cursor) {
                params.cursor = cursor;
            }

            const response = await RecipeService.getAll(params);
            const recipes = response.data || [];

            if (recipes.length > 0) {
                allRecipes = [...allRecipes, ...recipes];
            }

            if (response.meta && response.meta.nextCursor) {
                cursor = response.meta.nextCursor;
            } else {
                hasMore = false;
            }
        }

        return allRecipes;
    } catch (error) {
        console.error("Sitemap fetch error:", error);
        return [];
    }
}

export const GET: APIRoute = async () => {
    const baseUrl = import.meta.env.PUBLIC_BASE_URL || 'https://culinasmart.com';
    const recipes = await getAllRecipes();

    let urls = `
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>`;

    recipes.forEach((recipe) => {
        const url = `${baseUrl}/recipes/${slugify(recipe.name)}/${recipe.id}`;
        const lastMod = new Date(recipe.updated_at || recipe.created_at || new Date()).toISOString();
        const escapedUrl = escapeXml(url);

        urls += `
  <url>
    <loc>${escapedUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new Response(sitemap, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml',
        },
    });
};
