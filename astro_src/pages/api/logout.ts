import type { APIRoute } from 'astro';

const TOKEN_NAME = 'auth_token';

export const POST: APIRoute = async ({ cookies }) => {
    cookies.delete(TOKEN_NAME, {
        path: '/',
        secure: import.meta.env.PROD,
        httpOnly: true,
        sameSite: 'lax'
    });

    return new Response(JSON.stringify({ message: 'Sesión cerrada' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
    cookies.delete(TOKEN_NAME, {
        path: '/',
        secure: import.meta.env.PROD,
        httpOnly: true,
        sameSite: 'lax'
    });

    const url = new URL(request.url);
    const callbackUrl = url.searchParams.get('callbackUrl');

    const loginUrl = new URL('/login', request.url);
    if (callbackUrl) {
        loginUrl.searchParams.set('callbackUrl', callbackUrl);
    }

    return redirect(loginUrl.toString());
};
