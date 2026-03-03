import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';
import tailwindcss from '@tailwindcss/vite';

const isVercel = process.env.VERCEL === '1';

// https://astro.build/config
export default defineConfig({
    srcDir: './astro_src',
    output: 'server',
    site: process.env.PUBLIC_SITE_URL || 'https://smart-recipe-planner.com',
    adapter: isVercel
        ? vercel()
        : cloudflare({
            imageService: 'cloudflare',
            platformProxy: {
                enabled: false
            }
        }),
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                // Use edge-compatible version of react-dom/server for Cloudflare Workers
                'react-dom/server': 'react-dom/server.edge',
            }
        }
    },
    integrations: [
        react(),
        sitemap(),
        AstroPWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'Smart Recipe Planner',
                short_name: 'RecipePlanner',
                description: 'Plan your meals and manage your pantry intelligently',
                theme_color: '#ffffff',
                icons: [
                    {
                        src: '/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            },
            workbox: {
                globDirectory: 'dist',
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            },
        })
    ]
});
