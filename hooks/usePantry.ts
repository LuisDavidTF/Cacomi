import { useLiveQuery } from 'dexie-react-hooks';
import { db, type LocalPantryItem } from '@/lib/db';
import { useEffect, useRef, useCallback } from 'react';
import { useApiClient } from './useApiClient';

export function usePantry() {
    const items = useLiveQuery(() => db.pantryItems.toArray());
    const { syncPantry } = useApiClient();
    const syncDebounceRef = useRef<NodeJS.Timeout>(null);

    const syncToBackend = useCallback(async () => {
        try {
            if (!navigator.onLine) {
                console.log('Offline: Skipping sync.');
                return;
            }
            const currentItems = await db.pantryItems.toArray();
            await syncPantry(currentItems.map(item => ({
                ingredientId: item.ingredientId,
                quantity: item.quantity,
                unit: item.unit,
                expirationDate: item.expirationDate
            })));
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }, [syncPantry]);

    const scheduleSync = useCallback(() => {
        if (syncDebounceRef.current) {
            clearTimeout(syncDebounceRef.current);
        }
        syncDebounceRef.current = setTimeout(() => {
            syncToBackend();
        }, 4000); // 4 seconds debounce
    }, [syncToBackend]);

    const addItem = async (item: Omit<LocalPantryItem, 'id' | 'isSynced'>) => {
        try {
            await db.pantryItems.add({
                ...item,
                isSynced: false,
            });
            scheduleSync();
        } catch (error) {
            console.error('Failed to add item to pantry:', error);
            throw error;
        }
    };

    const updateItem = async (id: number, updates: Partial<LocalPantryItem>) => {
        try {
            await db.pantryItems.update(id, {
                ...updates,
                isSynced: false
            });
            scheduleSync();
        } catch (error) {
            console.error('Failed to update pantry item:', error);
            throw error;
        }
    };

    const removeItem = async (id: number) => {
        try {
            await db.pantryItems.delete(id);
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
            const response = await fetch('/api/pantry');
            if (response.ok) {
                const data = await response.json();
                if (data.items && Array.isArray(data.items)) {
                    // Clear and replace with backend data to ensure sync
                    await db.pantryItems.clear();
                    await db.pantryItems.bulkAdd(data.items.map((item: any) => ({
                        ...item,
                        isSynced: true
                    })));
                }
            }
        } catch (error) {
            console.error('Initial sync failed:', error);
        }
    };

    // Bootstrapping: Check if local DB is empty, if so, try to sync from backend
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

        const handleOnline = () => {
            console.log('Back online: Triggering sync...');
            syncToBackend();
        };
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [syncToBackend]);

    return {
        items: items || [],
        isLoading: items === undefined,
        addItem,
        updateItem,
        removeItem,
        getItemsByIngredient,
        syncFromBackend
    };
}
