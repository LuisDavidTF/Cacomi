import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';
import tailwindcss from '@tailwindcss/vite';

// Detectamos el entorno
const isVercel = process.env.VERCEL === '1';
const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
    srcDir: './astro_src',
    output: 'server',
    site: process.env.PUBLIC_SITE_URL || 'https://smart-recipe-planner.com',
    adapter: isVercel
        ? vercel()
        : cloudflare({
            imageService: 'cloudflare',
            platformProxy: {
                enabled: true // Puedes dejarlo en true ahora que el alias es condicional
            }
        }),
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            // Solo aplicamos el alias de Cloudflare si NO estamos en local (dev) 
            // y NO estamos en Vercel.
            alias: (isDev || isVercel) 
                ? {} 
                : {
                    'react-dom/server': 'react-dom/server.edge',
                },
        },
        ssr: {
            // Esto ayuda a que Vite no se confunda con módulos internos de Node en Windows
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
                // Importante: en dev, Workbox a veces se queja si dist no existe
                globDirectory: isDev ? '.astro' : 'dist',
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            },
        })
    ]
});