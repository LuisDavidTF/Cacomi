import { defineAction } from 'astro:actions';

export const server = {
    purgeRecipesCache: defineAction({
        handler: async (_, context) => {
            // Security check: ensure user is authenticated
            const hasSession = context.cookies.has('auth_token');
            if (!hasSession) {
                throw new Error('Unauthorized: You must be logged in to purge cache.');
            }

            // Read Cloudflare credentials from environment
            const zoneId = import.meta.env.CLOUDFLARE_ZONE_ID || process.env.CLOUDFLARE_ZONE_ID;
            const apiToken = import.meta.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;

            if (!zoneId || !apiToken) {
                console.warn('Cloudflare credentials not configured. Skipping cache purge.');
                return { success: false, reason: 'Credentials missing' };
            }

            try {
                const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tags: ['recipes-feed']
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error('Failed to purge Cloudflare cache:', errorData);
                    throw new Error('Cloudflare API error');
                }

                console.log('Successfully purged Cloudflare cache for tag: recipes-feed');
                return { success: true };
            } catch (error) {
                console.error('Error in purgeRecipesCache action:', error);
                throw new Error('Failed to purge cache');
            }
        }
    })
};
