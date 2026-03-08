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

    // 4. CSRF Protection for API Routes — must run BEFORE next() so the handler
    //    doesn't execute (e.g. set cookies) when the request is rejected.
    const isDev = import.meta.env.DEV;
    if (pathname.startsWith('/api') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const origin = request.headers.get('Origin');
        const referer = request.headers.get('Referer');

        if (!isDev && origin) {
            // Usamos el header "Host" para reconstruir el origen permitido.
            // En Vercel, request.url puede ser una URL interna del lambda
            // (ej: smart-recipe-planner-xyz.vercel.app) que no coincide con
            // el Origin del navegador. El header Host sí refleja el dominio real.
            const host = request.headers.get('Host') || request.headers.get('X-Forwarded-Host');
            const proto = request.headers.get('X-Forwarded-Proto') || 'https';
            const allowedOrigin = host ? `${proto}://${host}` : new URL(request.url).origin;

            if (origin !== allowedOrigin && (!referer || !referer.startsWith(allowedOrigin))) {
                return new Response(
                    JSON.stringify({ message: 'CSRF token validation failed' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }
    }

    // 5. Proceed and append security headers
    const response = await next();

    // Implement Secure Headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Basic CSP
    if (!isDev) {
        const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://pagead2.googlesyndication.com https://www.google-analytics.com;";
        response.headers.set('Content-Security-Policy', csp);
    }

    return response;
});
