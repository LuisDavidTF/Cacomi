import { useLiveQuery } from 'dexie-react-hooks';
import { db, type LocalPantryItem } from '@/lib/db';
import { useAuth } from '@context/AuthContext';
import type { SyncStatus } from '@components/pantry/PantryStatusHeader';
import { useEffect, useRef, useCallback, useState } from 'react';
import { generateUUIDv7 } from '@/lib/utils';

export function usePantry() {
    const { user, isAuthenticated, fetchAuth } = useAuth();
    const items = useLiveQuery(
        () => db.pantryItems.where('isDeleted').equals(0).toArray()
    );
    const [isSyncing, setIsSyncing] = useState(false);
    const isSyncingRef = useRef(false);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
    const [syncCountdown, setSyncCountdown] = useState<number | null>(null);
    const syncDebounceRef = useRef<NodeJS.Timeout | null>(null);
    const syncCountdownRef = useRef<NodeJS.Timeout | null>(null);
    const isSyncPaused = useRef(false);
    const isUnmounting = useRef(false);
    // Stable refs — always point to the latest version of these callbacks.
    // Used inside setTimeout/setInterval closures to avoid stale-closure bugs.
    const syncToBackendRef = useRef<() => Promise<void>>(async () => { });
    const scheduleSyncRef = useRef<() => void>(() => { });

    // Recalculates visual status.
    // Uses isSyncingRef instead of isSyncing state to avoid being included in
    // updateStatusState's dependency array, which would otherwise cause
    // syncToBackend (which depends on updateStatusState) to be re-created on
    // every sync tick — triggering the bootstrap useEffect in a loop.
    const updateStatusState = useCallback(async () => {
        if (!isAuthenticated) {
            setSyncStatus('local');
            return;
        }
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            setSyncStatus('offline');
            return;
        }
        if (isSyncingRef.current) {
            setSyncStatus('syncing');
            return;
        }
        try {
            const pendingChanges = await db.pantryItems.where('isSynced').equals(0).toArray();
            if (pendingChanges.length > 0) {
                setSyncStatus('pending');
            } else {
                setSyncStatus('synced');
            }
        } catch (e) {
            setSyncStatus('synced'); // Default to synced on error checking status
        }
    }, [isAuthenticated]);

    const syncToBackend = useCallback(async () => {
        if (!isAuthenticated) return;
        if (typeof navigator !== 'undefined' && !navigator.onLine) return;

        try {
            isSyncingRef.current = true;
            setIsSyncing(true);
            setSyncStatus('syncing');

            const pendingChanges = await db.pantryItems.where('isSynced').equals(0).toArray();

            if (pendingChanges.length > 0) {
                const validChanges = pendingChanges.map((change) => {
                    const { isSynced, isNew, isDeleted, ...rest } = change;
                    return {
                        ...rest,
                        isNew: isNew === 1,
                        isDeleted: isDeleted === 1
                    };
                });

                const response = await fetchAuth('/api/pantry', {
                    method: 'POST',
                    body: { changes: validChanges }
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.items && Array.isArray(data.items)) {
                        // Absolute truth: replace Dexie with server state
                        await db.pantryItems.clear();
                        await db.pantryItems.bulkAdd(data.items.map((item: any) => ({
                            ...item,
                            isSynced: 1,
                            isDeleted: 0,
                            isNew: 0
                        })));
                    } else {
                        // Backend acknowledged sync but didn't return canonical list.
                        // Manually mark pending changes as resolved in Dexie.
                        console.log('Pantry sync: no data.items in response, marking changes as synced locally');
                        await Promise.all(pendingChanges.map(change => {
                            if (change.isDeleted === 1) {
                                return db.pantryItems.delete(change.id!);
                            } else {
                                return db.pantryItems.update(change.id!, { isSynced: 1, isNew: 0 });
                            }
                        }));
                    }
                } else {
                    console.error('Pantry sync failed with status:', response.status);
                }
            }
        } catch (error) {
            console.error('Pantry sync failed:', error);
        } finally {
            isSyncingRef.current = false;
            setIsSyncing(false);
            updateStatusState();
        }
    }, [isAuthenticated, updateStatusState]);




    // Track unmount and force sync.
    // IMPORTANT: This must use [] deps, not [syncToBackend].
    // If we use [syncToBackend] as deps, the cleanup (which sets isUnmounting=true)
    // will fire every time syncToBackend recreates (e.g. when isAuthenticated changes
    // false→true on session load), permanently blocking all future syncs.
    useEffect(() => {
        return () => {
            isUnmounting.current = true;
            if (syncDebounceRef.current) {
                clearTimeout(syncDebounceRef.current);
                // Force an immediate sync dump if we leave the page before timer finishes.
                // Use ref so we always call the latest version.
                syncToBackendRef.current();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // Watch items/auth/syncing changes to update status indicator instantly
    useEffect(() => { updateStatusState(); }, [items, isAuthenticated, isSyncing, updateStatusState]);

    // Update status on online/offline events
    useEffect(() => {
        const handleOnline = () => { updateStatusState(); };
        const handleOffline = () => { updateStatusState(); };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [updateStatusState]);


    const SYNC_DELAY_MS = 4000;

    const scheduleSync = useCallback(() => {
        if (!isAuthenticated) {
            console.log("Pantry: Sync skipped (Not authenticated)");
            return;
        }

        // Clear any existing debounce and countdown
        if (syncDebounceRef.current) {
            clearTimeout(syncDebounceRef.current);
            syncDebounceRef.current = null;
        }
        if (syncCountdownRef.current) {
            clearInterval(syncCountdownRef.current);
            syncCountdownRef.current = null;
        }

        if (isSyncPaused.current) {
            console.log("Pantry: Sync paused (User interacting with UI)");
            return;
        }

        const delaySecs = SYNC_DELAY_MS / 1000;
        setSyncCountdown(delaySecs);
        console.log(`Pantry: Sync scheduled (${delaySecs}s delay)`);

        // Visual countdown (ticks every 1s)
        let remaining = delaySecs - 1;
        syncCountdownRef.current = setInterval(() => {
            setSyncCountdown(remaining);
            remaining--;
            if (remaining < 0) {
                clearInterval(syncCountdownRef.current!);
                syncCountdownRef.current = null;
            }
        }, 1000);

        syncDebounceRef.current = setTimeout(() => {
            if (!isUnmounting.current && !isSyncPaused.current) {
                setSyncCountdown(null);
                syncToBackendRef.current();
            } else {
                console.log("Pantry: Sync cancelled (Unmounting or Paused)");
                setSyncCountdown(null);
            }
            syncDebounceRef.current = null;
        }, SYNC_DELAY_MS);
    }, [isAuthenticated]);

    const pauseSync = useCallback(() => {
        isSyncPaused.current = true;
        if (syncDebounceRef.current) {
            clearTimeout(syncDebounceRef.current);
            syncDebounceRef.current = null;
        }
        if (syncCountdownRef.current) {
            clearInterval(syncCountdownRef.current);
            syncCountdownRef.current = null;
        }
        setSyncCountdown(null);
    }, []);

    const resumeSync = useCallback(() => {
        console.log("Pantry: Resuming sync");
        isSyncPaused.current = false;
        scheduleSync();
    }, [scheduleSync]);

    const addItem = async (item: Omit<LocalPantryItem, 'id' | 'isSynced' | 'isDeleted' | 'isNew'>) => {
        try {
            await db.pantryItems.add({
                ...item,
                id: generateUUIDv7(),
                isSynced: 0,
                isDeleted: 0,
                isNew: 1
            });
            scheduleSync();
        } catch (error) {
            console.error('Failed to add item to pantry:', error);
            throw error;
        }
    };

    const updateItem = async (id: string, updates: Partial<LocalPantryItem>) => {
        try {
            await db.pantryItems.update(id, {
                ...updates,
                isSynced: 0
            });
            scheduleSync();
        } catch (error) {
            console.error('Failed to update pantry item:', error);
            throw error;
        }
    };

    const removeItem = async (id: string) => {
        try {
            const item = await db.pantryItems.get(id);
            if (item && item.isNew === 1) {
                // Rule: "si es isDeleted y tambien es isNew se borra localmente y no se envia ese item."
                await db.pantryItems.delete(id);
            } else {
                await db.pantryItems.update(id, {
                    isDeleted: 1,
                    isSynced: 0
                });
            }
            scheduleSync();
        } catch (error) {
            console.error('Failed to delete pantry item:', error);
            throw error;
        }
    };

    // Helper to get items by ingredient ID (handling multiple batches)
    const getItemsByIngredient = async (ingredientId: number) => {
        return await db.pantryItems.where('ingredientId').equals(ingredientId).toArray();
    };

    const syncFromBackend = async () => {
        try {
            console.log('Bootstrapping: Syncing pantry from backend...');
            const response = await fetchAuth('/api/pantry');
            if (response.ok) {
                const data = await response.json();
                if (data.items && Array.isArray(data.items)) {
                    // Clear and replace with backend data to ensure sync
                    await db.pantryItems.clear();
                    await db.pantryItems.bulkAdd(data.items.map((item: any) => ({
                        ...item,
                        isSynced: 1,
                        isDeleted: 0,
                        isNew: 0
                    })));
                }
            }
        } catch (error) {
            console.error('Initial sync failed:', error);
        }
    };

    // Keep stable refs up-to-date after each render
    useEffect(() => { syncToBackendRef.current = syncToBackend; }, [syncToBackend]);
    useEffect(() => { scheduleSyncRef.current = scheduleSync; }, [scheduleSync]);

    // Bootstrapping: Check if local DB is empty. Runs only once on mount.
    useEffect(() => {
        const init = async () => {
            try {
                const count = await db.pantryItems.count();
                if (count === 0 && typeof navigator !== 'undefined' && navigator.onLine) {
                    await syncFromBackend();
                }
            } catch (error) {
                console.error('Bootstrapping failed:', error);
            }
        };
        init();

        // Use scheduleSync (debounced) instead of syncToBackend directly so we
        // don't fire multiple concurrent requests if the browser fires 'online'
        // several times in quick succession.
        const handleOnline = () => {
            console.log('Back online: Scheduling sync...');
            scheduleSyncRef.current();
        };
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Run Sync on Login Transition
    const prevAuthRef = useRef(isAuthenticated);
    useEffect(() => {
        if (!prevAuthRef.current && isAuthenticated) {
            // Transition off -> on (Login!). Flush everything to backend immediately
            console.log("User logged in! Triggering guest-data flush...");
            syncToBackend();
        }
        prevAuthRef.current = isAuthenticated;
    }, [isAuthenticated, syncToBackend]);

    return {
        items: items || [],
        isLoading: items === undefined,
        syncStatus,
        syncCountdown,
        addItem,
        updateItem,
        removeItem,
        getItemsByIngredient,
        syncFromBackend,
        pauseSync,
        resumeSync
    };
}
