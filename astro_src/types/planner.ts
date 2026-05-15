export type ActivityLevel = 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE';
export type Goal = 'WEIGHT_LOSS' | 'MAINTENANCE' | 'MUSCLE_GAIN';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
export type SelectionLogicCode = 'PROTEIN_FILL' | 'CALORIC_DENSITY' | 'PANTRY_CLEARANCE' | 'BUDGET_SAVER';

export interface Meal {
    id?: string; // Local UUID
    mealId?: number | null;
    logId?: number | null;
    recipeUUID: string;
    recipeName: string;
    imageUrl: string;
    mealDate: string;
    mealType: MealType;
    portionMultiplier: number;
    isNew?: number; // 0 or 1
    isPinned?: number; // 0 or 1
    isDeleted?: number; // 0 or 1
    isSynced?: number; // 0 or 1

    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    calories: number;
    estimatedCost: number;
    pantryUsage: number;
    selectionLogicCode: SelectionLogicCode;
    aiReasoning: string;
    tracking?: {
        isEating: boolean;
        rating?: number;
        satietyLevel?: 'HUNGRY' | 'SATISFIED' | 'STUFFED';
        skippedReason?: string;
    }
}

export interface PlanResponse {
    planId: number;
    birthDate: string;
    activityLevel: ActivityLevel;
    heightCm: number;
    currentWeight: number;
    goal: Goal;
    targetCalories: number;
    targetWeight: number;
    targetProtein: number;
    weeklyBudget: number | null;
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL' | 'GENERATING' | string;
    isActive?: number;
    meals: Meal[];
}

export interface GroupedMeals {
    [day: string]: Meal[];
}
