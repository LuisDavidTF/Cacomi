import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SelectionLogicCode } from '@/types/planner';

export interface RecommendedMeal {
    recipeUUID: string;
    recipeName: string;
    imageUrl: string;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
    portionMultiplier: number;
    selectionLogicCode: SelectionLogicCode;
    aiReasoning: string;
    estimatedCost: number;
    pantryUsage: number;
}

interface RecommendedMenuState {
    selection: RecommendedMeal[];
    addMeal: (meal: Partial<RecommendedMeal> & Pick<RecommendedMeal, 'recipeUUID' | 'recipeName' | 'imageUrl'>) => void;
    removeMeal: (uuid: string) => void;
    clearMenu: () => void;
    updateMealField: <K extends keyof RecommendedMeal>(uuid: string, field: K, value: RecommendedMeal[K]) => void;
}

export const useRecommendedMenuStore = create<RecommendedMenuState>()(
    persist(
        (set) => ({
            selection: [],
            addMeal: (meal) => set((state) => {
                if (state.selection.length >= 5) return state;
                if (state.selection.some(m => m.recipeUUID === meal.recipeUUID)) return state;
                
                const fullMeal: RecommendedMeal = {
                    recipeUUID: meal.recipeUUID,
                    recipeName: meal.recipeName,
                    imageUrl: meal.imageUrl,
                    calories: meal.calories || 0,
                    proteinGrams: meal.proteinGrams || 0,
                    carbsGrams: meal.carbsGrams || 0,
                    fatGrams: meal.fatGrams || 0,
                    mealType: meal.mealType || 'LUNCH',
                    portionMultiplier: meal.portionMultiplier || 1,
                    selectionLogicCode: meal.selectionLogicCode || 'PROTEIN_FILL',
                    aiReasoning: meal.aiReasoning || 'Este plato es ideal para mantener tu energía hoy.',
                    estimatedCost: meal.estimatedCost || 0,
                    pantryUsage: 0
                };

                return { selection: [...state.selection, fullMeal] };
            }),
            removeMeal: (uuid) => set((state) => ({
                selection: state.selection.filter(m => m.recipeUUID !== uuid)
            })),
            clearMenu: () => set({ selection: [] }),
            updateMealField: (uuid, field, value) => set((state) => ({
                selection: state.selection.map(m => 
                    m.recipeUUID === uuid ? { ...m, [field]: value } : m
                )
            })),
        }),
        {
            name: 'cacomi-recommended-menu-draft-v2',
        }
    )
);
