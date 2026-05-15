import type { LocalPlannedMeal } from '@/lib/db';

export const RECOMMENDED_DAILY_MENU: Omit<LocalPlannedMeal, 'id' | 'planId' | 'mealDate' | 'isSynced' | 'isDeleted' | 'isNew'>[] = [
    {
        "recipeUUID": "0106b29d-309c-4a36-9d43-28c90d10dd66",
        "recipeName": "Nopales Asados con Chimichurri Casero",
        "imageUrl": "https://res.cloudinary.com/dcjdxf0kk/image/upload/v1778859527/smart-recipe-planner/ai-generated/grilled-nopales-with-homemade-chimichurri-1778859526975.jpg",
        "calories": 751,
        "proteinGrams": 8,
        "carbsGrams": 0,
        "fatGrams": 0,
        "mealType": "BREAKFAST",
        "portionMultiplier": 0.5,
        "selectionLogicCode": "PROTEIN_FILL",
        "aiReasoning": "Este plato es ideal para mantener tu energía hoy.",
        "estimatedCost": 0,
        "pantryUsage": 0
    },
    {
        "recipeUUID": "2caf15c9-bc2d-4b85-a1d9-01be4c042f02",
        "recipeName": "Verduras al Wok con Salsa de Soya Ligera",
        "imageUrl": "https://res.cloudinary.com/dcjdxf0kk/image/upload/v1778859343/smart-recipe-planner/ai-generated/wok-vegetables-with-light-soy-sauce-1778859343280.jpg",
        "calories": 460,
        "proteinGrams": 18,
        "carbsGrams": 0,
        "fatGrams": 0,
        "mealType": "DINNER",
        "portionMultiplier": 0.8,
        "selectionLogicCode": "PROTEIN_FILL",
        "aiReasoning": "Este plato es ideal para mantener tu energía hoy.",
        "estimatedCost": 0,
        "pantryUsage": 0
    },
    {
        "recipeUUID": "aed401c9-4120-4257-adfe-0880a1469d1f",
        "recipeName": "Pimientos estilo Padrón asados en freidora de aire",
        "imageUrl": "https://res.cloudinary.com/dcjdxf0kk/image/upload/v1778859253/smart-recipe-planner/ai-generated/air-fried-padr-n-style-peppers-1778859253152.jpg",
        "calories": 94,
        "proteinGrams": 2,
        "carbsGrams": 0,
        "fatGrams": 0,
        "mealType": "SNACK",
        "portionMultiplier": 0.7,
        "selectionLogicCode": "PROTEIN_FILL",
        "aiReasoning": "Este plato es ideal para mantener tu energía hoy.",
        "estimatedCost": 0,
        "pantryUsage": 0
    },
    {
        "recipeUUID": "49a0c37b-ce15-4936-8c3e-6251914138cc",
        "recipeName": "Ensalada de Hinojo y Naranja con Vinagreta Cítrica",
        "imageUrl": "https://res.cloudinary.com/dcjdxf0kk/image/upload/v1778859073/smart-recipe-planner/ai-generated/fennel-and-orange-salad-with-citrus-vinaigrette-1778859073217.jpg",
        "calories": 518,
        "proteinGrams": 7,
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
        "recipeUUID": "c3ad9a90-4222-4a03-abc8-2136da26b35f",
        "recipeName": "Salpicón de Res Magra con Limón y Cilantro",
        "imageUrl": "https://res.cloudinary.com/dcjdxf0kk/image/upload/v1778569616/smart-recipe-planner/ai-generated/lean-beef-salpicon-with-lemon-and-cilantro-1778569615889.jpg",
        "calories": 1168,
        "proteinGrams": 93,
        "carbsGrams": 0,
        "fatGrams": 0,
        "mealType": "LUNCH",
        "portionMultiplier": 0.8,
        "selectionLogicCode": "PROTEIN_FILL",
        "aiReasoning": "Este plato es ideal para mantener tu energía hoy.",
        "estimatedCost": 0,
        "pantryUsage": 0
    }
];