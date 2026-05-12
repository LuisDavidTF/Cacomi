import type { APIRoute } from 'astro';
import { slugify } from '@utils/slugify';
import { RecipeService } from '@/lib/services/recipes';
import { getCollection } from 'astro:content';

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
    const baseUrl = 'https://cacomi.app';
    const recipes = await getAllRecipes();
    const blogPosts = await getCollection('blog');
    const revistaEditions = await getCollection('revista');

    let urls = `
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/revista</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>2026-05-08T00:00:00.000Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>2026-05-08T00:00:00.000Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>2026-05-08T00:00:00.000Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`;

    // Blog Posts
    blogPosts.forEach((post) => {
        urls += `
  <url>
    <loc>${baseUrl}/blog/${post.id}</loc>
    <lastmod>${new Date(post.data.date || new Date()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Revista Editions
    revistaEditions.forEach((edition) => {
        urls += `
  <url>
    <loc>${baseUrl}/revista/${edition.id}</loc>
    <lastmod>${new Date(edition.data.date || new Date()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Recipes
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

