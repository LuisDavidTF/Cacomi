import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import AstroPWA from '@vite-pwa/astro';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
    srcDir: './astro_src',
    output: 'server',
    site: 'https://cacomi.app',
    adapter: cloudflare({
        mode: 'advanced'
    }),
    integrations: [
        react(),
        tailwindcss(),
        AstroPWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'Cacomi - Smart Recipe Planner',
                short_name: 'Cacomi',
                description: 'Planifica tus comidas de forma inteligente',
                theme_color: '#ffffff',
                icons: [
                    { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
                    { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
                ]
            },
            workbox: {
                skipWaiting: true,
                clientsClaim: true,
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                globIgnores: ['**/_worker.js/**'],
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
                // offline.html is a static file → always precached → always works offline
                navigateFallback: '/offline.html',
                navigateFallbackDenylist: [/^\/api\//, /^\/admin\//],
                // Force SW to fetch and cache all main sections during install
                // so they work offline even if the user never visited them
                additionalManifestEntries: [
                    // Core navigation
                    { url: '/', revision: null },
                    { url: '/pantry', revision: null },
                    { url: '/planner', revision: null },
                    { url: '/saved-recipes', revision: null },
                    { url: '/juego', revision: null },
                    { url: '/profile', revision: null },
                    { url: '/settings', revision: null },
                    // Content pages
                    { url: '/blog', revision: null },
                    { url: '/about', revision: null },
                    { url: '/terms', revision: null },
                    { url: '/privacy', revision: null },
                    // Auth (login page, but not register which redirects)
                    { url: '/login', revision: null },
                    { url: '/recipes/offline-shell', revision: null },
                ],
                runtimeCaching: [
                    {
                        // NetworkFirst for all SSR page navigations
                        urlPattern: ({ url, request }) => {
                            if (url.origin !== self.location.origin) return false;
                            const isGet = request.method === 'GET';
                            const hasNoExtension = !url.pathname.includes('.');
                            const isExcluded = url.pathname.startsWith('/api') ||
                                               url.pathname.startsWith('/admin');
                            return isGet && hasNoExtension && !isExcluded;
                        },
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'pages-cache',
                            networkTimeoutSeconds: 3,
                            expiration: {
                                maxEntries: 60,
                                maxAgeSeconds: 60 * 60 * 24 * 30,
                            },
                            cacheableResponse: { statuses: [0, 200] },
                            plugins: [
                                {
                                    handlerDidError: async ({ request }) => {
                                        const url = new URL(request.url);
                                        if (url.pathname.startsWith('/recipes/')) {
                                            return caches.match('/recipes/offline-shell');
                                        }
                                        return caches.match('/offline.html');
                                    }
                                }
                            ]
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com/i,
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'google-fonts-stylesheets' },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-webfonts',
                            expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /\.(?:js|css|json|webmanifest)$/i,
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'static-resources' },
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images',
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
                        },
                    },
                ],
            }
        })
    ]
});