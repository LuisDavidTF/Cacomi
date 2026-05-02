import { db } from '@/lib/db';

/**
 * StorageHelper
 * Utility to calculate and manage offline storage usage across different systems:
 * - LocalStorage (CacheManager, Session)
 * - Dexie (Pantry, Recipes, Planner)
 * - Cache API (App Shell, Cached Pages)
 */
export const StorageHelper = {
    /**
     * Estimates size of an object in bytes
     */
    estimateSize: (obj) => {
        try {
            const str = JSON.stringify(obj);
            return new TextEncoder().encode(str).length;
        } catch (e) {
            return 0;
        }
    },

    /**
     * Gets LocalStorage usage for specific keys
     */
    getLocalStorageUsage: () => {
        if (typeof window === 'undefined') return { total: 0, items: [] };
        
        const keys = Object.keys(localStorage);
        let total = 0;
        const details = keys.map(key => {
            const size = localStorage.getItem(key)?.length || 0;
            total += size;
            return { key, size };
        });

        return { total, details };
    },

    /**
     * Gets Dexie usage for each table
     */
    getDexieUsage: async () => {
        const usage = {
            total: 0,
            tables: {}
        };

        try {
            const tableNames = db.tables.map(t => t.name);
            for (const name of tableNames) {
                const items = await db.table(name).toArray();
                let tableSize = 0;
                items.forEach(item => {
                    tableSize += StorageHelper.estimateSize(item);
                });
                usage.tables[name] = tableSize;
                usage.total += tableSize;
            }
        } catch (e) {
            console.error("Error calculating Dexie usage", e);
        }

        return usage;
    },

    /**
     * Gets Cache API usage
     */
    getCacheApiUsage: async () => {
        if (typeof window === 'undefined' || !('caches' in window)) return { total: 0, caches: {} };
        
        const usage = { total: 0, caches: {} };
        try {
            const cacheNames = await caches.keys();
            for (const name of cacheNames) {
                const cache = await caches.open(name);
                const keys = await cache.keys();
                let cacheSize = 0;
                
                // We estimate by summing blob sizes (can be slow if many items)
                for (const key of keys) {
                    const response = await cache.match(key);
                    if (response) {
                        const blob = await response.blob();
                        cacheSize += blob.size;
                    }
                }
                
                usage.caches[name] = cacheSize;
                usage.total += cacheSize;
            }
        } catch (e) {
            console.warn("Cache API estimation failed", e);
        }
        return usage;
    },

    /**
     * Gets full breakdown of storage
     */
    getStorageBreakdown: async () => {
        const ls = StorageHelper.getLocalStorageUsage();
        const dx = await StorageHelper.getDexieUsage();
        const ca = await StorageHelper.getCacheApiUsage();

        const total = ls.total + dx.total + ca.total;

        return {
            total,
            categories: {
                app: ca.total + (ls.details.find(d => d.key.includes('session'))?.size || 0),
                pantry: dx.tables.pantryItems || 0,
                recipes: (dx.tables.savedRecipes || 0) + (ls.details.find(d => d.key.includes('feed'))?.size || 0) + (ls.details.find(d => d.key.includes('visited'))?.size || 0),
                planner: (dx.tables.plannedMeals || 0) + (dx.tables.planMetadata || 0),
            },
            raw: { ls, dx, ca }
        };
    },

    /**
     * Clear specific storage sections
     */
    clearCategory: async (category) => {
        switch (category) {
            case 'pantry':
                await db.pantryItems.clear();
                break;
            case 'recipes':
                await db.savedRecipes.clear();
                // Also clear CacheManager feed/visited
                localStorage.removeItem('Cacomi_feed_cache');
                localStorage.removeItem('Cacomi_visited_cache');
                break;
            case 'planner':
                await db.plannedMeals.clear();
                await db.planMetadata.clear();
                break;
            default:
                console.warn("Unknown category to clear", category);
        }
    },

    formatBytes: (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
};
