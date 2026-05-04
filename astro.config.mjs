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
                globIgnores: ['**/_worker.js/**'],
                maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
                // We handle fallbacks manually via runtimeCaching for better SSR compatibility
                runtimeCaching: [
                    {
                        // Cache all internal page navigations (SSR)
                        urlPattern: ({ url, request }) => {
                            if (url.origin !== self.location.origin) return false;
                            
                            // Any GET request without an extension is likely a page
                            const isGet = request.method === 'GET';
                            const hasNoExtension = !url.pathname.includes('.');
                            
                            // Exclude API and Admin
                            const isExcluded = url.pathname.startsWith('/api') || 
                                               url.pathname.startsWith('/admin');
                                               
                            return isGet && hasNoExtension && !isExcluded;
                        },
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'pages-cache',
                            networkTimeoutSeconds: 5,
                            expiration: {
                                maxEntries: 60,
                                maxAgeSeconds: 60 * 60 * 24 * 30,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        // Cache Google Fonts (CSS)
                        urlPattern: /^https:\/\/fonts\.googleapis\.com/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'google-fonts-stylesheets',
                        },
                    },
                    {
                        // Cache Google Fonts (Files)
                        urlPattern: /^https:\/\/fonts\.gstatic\.com/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-webfonts',
                            expiration: {
                                maxEntries: 30,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
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