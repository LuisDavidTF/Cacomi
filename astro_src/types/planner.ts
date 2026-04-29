export type ActivityLevel = 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE';
export type Goal = 'WEIGHT_LOSS' | 'MAINTENANCE' | 'MUSCLE_GAIN';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
export type SelectionLogicCode = 'PROTEIN_FILL' | 'CALORIC_DENSITY' | 'PANTRY_CLEARANCE' | 'BUDGET_SAVER';

export interface Meal {
    logId: number;
    recipeUUID: string;
    recipeName: string;
    imageUrl: string;
    mealDate: string;
    mealType: MealType;
    portionMultiplier: number;
    proteinGrams: number;
    calories: number;
    estimatedCost: number;
    pantryUsage: number;
    selectionLogicCode: SelectionLogicCode;
    aiReasoning: string;
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
    status?: 'GENERATING' | 'COMPLETED' | string;
    meals: Meal[];
}

export interface GroupedMeals {
    [day: string]: Meal[];
}
