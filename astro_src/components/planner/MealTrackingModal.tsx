import React, { useState, useEffect } from 'react';
import { X, Star, Utensils, Info, ExternalLink } from 'lucide-react';
import { useSettings } from '@context/SettingsContext';

export interface MealTrackingData {
    mealPlanRecipeId: number;
    recipe: any;
    portionMultiplier: number;
    dayOfWeek: string;
    mealType: string;
    tracking?: {
        isEaten?: boolean;
        rating?: number;
        satietyLevel?: string;
        skippedReason?: string;
    }
}

interface MealTrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    mealData: MealTrackingData | null;
    onSave: (mealPlanRecipeId: number, trackingData: any) => void;
}

export function MealTrackingModal({ isOpen, onClose, mealData, onSave }: MealTrackingModalProps) {
    const { t } = useSettings();
    const trackingTexts = t.planner?.tracking;

    // Local form state
    const [isEaten, setIsEaten] = useState(true);
    const [rating, setRating] = useState(0);
    const [satietyLevel, setSatietyLevel] = useState('SATISFIED');
    const [skippedReason, setSkippedReason] = useState('NO_TIME');

    // Reset local state when a new meal is opened
    useEffect(() => {
        if (mealData) {
            setIsEaten(mealData.tracking?.isEaten ?? true);
            setRating(mealData.tracking?.rating ?? 0);
            setSatietyLevel(mealData.tracking?.satietyLevel || 'SATISFIED');
            setSkippedReason(mealData.tracking?.skippedReason || 'NO_TIME');
        }
    }, [mealData]);

    if (!isOpen || !mealData) return null;

    const recipe = mealData.recipe;
    const mult = mealData.portionMultiplier || 1.0;

    const handleSave = () => {
        const payload = isEaten
            ? { isEaten, rating, satietyLevel }
            : { isEaten, skippedReason };
        
        onSave(mealData.mealPlanRecipeId, payload);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background border border-border/50 shadow-2xl rounded-3xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                
                {/* Header: Recipe Details */}
                <div className="relative h-48 sm:h-56 shrink-0 bg-muted">
                    <img src={recipe?.image || '/placeholder.jpg'} alt={recipe?.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/40 text-white hover:bg-black/60 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="absolute bottom-4 left-6 right-6">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                                {mealData.mealType}
                            </span>
                            {mult !== 1.0 && (
                                <span className="px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-bold">
                                    Porción: {mult}x
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white line-clamp-1 mb-2">
                            {recipe?.name}
                        </h2>
                        <a 
                            href={`/recipes/${mealData.recipeId}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white text-xs font-medium transition-colors border border-white/20"
                        >
                            Ver receta completa
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>

                {/* Body: Tracking Form */}
                <div className="p-6 overflow-y-auto flex-1">
                    {mult !== 1.0 && (
                        <div className="mb-6 flex items-start gap-3 p-3 bg-secondary/10 text-secondary-foreground rounded-2xl border border-secondary/20">
                            <Info className="w-4 h-4 shrink-0 mt-0.5 text-secondary" />
                            <p className="text-xs leading-relaxed">
                                <strong>Nota de porción:</strong> El chef asignó un multiplicador de <strong>{mult}x</strong> para ajustarse a tus calorías. Las cantidades se escalan automáticamente.
                            </p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Eaten Toggle */}
                        <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEaten ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <Utensils className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">{trackingTexts?.eaten || 'Me lo comí'}</h3>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={isEaten} onChange={(e) => setIsEaten(e.target.checked)} />
                                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        {/* Conditional Fields */}
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            {isEaten ? (
                                <div className="space-y-6">
                                    {/* Rating */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold">{trackingTexts?.rating || 'Calificación'}</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className={`p-2 transition-transform hover:scale-110 active:scale-90 ${star <= rating ? 'text-yellow-400' : 'text-muted-foreground/30'}`}
                                                >
                                                    <Star className="w-8 h-8 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Satiety */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold">{trackingTexts?.satiety || '¿Cómo quedaste?'}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { value: 'VERY_HUNGRY', label: trackingTexts?.satietyLevels?.veryHungry || 'Muy hambriento' },
                                                { value: 'SATISFIED', label: trackingTexts?.satietyLevels?.satisfied || 'Satisfecho' },
                                                { value: 'VERY_FULL', label: trackingTexts?.satietyLevels?.veryFull || 'Muy lleno' }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => setSatietyLevel(opt.value)}
                                                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all
                                                        ${satietyLevel === opt.value 
                                                            ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                                                            : 'bg-background border-border/50 text-muted-foreground hover:border-border'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Skipped Reason */}
                                    <label className="text-sm font-bold text-destructive">{trackingTexts?.reason || '¿Por qué lo saltaste?'}</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: 'NO_TIME', label: trackingTexts?.reasons?.noTime || 'Falta de tiempo' },
                                            { value: 'TOO_EXPENSIVE', label: trackingTexts?.reasons?.tooExpensive || 'Muy caro' },
                                            { value: 'DIDNT_LIKE', label: trackingTexts?.reasons?.didntLike || 'No me gustó' },
                                            { value: 'ATE_OUT', label: trackingTexts?.reasons?.ateOut || 'Comí fuera' },
                                            { value: 'FORGOT', label: trackingTexts?.reasons?.forgot || 'Lo olvidé' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setSkippedReason(opt.value)}
                                                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all
                                                    ${skippedReason === opt.value 
                                                        ? 'bg-destructive/10 border-destructive text-destructive shadow-sm' 
                                                        : 'bg-background border-border/50 text-muted-foreground hover:border-border'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border/30 bg-muted/10 shrink-0">
                    <button
                        onClick={handleSave}
                        className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
                    >
                        {trackingTexts?.save || 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
