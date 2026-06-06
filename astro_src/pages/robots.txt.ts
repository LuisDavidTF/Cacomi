import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ request }) => {
    const baseUrl = 'https://cacomi.app';

    const robotsText = `
User-agent: *
Allow: /
Disallow: /edit-recipe/
Disallow: /create-recipe/
Disallow: /api/
Disallow: /register
Disallow: /planner
Disallow: /pantry
Disallow: /profile
Disallow: /settings
Disallow: /saved-recipes
Disallow: /admin
Disallow: /login

Sitemap: ${baseUrl}/sitemap.xml
`.trim();

    return new Response(robotsText, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
};

