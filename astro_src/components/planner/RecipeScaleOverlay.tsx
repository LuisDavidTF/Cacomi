import React, { useState, useEffect } from 'react';
import { X, Loader2, Info, Sparkles } from 'lucide-react';
import { db } from '@/lib/db';
import { useSettings } from '../../context/SettingsContext';

interface RecipeScaleOverlayProps {
    recipeUUID: string;
    multiplier: number;
    onClose: () => void;
}

export function RecipeScaleOverlay({ recipeUUID, multiplier, onClose }: RecipeScaleOverlayProps) {
    const { t } = useSettings();
    const viewerTexts = t?.planner?.scaledViewer;
    const [recipe, setRecipe] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                // 1. Try Local Dexie Storage first (Offline-First)
                const offlineRecipe = await db.savedRecipes.get(String(recipeUUID));
                if (offlineRecipe && offlineRecipe.ingredients && offlineRecipe.ingredients.length > 0) {
                    setRecipe(offlineRecipe);
                    setLoading(false);
                    return;
                }

                // 2. Fallback to API if online
                if (!navigator.onLine) {
                    throw new Error('Sin conexión: La receta no está disponible offline.');
                }

                const res = await fetch(`/api/recipes/${recipeUUID}`);
                if (!res.ok) throw new Error('Error al cargar la receta');
                const data = await res.json();
                setRecipe(data);
                
                // 3. Cache it for next time
                await db.savedRecipes.put({
                    ...data,
                    id: String(recipeUUID),
                    savedAt: new Date().toISOString()
                });

            } catch (err: any) {
                setError(err.message || 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [recipeUUID]);

    const scaleNumber = (num: number) => {
        const scaled = num * multiplier;
        return Number.isInteger(scaled) ? scaled : Number(scaled.toFixed(2));
    };

    // Very basic instruction scaler - avoids common time/temp words
    const scaleInstructionText = (text: string) => {
        if (multiplier === 1) return text;
        
        // Regex looks for a number, optionally followed by a space, and checks negative lookahead for temp/time words
        const regex = /\b(\d+(?:\.\d+)?)\b(?!\s*(?:minuto|hora|grado|celsiu|faren|hr|min|segundo|c|f)\b)/gi;
        
        return text.replace(regex, (match, p1) => {
            const num = parseFloat(p1);
            if (isNaN(num)) return match;
            return scaleNumber(num).toString();
        });
    };

    if (loading) {
        return (
            <div className="flex-1 bg-background flex flex-col items-center justify-center rounded-3xl min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-sm font-medium text-muted-foreground">Cargando detalles...</p>
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="flex-1 bg-background flex flex-col items-center justify-center rounded-3xl p-6 text-center min-h-[300px]">
                <p className="text-destructive font-bold mb-2">No se pudo cargar la receta</p>
                <p className="text-sm text-muted-foreground mb-6">{error}</p>
                <button onClick={onClose} className="px-4 py-2 bg-muted rounded-lg text-sm font-medium">
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 w-full h-full min-h-0 bg-background overflow-hidden relative">
            {/* Cinematic Header with Enhanced Contrast for Light Mode */}
            <div className="relative h-[240px] shrink-0 bg-muted group overflow-hidden">
                <img 
                    src={recipe.imageUrl || '/placeholder.jpg'} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 dark:opacity-60" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-black/10" />
                
                <div className="absolute bottom-6 left-8 right-16">
                    <span className="text-[10px] text-primary-foreground/90 bg-primary/20 backdrop-blur-md px-2 py-0.5 rounded w-fit font-black uppercase tracking-[0.3em] block mb-3">
                        {viewerTexts?.title || 'VISOR DE RECETA AJUSTADA'}
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-black leading-tight text-white tracking-tighter drop-shadow-lg">
                        {recipe.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="px-3 py-1.5 rounded-xl bg-white/20 border border-white/30 backdrop-blur-md">
                            <span className="text-xs font-black text-white tracking-widest uppercase">
                                Porción: {multiplier}x
                            </span>
                        </div>
                        {multiplier !== 1 && (
                            <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 backdrop-blur-md">
                                <span className="text-xs font-black text-amber-400 tracking-widest uppercase flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> ESCALADA
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl rounded-2xl text-white transition-all duration-300 hover:rotate-90 z-10"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Scrollable Content with crisp Light Mode styling */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-8 py-10 space-y-12 custom-scrollbar min-h-0 bg-background">
                {multiplier !== 1 && (
                    <div className="bg-amber-500/5 dark:bg-amber-500/10 p-6 rounded-2xl border border-amber-500/20 shadow-sm">
                        <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4" /> {viewerTexts?.note || 'NOTA DE AJUSTE'}
                        </h4>
                        <p className="text-sm text-foreground/80 dark:text-foreground/70 leading-relaxed font-medium">
                            Las cantidades han sido ajustadas automáticamente a tu porción ({multiplier}x). Tiempos y temperaturas se mantienen originales.
                        </p>
                    </div>
                )}

                {/* Ingredients Grid */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <h3 className="text-xs uppercase font-black text-foreground tracking-[0.2em] whitespace-nowrap">
                            {viewerTexts?.ingredients || 'INGREDIENTES ESCALA'}
                        </h3>
                        <div className="h-px bg-border/60 dark:bg-border/40 flex-1" />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {recipe.ingredients?.map((ing: any, i: number) => {
                            const name = typeof ing === 'object' ? ing.name : ing;
                            const qty = typeof ing === 'object' ? ing.quantity : null;
                            const unit = typeof ing === 'object' ? ing.unitOfMeasure : null;
                            const scaledQty = qty ? scaleNumber(qty) : null;
                            const meta = scaledQty ? `${scaledQty} ${unit || ''}`.trim() : unit;

                            return (
                                <div key={i} className="flex justify-between items-center p-4 bg-muted/30 dark:bg-muted/20 border border-border/60 dark:border-border/30 rounded-2xl transition-all hover:border-primary/40 group">
                                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{name}</span>
                                    {meta && (
                                        <span className="text-xs font-black text-primary bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                                            {meta}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Instructions List */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <h3 className="text-xs uppercase font-black text-foreground tracking-[0.2em] whitespace-nowrap">
                            {viewerTexts?.instructions || 'PREPARACIÓN'}
                        </h3>
                        <div className="h-px bg-border/60 dark:bg-border/40 flex-1" />
                    </div>
                    <div className="space-y-8">
                        {recipe.instructions?.map((step: any, index: number) => {
                            const stepText = typeof step === 'object' ? (step.text || step.description) : step;
                            const scaledText = scaleInstructionText(stepText);

                            return (
                                <div key={index} className="flex gap-6 items-start group">
                                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl bg-muted border border-border/80 dark:border-border/50 text-foreground dark:text-muted-foreground font-black text-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent transition-all group-hover:scale-110 shadow-sm">
                                        {index + 1}
                                    </div>
                                    <p className="text-sm text-foreground/90 dark:text-foreground/80 leading-relaxed pt-2 font-medium">
                                        {scaledText}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
