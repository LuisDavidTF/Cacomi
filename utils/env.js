/**
 * Utility to safely access environment variables in both Astro (Vite) and Next.js (Webpack/Turbopack) environments.
 * @param {string} key The environment variable name.
 * @returns {string|undefined} The value of the environment variable.
 */
export const getEnv = (key) => {
    // 1. Try Astro/Vite style
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
            return import.meta.env[key];
        }
    } catch (e) {
        // Silently ignore parsing errors for import.meta in non-supported environments
    }

    // 2. Try Next.js/Node style
    try {
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
    } catch (e) {
        // Silently ignore
    }

    return undefined;
};
