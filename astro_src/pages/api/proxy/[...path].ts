import type { APIRoute } from 'astro';

const BACKEND_URL = import.meta.env.BACKEND_URL || 'http://localhost:8080';
const TOKEN_NAME = 'auth_token';

/**
 * CATCH-ALL PROXY
 * Forwards all requests from the frontend to the backend API securely.
 */
export const ALL: APIRoute = async ({ request, params, cookies, url }) => {
    const path = params.path;
    if (!path) {
        return new Response(JSON.stringify({ error: 'Ruta no válida' }), { status: 400 });
    }

    // Reconstruct the backend URL
    const targetUrl = new URL(`${BACKEND_URL}/api/v2/${path}${url.search}`);
    
    // Clone headers but remove those that might interfere (like host)
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('origin');
    headers.delete('referer');

    // Inject Auth Token from HttpOnly cookie on the server
    const token = cookies.get(TOKEN_NAME)?.value;
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    try {
        // Forward the request to the backend
        const response = await fetch(targetUrl.toString(), {
            method: request.method,
            headers: headers,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined,
            redirect: 'follow'
        });

        // Return the response back to the client
        const responseData = await response.arrayBuffer();
        
        // Pass through some key headers
        const outHeaders = new Headers();
        const contentType = response.headers.get('content-type');
        if (contentType) outHeaders.set('content-type', contentType);

        return new Response(responseData, {
            status: response.status,
            headers: outHeaders
        });

    } catch (error: any) {
        console.error(`[PROXY ERROR] path: ${path} ->`, error);
        return new Response(JSON.stringify({ 
            error: 'Error de comunicación con el servidor', 
            details: error.message 
        }), { 
            status: 502,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
