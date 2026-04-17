const getEnv = (key) => {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) return import.meta.env[key];
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
    return undefined;
};

// BFF Proxy Logic: 
// On the server (SSR), we can hit the backend directly (BACKEND_URL).
// On the client, we MUST hit our local proxy (/api/proxy) to hide the real URL.
const isServer = typeof window === 'undefined';
const normalizeBackendUrl = (url) => {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
};

// Try to get from astro:env if possible (Astro 5+)
// This is handled at runtime to avoid breaking client-side imports
let envBackendUrl = getEnv('BACKEND_URL');

const BACKEND_URL = normalizeBackendUrl(envBackendUrl);

export const API_BASE_URL = isServer 
    ? (BACKEND_URL || 'http://localhost:8080')
    : '/api/proxy';

export const API_VERSION = 'v2';

// Ensure no double slashes or absolute URL issues for client proxy
const cleanBaseUrl = API_BASE_URL.replace(/\/$/, '');
export const API_URL = isServer 
    ? `${cleanBaseUrl}/api/${API_VERSION}`
    : cleanBaseUrl; // Local proxy already includes /api/proxy

console.log(`[CONFIG] Running on ${isServer ? 'SERVER' : 'CLIENT'}. Target: ${API_URL}`);
