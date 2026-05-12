/**
 * Postbuild script for Cloudflare Pages SSR deployment.
 *
 * Astro 6 with @astrojs/cloudflare puts the worker at dist/server/entry.mjs.
 * Cloudflare Pages needs _worker.js at the root of the output directory (dist/).
 * This script relocates the server artifacts so Cloudflare can find them.
 */
const fs = require('fs');
const path = require('path');

// --- 1. Diagnostics ---
console.log('=== dist/ ===');
try { fs.readdirSync('dist').forEach(f => console.log(' ', f)); } catch(e) { console.log('  (empty)'); }
console.log('=== dist/server/ ===');
try { fs.readdirSync('dist/server').forEach(f => console.log(' ', f)); } catch(e) { console.log('  no server dir'); }

// --- 2. Move dist/server/entry.mjs → dist/_worker.js ---
const workerSrc = path.join('dist', 'server', 'entry.mjs');
const workerDst = path.join('dist', '_worker.js');
if (fs.existsSync(workerSrc)) {
    fs.copyFileSync(workerSrc, workerDst);
    console.log('Copied: dist/server/entry.mjs → dist/_worker.js');
} else {
    console.error('ERROR: dist/server/entry.mjs not found!');
    process.exit(1);
}

// --- 3. Move dist/server/chunks/ → dist/chunks/ ---
const chunksSrc = path.join('dist', 'server', 'chunks');
const chunksDst = path.join('dist', 'chunks');
if (fs.existsSync(chunksSrc)) {
    if (fs.existsSync(chunksDst)) fs.rmSync(chunksDst, { recursive: true, force: true });
    fs.cpSync(chunksSrc, chunksDst, { recursive: true });
    console.log('Copied: dist/server/chunks/ → dist/chunks/');
}

// --- 4. Move any other .mjs files from dist/server/ to dist/ ---
try {
    fs.readdirSync(path.join('dist', 'server')).forEach(file => {
        if (file.endsWith('.mjs') && file !== 'entry.mjs') {
            const src = path.join('dist', 'server', file);
            const dst = path.join('dist', file);
            fs.copyFileSync(src, dst);
            console.log(`Copied: dist/server/${file} → dist/${file}`);
        }
    });
} catch(e) { /* ignore */ }

// --- 5. Remove conflicting generated config files ---
['dist/server/wrangler.json', '.wrangler/deploy/config.json'].forEach(f => {
    try { fs.rmSync(f, { recursive: true }); console.log('Deleted:', f); }
    catch(e) { /* file doesn't exist */ }
});

console.log('✅ Postbuild complete. dist/_worker.js is ready.');
