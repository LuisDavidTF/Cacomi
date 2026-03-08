import type { APIRoute } from 'astro';

const TOKEN_NAME = 'auth_token';

/** Borra la cookie de autenticación de forma robusta.
 *  Usa set() con maxAge=0 y expires=epoch en lugar de delete(),
 *  ya que delete() no siempre envía el Set-Cookie header correctamente
 *  en el adapter de Vercel.
 */
function clearAuthCookie(cookies: Parameters<APIRoute>[0]['cookies']) {
    const cookieOptions = {
        path: '/',
        secure: import.meta.env.PROD,
        httpOnly: true,
        sameSite: 'lax' as const,
        maxAge: 0,
        expires: new Date(0),
    };
    // Sobreescribimos con valor vacío y expiración inmediata
    cookies.set(TOKEN_NAME, '', cookieOptions);
}

export const POST: APIRoute = async ({ cookies }) => {
    clearAuthCookie(cookies);

    return new Response(JSON.stringify({ message: 'Sesión cerrada' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
    clearAuthCookie(cookies);

    const url = new URL(request.url);
    const callbackUrl = url.searchParams.get('callbackUrl');

    const loginUrl = new URL('/login', request.url);
    if (callbackUrl) {
        loginUrl.searchParams.set('callbackUrl', callbackUrl);
    }

    return redirect(loginUrl.toString());
};
