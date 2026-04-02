import React from 'react';
import { Plus, Clock, Sun, Utensils, Moon } from 'lucide-react';
import { useSettings } from '@context/SettingsContext';

interface PlannerSlotProps {
    type: 'breakfast' | 'lunch' | 'dinner';
    label: string;
    time: string;
    recipe?: any;
    isEditable?: boolean;
}

const mealIcon = {
    breakfast: Sun,
    lunch: Utensils,
    dinner: Moon,
};

export function PlannerSlot({ type, label, time, recipe, isEditable = true }: PlannerSlotProps) {
    const { t } = useSettings();
    const Icon = mealIcon[type];

    return (
        <div className={`w-full ${isEditable ? 'group/slot cursor-pointer' : 'cursor-not-allowed'}`}>
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
                                    flex items-end p-2.5">
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
