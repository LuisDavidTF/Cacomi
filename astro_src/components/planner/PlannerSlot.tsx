import React from 'react';
import { Plus, Clock, Sun, Utensils, Moon } from 'lucide-react';
import { useSettings } from '@context/SettingsContext';

interface PlannerSlotProps {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    label: string;
    time: string;
    recipe?: any;
    isEditable?: boolean;
    onClick?: () => void;
}

const mealIcon = {
    breakfast: Sun,
    lunch: Utensils,
    dinner: Moon,
    snack: Utensils, // You can use a different icon like Cookie or Sandwich if available, but Utensils is a safe bet
};

export function PlannerSlot({ type, label, time, recipe, isEditable = true, onClick }: PlannerSlotProps) {
    const { t } = useSettings();
    const Icon = mealIcon[type] || Utensils;


    const hasTracking = recipe?.tracking !== undefined;

    return (
        <div 
            onClick={onClick}
            className={`w-full ${isEditable || recipe ? 'group/slot cursor-pointer' : 'cursor-not-allowed'}`}
        >
            {/* Label row */}
            <div className="flex items-center justify-between mb-1.5 px-0.5">
                <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">{label}</span>
                </div>
                <span className="text-[8px] font-medium text-muted-foreground/40 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />{time}
                </span>
            </div>

            {recipe ? (
                // Filled slot — recipe card
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/40 shadow-sm
                                group-hover/slot:scale-[1.02] group-hover/slot:shadow-md active:scale-[0.98] transition-all">
                    <img src={recipe.image || '/placeholder.jpg'} alt={recipe.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                                    flex flex-col justify-end p-2.5">
                        
                        {/* Tracking indicator */}
                        {hasTracking && (
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-lg flex items-center gap-1 border border-white/10">
                                {recipe.tracking.isEaten ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                                )}
                            </div>
                        )}

                        {recipe.portionMultiplier && recipe.portionMultiplier !== 1.0 ? (
                            <span className="text-white text-[9px] font-bold bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] px-1.5 py-0.5 rounded mb-1 self-start">
                                Ajuste {recipe.portionMultiplier}x
                            </span>
                        ) : (
                            <span className="text-white/80 text-[8px] font-medium bg-black/40 px-1 py-0.5 rounded mb-1 self-start backdrop-blur-sm">
                                1x (Original)
                            </span>
                        )}
                        <span className="text-white text-[9px] font-bold leading-tight line-clamp-1">{recipe.name}</span>
                    </div>
                </div>
            ) : isEditable ? (
                // Empty slot — interactive add area
                <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-border/30
                                flex flex-col items-center justify-center gap-1
                                group-hover/slot:border-primary/40 group-hover/slot:bg-primary/5
                                active:scale-[0.97] transition-all">
                    <div className="w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center
                                    group-hover/slot:bg-primary/10 transition-colors">
                        <Plus className="w-3.5 h-3.5 text-muted-foreground/40 group-hover/slot:text-primary/60 transition-colors" />
                    </div>
                </div>
            ) : (
                // Locked slot — visually disabled, matching AI button disabled state
                <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-border/20
                                flex flex-col items-center justify-center
                                opacity-40 pointer-events-none">
                    <div className="w-6 h-6 rounded-full bg-muted/40 flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5 text-muted-foreground/30" />
                    </div>
                </div>
            )}
        </div>
    );
}
