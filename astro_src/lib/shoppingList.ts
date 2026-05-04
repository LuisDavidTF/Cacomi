import { db } from './db';

export interface ShoppingListItem {
    name: string;
    canonicalName: string;
    quantityNeeded: number;
    quantityInPantry: number;
    unit: string;
    status: 'IN_PANTRY' | 'PARTIAL' | 'NEED_TO_BUY';
    variants?: { name: string, quantity: number, unit: string }[];
}

const NOISE_WORDS = [
    'extra', 'virgen', 'fresco', 'fresca', 'molido', 'molida', 'picado', 'picada', 
    'hervida', 'hervido', 'tibia', 'tibio', 'fria', 'frio', 'caliente', 
    'en polvo', 'seco', 'seca', 'deshidratado', 'deshidratada', 
    'orgánico', 'orgánica', 'natural', 'entero', 'entera'
];

/**
 * Normalizes ingredient names to a "canonical" version for grouping
 */
export function getCanonicalName(name: string): string {
    let clean = name.toLowerCase().trim();
    
    // Remove "de", "con", "en" if they are at the start or between words
    // but be careful not to break names like "Aceite de oliva"
    
    // Remove specific noise words
    NOISE_WORDS.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        clean = clean.replace(regex, '');
    });

    // Remove double spaces and trim again
    return clean.replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes unit strings for comparison
 */
export function normalizeUnit(unit: string): string {
    const u = unit?.toLowerCase().trim() || '';
    if (['gramos', 'gramo', 'g', 'gr', 'grs'].includes(u)) return 'g';
    if (['kilogramos', 'kilogramo', 'kg', 'kgs'].includes(u)) return 'kg';
    if (['mililitros', 'mililitro', 'ml', 'mls'].includes(u)) return 'ml';
    if (['litros', 'litro', 'l', 'lt', 'lts'].includes(u)) return 'L';
    if (['piezas', 'pieza', 'pza', 'pzas', 'pz', 'u', 'unidad', 'unidades', 'piezas'].includes(u)) return 'pz';
    if (['cucharada', 'cucharadas', 'tbsp', 'cda', 'cdas'].includes(u)) return 'tbsp';
    if (['cucharadita', 'cucharaditas', 'tsp', 'cdta', 'cdtas'].includes(u)) return 'tsp';
    if (['taza', 'tazas', 'cup', 'cups'].includes(u)) return 'cup';
    return u;
}

/**
 * Converts quantity to a base unit for internal calculation
 * Base units: 'g' for mass, 'ml' for volume, 'pz' for units
 */
export function convertToBaseUnit(quantity: number, unit: string): { q: number, u: 'g' | 'ml' | 'pz' | string } {
    const n = normalizeUnit(unit);
    if (n === 'kg') return { q: quantity * 1000, u: 'g' };
    if (n === 'L') return { q: quantity * 1000, u: 'ml' };
    if (n === 'tbsp') return { q: quantity * 15, u: 'ml' };
    if (n === 'tsp') return { q: quantity * 5, u: 'ml' };
    if (n === 'cup') return { q: quantity * 240, u: 'ml' };
    return { q: quantity, u: n };
}

/**
 * Formats base units back to human-readable units
 */
export function formatFromBaseUnit(quantity: number, unit: string): { q: number, u: string } {
    if (unit === 'ml' && quantity >= 1000) return { q: quantity / 1000, u: 'L' };
    if (unit === 'g' && quantity >= 1000) return { q: quantity / 1000, u: 'kg' };
    return { q: quantity, u: unit };
}

/**
 * Converts units to a base unit for calculation if possible (g/kg, ml/L)
 */
function toBaseUnit(quantity: number, unit: string): { q: number, u: string } {
    const normalized = normalizeUnit(unit);
    if (normalized === 'kg') return { q: quantity * 1000, u: 'g' };
    if (normalized === 'L') return { q: quantity * 1000, u: 'ml' };
    return { q: quantity, u: normalized };
}

/**
 * Aggregates ingredients from multiple recipes and compares with pantry
 */
export async function generateShoppingList(meals: any[]): Promise<ShoppingListItem[]> {
    const aggregated: Record<string, { 
        canonicalName: string,
        displayName: string,
        variants: Record<string, { quantity: number, unit: string, originalNames: Set<string> }> 
    }> = {};

    // 1. Fetch full recipe details and aggregate
    for (const meal of meals) {
        const recipe = await db.savedRecipes.get(String(meal.recipeUUID));
        if (!recipe || !recipe.ingredients) continue;

        const multiplier = meal.portionMultiplier || 1.0;

        for (const ing of recipe.ingredients) {
            const originalName = (typeof ing === 'object' ? ing.name : ing).trim();
            const quantityRaw = (typeof ing === 'object' ? (ing.quantity || 0) : 0) * multiplier;
            const unitRaw = typeof ing === 'object' ? (ing.unitOfMeasure || '') : '';

            const canonicalName = getCanonicalName(originalName);
            const { q, u } = convertToBaseUnit(quantityRaw, unitRaw);

            if (!aggregated[canonicalName]) {
                aggregated[canonicalName] = {
                    canonicalName,
                    displayName: originalName, // Use first found as display
                    variants: {}
                };
            }

            if (!aggregated[canonicalName].variants[u]) {
                aggregated[canonicalName].variants[u] = { quantity: 0, unit: u, originalNames: new Set() };
            }
            
            aggregated[canonicalName].variants[u].quantity += q;
            aggregated[canonicalName].variants[u].originalNames.add(originalName);
        }
    }

    // 2. Fetch and normalize pantry items
    const pantryItemsRaw = await db.pantryItems.where('isDeleted').equals(0).toArray();
    const pantryMap: Record<string, number> = {};
    
    for (const p of pantryItemsRaw) {
        const canonicalName = getCanonicalName(p.ingredientName);
        const { q, u } = convertToBaseUnit(p.quantity, p.unitType);
        const key = `${canonicalName}|${u}`;
        pantryMap[key] = (pantryMap[key] || 0) + q;
    }

    // 3. Compare and build list
    const shoppingList: ShoppingListItem[] = [];

    for (const canonicalName in aggregated) {
        const group = aggregated[canonicalName];
        
        // Process each unit variant under this canonical name
        for (const unitKey in group.variants) {
            const variant = group.variants[unitKey];
            const pantryKey = `${canonicalName}|${unitKey}`;
            const totalInPantry = pantryMap[pantryKey] || 0;
            
            let status: ShoppingListItem['status'] = 'NEED_TO_BUY';
            
            if (variant.quantity > 0) {
                if (totalInPantry >= variant.quantity) {
                    status = 'IN_PANTRY';
                } else if (totalInPantry > 0) {
                    status = 'PARTIAL';
                }
            } else {
                // If quantity is 0 (to taste), only mark as IN_PANTRY if we actually have it
                status = totalInPantry > 0 ? 'IN_PANTRY' : 'NEED_TO_BUY';
            }

            const formatted = formatFromBaseUnit(variant.quantity, unitKey);
            const formattedPantry = formatFromBaseUnit(totalInPantry, unitKey);

            // Determine best name to show
            // If multiple original names exist, pick the shortest/cleanest one or the group's display name
            const displayName = Array.from(variant.originalNames).sort((a, b) => a.length - b.length)[0];

            shoppingList.push({
                name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
                canonicalName: canonicalName,
                quantityNeeded: formatted.q,
                quantityInPantry: formattedPantry.q,
                unit: formatted.u,
                status
            });
        }
    }

    // Sort: NEED_TO_BUY first, then PARTIAL, then IN_PANTRY
    return shoppingList.sort((a, b) => {
        const order = { 'NEED_TO_BUY': 0, 'PARTIAL': 1, 'IN_PANTRY': 2 };
        if (order[a.status] !== order[b.status]) {
            return order[a.status] - order[b.status];
        }
        return a.name.localeCompare(b.name);
    });
}
