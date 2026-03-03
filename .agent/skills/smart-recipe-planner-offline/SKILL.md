---
name: smart-recipe-planner-offline
description: Standards and strategies for offline capabilities, network detection, and caching fallback in Smart Recipe Planner.
---

# Offline Storage & Caching Protocol

Smart Recipe Planner requires robust offline behavior across both Next.js and Astro routes. Since users rely on the app while cooking (often in areas with poor Wi-Fi), components must gracefully gracefully fallback to cached data.

## 1. Network Fetching & `CacheManager` Fallbacks

When calling API endpoints from **Client Components**, always check `CacheManager` or local Dexie/IndexedDB stores if the request fails due to `TypeError: Failed to fetch` (network error).

```javascript
import { CacheManager } from '@utils/cacheManager';

try {
    const response = await api.getRecipes();
    setRecipes(response.data);
} catch (error) {
    const cached = feedCache.get(); // or CacheManager
    if (cached) {
        setRecipes(cached.recipes);
        showToast(t.common?.offlineMode, 'info');
    } else {
        // Only show fatal error if NO cache is available
        setError(error.message);
    }
}
```

## 2. Server-Side Routing (Next.js SSR & Astro)

**CRITICAL BUG AVOIDANCE:** Never throw hard 404s (`notFound()` in Next.js or `Astro.redirect('/404')`) solely because the upstream API request failed. 

If the user is using `next-pwa` offline, their local device / Service Worker will still respond to the client's Page Request, executing the Node server which then attempts to hit the API. If the API fails and the server returns a 404 status code, the browser will render the error page, bypassing any client-side offline logic!

**Correct Pattern:** Check for connection errors, catch them, and pass `null` or empty data to the client component. Let the client component handle the "Not Found vs Offline" distinction.

**Next.js (`page.jsx`):**
```javascript
// BAD:
if (!recipe) notFound();

// GOOD:
const recipe = await getRecipe(id).catch(() => null);
return <RecipeClient recipe={recipe} recipeId={id} />;
```

**Client Receiver (`RecipeClient.jsx`):**
```javascript
useEffect(() => {
    if (!initialRecipe && recipeId) {
        const cached = CacheManager.getVisitedRecipe(recipeId);
        if (cached) setRecipe(cached); // Recovered!
    }
}, []);
```

##  3. UI Best Practices for Offline

- **Safe Image Loading:** If images fail offline, handle `onError` with `https://placehold.co` fallbacks or locally bundled default UI assets.
- **Routing:** Use native `<a>` tags instead of `<Link>` components if you suspect Next.js client-side navigation will request missing JSON payloads. Standard `<a>` tags guarantee the Service Worker will intercept the standard HTTP request and return the cached HTML.
- **Saving HTML:** When implementing a "Save Offline" button, explicitly use `cache.put()` bypassing `no-store` headers:

```javascript
const handleSaveOffline = async () => {
    CacheManager.saveVisitedRecipe(recipe);
    if ('caches' in window) {
        const cache = await caches.open('pages');
        const req = new Request(window.location.pathname);
        const resp = await fetch(req);
        if (resp.ok) await cache.put(req, resp.clone());
    }
}
```
