---
name: cacomi-offline
description: Standards and strategies for offline capabilities, network detection, and caching fallback in Cacomi.
---

# Offline Storage & Caching Protocol

Cacomi requires robust offline behavior across both Next.js and Astro routes. Since users rely on the app while cooking (often in areas with poor Wi-Fi), components must gracefully gracefully fallback to cached data.

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

## 4. Data Synchronization (Sync Payload DTO & Unit Types)

When dealing with IndexedDB / Dexie `Offline-First` databases that eventually sync to a strict Spring Boot Backend API (like the Pantry module):

**1. ID Generation:** Always assign an explicit `UUIDv7` via `generateUUIDv7()` (from `@/lib/utils`) to the `id` field when creating an offline record, because `crypto.randomUUID()` is v4 and backend constraints may expect time-sorted v7. `ingredientId` should fall back to `null` for new custom items.

**2. Boolean Flags (Dexie -> Backend):** IndexedDB indices do not natively support javascript boolean (`true`/`false`) compounds well in some versions. Always store flags like `isSynced`, `isNew`, and `isDeleted` locally as integers (`0` or `1`).
Before sending a `POST` sync payload to the remote API, map the DTO:
- Exclude internal states (e.g., *never* send `isSynced` to the backend).
- Parse the integer flags back to explicit booleans (`true`/`false`).

**3. Unit Types (UX vs Backend strictness):** The application database and API standardized only on fundamental metric units (`g`, `ml`, `pz`). 
To enhance User Experience, UI Modals may allow inputs in `kg`, `L`, or `pza`.
- **Pre-Storage Conversion (Frontend -> Backend/DB):** If a user inputs `2.5 kg`, multiply by 1000 and store it implicitly as `2500 g`. Always store `ml` and `g` or `pz`.
- **Post-Storage Formatting (DB -> Frontend):** Use the `formatQuantityUnit(qty, unit)` utility to re-interpret heavy weights on-the-fly. For example, `3000 g` gets mathematically clamped back to visually render as `3 kg` in React hooks. This preserves visual cleanliness in the Pantry List without polluting the dataset standards.

> [!CAUTION]
> **AVOID** using raw JavaScript booleans (`true` / `false`) as Dexie/IndexedDB schema properties if you plan to query or filter by them using `.where('isSynced').equals(false)`.
> **BECAUSE** older and some specific browser implementations of IndexedDB fail to index and retrieve boolean values correctly, causing queries to return empty arrays silently.
> **CORRECT APPROACH**: Always map binary flags to small integers (`0` and `1`) in the Local Database schema. Convert them strictly back to booleans right before sending the DTO JSON payload to the REST API.

---

## 5. pauseSync / resumeSync — Usage Contract

`pauseSync()` blocks the debounce timer from scheduling new syncs. It must **only** be used when opening a modal that will delay user input for seconds (e.g., "Add new ingredient" modal). It must **never** be called for fast inline interactions.

```typescript
// ❌ BUG: Calling pauseSync before opening an edit modal
onClick={() => { pauseSync(); setEditingItem(item); }}
// Then onSave calls: onUpdate(id, data) → scheduleSync() ← BLOCKED (isSyncPaused=true)
// resumeSync() arrives AFTER scheduleSync already tried and was blocked
// Result: timer never scheduled → sync never fires → status stuck at 'pending'

// ✅ CORRECT: Don't pause for inline opens. resumeSync() after save is enough.
onClick={() => setEditingItem(item)}  // no pause
onSave={async (data) => {
    await onUpdate(id, data);  // scheduleSync() runs unblocked
    setEditingItem(null);
    resumeSync();              // resets timer cleanly
}}
```

> [!CAUTION]
> **AVOID** calling `pauseSync()` when opening fast inline edit modals (like `BatchList` item editing). 
> **BECAUSE** `onUpdate()` internally calls `scheduleSync()` while `isSyncPaused` is still `true`, so the timer never gets scheduled. By the time `resumeSync()` fires, there is nothing queued, and the sync is permanently lost for that change.
> **CORRECT APPROACH**: Only call `pauseSync()` for modals that take significant user time and where you definitively DO NOT want any sync to fire mid-session (e.g., a multi-step form). For quick inline edits, let `scheduleSync()` run freely and rely on `resumeSync()` after save to reset the debounce window.

---

## 6. Sync Response — Never Assume `data.items`

When the backend responds to `POST /api/pantry` with a 200 status, it may or may not return the full canonical list as `data.items`. Always handle both cases.

```typescript
// ❌ NEVER: assume data.items exists
if (response.ok) {
    const data = await response.json();
    if (data.items && Array.isArray(data.items)) {
        // Only path that marks Dexie as synced
        await db.pantryItems.bulkAdd(...);
    }
    // If data.items is missing → Dexie NEVER updated → items stay isSynced=0 forever
}

// ✅ CORRECT: always mark pending items as resolved on success
if (response.ok) {
    const data = await response.json();
    if (data.items && Array.isArray(data.items)) {
        // Absolute truth: replace Dexie with server state
        await db.pantryItems.clear();
        await db.pantryItems.bulkAdd(data.items.map(item => ({ ...item, isSynced: 1, isDeleted: 0, isNew: 0 })));
    } else {
        // Backend acknowledged but didn't return canonical list → mark locally
        await Promise.all(pendingChanges.map(change =>
            change.isDeleted === 1
                ? db.pantryItems.delete(change.id!)
                : db.pantryItems.update(change.id!, { isSynced: 1, isNew: 0 })
        ));
    }
}
```

> [!CAUTION]
> **AVOID** gating the Dexie update exclusively on `data.items && Array.isArray(data.items)` after a successful POST.
> **BECAUSE** some backend implementations return `{ success: true }` or similar without the full item list. If `data.items` is missing, Dexie items remain with `isSynced: 0`, and the next call to `updateStatusState()` will find pending changes and set the status back to `'pending'` — making it appear the sync never happened.
> **CORRECT APPROACH**: On any `response.ok`, always guarantee that the items involved in that sync are marked as resolved in Dexie, either by replacing from `data.items` (if present) or by manually updating each item's `isSynced` flag.
