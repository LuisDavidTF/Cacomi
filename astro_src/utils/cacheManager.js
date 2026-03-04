/**
 * Cache Limits
 */
const LIMITS = {
    FEED_MAX_ITEMS: 150,    // Keep last 150 items in feed flow
    VISITED_MAX_ITEMS: 100, // Keep last 100 opened recipes (LRU)
};

const KEYS = {
    FEED: 'culina_feed_cache',
    VISITED: 'culina_visited_cache',
    USER: 'culina_user_session'
};

/**
 * Safe LocalStorage Wrapper with Quota Management
 */
export const CacheManager = {
    // --- GENERIC HELPERS ---
    get: (key) => {
        if (typeof window === 'undefined') return null;
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error(`Error reading ${key}`, e);
            return null;
        }
    },

    set: (key, data) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn(`Quota exceeded saving ${key}`, e);
            // Optional: Strategy to clear space if quota exceeded?
            // For now, simple warn.
        }
    },

    // --- FEED MANAGEMENT (Sequential/Scroll) ---
    saveFeed: (recipes, nextCursor, hasMore) => {
        try {
            // Logic: We want to save the "latest" items the user has scrolled.
            // But we shouldn't keep infinite.
            // If the list is > LIMIT, trim from the BEGINNING? No, usually users lose top context.
            // Actually, in infinite scroll, the "top" is the first loaded.
            // If we trim the top, the user can't scroll up.
            // If we trim the bottom, the user loses where they were.
            // Strategy: Keep the first N items (most relevant/newest usually) OR just slice.

            // Current simple strategy: Slice to max limit.
            const limitedRecipes = recipes.slice(0, LIMITS.FEED_MAX_ITEMS);

            const payload = {
                timestamp: Date.now(),
                recipes: limitedRecipes,
                nextCursor,
                hasMore
            };

            CacheManager.set(KEYS.FEED, payload);

        } catch (e) {
            console.error("Error saving feed", e);
        }
    },

    getFeed: () => {
        return CacheManager.get(KEYS.FEED);
    },

    // --- VISITED RECIPES (Random Access / LRU) ---
    saveVisitedRecipe: (recipe) => {
        if (!recipe || !recipe.id) return;

        try {
            const currentCache = CacheManager.get(KEYS.VISITED) || [];

            // LRU Logic: Remove if exists, then add to front (newest)
            const filtered = currentCache.filter(r => String(r.id) !== String(recipe.id));

            const newCache = [recipe, ...filtered];

            // Enforce Limit
            if (newCache.length > LIMITS.VISITED_MAX_ITEMS) {
                newCache.length = LIMITS.VISITED_MAX_ITEMS; // Trim end (oldest)
            }

            CacheManager.set(KEYS.VISITED, newCache);
            console.log(`[Cache] Saved visited recipe: ${recipe.name} (${newCache.length}/${LIMITS.VISITED_MAX_ITEMS})`);

        } catch (e) {
            console.error("Error saving visited recipe", e);
        }
    },

    getVisitedRecipe: (id) => {
        const cache = CacheManager.get(KEYS.VISITED);
        if (!cache) return null;
        return cache.find(r => String(r.id) === String(id));
    },

    // --- CLEARING ---
    clearAll: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(KEYS.FEED);
        localStorage.removeItem(KEYS.VISITED);
        // Do NOT clear user session usually, unless explicit logout
    },

    getStats: () => {
        const feed = CacheManager.get(KEYS.FEED);
        const visited = CacheManager.get(KEYS.VISITED);
        return {
            feedCount: feed?.recipes?.length || 0,
            visitedCount: visited?.length || 0,
            feedLimit: LIMITS.FEED_MAX_ITEMS,
            visitedLimit: LIMITS.VISITED_MAX_ITEMS
        };
    }
};
