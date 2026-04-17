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

export const getBackendUrl = () => {
    if (!isServer) return undefined;
    const url = getEnv('BACKEND_URL');
    return normalizeBackendUrl(url) || 'http://localhost:8080';
};

export const API_VERSION = 'v2';

export const getApiUrl = () => {
    if (!isServer) return '/api/proxy';
    const baseUrl = getBackendUrl().replace(/\/$/, '');
    return `${baseUrl}/api/${API_VERSION}`;
};

// Legacy constant (will use the first resolved value or fallback)
export const API_BASE_URL = isServer 
    ? (getBackendUrl() || 'http://localhost:8080')
    : '/api/proxy';

const cleanBaseUrl = API_BASE_URL.replace(/\/$/, '');
export const API_URL = isServer 
    ? `${cleanBaseUrl}/api/${API_VERSION}`
    : cleanBaseUrl;

if (isServer) {
    console.log(`[CONFIG] Server-side API Target: ${getApiUrl()}`);
} else {
    console.log(`[CONFIG] Client-side API Proxy: ${API_URL}`);
}
