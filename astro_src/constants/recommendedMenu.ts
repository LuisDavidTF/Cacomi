import type { LocalPlannedMeal } from '@/lib/db';

export const RECOMMENDED_DAILY_MENU: Omit<LocalPlannedMeal, 'id' | 'planId' | 'mealDate' | 'isSynced' | 'isDeleted' | 'isNew'>[] = [
    {
        "recipeUUID": "aa3eee83-c5e3-4aaa-b7e0-6d5667b92764",
        "recipeName": "Pechuga de Pollo con Costra de Amaranto y Miel",
        "imageUrl": "https://res.cloudinary.com/dcjdxf0kk/image/upload/v1778569527/smart-recipe-planner/ai-generated/amaranth-and-honey-crusted-chicken-breast-1778569527013.jpg",
        "calories": 756,
        "proteinGrams": 76,
        "carbsGrams": 0,
        "fatGrams": 0,
        "mealType": "LUNCH",
        "portionMultiplier": 0.6,
        "selectionLogicCode": "PROTEIN_FILL",
        "aiReasoning": "Este plato es ideal para mantener tu energía hoy.",
        "estimatedCost": 0,
        "pantryUsage": 0
    },
    {
        "recipeUUID": "0a842844-165a-4953-87e0-2294ebd10b06",
        "recipeName": "Pudín de camote con leche de coco y vainilla",
        "imageUrl": "https://res.cloudinary.com/dcjdxf0kk/image/upload/v1778306770/smart-recipe-planner/ai-generated/sweet-potato-pudding-with-coconut-milk-and-vanilla-1778306770387.jpg",
        "calories": 638,
        "proteinGrams": 9,
        "carbsGrams": 0,
        "fatGrams": 0,
        "mealType": "SNACK",
        "portionMultiplier": 1,
        "selectionLogicCode": "PROTEIN_FILL",
        "aiReasoning": "Este plato es ideal para mantener tu energía hoy.",
        "estimatedCost": 0,
        "pantryUsage": 0
    },
    {
        "recipeUUID": "f90dd5f9-108e-4296-bf64-ef9157556414",
        "recipeName": "Agua fresca de tamarindo natural sin azúcar añadida",
        "imageUrl": "https://res.cloudinary.com/dcjdxf0kk/image/upload/v1777619350/smart-recipe-planner/ai-generated/natural-sugar-free-tamarind-agua-fresca-1777619350330.jpg",
        "calories": 478,
        "proteinGrams": 6,
        "carbsGrams": 0,
        "fatGrams": 0,
        "mealType": "SNACK",
        "portionMultiplier": 1,
        "selectionLogicCode": "PROTEIN_FILL",
        "aiReasoning": "Este plato es ideal para mantener tu energía hoy.",
        "estimatedCost": 0,
        "pantryUsage": 0
    },
    {
        "recipeUUID": "d21bbd6e-ad3e-4f85-bbb0-7a973386d2fd",
        "recipeName": "Sopa de pasta integral con verduras en juliana",
        "imageUrl": "https://res.cloudinary.com/dcjdxf0kk/image/upload/v1776924910/smart-recipe-planner/ai-generated/whole-wheat-pasta-soup-with-julienned-vegetables-1776924910828.jpg",
        "calories": 483,
        "proteinGrams": 16,
        "carbsGrams": 0,
        "fatGrams": 0,
        "mealType": "DINNER",
        "portionMultiplier": 1,
        "selectionLogicCode": "PROTEIN_FILL",
        "aiReasoning": "Este plato es ideal para mantener tu energía hoy.",
        "estimatedCost": 0,
        "pantryUsage": 0
    },
    {
        "recipeUUID": "ae12d052-b040-4183-a8d2-60c9a45a14b9",
        "recipeName": "Tortilla Wrap Hack con Huevo y Aguacate",
        "imageUrl": "https://res.cloudinary.com/dcjdxf0kk/image/upload/v1778652475/smart-recipe-planner/ai-generated/viral-egg-and-avocado-tortilla-wrap-hack-1778652475786.jpg",
        "calories": 713,
        "proteinGrams": 28,
        "carbsGrams": 0,
        "fatGrams": 0,
        "mealType": "BREAKFAST",
        "portionMultiplier": 1,
        "selectionLogicCode": "PROTEIN_FILL",
        "aiReasoning": "Este plato es ideal para mantener tu energía hoy.",
        "estimatedCost": 0,
        "pantryUsage": 0
    }
];