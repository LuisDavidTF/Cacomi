import React from 'react';
import { Plus, Clock, Sun, Utensils, Moon, Pin } from 'lucide-react';
import { useSettings } from '@context/SettingsContext';

interface PlannerSlotProps {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    label: string;
    time: string;
    recipe?: any;
    isEditable?: boolean;
    onClick?: () => void;
    onDropRecipe?: (recipe: any) => void;
    onDelete?: () => void;
    onPin?: () => void;
    onPointerDown?: (e: React.PointerEvent, recipe: any) => void;
    isSelected?: boolean;
    date?: string;
    id?: string;
}

const mealIcon = {
    breakfast: Sun,
    lunch: Utensils,
    dinner: Moon,
    snack: Utensils,
};

export function PlannerSlot({ type, label, time, recipe, isEditable = true, onClick, onDropRecipe, onDelete, onPin, onPointerDown, isSelected, date, id }: PlannerSlotProps) {
    const { t, language } = useSettings();
    const Icon = mealIcon[type] || Utensils;
    const [isDragOver, setIsDragOver] = React.useState(false);

    const hasTracking = recipe?.tracking !== undefined;

    const handleDragOver = (e: React.DragEvent) => {
        if (!isEditable) return;
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        if (!isEditable) return;
        e.preventDefault();
        setIsDragOver(false);
        try {
            const recipeData = JSON.parse(e.dataTransfer.getData('recipe'));
            onDropRecipe?.(recipeData);
        } catch (err) {
            console.error("Error parsing dropped recipe", err);
        }
    };

    return (
        <div 
            onClick={onClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-slot-date={date}
            data-slot-type={type}
            data-slot-id={recipe?.id}
            className={`w-full transition-all 
                ${isEditable || recipe ? 'group/slot cursor-pointer' : 'cursor-not-allowed'} 
                ${isDragOver ? 'scale-[1.02] z-10' : ''}
                ${isSelected ? 'animate-pulse scale-[1.02] ring-2 ring-primary/40 rounded-3xl p-1' : ''}`}
        >
            {/* Label row */}
            <div className="flex items-center justify-between mb-1.5 px-0.5">
                <div className="flex items-center gap-1.5">
                    <Icon className={`w-3 h-3 ${isDragOver ? 'text-primary' : 'text-muted-foreground/50'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-wider ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
                </div>
                <span className="text-[8px] font-medium text-muted-foreground/40 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />{time}
                </span>
            </div>

            {recipe ? (
                // Filled slot — recipe card
                <div 
                    onPointerDown={(e) => onPointerDown?.(e, recipe)}
                    className={`relative aspect-[4/3] rounded-2xl overflow-hidden border shadow-sm transition-all
                                ${isDragOver ? 'border-primary ring-4 ring-primary/20 scale-[1.02]' : 'border-border/40'}
                                group-hover/slot:scale-[1.02] group-hover/slot:shadow-md active:scale-[0.98]`}>
                    <img 
                        src={recipe.image || '/placeholder.jpg'} 
                        alt={recipe.name} 
                        className={`w-full h-full object-cover transition-all duration-700 
                                    ${hasTracking ? 'blur-[3px] grayscale-[0.6] scale-105' : ''}`} 
                    />
                    
                    {/* Status Overlay */}
                    {hasTracking && (
                        <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center gap-1.5 animate-in fade-in duration-500">
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-2xl backdrop-blur-md border 
                                            ${recipe.tracking.isEating 
                                                ? 'bg-emerald-500/90 text-white border-emerald-400/50' 
                                                : 'bg-destructive/90 text-white border-destructive/50'}`}>
                                {recipe.tracking.isEating 
                                    ? (t.planner?.tracking?.eaten || 'Comido') 
                                    : (t.planner?.tracking?.skipped || 'Saltado')}
                            </div>
                            {recipe.tracking.rating > 0 && (
                                <div className="flex gap-0.5">
                                    {Array.from({ length: recipe.tracking.rating }).map((_, i) => (
                                        <span key={i} className="text-[10px] text-yellow-400 drop-shadow-md">★</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                                    flex flex-col justify-end p-2.5">
                        
                        {/* Tracking indicator (Circle) - Enhanced */}
                        {hasTracking && (
                            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg flex items-center gap-1.5 border backdrop-blur-md shadow-lg transition-all
                                            ${recipe.tracking.isEating 
                                                ? 'bg-emerald-500/20 border-emerald-500/40' 
                                                : 'bg-destructive/20 border-destructive/40'}`}>
                                <span className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]
                                                ${recipe.tracking.isEating ? 'bg-emerald-400' : 'bg-destructive'}`} />
                                <span className="text-[8px] font-black text-white uppercase tracking-tighter">TRACK</span>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-1 mb-1">
                            {recipe.isPinned === 1 && (
                                <span className="text-white text-[9px] font-black bg-primary shadow-lg shadow-primary/40 px-1.5 py-0.5 rounded-lg flex items-center gap-1 border border-white/20 animate-in zoom-in duration-300">
                                    <Pin className="w-2.5 h-2.5 fill-current" /> {language === 'es' ? 'FIJADO' : 'PINNED'}
                                </span>
                            )}
                            {recipe.isNew === 1 && (
                                <span className="text-white text-[9px] font-black bg-primary shadow-lg shadow-primary/40 px-1.5 py-0.5 rounded-lg flex items-center gap-1 border border-white/20">
                                    <Plus className="w-2.5 h-2.5 rotate-45" /> EDITAR
                                </span>
                            )}
                            {recipe.portionMultiplier && (
                                <span className={`text-white text-[9px] font-bold px-1.5 py-0.5 rounded ${recipe.portionMultiplier !== 1.0 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-black/40 backdrop-blur-sm'}`}>
                                    {recipe.portionMultiplier}x
                                </span>
                            )}
                        </div>
                        <span className="text-white text-[9px] font-bold leading-tight line-clamp-1">{recipe.name}</span>
                    </div>

                    {/* Action buttons */}
                    {isEditable && (

                        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover/slot:opacity-100 z-20 transition-all duration-300 translate-x-2 group-hover/slot:translate-x-0">
                            {/* Delete Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.();
                                }}
                                className="w-7 h-7 bg-black/60 backdrop-blur-md rounded-full 
                                           flex items-center justify-center text-white/70 hover:text-white hover:bg-destructive 
                                           transition-all shadow-lg border border-white/20"
                            >
                                <Plus className="w-4 h-4 rotate-45" />
                            </button>
                        </div>
                    )}

                    {/* Action buttons area (empty for now) */}
                </div>
            ) : isEditable ? (
                // Empty slot — interactive add area
                <div className={`aspect-[4/3] rounded-2xl border-2 border-dashed transition-all
                                flex flex-col items-center justify-center gap-1
                                ${isSelected 
                                    ? 'border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.02]' 
                                    : isDragOver
                                        ? 'border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.02]'
                                        : 'border-border/30 group-hover/slot:border-primary/40 group-hover/slot:bg-primary/5'}
                                active:scale-[0.97]`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors
                                    ${isSelected || isDragOver ? 'bg-primary text-white' : 'bg-muted/60 group-hover/slot:bg-primary/10'}`}>
                        <Plus className={`w-3.5 h-3.5 ${(isSelected || isDragOver) ? 'text-white' : 'text-muted-foreground/40 group-hover/slot:text-primary/60'}`} />
                    </div>
                    {isSelected && (
                        <span className="text-[8px] font-bold text-primary animate-bounce mt-1">Seleccionado</span>
                    )}
                </div>
            ) : (
                // Locked slot
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

