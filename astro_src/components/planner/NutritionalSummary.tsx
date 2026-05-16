import React from 'react';
import { useSettings } from '@context/SettingsContext';
import { Zap, Flame, CircleDashed, Droplets } from 'lucide-react';

interface NutritionalSummaryProps {
    isHorizontal?: boolean;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFat?: number;
    meals?: any[];
}

export function NutritionalSummary({ 
    isHorizontal = false, 
    targetCalories = 2000, 
    targetProtein = 120, 
    targetCarbs = 250,
    targetFat = 70,
    meals = [] 
}: NutritionalSummaryProps) {
    const { t } = useSettings();

    // Group meals by date to count unique days
    const uniqueDays = new Set(meals.map(m => m.mealDate)).size;
    const daysToDivide = Math.max(1, uniqueDays);

    const [isHydrating, setIsHydrating] = React.useState(false);
    const [finalTotals, setFinalTotals] = React.useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

    React.useEffect(() => {
        const hydrateTotals = async () => {
            if (!meals || meals.length === 0) {
                setFinalTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
                return;
            }

            setIsHydrating(true);
            let tCal = 0, tProt = 0, tCarb = 0, tFat = 0;

            for (const m of meals) {
                let mCal = m.calories ?? m.kcal ?? m.nutrition?.totalCalories ?? m.nutrition?.calories ?? m.nutrition?.kcal ?? 0;
                let mProt = m.proteinGrams ?? m.protein ?? m.nutrition?.totalProtein ?? m.nutrition?.protein ?? 0;
                let mCarb = m.carbsGrams ?? m.carbohydrates ?? m.carbs ?? m.nutrition?.totalCarbs ?? m.nutrition?.totalCarbohydrates ?? m.nutrition?.carbohydrates ?? m.nutrition?.carbs ?? 0;
                let mFat = m.fatGrams ?? m.fat ?? m.nutrition?.totalFat ?? m.nutrition?.fat ?? 0;

                // If critical macros are 0, try to find in savedRecipes
                if ((mCarb === 0 || mFat === 0 || mCal === 0) && m.recipeUUID) {
                    try {
                        const { db } = await import('@/lib/db');
                        const saved = await db.savedRecipes.get(String(m.recipeUUID));
                        if (saved) {
                            const sn = saved.nutrition || {};
                            if (mCal === 0) mCal = saved.calories ?? saved.kcal ?? sn.totalCalories ?? sn.calories ?? sn.kcal ?? 0;
                            if (mProt === 0) mProt = saved.proteinGrams ?? saved.protein ?? sn.totalProtein ?? sn.protein ?? 0;
                            if (mCarb === 0) mCarb = saved.carbsGrams ?? saved.carbohydrates ?? saved.carbs ?? sn.totalCarbs ?? sn.totalCarbohydrates ?? sn.carbohydrates ?? sn.carbs ?? 0;
                            if (mFat === 0) mFat = saved.fatGrams ?? saved.fat ?? sn.totalFat ?? sn.fat ?? 0;
                        }
                    } catch (e) {
                        console.error("Hydration error in Summary", e);
                    }
                }

                tCal += Number(mCal);
                tProt += Number(mProt);
                tCarb += Number(mCarb);
                tFat += Number(mFat);
            }

            setFinalTotals({ calories: tCal, protein: tProt, carbs: tCarb, fat: tFat });
            setIsHydrating(false);
        };

        hydrateTotals();
    }, [meals]);

    // Average based on planned days (more intuitive for partial weeks)
    const avgCalories = Math.round(finalTotals.calories / daysToDivide);
    const avgProtein = Math.round(finalTotals.protein / daysToDivide);
    const avgCarbs = Math.round(finalTotals.carbs / daysToDivide);
    const avgFat = Math.round(finalTotals.fat / daysToDivide);

    const proteinPercentage = Math.min(Math.round((avgProtein / targetProtein) * 100), 100);


    if (isHorizontal) {
        // Pill-style cards matching About's value cards — lighter, cleaner
        return (
            <div className={`flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1 touch-pan-x flex-nowrap md:flex-wrap lg:flex-nowrap transition-opacity duration-300 ${isHydrating ? 'opacity-70' : 'opacity-100'}`}>
                {/* Proteins */}
                <div className={`flex items-center gap-2 px-2.5 sm:px-4 py-3
                                bg-background border border-border/50 rounded-2xl
                                shadow-sm hover:shadow-md transition-all
                                shrink-0 min-w-[110px] sm:min-w-[130px] ${isHydrating ? 'animate-pulse' : ''}`}>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            {t.planner?.proteins}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-foreground tabular-nums leading-tight">
                            {isHydrating ? (
                                <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                            ) : (
                                <span className="animate-in fade-in duration-500">
                                    {avgProtein}<span className="text-[8px] sm:text-[10px] font-medium text-muted-foreground/50 ml-0.5">/ {targetProtein}g</span>
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Calories */}
                <div className={`flex items-center gap-2 px-2.5 sm:px-4 py-3
                                bg-background border border-border/50 rounded-2xl
                                shadow-sm hover:shadow-md transition-all
                                shrink-0 min-w-[100px] sm:min-w-[115px] ${isHydrating ? 'animate-pulse' : ''}`}>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                        <Flame className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            {t.planner?.calories}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-foreground tabular-nums leading-tight">
                            {isHydrating ? (
                                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                            ) : (
                                <span className="animate-in fade-in duration-500">
                                    {avgCalories.toLocaleString()}<span className="text-[8px] sm:text-[10px] font-medium text-muted-foreground/50 ml-0.5">kcal</span>
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Carbs */}
                <div className={`flex items-center gap-2 px-2.5 sm:px-4 py-3
                                bg-background border border-border/50 rounded-2xl
                                shadow-sm hover:shadow-md transition-all
                                shrink-0 min-w-[90px] sm:min-w-[110px] ${isHydrating ? 'animate-pulse' : ''}`}>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600 shrink-0">
                        <CircleDashed className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            {t.recipe?.carbs || 'Carbs'}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-foreground tabular-nums leading-tight">
                            {isHydrating ? (
                                <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                            ) : (
                                <span className="animate-in fade-in duration-500">{avgCarbs}g</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Fats */}
                <div className={`flex items-center gap-2 px-2.5 sm:px-4 py-3
                                bg-background border border-border/50 rounded-2xl
                                shadow-sm hover:shadow-md transition-all
                                shrink-0 min-w-[90px] sm:min-w-[110px] ${isHydrating ? 'animate-pulse' : ''}`}>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                        <Droplets className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            {t.recipe?.fat || 'Fats'}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-foreground tabular-nums leading-tight">
                            {isHydrating ? (
                                <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                            ) : (
                                <span className="animate-in fade-in duration-500">{avgFat}g</span>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Vertical mode — used in the sidebar (xl+ desktop only)
    // Matches About's value cards: bg-background border border-border/50 rounded-3xl p-8 shadow-sm hover:shadow-md
    return (
        <div className="bg-background border border-border/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Decorative corner icon (same pattern as About cards) */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform origin-top-right">
                <Flame className="w-24 h-24" />
            </div>

            <div className="relative z-10 space-y-8">
                <h2 className="text-lg font-bold text-foreground">
                    {t.planner?.nutritionalSummary}
                </h2>

                {/* Proteins */}
                <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Zap className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                {t.planner?.proteins}
                            </span>
                        </div>
                        {isHydrating ? (
                            <div className="h-6 w-12 bg-muted animate-pulse rounded-md" />
                        ) : (
                            <span className="text-lg font-bold text-foreground tabular-nums animate-in fade-in duration-500">{avgProtein}g</span>
                        )}
                    </div>
                    <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                        <div className={`h-full bg-primary rounded-full transition-all duration-1000 ${isHydrating ? 'opacity-30' : 'opacity-100'}`} style={{ width: `${proteinPercentage}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground/40 text-right">Goal {targetProtein}g</p>

                </div>

                {/* Calories */}
                <div className="pt-6 border-t border-border/30 space-y-2">
                    <div className="flex justify-between items-baseline">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                                <Flame className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                {t.planner?.calories}
                            </span>
                        </div>
                        {isHydrating ? (
                            <div className="h-6 w-20 bg-muted animate-pulse rounded-md" />
                        ) : (
                            <span className="text-xl font-bold text-foreground tabular-nums animate-in fade-in duration-500">{avgCalories.toLocaleString()}</span>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground/40 text-right">Budget {targetCalories.toLocaleString()} kcal</p>
                </div>

                {/* Macros Breakdown (Carbs/Fat) */}
                <div className="pt-6 border-t border-border/30 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">{t.recipe?.carbs || 'Carbs'}</span>
                        <div className="flex items-center gap-2 text-foreground font-bold">
                            <CircleDashed className="w-3 h-3 text-yellow-500" />
                            {isHydrating ? (
                                <div className="h-4 w-10 bg-muted animate-pulse rounded" />
                            ) : (
                                <span className="animate-in fade-in duration-500">{avgCarbs}g</span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">{t.recipe?.fat || 'Fats'}</span>
                        <div className="flex items-center gap-2 text-foreground font-bold">
                            <Droplets className="w-3 h-3 text-emerald-500" />
                            {isHydrating ? (
                                <div className="h-4 w-10 bg-muted animate-pulse rounded" />
                            ) : (
                                <span className="animate-in fade-in duration-500">{avgFat}g</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
