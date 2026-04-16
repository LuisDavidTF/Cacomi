# Incident Report: Sensitive Data Exposure in Client Bundle

## 🚨 Symptom
The backend API URL and the administrative PIN were visible in the browser's network tab and source code.

## 🔍 Root Cause Analysis
- **Misuse of `PUBLIC_` Prefix**: In Astro/Vite, variables prefixed with `PUBLIC_` are automatically bundled into the client-side JavaScript. 
- **Direct Client-to-Backend Communication**: React Islands were performing direct `fetch` calls to the backend using these public variables, bypassing any server-side security layer.
- **Client-Side Validation**: PIN verification was happening in the browser (`pin === PUBLIC_ADMIN_PIN`), exposing the secret value.

## ✅ Resolution (Permanent Fix)
- **Private Variables**: Renamed all sensitive variables to private versions (e.g., `BACKEND_URL`, `ADMIN_PIN`).
- **BFF Proxy Implementation**: 
    - Created a catch-all server-side proxy at `/api/proxy/[...path].ts`.
    - Created a server-side elevation endpoint at `/api/admin/elevate.ts`.
- **Authorization Injection**: The token is now pulled from `HttpOnly` cookies and injected into the backend request on the server, never touching the client-side JS logic.

## 🛡️ Prevention (Future Rules)
- **GEMINI.md Update**: Added a critical rule forbidding `PUBLIC_` for secrets and backend URLs.
- **Mandatory Review**: All new integrations with external APIs must be implemented via the BFF Proxy pattern.
