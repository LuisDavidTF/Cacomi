import { defineConfig } from 'astro/config';
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
    site: process.env.PUBLIC_SITE_URL || 'https://smart-recipe-planner.com',
    adapter,
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
            manifest: {
                name: 'Smart Recipe Planner',
                short_name: 'RecipePlanner',
                description: 'Plan your meals and manage your pantry intelligently',
                theme_color: '#ffffff',
                icons: [
                    { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
                ]
            },
            workbox: {
                globDirectory: isDev ? '.astro' : 'dist',
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            },
        })
    ]
});