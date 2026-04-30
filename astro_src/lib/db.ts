import Dexie, { type EntityTable } from 'dexie';
import type { PlanResponse, Meal } from '@/types/planner';

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

export interface LocalPlannedMeal extends Meal {
    id: string; // Local UUIDv7
    planId?: number | null;
    isSynced: number; // 0 or 1
    isDeleted: number; // 0 or 1
    isNew: number; // 0 or 1
}

export interface LocalPlanMetadata extends Omit<PlanResponse, 'meals'> {
    lastUpdated: string;
    isActive: number; // 0 or 1 (Active backend plan)
}

export type { LocalPantryItem as PantryItemType };

// Extend Dexie class to handle typescript properly for specific tables
const db = new Dexie('CacomiPlannerDB_v2') as Dexie & {
    pantryItems: EntityTable<LocalPantryItem, 'id'>;
    plannedMeals: EntityTable<LocalPlannedMeal, 'id'>;
    planMetadata: EntityTable<LocalPlanMetadata, 'planId'>;
};

// Schema registration
db.version(7).stores({
    pantryItems: 'id, ingredientId, isSynced, isDeleted',
    plannedMeals: 'id, planId, mealDate, mealType, isSynced, isDeleted, isPinned',
    planMetadata: 'planId, isActive'
});

export { db };

