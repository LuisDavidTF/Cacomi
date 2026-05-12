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
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
                navigateFallback: '/',
                navigateFallbackDenylist: [/^\/api\//, /^\/admin\//, /^\/login/, /^\/register/],
                runtimeCaching: [
                    {
                        // Cache all internal page navigations (SSR)
                        urlPattern: ({ url, request }) => {
                            if (url.origin !== self.location.origin) return false;
                            const isGet = request.method === 'GET';
                            const hasNoExtension = !url.pathname.includes('.');
                            const isExcluded = url.pathname.startsWith('/api') || 
                                               url.pathname.startsWith('/admin') ||
                                               url.pathname.startsWith('/login');
                            return isGet && hasNoExtension && !isExcluded;
                        },
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'pages-cache',
                            networkTimeoutSeconds: 3,
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
                        // Cache images aggressively
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 30,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        // Cache Google Fonts
                        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 60 * 60 * 24 * 365,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        }
                    }
                ]
            }
        })
    ]
});