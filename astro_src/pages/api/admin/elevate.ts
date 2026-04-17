import type { APIRoute } from 'astro';
import { ADMIN_PIN as ENV_ADMIN_PIN } from 'astro:env/server';

const ADMIN_PIN = ENV_ADMIN_PIN || import.meta.env.ADMIN_PIN;
const ELEVATION_COOKIE = 'culina_admin_elevated';

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        const { pin } = body;

        if (!pin) {
            return new Response(JSON.stringify({ error: 'PIN requerido' }), { status: 400 });
        }

        // Verify PIN against private server-side environment variable
        if (pin === ADMIN_PIN && ADMIN_PIN) {
            // Set a secure, short-lived session cookie for elevation
            // This cookie is HttpOnly and Secure, so it can't be read by JS
            cookies.set(ELEVATION_COOKIE, 'true', {
                path: '/',
                httpOnly: true,
                secure: import.meta.env.PROD,
                sameSite: 'strict',
                maxAge: 30 * 60, // 30 minutes
            } as any);

            return new Response(JSON.stringify({ 
                success: true,
                message: 'Privilegios elevados correctamente' 
            }), { status: 200 });
        }

        return new Response(JSON.stringify({ error: 'PIN incorrecto' }), { status: 401 });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: 'Error en el servidor' }), { status: 500 });
    }
};

// Optional GET to check current elevation status
export const GET: APIRoute = async ({ cookies }) => {
    const elevated = cookies.get(ELEVATION_COOKIE)?.value === 'true';
    return new Response(JSON.stringify({ elevated }), { status: 200 });
};
