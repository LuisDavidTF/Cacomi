import React, { useState, useEffect } from 'react';
import { X, Star, Utensils, Info, ExternalLink, Sparkles, Beef, Coins, Package, Flame, Plus, Minus, Droplets, CircleDashed } from 'lucide-react';
import { useSettings } from '@context/SettingsContext';
import { RecipeScaleOverlay } from './RecipeScaleOverlay';
import { db } from '@/lib/db';

import type { Meal } from '@/types/planner';


export type MealTrackingData = Meal & {
    tracking?: {
        isEating?: boolean;
        rating?: number;
        satietyLevel?: 'HUNGRY' | 'SATISFIED' | 'STUFFED';
        skippedReason?: string;
    }
};


interface MealTrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    mealData: MealTrackingData | null;
    onSave: (mealPlanRecipeId: number, trackingData: any) => void;
}

export function MealTrackingModal({ isOpen, onClose, mealData, onSave }: MealTrackingModalProps) {
    const { t, language } = useSettings();
    const trackingTexts = t.planner?.tracking;

    // Local form state
    const [isEating, setIsEating] = useState(true);
    const [rating, setRating] = useState(0);
    const [satietyLevel, setSatietyLevel] = useState<'HUNGRY' | 'SATISFIED' | 'STUFFED'>('SATISFIED');
    const [skippedReason, setSkippedReason] = useState('NO_TIME');
    const [customReason, setCustomReason] = useState('');
    const [isViewingRecipe, setIsViewingRecipe] = useState(false);

    // Portion adjustment for manual meals
    const [localMultiplier, setLocalMultiplier] = useState(1.0);
    const [displayCalories, setDisplayCalories] = useState(0);
    const [displayProtein, setDisplayProtein] = useState(0);
    const [displayCarbs, setDisplayCarbs] = useState(0);
    const [displayFat, setDisplayFat] = useState(0);
    const [displayCost, setDisplayCost] = useState(0);
    const [isHydrating, setIsHydrating] = useState(false);

    useEffect(() => {
        if (mealData) {
            setIsEating(mealData.tracking?.isEating ?? true);
            setRating(mealData.tracking?.rating ?? 0);
            setSatietyLevel(mealData.tracking?.satietyLevel || 'SATISFIED');

            const reason = mealData.tracking?.skippedReason || 'NO_TIME';
            const isStandard = ['NO_TIME', 'TOO_EXPENSIVE', 'DIDNT_LIKE', 'ATE_OUT', 'FORGOT'].includes(reason);

            if (isStandard) {
                setSkippedReason(reason);
                setCustomReason('');
            } else {
                setSkippedReason('OTHER');
                setCustomReason(reason);
            }

            setIsViewingRecipe(false);

            // Portions
            setLocalMultiplier(mealData.portionMultiplier || 1.0);
        }
    }, [mealData]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isOpen]);

    // Reactively update display values when multiplier or mealData changes
    useEffect(() => {
        const updateDisplayValues = async () => {
            if (mealData && isOpen) {
                setIsHydrating(true);
                const originalMult = mealData.portionMultiplier || 1.0;

                // Base values from mealData
                let baseCals = (mealData.calories || 0) / originalMult;
                let baseProt = (mealData.proteinGrams || 0) / originalMult;
                let baseCarbs = (mealData.carbsGrams || 0) / originalMult;
                let baseFat = (mealData.fatGrams || mealData.fat || 0) / originalMult;
                let baseCost = (mealData.estimatedCost || 0) / originalMult;

                // CRITICAL: If macros are 0 or missing, try to hydrate from savedRecipes
                // Minimal responses often have calories/protein but NOT carbs/fat
                if ((baseCals === 0 || baseCarbs === 0 || baseFat === 0) && mealData.recipeUUID) {
                    const saved = await db.savedRecipes.get(String(mealData.recipeUUID));
                    if (saved) {
                        const n = saved.nutrition || {};
                        // Prioritize nutrition object, then flat fields
                        const protein = saved.proteinGrams ?? saved.protein ?? n.totalProtein ?? n.protein ?? 0;
                        const carbs = saved.carbsGrams ?? saved.carbohydrates ?? saved.carbs ?? n.totalCarbs ?? n.totalCarbohydrates ?? n.carbohydrates ?? n.carbs ?? 0;
                        const fat = saved.fatGrams ?? saved.fat ?? n.totalFat ?? n.fat ?? 0;
                        const calories = saved.calories ?? saved.kcal ?? n.totalCalories ?? n.calories ?? n.kcal ?? 0;
                        
                        if (protein > 0) baseProt = protein;
                        if (carbs > 0) baseCarbs = carbs;
                        if (fat > 0) baseFat = fat;
                        if (calories > 0) baseCals = calories;
                    }
                }

                setDisplayCalories(baseCals * localMultiplier);
                setDisplayProtein(baseProt * localMultiplier);
                setDisplayCarbs(baseCarbs * localMultiplier);
                setDisplayFat(baseFat * localMultiplier);
                setDisplayCost(baseCost * localMultiplier);
                setIsHydrating(false);
            }
        };

        updateDisplayValues();
    }, [mealData, localMultiplier, isOpen]);

    if (!isOpen || !mealData) return null;

    const handleMultiplierChange = (val: number | string) => {
        let newMult = typeof val === 'string' ? parseFloat(val) : val;

        if (isNaN(newMult) || newMult < 0.1) newMult = 0.1;
        if (newMult > 10) newMult = 10;

        setLocalMultiplier(Number(newMult.toFixed(2)));
    };

    const handleSave = () => {
        if (mealData.isNew === 1) {
            // Manual meal: Save local adjustments
            onSave(mealData.id as any, {
                portionMultiplier: localMultiplier,
                calories: displayCalories,
                proteinGrams: displayProtein,
                carbsGrams: displayCarbs,
                fatGrams: displayFat,
                estimatedCost: displayCost
            });
            onClose();
            return;
        }

        const finalReason = skippedReason === 'OTHER' ? customReason : skippedReason;

        const payload = isEating
            ? { isEating, rating, satietyLevel, mealId: mealData.mealId || mealData.logId }
            : { isEating, skippedReason: finalReason, mealId: mealData.mealId || mealData.logId };

        onSave((mealData.mealId || mealData.logId) as number, payload);
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className={`bg-background border border-border/50 shadow-2xl rounded-3xl w-full flex flex-col lg:flex-row overflow-hidden transition-all duration-500 ease-in-out h-[90vh] sm:h-[800px] ${isViewingRecipe ? 'max-w-4xl' : 'max-w-xl'}`}>

                {/* Left Side: Form */}
                <div className={`flex flex-col w-full h-full transition-all duration-500 ${isViewingRecipe ? 'hidden lg:flex lg:w-[420px] shrink-0 border-r border-border/30' : 'flex-1'}`}>

                    {/* Unified Scroll Container (Mobile) / Fixed Header (LG) */}
                    <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col custom-scrollbar">

                        {/* Header: Recipe Details */}
                        <div className="relative h-[380px] sm:h-[480px] shrink-0 bg-muted/20 group overflow-hidden">
                            <img
                                src={mealData.imageUrl || '/placeholder.jpg'}
                                alt={mealData.recipeName}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

                            <div className="absolute top-6 left-6 flex items-center gap-3 z-20 max-w-[calc(100%-80px)] overflow-x-auto no-scrollbar">
                                <span className="shrink-0 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/40 backdrop-blur-md border border-white/10">
                                    {mealData.mealType}
                                </span>
                                {localMultiplier !== 1.0 && (
                                    <span className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/40 backdrop-blur-md border border-white/10">
                                        {localMultiplier}x PORCIÓN
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-3.5 bg-black/40 backdrop-blur-xl text-white hover:bg-black/60 rounded-2xl transition-all duration-300 hover:rotate-90 z-30 shadow-2xl"
                                aria-label="Close"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end transition-all duration-500">
                                <h2 className={`font-black text-white leading-[1.1] mb-6 drop-shadow-2xl tracking-tighter transition-all duration-500 line-clamp-3 ${isViewingRecipe ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl md:text-5xl'}`}>
                                    {mealData.recipeName}
                                </h2>
                                {(displayCalories > 0 || displayProtein > 0) ? (
                                    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 py-5 px-6 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-2xl transition-all duration-500 ${isViewingRecipe ? 'scale-90 origin-left' : ''}`}>
                                <div className="flex flex-col items-center sm:items-start text-center sm:text-left min-w-0">
                                    <span className="text-[9px] sm:text-[10px] uppercase font-black text-white/40 tracking-[0.2em] mb-1.5 truncate w-full">
                                        {trackingTexts?.stats?.energy || 'Calorías'}
                                    </span>
                                    <div className="flex items-center gap-2 text-white font-black text-base sm:text-lg truncate w-full">
                                        <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                                        {isHydrating ? (
                                            <div className="h-5 w-12 bg-white/20 animate-pulse rounded-md" />
                                        ) : (
                                            <span className="animate-in fade-in duration-500">{displayCalories?.toFixed(0)}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center sm:items-start text-center sm:text-left min-w-0">
                                    <span className="text-[9px] sm:text-[10px] uppercase font-black text-white/40 tracking-[0.2em] mb-1.5 truncate w-full">
                                        {trackingTexts?.stats?.protein || 'Proteína'}
                                    </span>
                                    <div className="flex items-center gap-2 text-white font-black text-base sm:text-lg truncate w-full">
                                        <Beef className="w-4 h-4 text-blue-400 shrink-0" />
                                        {isHydrating ? (
                                            <div className="h-5 w-10 bg-white/20 animate-pulse rounded-md" />
                                        ) : (
                                            <div className="flex items-baseline gap-1 animate-in fade-in duration-500">
                                                <span>{displayProtein?.toFixed(0)}</span>
                                                <span className="text-[10px] font-medium opacity-40">g</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center sm:items-start text-center sm:text-left min-w-0">
                                    <span className="text-[9px] sm:text-[10px] uppercase font-black text-white/40 tracking-[0.2em] mb-1.5 truncate w-full">
                                        {t.recipe?.carbs || 'Carbohidratos'}
                                    </span>
                                    <div className="flex items-center gap-2 text-white font-black text-base sm:text-lg truncate w-full">
                                        <CircleDashed className="w-4 h-4 text-yellow-400 shrink-0" />
                                        {isHydrating ? (
                                            <div className="h-5 w-10 bg-white/20 animate-pulse rounded-md" />
                                        ) : (
                                            <div className="flex items-baseline gap-1 animate-in fade-in duration-500">
                                                <span>{displayCarbs?.toFixed(0)}</span>
                                                <span className="text-[10px] font-medium opacity-40">g</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center sm:items-start text-center sm:text-left min-w-0">
                                    <span className="text-[9px] sm:text-[10px] uppercase font-black text-white/40 tracking-[0.2em] mb-1.5 truncate w-full">
                                        {t.recipe?.fat || 'Grasas'}
                                    </span>
                                    <div className="flex items-center gap-2 text-white font-black text-base sm:text-lg truncate w-full">
                                        <Droplets className="w-4 h-4 text-emerald-400 shrink-0" />
                                        {isHydrating ? (
                                            <div className="h-5 w-10 bg-white/20 animate-pulse rounded-md" />
                                        ) : (
                                            <div className="flex items-baseline gap-1 animate-in fade-in duration-500">
                                                <span>{displayFat?.toFixed(0)}</span>
                                                <span className="text-[10px] font-medium opacity-40">g</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                        {/* Cost Badge - Moved to a subtle floating position or secondary row */}
                                        <div className="col-span-2 sm:col-span-4 pt-4 mt-2 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{trackingTexts?.stats?.cost || 'Costo Estimado'}</span>
                                            <div className="flex items-center gap-1.5 text-white/80 font-bold text-xs">
                                                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                                                <span>${displayCost?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-8 p-4 bg-amber-500/20 backdrop-blur-3xl border border-amber-500/30 rounded-3xl text-white text-[11px] sm:text-xs font-bold italic text-center animate-pulse shadow-2xl">
                                        Esta comida aún no ha sido calculada por Cacomi, espera al día de mañana para conocer su información nutricional.
                                    </div>
                                )}



                                <button
                                    onClick={() => setIsViewingRecipe(true)}
                                    className={`w-full sm:w-auto inline-flex justify-center items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-2xl hover:bg-white/90 active:scale-95 ${isViewingRecipe ? 'hidden' : 'flex'}`}
                                >
                                    {trackingTexts?.viewRecipe || 'Ver receta completa'}
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>


                        {/* Body: Tracking Form */}
                        <div className="p-6 md:p-8 lg:overflow-y-auto overscroll-contain lg:flex-1 custom-scrollbar min-h-0 bg-background">
                            {mealData.isNew !== 1 && localMultiplier !== 1.0 && (
                                <div className="mb-6 flex items-start gap-3 p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20 shadow-sm">
                                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p className="text-sm leading-relaxed font-medium">
                                        <strong>Nota de porción:</strong> El chef asignó un multiplicador de <strong>{localMultiplier}x</strong>. Las cantidades de la receta se escalan automáticamente.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-8">
                                {/* AI Reasoning */}
                                {mealData.aiReasoning && (
                                    <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl">
                                        <div className="flex items-start gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            <h3 className="text-sm font-bold text-primary tracking-wide">Nota del Chef AI</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground/90 leading-relaxed font-medium">
                                            {mealData.aiReasoning}
                                        </p>
                                    </div>
                                )}

                                {/* Portion Adjustment for Manual Meals */}
                                {mealData.isNew === 1 ? (
                                    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Utensils className="w-5 h-5 text-primary" />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-primary">Ajuste de Porción</h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                                            Personaliza el tamaño de tu porción manual. Los valores nutricionales se recalcularán automáticamente para tu plan.
                                        </p>

                                        <div className="flex items-center gap-6 p-2 bg-background rounded-2xl border border-border/50 shadow-inner">
                                            <button
                                                onClick={() => handleMultiplierChange(localMultiplier - 0.1)}
                                                className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all active:scale-90"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>
                                            <div className="flex-1 flex flex-col items-center justify-center min-w-0">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0.1"
                                                    max="10"
                                                    value={localMultiplier}
                                                    onChange={(e) => setLocalMultiplier(parseFloat(e.target.value) || 0)}
                                                    onBlur={(e) => handleMultiplierChange(e.target.value)}
                                                    className="w-full bg-transparent text-4xl font-black text-center focus:outline-none tabular-nums leading-none"
                                                />
                                                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mt-1 pointer-events-none">
                                                    Porciones
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleMultiplierChange(localMultiplier + 0.1)}
                                                className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all active:scale-90"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Eaten Toggle */}
                                        <div
                                            className={`flex items-center justify-between p-5 border rounded-2xl cursor-pointer transition-all duration-300 ${isEating ? 'bg-primary/5 border-primary/30 shadow-inner' : 'bg-muted/30 border-border/50'}`}
                                            onClick={() => setIsEating(!isEating)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${isEating ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-background border border-border text-muted-foreground'}`}>
                                                    <Utensils className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className={`text-base font-bold transition-colors ${isEating ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {trackingTexts?.eaten || 'Me lo comí'}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-0.5">Registra tu comida para ajustar tu plan</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                                                <input type="checkbox" className="sr-only peer" checked={isEating} readOnly />
                                                <div className="w-12 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                            </label>
                                        </div>

                                        {/* Conditional Tracking Fields */}
                                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                            {isEating ? (
                                                <div className="space-y-8 bg-muted/10 p-6 rounded-3xl border border-border/40">
                                                    <div className="space-y-4">
                                                        <label className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">{trackingTexts?.rating || 'Calificación'}</label>
                                                        <div className="flex gap-2 sm:gap-3">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() => setRating(star)}
                                                                    className={`relative p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${star <= rating ? 'bg-yellow-400/10 text-yellow-500 shadow-sm' : 'bg-background border border-border/50 text-muted-foreground/30 hover:bg-muted'}`}
                                                                >
                                                                    <Star className={`w-6 h-6 sm:w-8 sm:h-8 ${star <= rating ? 'fill-current drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : ''}`} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <label className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">{trackingTexts?.satiety || '¿Cómo quedaste?'}</label>
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                            {[
                                                                { value: 'HUNGRY', label: trackingTexts?.satietyLevels?.hungry || 'Con hambre', icon: '☹️' },
                                                                { value: 'SATISFIED', label: trackingTexts?.satietyLevels?.satisfied || 'Satisfecho', icon: '😊' },
                                                                { value: 'STUFFED', label: trackingTexts?.satietyLevels?.stuffed || 'Demasiado lleno', icon: '😵‍💫' }
                                                            ].map((opt) => (
                                                                <button
                                                                    key={opt.value}
                                                                    onClick={() => setSatietyLevel(opt.value as any)}
                                                                    className={`flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2 px-4 py-4 sm:py-5 rounded-2xl border transition-all duration-300
                                                                        ${satietyLevel === opt.value
                                                                            ? 'bg-primary text-primary-foreground border-transparent shadow-lg shadow-primary/30 scale-[1.02]'
                                                                            : 'bg-background border-border/50 text-muted-foreground hover:border-border hover:bg-muted/30'}`}
                                                                >
                                                                    <span className="text-2xl sm:text-3xl filter drop-shadow-sm">{opt.icon}</span>
                                                                    <span className="text-sm font-bold tracking-wide">{opt.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6 bg-destructive/5 p-6 rounded-3xl border border-destructive/10">
                                                    <div className="space-y-4">
                                                        <label className="text-sm font-extrabold uppercase tracking-wider text-destructive">{trackingTexts?.reason || '¿Por qué lo saltaste?'}</label>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {[
                                                                { value: 'NO_TIME', label: trackingTexts?.reasons?.noTime || 'Sin tiempo', icon: '⏱️' },
                                                                { value: 'TOO_EXPENSIVE', label: trackingTexts?.reasons?.tooExpensive || 'Muy caro', icon: '💸' },
                                                                { value: 'DIDNT_LIKE', label: trackingTexts?.reasons?.didntLike || 'No me gustó', icon: '🤢' },
                                                                { value: 'ATE_OUT', label: trackingTexts?.reasons?.ateOut || 'Comí fuera', icon: '🍽️' },
                                                                { value: 'FORGOT', label: trackingTexts?.reasons?.forgot || 'Lo olvidé', icon: '🤦' },
                                                                { value: 'OTHER', label: trackingTexts?.reasons?.other || 'Otro', icon: '✍️' }
                                                            ].map((opt) => (
                                                                <button
                                                                    key={opt.value}
                                                                    onClick={() => setSkippedReason(opt.value)}
                                                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-300 text-left
                                                                        ${skippedReason === opt.value
                                                                            ? 'bg-destructive text-destructive-foreground border-transparent shadow-md shadow-destructive/20 scale-[1.02]'
                                                                            : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}
                                                                >
                                                                    <span className="text-xl">{opt.icon}</span>
                                                                    <span className="text-sm font-bold tracking-wide">{opt.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {skippedReason === 'OTHER' && (
                                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <textarea
                                                                value={customReason}
                                                                onChange={(e) => setCustomReason(e.target.value)}
                                                                placeholder={trackingTexts?.specifyReason || 'Especificar razón...'}
                                                                className="w-full p-4 bg-background border border-destructive/20 rounded-2xl text-sm focus:ring-2 focus:ring-destructive/20 focus:border-destructive outline-none min-h-[100px] resize-none font-medium"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {mealData.isNew !== 1 && (
                                    <div className="pt-6 mt-6 border-t border-border/40 animate-in fade-in duration-700">
                                        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl transition-all hover:bg-primary/10 group">
                                            <div className="mt-1 shrink-0 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                                                <Sparkles className="w-2.5 h-2.5 text-primary" />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                                {language === 'es'
                                                    ? 'Al generar este plan, aceptaste compartir datos anonimizados. Tu feedback es la brújula de nuestra IA: cada "Meal Check" nos ayuda a perfeccionar tus planes futuros para que sean exactamente lo que necesitas. ¡Gracias por mejorar con nosotros!'
                                                    : 'By generating this plan, you agreed to share anonymized data. Your feedback is our AI\'s compass: each "Meal Check" helps us perfect your future plans to be exactly what you need. Thanks for improving with us!'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                    </div> {/* <-- Closes Unified Scroll Container */}

                    {/* Footer - Pinned to bottom */}
                    <div className="p-4 border-t border-border/30 bg-muted/10 shrink-0">
                        <button
                            onClick={handleSave}
                            disabled={mealData.isNew !== 1 && isEating && rating === 0}
                            className={`w-full py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-[0.98]
                                ${mealData.isNew !== 1 && isEating && rating === 0
                                    ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                                    : 'bg-primary text-primary-foreground shadow-primary/20 hover:opacity-90'}`}
                        >
                            {trackingTexts?.save || 'Guardar'}
                        </button>
                        {mealData.isNew !== 1 && isEating && rating === 0 && (
                            <p className="text-[10px] text-center text-destructive font-bold mt-2 animate-pulse uppercase tracking-widest">
                                {language === 'es' ? 'Por favor califica tu comida' : 'Please rate your meal'}
                            </p>
                        )}
                    </div>
                </div> {/* <-- Closes Left Side: Tracking Form */}

                {/* Right Side: Recipe Scale Overlay */}
                {isViewingRecipe && (
                    <div className="flex flex-col flex-1 w-full h-full min-h-0 overflow-hidden animate-in fade-in lg:slide-in-from-right-8 duration-300 relative">
                        <RecipeScaleOverlay
                            recipeUUID={mealData.recipeUUID}
                            multiplier={localMultiplier}
                            onClose={() => setIsViewingRecipe(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
