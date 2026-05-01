import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, redirect }) => {
    // Resolve backend URL
    const rawEnvUrl = import.meta.env.BACKEND_URL || (typeof process !== 'undefined' ? process.env.BACKEND_URL : undefined);
    const BACKEND_URL = rawEnvUrl?.replace(/\/+$/, '') || 'http://localhost:8080';

    try {
        // We fetch the initiation endpoint server-to-server
        // We forward cookies from the browser to ensure any existing session is maintained
        const response = await fetch(`${BACKEND_URL}/api/v2/auth/google`, {
            method: 'GET',
            headers: {
                'User-Agent': request.headers.get('User-Agent') || '',
                'Accept': request.headers.get('Accept') || '*/*',
                'Cookie': request.headers.get('Cookie') || '',
            },
            redirect: 'manual'
        });

        const googleAuthUrl = response.headers.get('location');
        const setCookie = response.headers.get('set-cookie');

        if (googleAuthUrl) {
            const headers = new Headers();
            headers.set('Location', googleAuthUrl);
            
            // Forward security cookies (JSESSIONID, etc.) back to the browser
            // These are essential for the callback phase
            if (setCookie) {
                headers.set('set-cookie', setCookie);
            }

            return new Response(null, {
                status: 302,
                headers
            });
        }

        // If backend fails to provide a URL, we return an error instead of exposing the backend
        return new Response("No se pudo iniciar la autenticación con Google", { status: 500 });
    } catch (error) {
        console.error("Error initiating Google Auth via BFF:", error);
        return new Response("Error de servidor al iniciar autenticación", { status: 500 });
    }
};
