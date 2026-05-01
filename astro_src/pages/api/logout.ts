import type { APIRoute } from 'astro';
import { AuthService } from '@/lib/services/auth';

/** Borra las cookies de autenticación de forma robusta. */
function clearAuthCookies(cookies: Parameters<APIRoute>[0]['cookies']) {
    const cookieOptions = {
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'strict' as const,
        maxAge: 0,
        expires: new Date(0),
    };
    
    cookies.set('refreshToken', '', cookieOptions);
    cookies.set('auth_token', '', cookieOptions); // Legacy support
}

export const POST: APIRoute = async ({ cookies }) => {
    try {
        const refreshToken = cookies.get('refreshToken')?.value;
        if (refreshToken) {
            await AuthService.logout(`refreshToken=${refreshToken}`).catch(() => {});
        }
    } catch (e) {}

    clearAuthCookies(cookies);

    return new Response(JSON.stringify({ message: 'Sesión cerrada' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
    const refreshToken = cookies.get('refreshToken')?.value;
    if (refreshToken) {
        await AuthService.logout(`refreshToken=${refreshToken}`).catch(() => {});
    }

    clearAuthCookies(cookies);

    const url = new URL(request.url);
    const callbackUrl = url.searchParams.get('callbackUrl');

    const loginPath = callbackUrl
        ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : '/login';

    return redirect(loginPath);
};
