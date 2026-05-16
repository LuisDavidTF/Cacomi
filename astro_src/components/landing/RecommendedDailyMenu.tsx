"use client";

import React, { useState, useEffect } from 'react';
import { useSettings } from '@context/SettingsContext';
import { Sparkles, Plus, ArrowRight, ChevronDown, ChevronUp, Clock, Flame, Beef, CheckCircle2, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { RECOMMENDED_DAILY_MENU } from '@/constants/recommendedMenu';
import { cn, generateUUIDv7, formatDateToString } from '@/lib/utils';
import { db } from '@/lib/db';
import { RecipeService } from '@/lib/services/recipes';

export function RecommendedDailyMenu() {
    const { t, language } = useSettings();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleAddToPlan = async () => {
        setIsSaving(true);
        const today = new Date();
        const dateStr = formatDateToString(today);

        try {
            // 1. Get the most likely active planId
            // Try active metadata first
            let planId = 0;
            const activeMeta = await db.planMetadata.where('isActive').equals(1).first();
            
            if (activeMeta) {
                planId = activeMeta.planId;
            } else {
                // Try any metadata
                const latestMeta = await db.planMetadata.toArray();
                if (latestMeta.length > 0) {
                    planId = latestMeta.sort((a, b) => b.planId - a.planId)[0].planId;
                } else {
                    // Try to find any planId in meals
                    const latestMeal = await db.plannedMeals.orderBy('planId').reverse().first();
                    if (latestMeal) planId = latestMeal.planId || 0;
                }
            }

            console.log(`[RecommendedMenu] Target Plan ID: ${planId} for Date: ${dateStr}`);

            // 2. Identify all meal types to be replaced
            const typesToReplace = Array.from(new Set(RECOMMENDED_DAILY_MENU.map(m => m.mealType.toUpperCase())));
            
            // 3. Clear existing meals of those types for today
            for (const type of typesToReplace) {
                const existingMeals = await db.plannedMeals
                    .where('mealDate').equals(dateStr)
                    .filter(m => m.mealType === type && m.isDeleted === 0 && m.planId === planId)
                    .toArray();
                
                for (const m of existingMeals) {
                    if (m.isNew === 1) {
                        await db.plannedMeals.delete(m.id);
                    } else {
                        await db.plannedMeals.update(m.id, { isDeleted: 1, isSynced: 0 });
                    }
                }
            }

            // 4. Add the new recommended meals
            for (const meal of RECOMMENDED_DAILY_MENU) {
                const existingRecipe = await db.savedRecipes.get(meal.recipeUUID);
                if (!existingRecipe) {
                    try {
                        const recipeData = await RecipeService.getById(meal.recipeUUID);
                        if (recipeData) {
                            const n = recipeData.nutrition || {};
                            const normalizedNutrition = {
                                totalCalories: n.totalCalories ?? n.calories ?? n.kcal ?? recipeData.calories ?? recipeData.kcal ?? 0,
                                totalProtein: n.totalProtein ?? n.protein ?? recipeData.proteinGrams ?? recipeData.protein ?? 0,
                                totalCarbs: n.totalCarbs ?? n.totalCarbohydrates ?? n.carbohydrates ?? n.carbs ?? recipeData.carbsGrams ?? recipeData.carbohydrates ?? recipeData.carbs ?? 0,
                                totalFat: n.totalFat ?? n.fat ?? recipeData.fatGrams ?? recipeData.fat ?? 0
                            };

                            await db.savedRecipes.put({
                                ...recipeData,
                                nutrition: normalizedNutrition,
                                id: meal.recipeUUID,
                                savedAt: new Date().toISOString(),
                                proteinGrams: normalizedNutrition.totalProtein,
                                carbsGrams: normalizedNutrition.totalCarbs,
                                fatGrams: normalizedNutrition.totalFat,
                                calories: normalizedNutrition.totalCalories,
                                // Alternative keys
                                protein: normalizedNutrition.totalProtein,
                                carbs: normalizedNutrition.totalCarbs,
                                fat: normalizedNutrition.totalFat,
                                carbohydrates: normalizedNutrition.totalCarbs,
                                kcal: normalizedNutrition.totalCalories,
                                estimatedCost: recipeData.estimatedCost || 0
                            });
                        }
                    } catch (fetchErr) {
                        await db.savedRecipes.put({
                            id: meal.recipeUUID,
                            name: meal.recipeName,
                            imageUrl: meal.imageUrl,
                            calories: meal.calories,
                            protein: meal.proteinGrams,
                            description: meal.aiReasoning,
                            savedAt: new Date().toISOString()
                        });
                    }
                }

                const newMeal = {
                    ...meal,
                    id: generateUUIDv7(),
                    planId: planId,
                    mealDate: dateStr,
                    isSynced: 0,
                    isDeleted: 0,
                    isNew: 1,
                    isPinned: 1
                };
                
                await db.plannedMeals.add(newMeal as any);
            }

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);
        } catch (err) {
            console.error("Error adding recommended menu to DB:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="container mx-auto px-4 mb-12">
            <div className="bg-white dark:bg-gray-900 border border-primary/10 rounded-[32px] overflow-hidden shadow-2xl shadow-primary/5 relative group transition-all duration-500 hover:shadow-primary/10">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                
                {/* Success Notification Modal */}
                <Modal 
                    isOpen={showSuccess} 
                    onClose={() => setShowSuccess(false)} 
                    title="" 
                    maxWidth="max-w-lg" 
                    noPadding
                >
                    <div className="relative bg-white dark:bg-gray-900 p-8 sm:p-12 text-center animate-in zoom-in-95 duration-500">
                        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary flex items-center justify-center mb-6 sm:mb-8 shadow-2xl shadow-primary/40">
                            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-bounce" />
                        </div>
                        <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-2 sm:mb-4 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                            {t.recommendedMenu?.success || '¡Plan Actualizado!'}
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground font-medium mb-8 sm:mb-10 max-w-xs mx-auto leading-relaxed">
                            {language === 'es' 
                                ? 'Hemos integrado el menú oficial en tu planeador para el día de hoy.' 
                                : 'We have integrated the official menu into your planner for today.'}
                        </p>
                        
                        <button 
                            onClick={() => window.location.href = '/planner'}
                            className="w-full py-4 sm:py-5 bg-primary text-white rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3"
                        >
                            {t.recommendedMenu?.viewInPlanner || 'Ir al Planeador'}
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => setShowSuccess(false)}
                            className="mt-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {language === 'es' ? 'Cerrar' : 'Close'}
                        </button>
                    </div>
                </Modal>

                {/* Header / Actions */}
                <div className="p-5 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6 sm:gap-8 relative z-10">
                    <div className="flex items-center gap-4 sm:gap-6 w-full lg:flex-1 min-w-0">
                        <div className="shrink-0 w-12 h-12 sm:w-16 lg:w-20 sm:h-16 lg:h-20 rounded-[1.2rem] sm:rounded-[1.8rem] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-all duration-700">
                            <Sparkles className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                                <h2 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight lg:tracking-tighter text-foreground truncate">
                                    {t.recommendedMenu?.title || 'Menú Recomendado'}
                                </h2>
                                <span className="hidden xs:inline-flex px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[7px] sm:text-[8px] font-black uppercase tracking-widest border border-primary/10">
                                    TOP
                                </span>
                            </div>
                            <p className="text-[10px] sm:text-sm lg:text-base text-muted-foreground font-medium max-w-xl line-clamp-2 leading-tight sm:leading-relaxed">
                                {t.recommendedMenu?.subtitle || 'El menú que compartimos hoy en nuestras redes. ¡Pruébalo!'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-muted/50 hover:bg-muted rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-transparent hover:border-primary/10"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                                    {t.recommendedMenu?.hideMenu || 'Ocultar'}
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                                    {t.recommendedMenu?.showMenu || 'Ver Menú'}
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleAddToPlan}
                            disabled={isSaving}
                            className={cn(
                                "w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 lg:px-10 py-4 bg-primary text-primary-foreground rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] sm:hover:scale-105 active:scale-95 transition-all whitespace-nowrap",
                                isSaving && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                            {t.recommendedMenu?.addToPlan || 'Añadir a mi plan'}
                        </button>
                    </div>
                </div>

                {/* Content: Responsive Grid (Collapsible on all devices) */}
                <div className={cn(
                    "overflow-hidden transition-all duration-700 ease-in-out border-t border-primary/5 bg-primary/[0.01]",
                    isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                )}>
                    <div className="p-4 sm:p-6 md:p-8 pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                            {RECOMMENDED_DAILY_MENU.map((meal, idx) => (
                                <div 
                                    key={meal.recipeUUID} 
                                    className="relative group/card bg-white dark:bg-gray-800/40 rounded-[2.5rem] p-3 sm:p-5 shadow-sm border border-border/40 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-700 animate-in fade-in slide-in-from-bottom-4"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Meal Type Tag */}
                                    <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10 px-3 py-1.5 bg-black/80 backdrop-blur-md text-white rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/10 shadow-xl">
                                        {meal.mealType === 'BREAKFAST' ? (language === 'es' ? 'Desayuno' : 'Breakfast') : 
                                         meal.mealType === 'LUNCH' ? (language === 'es' ? 'Comida' : 'Lunch') : 
                                         meal.mealType === 'DINNER' ? (language === 'es' ? 'Cena' : 'Dinner') : 
                                         (language === 'es' ? 'Snack' : 'Snack')}
                                    </div>

                                    {/* Image Container */}
                                    <div className="relative aspect-video sm:aspect-[4/3] lg:aspect-video rounded-[1.8rem] overflow-hidden mb-4 sm:mb-6 bg-muted shadow-2xl">
                                        <img 
                                            src={meal.imageUrl} 
                                            alt={meal.recipeName}
                                            className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-[1500ms] ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
                                    </div>

                                    {/* Info */}
                                    <h3 className="font-black text-sm sm:text-base leading-tight mb-4 line-clamp-2 min-h-[2.5rem] group-hover/card:text-primary transition-colors tracking-tight px-1">
                                        {meal.recipeName}
                                    </h3>

                                    <div className="flex items-center justify-between pt-4 border-t border-border/20 px-1">
                                        <div className="flex items-center gap-2 text-orange-500/80">
                                            <div className="w-8 h-8 rounded-xl bg-orange-500/5 flex items-center justify-center border border-orange-500/10">
                                                <Flame className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-black tracking-tight">{meal.calories} kcal</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-primary/80">
                                            <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                                <Beef className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-black tracking-tight">{meal.proteinGrams}g</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Link */}
                        <div className="mt-10 flex justify-center">
                             <a 
                                href="/planner" 
                                className="group/link inline-flex items-center gap-3 px-6 py-3 rounded-full hover:bg-primary/5 text-xs font-black uppercase tracking-widest text-primary transition-all"
                            >
                                {t.recommendedMenu?.viewInPlanner || 'Ver en el planeador'}
                                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
