import React from 'react';
import { useSettings } from '@context/SettingsContext';
import { Zap, Flame } from 'lucide-react';

interface NutritionalSummaryProps {
    isHorizontal?: boolean;
    targetCalories?: number;
    targetProtein?: number;
    meals?: any[];
}

export function NutritionalSummary({ 
    isHorizontal = false, 
    targetCalories = 2000, 
    targetProtein = 120, 
    meals = [] 
}: NutritionalSummaryProps) {
    const { t } = useSettings();

    // Group meals by date to count unique days
    const uniqueDays = new Set(meals.map(m => m.mealDate)).size;
    const daysToDivide = Math.max(1, uniqueDays);

    const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalProtein = meals.reduce((sum, m) => sum + (m.proteinGrams || 0), 0);
    
    // Average based on planned days (more intuitive for partial weeks)
    const avgCalories = Math.round(totalCalories / daysToDivide);
    const avgProtein = Math.round(totalProtein / daysToDivide);

    const proteinPercentage = Math.min(Math.round((avgProtein / targetProtein) * 100), 100);


    if (isHorizontal) {
        // Pill-style cards matching About's value cards — lighter, cleaner
        return (
            <div className="flex items-center gap-3 flex-nowrap">
                {/* Proteins */}
                <div className="flex items-center gap-2.5 px-4 py-3
                                bg-background border border-border/50 rounded-2xl
                                shadow-sm hover:shadow-md transition-shadow
                                shrink-0 min-w-[130px]">
                    <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            {t.planner?.proteins}
                        </span>
                        <span className="text-sm font-bold text-foreground tabular-nums leading-tight">
                            {avgProtein}<span className="text-[10px] font-medium text-muted-foreground/50 ml-0.5">/ {targetProtein}g</span>
                        </span>

                    </div>
                </div>

                {/* Calories */}
                <div className="flex items-center gap-2.5 px-4 py-3
                                bg-background border border-border/50 rounded-2xl
                                shadow-sm hover:shadow-md transition-shadow
                                shrink-0 min-w-[115px]">
                    <div className="w-7 h-7 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                        <Flame className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            {t.planner?.calories}
                        </span>
                        <span className="text-sm font-bold text-foreground tabular-nums leading-tight">
                            {avgCalories.toLocaleString()}<span className="text-[10px] font-medium text-muted-foreground/50 ml-0.5">kcal</span>
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
                        <span className="text-lg font-bold text-foreground tabular-nums">{avgProtein}g</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${proteinPercentage}%` }} />
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
                        <span className="text-xl font-bold text-foreground tabular-nums">{avgCalories.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/40 text-right">Budget {targetCalories.toLocaleString()} kcal</p>

                </div>
            </div>
        </div>
    );
}
