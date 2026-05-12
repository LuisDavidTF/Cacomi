/**
 * Postbuild script for Astro 6 + Cloudflare Pages.
 * 
 * Astro 6 generates a wrangler.json in the output directory which
 * conflicts with Cloudflare Pages' own ASSETS binding.
 * 
 * This script removes the conflicting file to allow the deployment to proceed.
 */
const fs = require('fs');
const path = require('path');

const problematicFiles = [
    'dist/server/wrangler.json',
    'dist/server/.prerender',
    '.wrangler/deploy/config.json'
];

problematicFiles.forEach(f => {
    try {
        if (fs.existsSync(f)) {
            fs.rmSync(f, { recursive: true, force: true });
            console.log(`🗑  Deleted: ${f}`);
        }
    } catch (e) {
        console.warn(`⚠️  Failed to delete ${f}:`, e.message);
    }
});

console.log('🚀 Postbuild cleanup complete.');
