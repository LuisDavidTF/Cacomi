/**
 * Postbuild script for Cloudflare Pages SSR deployment.
 *
 * Astro 6 generates:
 *   dist/server/entry.mjs   → needs to be dist/_worker.js
 *   dist/server/chunks/     → needs to be dist/chunks/
 *   dist/client/            → contents need to be at dist/ root (Cloudflare ASSETS binding)
 *
 * This script flattens the output so Cloudflare Pages finds everything.
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

// --- 1. Move dist/server/entry.mjs → dist/_worker.js ---
const workerSrc = path.join('dist', 'server', 'entry.mjs');
const workerDst = path.join('dist', '_worker.js');
if (fs.existsSync(workerSrc)) {
    fs.copyFileSync(workerSrc, workerDst);
    console.log('✅ Copied: dist/server/entry.mjs → dist/_worker.js');
} else {
    console.error('❌ ERROR: dist/server/entry.mjs not found!');
    process.exit(1);
}

// --- 2. Move dist/server/chunks/ → dist/chunks/ ---
const chunksSrc = path.join('dist', 'server', 'chunks');
const chunksDst = path.join('dist', 'chunks');
if (fs.existsSync(chunksSrc)) {
    if (fs.existsSync(chunksDst)) fs.rmSync(chunksDst, { recursive: true, force: true });
    copyDirRecursive(chunksSrc, chunksDst);
    console.log('✅ Copied: dist/server/chunks/ → dist/chunks/');
}

// --- 3. Copy any other .mjs files from dist/server/ → dist/ ---
try {
    for (const file of fs.readdirSync(path.join('dist', 'server'))) {
        if (file.endsWith('.mjs') && file !== 'entry.mjs') {
            fs.copyFileSync(path.join('dist', 'server', file), path.join('dist', file));
            console.log(`✅ Copied: dist/server/${file} → dist/${file}`);
        }
    }
} catch(e) { /* ignore */ }

// --- 4. Flatten dist/client/ → dist/ (so ASSETS binding finds static files) ---
const clientDir = path.join('dist', 'client');
if (fs.existsSync(clientDir)) {
    copyDirRecursive(clientDir, 'dist');
    console.log('✅ Flattened: dist/client/ → dist/');
} else {
    console.warn('⚠️  dist/client/ not found, skipping flatten.');
}

// --- 5. Remove conflicting generated config files ---
['dist/server/wrangler.json', 'dist/server/.prerender', '.wrangler/deploy/config.json'].forEach(f => {
    try { 
        if (fs.existsSync(f)) {
            fs.rmSync(f, { recursive: true, force: true }); 
            console.log('🗑  Deleted:', f); 
        }
    }
    catch(e) { console.warn('⚠️  Failed to delete:', f, e.message); }
});

console.log('🚀 Postbuild complete. dist/_worker.js + static assets ready for Cloudflare Pages.');
