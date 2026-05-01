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
    
    console.log(`[PROXY DEBUG] Method: ${request.method} | Path: ${path} | Target: ${targetUrl.toString()}`);
    
    if (BACKEND_URL === 'http://localhost:8080' && import.meta.env.PROD) {
        console.warn(`[PROXY WARNING] BACKEND_URL not found, falling back to localhost in PROD!`);
    }
    
    // Clone headers but remove those that might interfere (like host)
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('origin');
    headers.delete('referer');

    // Inject Auth Token
    // Priority 1: Authorization header from frontend (preferred for JWT)
    // Priority 2: auth_token cookie (legacy)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        const token = cookies.get(TOKEN_NAME)?.value;
        if (token && token !== 'undefined') {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    // Proxy the refreshToken cookie if it exists to allow the backend to see it
    const refreshToken = cookies.get('refreshToken')?.value;
    if (refreshToken) {
        // If the backend expects the cookie, we should send it.
        // However, fetch in Node/Astro doesn't automatically send cookies.
        // We append it to any existing Cookie header.
        const existingCookie = headers.get('Cookie') || '';
        const newCookie = existingCookie 
            ? `${existingCookie}; refreshToken=${refreshToken}`
            : `refreshToken=${refreshToken}`;
        headers.set('Cookie', newCookie);
    }

    try {
        // Forward the request to the backend
        const response = await fetch(targetUrl.toString(), {
            method: request.method,
            headers: headers,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined,
            redirect: 'follow'
        });

        // Pass through key headers
        const outHeaders = new Headers();
        const contentType = response.headers.get('content-type');
        if (contentType) outHeaders.set('content-type', contentType);
        
        // Forward Set-Cookie headers (essential for refreshToken and sessions)
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            outHeaders.set('set-cookie', setCookie);
        }

        // Special handling for 204 No Content and other body-less statuses
        // The Response constructor throws if a body is provided for these statuses
        const noBodyStatuses = [204, 205, 304];
        if (noBodyStatuses.includes(response.status)) {
            return new Response(null, {
                status: response.status,
                headers: outHeaders
            });
        }

        // Return the response back to the client
        const responseData = await response.arrayBuffer();
        
        return new Response(responseData, {
            status: response.status,
            headers: outHeaders
        });

    } catch (error: any) {
        console.error(`[PROXY ERROR] path: ${path} ->`, error);
        
        // Differentiate between configuration and connection errors
        const isConfigError = !rawEnvUrl || rawEnvUrl === 'http://localhost:8080';
        
        // SECURITY: Do NOT expose the targetUrl or error details to the client
        return new Response(JSON.stringify({ 
            error: isConfigError ? 'Error de configuración del servidor' : 'Error de comunicación con el backend'
        }), { 
            status: 502,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
