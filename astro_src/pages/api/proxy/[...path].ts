import type { APIRoute } from 'astro';
import { BACKEND_URL as ENV_BACKEND_URL } from 'astro:env/server';

const normalizeBackendUrl = (url: string | undefined): string => {
    if (!url) return 'http://localhost:8080';
    let normalized = url.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        normalized = `https://${normalized}`;
    }
    // Remove trailing slashes to avoid double-slashes when joining paths
    return normalized.replace(/\/+$/, '');
};

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

    // Resolve backend URL with multi-layer fallback for Cloudflare/Vite/Node compatibility
    const rawEnvUrl = ENV_BACKEND_URL || import.meta.env.BACKEND_URL || (typeof process !== 'undefined' ? process.env.BACKEND_URL : undefined);
    const BACKEND_URL = normalizeBackendUrl(rawEnvUrl);

    // Reconstruct the backend URL (ensuring clean slashes)
    const targetUrl = new URL(`${BACKEND_URL}/api/v2/${path}${url.search}`);
    
    if (BACKEND_URL === 'http://localhost:8080' && import.meta.env.PROD) {
        console.warn(`[PROXY WARNING] BACKEND_URL not found, falling back to localhost in PROD!`);
    }
    
    // Clone headers but remove those that might interfere (like host)
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('origin');
    headers.delete('referer');

    // Inject Auth Token from HttpOnly cookie on the server
    const token = cookies.get(TOKEN_NAME)?.value;
    if (token && token !== 'undefined') {
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
        
        // Differentiate between configuration and connection errors
        const isConfigError = !rawEnvUrl || rawEnvUrl === 'http://localhost:8080';
        
        return new Response(JSON.stringify({ 
            error: isConfigError ? 'Error de configuración del servidor' : 'Error de comunicación con el backend', 
            details: error.message,
            path: path,
            target: targetUrl.origin // Only return origin for safety
        }), { 
            status: 502,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
