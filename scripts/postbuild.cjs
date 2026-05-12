/**
 * Postbuild script for Cloudflare Pages SSR deployment (Advanced Mode).
 *
 * Astro 6 in 'advanced' mode generates:
 *   dist/server/entry.mjs   → needs to be dist/_worker.js
 *   dist/server/chunks/     → needs to be dist/chunks/
 *   dist/client/            → contents need to be at dist/ root (Cloudflare ASSETS binding)
 *
 * This script flattens the output so Cloudflare Pages finds everything and
 * removes conflicting wrangler configs.
 */
const fs = require('fs');
const path = require('path');

function copyDirRecursive(src, dst) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const dstPath = path.join(dst, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, dstPath);
        } else {
            fs.copyFileSync(srcPath, dstPath);
        }
    }
}

console.log('🏗  Starting postbuild flattening...');

// --- 1. Move dist/server/entry.mjs → dist/_worker.js ---
const workerSrc = path.join('dist', 'server', 'entry.mjs');
const workerDst = path.join('dist', '_worker.js');
if (fs.existsSync(workerSrc)) {
    fs.copyFileSync(workerSrc, workerDst);
    console.log('✅ Copied: dist/server/entry.mjs → dist/_worker.js');
} else {
    console.error('❌ ERROR: dist/server/entry.mjs not found! (Mode might not be advanced?)');
}

// --- 2. Move dist/server/chunks/ → dist/chunks/ ---
const chunksSrc = path.join('dist', 'server', 'chunks');
const chunksDst = path.join('dist', 'chunks');
if (fs.existsSync(chunksSrc)) {
    if (fs.existsSync(chunksDst)) fs.rmSync(chunksDst, { recursive: true, force: true });
    copyDirRecursive(chunksSrc, chunksDst);
    console.log('✅ Copied: dist/server/chunks/ → dist/chunks/');
}

// --- 3. Flatten dist/client/ → dist/ ---
const clientDir = path.join('dist', 'client');
if (fs.existsSync(clientDir)) {
    copyDirRecursive(clientDir, 'dist');
    console.log('✅ Flattened: dist/client/ → dist/');
}

// --- 4. Remove conflicting generated config files ---
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

console.log('🚀 Postbuild complete. Application ready for Cloudflare Pages.');
