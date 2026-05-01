import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, request }) => {
    const rawEnvUrl = import.meta.env.BACKEND_URL || (typeof process !== 'undefined' ? process.env.BACKEND_URL : undefined);
    const BACKEND_URL = rawEnvUrl?.replace(/\/+$/, '') || 'http://localhost:8080';

    // Capturamos todos los parámetros que nos envía Google (code, state, etc.)
    const queryParams = url.search;
    
    try {
        // Forwarding the request to the backend callback
        // CRITICAL: We MUST forward the Cookie header (JSESSIONID, etc.)
        // so the backend can verify the OAuth2 'state' against the session.
        const response = await fetch(`${BACKEND_URL}/auth/google/callback${queryParams}`, {
            method: 'GET',
            headers: {
                'User-Agent': request.headers.get('User-Agent') || '',
                'Cookie': request.headers.get('Cookie') || '',
            },
            redirect: 'manual' // Capture the final redirect from the backend
        });

        const location = response.headers.get('location');
        const setCookie = response.headers.get('set-cookie');

        const headers = new Headers();
        
        // Forward the cookies (JWT, Session updates, etc.) back to the browser
        if (setCookie) {
            // If multiple set-cookie headers exist, we need to handle them carefully
            // Standard fetch response.headers.get('set-cookie') might join them with commas
            headers.set('set-cookie', setCookie);
        }

        // If the backend redirects (usually to /auth-success?token=...), 
        // we forward that redirect to the browser
        if (location) {
            let finalLocation = location;
            // Ensure the redirect points back to our frontend domain
            if (location.startsWith(BACKEND_URL)) {
                finalLocation = location.replace(BACKEND_URL, '');
            } else if (location.startsWith('http') && !location.includes(url.host)) {
                 // If it's an absolute URL to the backend but not starting with BACKEND_URL string literally
                 try {
                     const locUrl = new URL(location);
                     if (locUrl.origin === new URL(BACKEND_URL).origin) {
                         finalLocation = locUrl.pathname + locUrl.search + locUrl.hash;
                     }
                 } catch (e) {}
            }
            
            headers.set('Location', finalLocation);
            return new Response(null, { status: 302, headers });
        }

        // If no redirect, just proxy the body
        const body = await response.text();
        return new Response(body, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'text/html',
                'set-cookie': setCookie || ''
            }
        });

    } catch (error) {
        console.error("Error proxying Google Callback:", error);
        return new Response("Error en la autenticación con Google", { status: 500 });
    }
};
