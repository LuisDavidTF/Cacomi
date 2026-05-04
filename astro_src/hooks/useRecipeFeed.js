import { useState, useRef, useCallback, useEffect } from 'react';
import { useApiClient } from '@hooks/useApiClient';
import { useToast } from '@context/ToastContext';
import { useSettings } from '@context/SettingsContext';
import { feedCache } from '@utils/feedCache';

/**
 * Custom hook to handle recipe fetching, pagination, and infinite scroll logic.
 * Separation of Concerns: Keeps the UI component clean and focused on presentation.
 */
const STORAGE_KEY = 'Cacomi_feed_cache';

export function useRecipeFeed({ initialData, forceSavedMode = false } = {}) {
    // Helper to load from storage safely
    // const loadFromStorage = () => { ... } // Replaced by feedCache.get()

    // Initialize state
    // Priority: 1. SSR Initial Data (Fresh) -> 2. LocalStorage (Offline/Back) -> 3. Empty
    const cachedData = feedCache.get();

    // HEURISTIC: If we have SSR data, we us usually prefer it. 
    // BUT if we are offline (network error likely on client hydration) or if the user expects to see their previous scroll position...
    // Actually, for a social feed, "Fresh" is usually better on reload. 
    // However, if SSR failed (empty data) or if we want to restore previous deep scroll state...
    // Let's implement this: Use SSR data if valid. If SSR is empty (error/no content), try Cache.

    // Actually, simpler:
    // Initialize with SSR data. 
    // If SSR data is empty, check cache immediately in an effect.

    const initialRecipes = initialData?.data || [];
    const initialCursor = initialData?.meta?.nextCursor || initialData?.nextCursor || null;

    const [status, setStatus] = useState(initialRecipes.length > 0 ? 'success' : 'loading');
    const [recipes, setRecipes] = useState(initialRecipes);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSlowLoadMessage, setShowSlowLoadMessage] = useState(false);

    // Pagination
    const [nextCursor, setNextCursor] = useState(initialCursor);
    const [hasMore, setHasMore] = useState(forceSavedMode ? false : (!!initialCursor || initialRecipes.length === 0));
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isErrorLoadingMore, setIsErrorLoadingMore] = useState(false);

    const initialFetchedRef = useRef(initialRecipes.length > 0);
    const api = useApiClient();
    const { showToast } = useToast();
    const { t } = useSettings();

    // Refs for tracking state
    const stateRef = useRef({ isLoadingMore, hasMore, nextCursor, isErrorLoadingMore });
    stateRef.current = { isLoadingMore, hasMore, nextCursor, isErrorLoadingMore };

    // SAVE TO STORAGE EFFECT
    useEffect(() => {
        // Only save if we have data.
        if (recipes.length > 0) {
            try {
                // READ BEFORE WRITE:
                // If we are currently showing 10 recipes (e.g. after a refresh where we only fetched page 1),
                // but the cache has 50 recipes, WE SHOULD NOT OVERWRITE with 10.
                // UNLESS the user explicitly refreshed (handled by clearing cache or explicit action).

                const currentCache = feedCache.get();
                const cachedCount = currentCache?.recipes?.length || 0;

                // If current state has FEWER or EQUAL recipes than cache, AND we are just starting up (isLoadingMore is false),
                // we might be in a "Partial Load" state.
                // However, if we just fetched more, we want to save.

                // Simple Logic: ALWAYS SAVE MAX.
                // If current recipes > cached recipes -> SAVE.
                // If current recipes < cached recipes -> DO NOT SAVE (preserve cache), UNLESS we are sure it's a "reset".

                // BETTER: The component should have initialized with the cache if it was larger.
                // If it didn't (e.g. SSR provided page 1), we should have merged in the Init effect.

                // Let's rely on the Init effect to have done its job. 
                // But as a safety net: Only save if recipes.length >= cachedCount OR if we explicitly want to overwrite (not easy to know).
                // Let's just save if we have data, but relies on proper initialization to not lose it.

                if (recipes.length >= cachedCount) {
                    const cachePayload = {
                        timestamp: Date.now(),
                        recipes,
                        nextCursor,
                        hasMore
                    };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachePayload));
                }
            } catch (e) {
                console.warn("Quota exceeded for localStorage", e);
            }
        }
    }, [recipes, nextCursor, hasMore]);

    // RESTORE / MERGE FROM STORAGE EFFECT
    useEffect(() => {
        // This runs on mount.
        const cached = feedCache.get();

        if (cached && cached.recipes?.length > 0) {
            setRecipes(currentRecipes => {
                // 1. If we have NO current recipes (SSR failed/empty), use cache fully.
                if (currentRecipes.length === 0) {
                    console.log('Restoring full feed from cache (SSR empty)');
                    // Restore cursor state too since we are adopting the full cache
                    setNextCursor(cached.nextCursor);
                    setHasMore(forceSavedMode ? false : cached.hasMore);
                    setStatus('success');
                    return cached.recipes;
                }

                // 2. If we HAVE recipes (SSR Page 1), MERGE with cache.
                // Strategy: Keep SSR data as "Truth" for Page 1. Append cached items that are NOT in SSR data.
                // This ensures we show updated content ("Pasta v2") instead of stale cache ("Pasta v1"),
                // while preserving the scroll history (Page 2-5) if it exists.

                // If cache has fewer items than current, strictly ignoring cache might be better?
                // But usually cache has MORE (history).
                // Example: SSR=10, Cache=50. Result=50 (10 updated + 40 old).

                const freshIds = new Set(currentRecipes.map(r => r.id));
                const uniqueCached = cached.recipes.filter(r => !freshIds.has(r.id));

                if (uniqueCached.length > 0) {
                    console.log(`Merging Cache: Keeping ${currentRecipes.length} fresh, appending ${uniqueCached.length} from cache.`);
                    // We expanded the list, so we should trust the CACHE's pagination state (nextCursor) 
                    // because it corresponds to the longer list.
                    setNextCursor(cached.nextCursor);
                    setHasMore(forceSavedMode ? false : cached.hasMore);
                    return [...currentRecipes, ...uniqueCached];
                }

                return currentRecipes;
            });
        }
    }, []); // Run once on mount

    // LISTEN FOR INITIAL DATA UPDATES (e.g. router.refresh())
    // When props change, we want to update the "Top" of the list with the new fresh data.
    useEffect(() => {
        if (!forceSavedMode && initialData?.data && initialData.data.length > 0) {
            setRecipes(prev => {
                const fresh = initialData.data;
                const freshIds = new Set(fresh.map(r => r.id));

                // If we are effectively just replacing Page 1, perform the same Merge logic:
                // New Page 1 + (Old List - items in New Page 1)
                const uniqueOld = prev.filter(r => !freshIds.has(r.id));
                return [...fresh, ...uniqueOld];
            });
            // Note: We generally don't reset pagination cursor here because we might have 10 pages loaded.
            // Replacing Page 1 shouldn't invalidate the cursor for Page 10.
            // Exception: If nextCursor changed in a way that implies a reset? 
            // For now, preserving existing cursor is safest for "Update" actions.
        }
    }, [initialData]);

    // Slow Load Message
    useEffect(() => {
        let timer;
        if (status === 'loading') {
            timer = setTimeout(() => {
                setStatus(current => {
                    if (current === 'loading') setShowSlowLoadMessage(true);
                    return current;
                });
            }, 3000);
        } else {
            setShowSlowLoadMessage(false);
        }
        return () => clearTimeout(timer);
    }, [status]);

    // Initial Fetch (Client-side fallback)
    const fetchInitialRecipes = useCallback(async () => {
        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await api.getRecipes();

            // Safety: If API returns empty and we have a cache, maybe keep cache? 
            // For now, let's treat API as truth. 
            // But if API throws error (offline), we handled that in catch.
            const data = response.data || [];
            const nextCursor = response.meta?.nextCursor || null;

            setRecipes(data);
            setNextCursor(nextCursor);
            setHasMore(!!nextCursor && data.length > 0);
            setStatus('success');
        } catch (error) {
            // ERROR HANDLING WITH FALLBACK
            console.error("Fetch initial failed", error);

            // Try to recover from storage if we haven't already
            const cached = feedCache.get();
            if (cached && cached.recipes?.length > 0) {
                setRecipes(cached.recipes);
                setNextCursor(cached.nextCursor);
                setHasMore(cached.hasMore);
                setStatus('success'); // Show success because we have content
                showToast(t.common?.offlineMode || 'Modo Offline: Mostrando recetas guardadas.', 'info');
            } else {
                setErrorMessage(error.message || t.feed?.error || 'Error al cargar recetas');
                setStatus('error');
            }
        }
    }, [api, showToast]);

    // Infinite Scroll Fetch
    const fetchMoreRecipes = useCallback(async () => {
        // Prevent API calls if loading, no more items, in error state, OFFLINE, or in saved mode
        const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
        if (stateRef.current.isLoadingMore || !stateRef.current.hasMore || stateRef.current.isErrorLoadingMore || isOffline || forceSavedMode) return;

        setIsLoadingMore(true);
        try {
            const params = {};
            // New API uses a single string cursor
            if (stateRef.current.nextCursor) {
                params.cursor = stateRef.current.nextCursor;
            }

            const response = await api.getRecipes(params);

            // Handle new response structure { data, meta }
            const newRecipes = response.data || [];
            const newNextCursor = response.meta?.nextCursor || null;

            setRecipes(prev => {
                const newIds = new Set(prev.map(r => r.id));
                const unique = newRecipes.filter(r => !newIds.has(r.id));
                return [...prev, ...unique];
            });

            setNextCursor(newNextCursor);
            setHasMore(!!newNextCursor && newRecipes.length > 0);
        } catch (error) {
            setIsErrorLoadingMore(true);

            // Try explicit cache check for next page? 
            // If useApiClient handled it, we might get data back.
            // If useApiClient threw, then we really failed.
            console.error("Fetch more failed:", error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [api]);

    const retryLoadMore = useCallback(() => {
        setIsErrorLoadingMore(false);
        fetchMoreRecipes();
    }, [fetchMoreRecipes]);

    const removeRecipe = useCallback((id) => {
        setRecipes(prev => prev.filter(r => r.id !== id));
        feedCache.removeRecipe(id); // Explicitly update cache on delete
    }, []);

    // Initial load effect
    useEffect(() => {
        if (!forceSavedMode && !initialFetchedRef.current && recipes.length === 0) {
            fetchInitialRecipes();
        }
    }, [fetchInitialRecipes, recipes.length, forceSavedMode]);

    return {
        recipes,
        status,
        errorMessage,
        showSlowLoadMessage,
        hasMore,
        isLoadingMore,
        isErrorLoadingMore,
        retryLoadMore,
        fetchMoreRecipes,
        fetchInitialRecipes,
        removeRecipe
    };
}

