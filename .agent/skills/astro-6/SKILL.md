---
name: astro-6
description: >
  Astro 6 patterns including SSR, API Routes, Island Architecture, and React integrations.
  Trigger: When working in Astro pages (src/pages/*.astro or *.ts), layouts (src/layouts/*.astro), middleware (src/middleware.ts), and React Islands (client:load).
license: Apache-2.0
metadata:
  author: ant-gravity
  version: "1.0"
  scope: [root, ui, src]
  auto_invoke: "Astro Pages / API / Layouts"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## Astro 6 Concepts & Patterns

Astro is a web framework designed for content-driven websites, using "Island Architecture" to hydrate interactive components.

### File Structure (SSR Mode)

```text
src/
├── layouts/
│   └── Layout.astro         # HTML skeleton, <head>, global styles
├── pages/
│   ├── index.astro          # Maps to /
│   ├── about.astro          # Maps to /about
│   ├── recipes/[slug].astro # Dynamic route
│   └── api/
│       └── hello.ts         # Maps to /api/hello (API Endpoint)
├── components/              # Framework-agnostic or specific components
│   └── ReactButton.tsx      # React Island
└── middleware.ts            # Global Edge Middleware
```

### Pages (`.astro`)

Astro pages contain frontmatter (server-side JS) enclosed in `---` and an HTML-like template.

```astro
---
import Layout from '../layouts/Layout.astro';
import { db } from '../lib/db';
import InteractiveCounter from '../components/InteractiveCounter';

// Disable prerendering for SSR (if configure 'output: server' globally, this is default)
export const prerender = false;

// Access query params or dynamic route params
const { id } = Astro.params;
const name = Astro.url.searchParams.get('name');

// Server-side fetching
const data = await db.query();
---

<Layout title="Home">
  <h1>Data: {data.value}</h1>
  
  <!-- Hydrate React component on the client -->
  <InteractiveCounter client:load initialCount={data.count} />
</Layout>
```

### API Endpoints (`.ts`)

Astro API routes use standard Request/Response web APIs.

```typescript
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, url, cookies }) => {
  const token = cookies.get('token');
  
  return new Response(JSON.stringify({ message: "Hello" }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  return new Response("Created", { status: 201 });
};
```

### Middleware (`src/middleware.ts`)

Middleware intercepts requests before pages render. Useful for auth and security headers.

```typescript
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  
  // Auth Check
  if (url.pathname.startsWith('/protected') && !cookies.has('session')) {
    return redirect('/login');
  }

  // Get response and modify headers
  const response = await next();
  response.headers.set('X-Frame-Options', 'DENY');
  
  return response;
});
```

### React Islands (Client Directives)

To use React components interactively:
- `client:load`: Hydrate immediately.
- `client:idle`: Hydrate when main thread is free.
- `client:visible`: Hydrate when element enters viewport.
- `client:only="react"`: Skip SSR entirely (useful for heavy client libs).

> [!CAUTION]
> **AVOID** using React `Context` (`createContext`, `useContext`) to share state between multiple independent Astro islands (e.g. `<Providers client:load><Navbar client:load /></Providers>` where Navbar is a separate island, or sibling islands).
> **BECAUSE** Astro isolates each island into its own React root. A Provider in one island will not pass its context to components in a different island. This causes `useContext` to return the default value (or `null`), resulting in runtime crashes like `Cannot destructure property 'isAuthenticated' of 'useAuth(...)' as it is null`.
> **CORRECT APPROACH**: Use a framework-agnostic global state manager like **Zustand** (see `zustand-5` skill) to share state across islands. Zustand stores exist outside the React tree and hydrate correctly across multiple islands.

> [!CAUTION]
> **AVOID** using `process.env` to access environment variables inside client-side React code (e.g., inside components marked with `client:load`).
> **BECAUSE** Astro's Vite bundler does not inject `process` into the browser environment by default. This causes a `ReferenceError: process is not defined` during React hydration, which triggers an Error Boundary and completely unmounts the component tree.
> **CORRECT APPROACH**: Use Astro's standard `import.meta.env.PUBLIC_VAR_NAME` syntax for any variable that needs to be exposed to client-side components. Ensure the variable is prefixed with `PUBLIC_` in your `.env` files.

> [!CAUTION]
> **AVOID** using framework-specific imports (like `astro:actions`) in shared hooks or components that are used by multiple frameworks (Next.js and Astro).
> **BECAUSE** the secondary framework (e.g., Next.js) will fail to resolve the import during the build process, leading to "module not found" or chunk generation errors.
> **CORRECT APPROACH**: Use dynamic `import()` or dependency injection to keep shared logic framework-agnostic.

> [!CAUTION]
> **AVOID** relying purely on API-side authorization for sensitive UI forms like "Edit Recipe".
> **BECAUSE** while the API might block the save action, the unauthorized user might still see sensitive data or a broken UI before a manual redirection occurs.
> **CORRECT APPROACH**: Implement reactive ownership checks in the UI (comparing ID and name as fallback) that block rendering and trigger an immediate redirection if authorship can't be verified.

> [!CAUTION]
> **AVOID** importing Node-only libraries (e.g., `crypto`, `fs`) or using `require()` inside utilities that are executed in Astro Client components or React Islands during SSR.
> **BECAUSE** Vite's SSR module runner cannot resolve `require` or Node polyfills natively when building the client bundle, causing an aggressive `ReferenceError: require is not defined` crashing the page.
> **CORRECT APPROACH**: Use standard Web APIs (like `Math.random()`, `crypto.getRandomValues()`) or ensure your utilities are strictly isomorphic. If you must use Node modules, isolate them securely in `.astro` frontmatter or `/api` endpoints.

> [!CAUTION]
> **AVOID** placing core logic folders (`components`, `hooks`, `lib`, `context`, `utils`) outside the configured `srcDir` (e.g., `astro_src` or `src`) when using TypeScript and JSX.
> **BECAUSE** even if the build succeeds, the TypeScript Language Server (IDE) often fails to correctly resolve "IntrinsicElements" (like `div`, `span`, `svg`) for files located outside the source root, leading to persistent red errors and broken autocompletado despite correct `tsconfig.json` configurations.
> **CORRECT APPROACH**: Consolidate all functional source code into the directory defined as `srcDir` in `astro.config.mjs` and ensure `tsconfig.json` paths and `include` arrays point strictly within that directory.
