export const API_BASE_URL = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.PUBLIC_API_URL || import.meta.env.NEXT_PUBLIC_API_URL) : (process.env.PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL);

export const AUTH_TOKEN_KEY = 'SRP_AUTH_TOKEN';
export const AUTH_USER_KEY = 'SRP_AUTH_USER';