import Dexie, { type EntityTable } from 'dexie';

export interface LocalPantryItem {
    id: string; // React String UUIDv7
    ingredientId: number | null;
    ingredientName: string; // Ingredient name for display
    quantity: number;
    unitType: 'g' | 'ml' | 'pz' | string;
    expirationDate?: string | null; // ISO Date YYYY-MM-DD
    addedDate?: string | null;
    isSynced: number; // 0 or 1
    isDeleted: number; // 0 or 1
    isNew: number; // 0 or 1
}

export type { LocalPantryItem as PantryItemType };

// Extend Dexie class to handle typescript properly for specific tables
const db = new Dexie('CacomiPlannerDB_v2') as Dexie & {
    pantryItems: EntityTable<LocalPantryItem, 'id'>;
};

// Schema registration
db.version(3).stores({
    pantryItems: 'id, ingredientId, isSynced, isDeleted'
});

export { db };

