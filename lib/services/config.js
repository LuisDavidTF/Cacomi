const getEnv = (key) => {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) return import.meta.env[key];
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
    return undefined;
};

export const API_BASE_URL = getEnv('PUBLIC_API_URL') || getEnv('NEXT_PUBLIC_API_URL') || 'http://localhost:8080';
console.log('== DEBUG config.js == API_BASE_URL:', API_BASE_URL);

export const API_VERSION = 'v2';

// Ensure no double slashes if API_BASE_URL ends with /
const cleanBaseUrl = API_BASE_URL.replace(/\/$/, '');
export const API_URL = `${cleanBaseUrl}/api/${API_VERSION}`;
console.log('== DEBUG config.js == API_URL:', API_URL);
