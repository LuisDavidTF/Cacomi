import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ request }) => {
    const baseUrl = import.meta.env.PUBLIC_BASE_URL || 'https://culinasmart.com';

    const robotsText = `
User-agent: *
Allow: /
Disallow: /edit-recipe/
Disallow: /create-recipe/

Sitemap: ${baseUrl}/sitemap.xml
`.trim();

    return new Response(robotsText, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
};
