/**
 * Postbuild script for Cloudflare Pages deployment.
 * - Lists dist/ structure for debugging
 * - Removes auto-generated wrangler.json files that conflict with Pages
 */
const fs = require('fs');

// Diagnostic: show what Astro generated
console.log('=== dist/ ===');
try { fs.readdirSync('dist').forEach(f => console.log(' ', f)); } catch(e) { console.log('  (empty)'); }

console.log('=== dist/server/ ===');
try { fs.readdirSync('dist/server').forEach(f => console.log(' ', f)); } catch(e) { console.log('  no server dir'); }

// Remove files that override our wrangler.toml
const toDelete = ['dist/server/wrangler.json', '.wrangler/deploy/config.json'];
toDelete.forEach(f => {
    try { fs.rmSync(f, { recursive: true }); console.log('Deleted:', f); }
    catch(e) { /* file doesn't exist, that's fine */ }
});
