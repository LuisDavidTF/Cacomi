import { defineMiddleware } from 'astro:middleware';
// import { ADMIN_PATH_PREFIX } from 'astro:env/server';

const AUTH_COOKIE_NAME = 'auth_token';
const PUBLIC_AUTH_ROUTES = ['/login', '/register'];
const PROTECTED_ROUTE_PREFIXES = ['/create-recipe', '/edit-recipe'];

/**
 * Decodes the payload of a JWT without verifying the signature.
 * Safe on the server since the cookie is httpOnly and the backend
 * already validates the signature on every protected API call.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        // Use Buffer instead of atob for better SSR compatibility (Node/Cloudflare)
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
        return JSON.parse(jsonPayload) as Record<string, unknown>;
    } catch {
        return null;
    }
}

/**
 * Checks whether a decoded JWT payload grants admin access.
 * backend injects ROLE_ADMIN in the 'roles' array.
 */
function isAdminPayload(payload: Record<string, unknown>): boolean {
    const roles = payload.roles;
    if (Array.isArray(roles)) {
        return roles.some(role => {
            if (typeof role === 'string') return role === 'ROLE_ADMIN';
            if (role && typeof role === 'object') return (role as any).authority === 'ROLE_ADMIN';
            return false;
        });
    }
    return false;
}

/** Returns a proper 404 response that renders the existing 404 page. */
function notFound(context: Parameters<Parameters<typeof defineMiddleware>[0]>[0]) {
    return context.rewrite('/404');
}

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, request, cookies, redirect } = context;
    const pathname = url.pathname;

    // Read the secret admin path prefix (server-side only, never PUBLIC_)
    const adminPrefix = (import.meta.env.ADMIN_PATH_PREFIX ?? 'admin').replace(/^\/|\/$/g, '');
    const secretAdminPrefix = `/${adminPrefix}`;
    const internalAdminPrefix = '/admin';

    // 1. Session Check
    console.log(`[MIDDLEWARE DEBUG] Path: ${pathname} | Host: ${context.url.hostname}`);
    const tokenCookie = cookies.get(AUTH_COOKIE_NAME);
    const hasSession = !!tokenCookie;

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

    // 4. Internal /admin/* routes — 404 for direct access from the browser.
    //    Exception: internal rewrites from the secret path (flagged via context.locals).
    if (pathname.startsWith(internalAdminPrefix)) {
        // Allow the rewrite chain: /<secret>/* → /admin/* sets this flag
        if ((context.locals as unknown as Record<string, unknown>).isInternalAdminRewrite) {
            return next();
        }
        return notFound(context);
    }

    // 5. Secret Admin Guard — the real entry point for admins.
    //    Path: /<ADMIN_PATH_PREFIX>/* → rewrite to /admin/*
    if (pathname.startsWith(secretAdminPrefix)) {
        // a) Must be logged in
        if (!hasSession) {
            return notFound(context);
        }

        // b) Must be admin (role check via JWT payload)
        const payload = decodeJwtPayload(tokenCookie!.value);

        if (!payload || !isAdminPayload(payload)) {
            return notFound(context);
        }

        // c) Mark as internal rewrite so the /admin/* block lets it through
        //    (middleware runs again after rewrite; locals persists across rewrites)
        (context.locals as unknown as Record<string, unknown>).isInternalAdminRewrite = true;

        // d) Rewrite the secret path to the real /admin/* page internally
        const rest = pathname.slice(secretAdminPrefix.length) || '/dashboard';
        const internalPath = `${internalAdminPrefix}${rest}`;
        return context.rewrite(internalPath);
    }

    // 6. Canonical Domain Enforcer (301 Redirect)
    const hostname = context.url.hostname;
    const isLocal = hostname === 'localhost' || hostname.includes('127.0.0.1');
    const isVercelStaging = hostname.endsWith('.vercel.app') && !hostname.includes('cacomi'); // Vercel previews
    
    // If not local and not the production domain, redirect to production
    if (!isLocal && !isVercelStaging && hostname !== 'cacomi.app' && hostname !== 'www.cacomi.app') {
        const canonicalUrl = new URL(context.url.pathname + context.url.search, 'https://cacomi.app');
        return redirect(canonicalUrl.toString(), 301);
    }

    // 7. Proceed and append security headers
    const response = await next();

    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Basic CSP (production only)
    const isDev = import.meta.env.DEV;
    if (!isDev) {
        const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://pagead2.googlesyndication.com https://www.google-analytics.com;";
        response.headers.set('Content-Security-Policy', csp);
    }

    return response;
});
