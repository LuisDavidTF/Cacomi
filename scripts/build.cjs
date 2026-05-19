const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const wranglerPath = path.join(process.cwd(), 'wrangler.toml');
const wranglerBakPath = path.join(process.cwd(), 'wrangler.toml.bak');

console.log('🚀 Starting customized Astro build process...');

let renamed = false;
try {
    if (fs.existsSync(wranglerPath)) {
        fs.renameSync(wranglerPath, wranglerBakPath);
        console.log('📦 Temporarily renamed wrangler.toml → wrangler.toml.bak');
        renamed = true;
    }
} catch (e) {
    console.warn('⚠️  Could not temporarily rename wrangler.toml:', e.message);
}

try {
    console.log('🏃 Running astro build...');
    execSync('npx astro build', { stdio: 'inherit' });
    console.log('✅ Astro build completed successfully.');
} catch (error) {
    console.error('❌ Astro build failed.');
    restoreWrangler();
    process.exit(1);
}

restoreWrangler();

try {
    console.log('🏃 Running postbuild scripts...');
    // Execute postbuild script
    execSync('node scripts/postbuild.cjs', { stdio: 'inherit' });
} catch (postError) {
    console.error('❌ Postbuild script failed:', postError.message);
    process.exit(1);
}

function restoreWrangler() {
    if (renamed && fs.existsSync(wranglerBakPath)) {
        try {
            if (fs.existsSync(wranglerPath)) {
                fs.rmSync(wranglerPath, { force: true });
            }
            fs.renameSync(wranglerBakPath, wranglerPath);
            console.log('📦 Restored wrangler.toml.bak → wrangler.toml');
        } catch (e) {
            console.error('❌ Failed to restore wrangler.toml:', e.message);
        }
    }
}
