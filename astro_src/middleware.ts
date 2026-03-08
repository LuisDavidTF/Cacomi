import { defineMiddleware } from 'astro:middleware';

const AUTH_COOKIE_NAME = 'auth_token';
const PUBLIC_AUTH_ROUTES = ['/login', '/register'];
const PROTECTED_ROUTE_PREFIXES = ['/create-recipe', '/edit-recipe'];

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, request, cookies, redirect } = context;
    const pathname = url.pathname;

    // 1. Session Check
    const hasSession = cookies.has(AUTH_COOKIE_NAME);

    // 2. Guest Guard
    if (hasSession && PUBLIC_AUTH_ROUTES.includes(pathname)) {
        return redirect('/');
    }

    // 3. Auth Guard
    const isTryingToAccessProtectedRoute = PROTECTED_ROUTE_PREFIXES.some(prefix =>
        pathname.startsWith(prefix)
    );

    if (!hasSession && isTryingToAccessProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return redirect(loginUrl.toString());
    }


    // 5. Proceed and append security headers
    const response = await next();

    // Implement Secure Headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Basic CSP
    const isDev = import.meta.env.DEV;
    if (!isDev) {
        const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://pagead2.googlesyndication.com https://www.google-analytics.com;";
        response.headers.set('Content-Security-Policy', csp);
    }

    return response;
});
