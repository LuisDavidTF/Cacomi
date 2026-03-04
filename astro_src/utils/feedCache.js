/**
 * Utility to manage the Recipe Feed Cache in LocalStorage.
 * Key used: 'culina_feed_cache'
 */

const STORAGE_KEY = 'culina_feed_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 Minutes

export const feedCache = {
    get() {
        if (typeof window === 'undefined') return null;
        try {
            const cachedString = localStorage.getItem(STORAGE_KEY);
            if (!cachedString) return null;

            const cached = JSON.parse(cachedString);

            // SMART TTL STRATEGY:
            // 1. If Online: Enforce CACHE_DURATION. If expired, clear and return null (force fetch).
            // 2. If Offline: Ignore expiration. Return data to ensure availability.

            const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
            const isExpired = (Date.now() - (cached.timestamp || 0)) > CACHE_DURATION;

            if (isOnline && isExpired) {
                console.log('[Cache] Data expired and user is online. Clearing cache.');
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }

            if (!isOnline && isExpired) {
                console.log('[Cache] Data expired but user is OFFLINE. Using stale data.');
            }

            return cached;
        } catch (e) {
            console.error("Failed to load feed from storage", e);
            return null;
        }
    },

    set(data) {
        if (typeof window === 'undefined') return;
        try {
            // Ensure we save the timestamp
            const payload = { ...data, timestamp: Date.now() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
            console.warn("Quota exceeded or error saving to localStorage", e);
        }
    },

    /**
     * Updates a single recipe in the cache if it exists.
     * @param {Object} updatedRecipe - The full recipe object with updated data.
     */
    updateRecipe(updatedRecipe) {
        if (!updatedRecipe?.id) return;

        // We call get() to benefit from validation (though if expired online, we might lose the cache here, which is fine)
        const cache = this.get();
        if (!cache || !cache.recipes || cache.recipes.length === 0) return;

        const index = cache.recipes.findIndex(r => r.id === updatedRecipe.id);

        if (index !== -1) {
            // Update the recipe in the array
            cache.recipes[index] = { ...cache.recipes[index], ...updatedRecipe };

            // Note: We deliberately update the timestamp here.
            // This signals "activity" and keeps the cache fresh for another window.
            this.set(cache);
            console.log(`[Cache] Updated recipe ${updatedRecipe.id} in local storage.`);
        }
    },

    /**
     * Removes a recipe from the cache by ID.
     * @param {string|number} recipeId 
     */
    removeRecipe(recipeId) {
        if (!recipeId) return;

        const cache = this.get();
        if (!cache || !cache.recipes) return;

        const initialLength = cache.recipes.length;
        const filteredRecipes = cache.recipes.filter(r => r.id !== recipeId);

        if (filteredRecipes.length < initialLength) {
            cache.recipes = filteredRecipes;
            // Update to save changes
            this.set(cache);
            console.log(`[Cache] Removed recipe ${recipeId} from local storage.`);
        }
    }
};
