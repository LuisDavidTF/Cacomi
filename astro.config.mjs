import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';
import tailwindcss from '@tailwindcss/vite';

// Detectamos el entorno
const isVercel = process.env.VERCEL === '1';
const isDev = process.env.NODE_ENV === 'development';

// Cargamos el adapter dinámicamente para evitar que workerd/lightningcss
// intenten resolver sus binarios de plataforma en entornos donde no se usan.
const adapter = isVercel
    ? (await import('@astrojs/vercel')).default()
    : (await import('@astrojs/cloudflare')).default({
        imageService: 'cloudflare',
        platformProxy: {
            enabled: true
        },
        routes: {
            extend: {
                exclude: [
                    '/sw.js',
                    '/manifest.webmanifest',
                    '/registerSW.js',
                    '/workbox-*.js',
                    '/sitemap-*.xml',
                    '/sitemap-index.xml',
                    '/~offline',
                    '/~offline/*',
                    '/*.css',
                    '/*.js'
                ]
            }
        }
    });

export default defineConfig({
    srcDir: './astro_src',
    output: 'server',
    site: 'https://cacomi.app',
    adapter,
    env: {
        schema: {
            BACKEND_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
            ADMIN_PATH_PREFIX: envField.string({ context: 'server', access: 'secret', optional: true }),
            ADMIN_PIN: envField.string({ context: 'server', access: 'secret', optional: true }),
        }
    },
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            // Solo aplicamos el alias de Cloudflare si NO estamos en local (dev)
            // y NO estamos en Vercel. Ver skill astro-6 para el motivo.
            alias: (isDev || isVercel)
                ? {}
                : {
                    'react-dom/server': 'react-dom/server.edge',
                },
        },
        ssr: {
            // Evita que Vite bundle módulos nativos de Node en SSR (especialmente en Windows)
            external: ['node:buffer', 'node:async_hooks', 'node:path', 'node:url']
        }
    },
    integrations: [
        react(),
        sitemap(),
        AstroPWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true,
                type: 'classic',
            },
            manifest: {
                name: 'Cacomi: Planificador de comidas',
                short_name: 'Cacomi',
                description: 'Planifica tus comidas de manera inteligente con el instinto de comer sano.',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
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
                maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
                navigateFallback: '/~offline',
                // We exclude API routes and admin paths from the fallback
                navigateFallbackDenylist: [/^\/api\//, /^\/admin\//],
                runtimeCaching: [
                    {
                        // Cache all internal page navigations (SSR)
                        urlPattern: ({ url, request }) => {
                            // Only match requests for our own origin
                            if (url.origin !== self.location.origin) return false;
                            
                            // Match direct navigations or HTML fetches (like Astro ViewTransitions)
                            const isPage = request.mode === 'navigate' || 
                                          (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
                                          
                            // Exclude API and Admin paths
                            const isExcluded = url.pathname.startsWith('/api') || 
                                              url.pathname.startsWith('/admin') ||
                                              url.pathname.includes('.'); // Exclude files with extensions (handled by other rules)
                                              
                            return isPage && !isExcluded;
                        },
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'pages-cache',
                            networkTimeoutSeconds: 5,
                            expiration: {
                                maxEntries: 60,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        // Cache static assets that might not be in the precache
                        urlPattern: /\.(?:js|css|json|webmanifest)$/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'static-resources',
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-stylesheets',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365,
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-webfonts',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 60 * 60 * 24 * 365,
                            },
                        },
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 30,
                            },
                        },
                    },
                ],
            },
        })
    ]
});