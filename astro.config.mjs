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
        mode: 'directory'
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
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
                navigateFallback: '/~offline',
                navigateFallbackDenylist: [/^\/api\//, /^\/admin\//, /^\/login/, /^\/register/],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            }
        })
    ]
});