/**
 * Postbuild script for Cloudflare Pages SSR deployment (Advanced Mode).
 * Optimized for Astro 6 to maintain relative path integrity.
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

console.log('🏗  Starting robust postbuild flattening...');

const serverDir = path.join('dist', 'server');
const clientDir = path.join('dist', 'client');

// --- 1. Move everything from dist/server/ to dist/ ---
// This preserves relative paths between entry point and chunks/middleware
if (fs.existsSync(serverDir)) {
    console.log('📦 Moving server files to root...');
    const files = fs.readdirSync(serverDir);
    files.forEach(file => {
        const src = path.join(serverDir, file);
        const dst = path.join('dist', file);
        if (fs.lstatSync(src).isDirectory()) {
            copyDirRecursive(src, dst);
        } else {
            fs.copyFileSync(src, dst);
        }
    });
    
    // Rename entry.mjs to _worker.js as required by Cloudflare Pages
    const entryPath = path.join('dist', 'entry.mjs');
    const workerPath = path.join('dist', '_worker.js');
    if (fs.existsSync(entryPath)) {
        if (fs.existsSync(workerPath)) fs.unlinkSync(workerPath);
        fs.renameSync(entryPath, workerPath);
        console.log('✅ Renamed entry.mjs to _worker.js');
    }
}

// --- 2. Move everything from dist/client/ to dist/ ---
if (fs.existsSync(clientDir)) {
    console.log('📂 Flattening client assets...');
    const files = fs.readdirSync(clientDir);
    files.forEach(file => {
        const src = path.join(clientDir, file);
        const dst = path.join('dist', file);
        if (fs.lstatSync(src).isDirectory()) {
            copyDirRecursive(src, dst);
        } else {
            fs.copyFileSync(src, dst);
        }
    });
}

// --- 3. Cleanup conflicting files ---
const problematicFiles = [
    'dist/server',
    'dist/client',
    'dist/wrangler.json', // Sometimes generated in root or server
    'dist/server/wrangler.json',
    '.wrangler/deploy/config.json'
];

problematicFiles.forEach(f => {
    try {
        if (fs.existsSync(f)) {
            fs.rmSync(f, { recursive: true, force: true });
            console.log(`🗑  Deleted: ${f}`);
        }
    } catch (e) {
        // ignore
    }
});

console.log('🚀 Postbuild complete. Application structure is now optimized for Cloudflare Pages.');
