'use client';

import React, { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useRecommendedMenuStore } from '@store/useRecommendedMenuStore';
import { Sparkles, Trash2, X, Copy, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LocalPlannedMeal } from '@/lib/db';

export function RecommendedMenuManager() {
    const { user } = useAuth();
    const { selection, removeMeal, updateMealField, clearMenu } = useRecommendedMenuStore();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    if (user?.role !== 'ADMIN') return null;

    const generateCode = () => {
        const code = `export const RECOMMENDED_DAILY_MENU: Omit<LocalPlannedMeal, 'id' | 'planId' | 'mealDate' | 'isSynced' | 'isDeleted' | 'isNew'>[] = ${JSON.stringify(selection, null, 4)};`;
        return code;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            {/* Floating Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-24 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-2xl transition-all duration-500 scale-0 group hover:scale-110",
                    selection.length > 0 && "scale-100"
                )}
            >
                <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                    {selection.length}
                </div>
                <Sparkles className="w-6 h-6" />
                <span className="absolute right-full mr-4 bg-black text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Gestionar Menú Recomendado
                </span>
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                        {/* Header - Fixed */}
                        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-border/50 shrink-0">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black tracking-tight">Menú Recomendado</h2>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Draft Builder</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
                            {selection.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground font-medium">No has seleccionado recetas aún.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 sm:space-y-6">
                                    {selection.map((meal) => (
                                        <div key={meal.recipeUUID} className="p-4 sm:p-5 bg-muted/30 rounded-[1.5rem] sm:rounded-[2rem] border border-border/50 group space-y-4">
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <img src={meal.imageUrl} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover shadow-lg" />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-black text-xs sm:text-sm truncate leading-none mb-2 sm:mb-3">{meal.recipeName}</h3>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const).map((type) => (
                                                            <button
                                                                key={type}
                                                                onClick={() => updateMealField(meal.recipeUUID, 'mealType', type)}
                                                                className={cn(
                                                                    "px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border transition-all",
                                                                    meal.mealType === type 
                                                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                                                        : "bg-white dark:bg-gray-800 border-border hover:border-primary/30"
                                                                )}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => removeMeal(meal.recipeUUID)}
                                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                                        Porciones
                                                    </label>
                                                    <input 
                                                        type="number" 
                                                        step="0.1"
                                                        min="0.1"
                                                        value={meal.portionMultiplier}
                                                        onChange={(e) => updateMealField(meal.recipeUUID, 'portionMultiplier', parseFloat(e.target.value))}
                                                        className="w-full bg-white dark:bg-gray-800 border border-border rounded-xl px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                                        Lógica
                                                    </label>
                                                    <select 
                                                        value={meal.selectionLogicCode}
                                                        onChange={(e) => updateMealField(meal.recipeUUID, 'selectionLogicCode', e.target.value as any)}
                                                        className="w-full bg-white dark:bg-gray-800 border border-border rounded-xl px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    >
                                                        <option value="PROTEIN_FILL">PROTEIN_FILL</option>
                                                        <option value="CALORIC_DENSITY">CALORIC_DENSITY</option>
                                                        <option value="PANTRY_CLEARANCE">PANTRY_CLEARANCE</option>
                                                        <option value="BUDGET_SAVER">BUDGET_SAVER</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                                    Comentario del Chef
                                                </label>
                                                <textarea 
                                                    value={meal.aiReasoning}
                                                    onChange={(e) => updateMealField(meal.recipeUUID, 'aiReasoning', e.target.value)}
                                                    rows={1}
                                                    className="w-full bg-white dark:bg-gray-800 border border-border rounded-xl px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                                    placeholder="Razonamiento..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer - Fixed */}
                        <div className="p-4 sm:p-6 bg-muted/50 border-t border-border/50 flex flex-col items-center gap-4 shrink-0">
                            {/* Nutritional Summary - Compact on Mobile */}
                            <div className="w-full grid grid-cols-2 gap-2 sm:gap-4">
                                {(() => {
                                    const totals = selection.reduce((acc, meal) => ({
                                        cal: acc.cal + (meal.calories * meal.portionMultiplier),
                                        prot: acc.prot + (meal.proteinGrams * meal.portionMultiplier)
                                    }), { cal: 0, prot: 0 });

                                    const calStatus = totals.cal < 1600 ? 'low' : totals.cal > 2400 ? 'high' : 'good';
                                    const protStatus = totals.prot < 100 ? 'low' : totals.prot > 180 ? 'high' : 'good';

                                    return (
                                        <>
                                            <div className={cn(
                                                "p-2 sm:p-4 rounded-2xl border transition-all duration-500",
                                                calStatus === 'good' ? "bg-green-500/5 border-green-500/20" :
                                                calStatus === 'low' ? "bg-amber-500/5 border-amber-500/20" :
                                                "bg-red-500/5 border-red-500/20"
                                            )}>
                                                <div className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest opacity-60">Calorías</div>
                                                <div className={cn(
                                                    "text-lg sm:text-2xl font-black",
                                                    calStatus === 'good' ? "text-green-600" :
                                                    calStatus === 'low' ? "text-amber-600" : "text-red-600"
                                                )}>
                                                    {Math.round(totals.cal)} <span className="text-[8px] sm:text-[10px] opacity-60">kcal</span>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "p-2 sm:p-4 rounded-2xl border transition-all duration-500",
                                                protStatus === 'good' ? "bg-indigo-500/5 border-indigo-500/20" :
                                                protStatus === 'low' ? "bg-amber-500/5 border-amber-500/20" :
                                                "bg-red-500/5 border-red-500/20"
                                            )}>
                                                <div className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest opacity-60">Proteína</div>
                                                <div className={cn(
                                                    "text-lg sm:text-2xl font-black",
                                                    protStatus === 'good' ? "text-indigo-600" :
                                                    protStatus === 'low' ? "text-amber-600" : "text-red-600"
                                                )}>
                                                    {Math.round(totals.prot)} <span className="text-[8px] sm:text-[10px] opacity-60">g</span>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Validation Status */}
                            <div className="w-full flex flex-wrap justify-center gap-1.5 sm:gap-3">
                                {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const).map(type => {
                                    const count = selection.filter(m => m.mealType === type).length;
                                    const isValid = type === 'SNACK' ? count <= 2 : count === 1;
                                    return (
                                        <div key={type} className={cn(
                                            "flex items-center gap-1.5 px-2 py-1 rounded-full text-[7px] sm:text-[9px] font-black uppercase tracking-wider border transition-all",
                                            count === 0 ? "bg-muted text-muted-foreground border-transparent" :
                                            isValid ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                            "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse"
                                        )}>
                                            {isValid && count > 0 ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-current opacity-30" />}
                                            {type}: {count}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between w-full gap-4">
                                <button 
                                    onClick={clearMenu}
                                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                    Limpiar
                                </button>
                                <button
                                    onClick={handleCopy}
                                    disabled={
                                        selection.filter(m => m.mealType === 'BREAKFAST').length !== 1 ||
                                        selection.filter(m => m.mealType === 'LUNCH').length !== 1 ||
                                        selection.filter(m => m.mealType === 'DINNER').length !== 1 ||
                                        selection.filter(m => m.mealType === 'SNACK').length > 2 ||
                                        selection.length === 0
                                    }
                                    className={cn(
                                        "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-primary text-primary-foreground rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all",
                                        (selection.filter(m => m.mealType === 'BREAKFAST').length !== 1 ||
                                        selection.filter(m => m.mealType === 'LUNCH').length !== 1 ||
                                        selection.filter(m => m.mealType === 'DINNER').length !== 1 ||
                                        selection.filter(m => m.mealType === 'SNACK').length > 2 ||
                                        selection.length === 0) && "opacity-50 cursor-not-allowed grayscale"
                                    )}
                                >
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copied ? '¡Copiado!' : 'Copiar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
