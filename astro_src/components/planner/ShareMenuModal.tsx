import React, { useRef, useState } from 'react';
import { toJpeg, toBlob } from 'html-to-image';
import { X, Download, Share2, Loader2, Sparkles, Smartphone, Square } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { DailyMenuShareCard } from './DailyMenuShareCard';
import type { Meal, PlanResponse } from '@/types/planner';
import { cn } from '@/lib/utils';

interface ShareMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
    meals: Meal[];
    planMetadata?: Omit<PlanResponse, 'meals'> | null;
    language?: string;
}

export function ShareMenuModal({ isOpen, onClose, date, meals, planMetadata, language = 'es' }: ShareMenuModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [format, setFormat] = useState<'POST' | 'STORY'>('POST');
    const [hydratedMeals, setHydratedMeals] = useState<Meal[]>(meals);
    const [isHydrating, setIsHydrating] = useState(false);

    // Sync hydration logic - same as summary
    React.useEffect(() => {
        if (isOpen && meals.length > 0) {
            const performHydration = async () => {
                setIsHydrating(true);
                try {
                    const { db } = await import('@/lib/db');
                    const results = await Promise.all(meals.map(async m => {
                        let mCarb = m.carbsGrams ?? m.carbohydrates ?? m.carbs ?? m.nutrition?.totalCarbs ?? m.nutrition?.totalCarbohydrates ?? m.nutrition?.carbohydrates ?? m.nutrition?.carbs ?? 0;
                        let mFat = m.fatGrams ?? m.fat ?? m.nutrition?.totalFat ?? m.nutrition?.fat ?? 0;

                        if ((mCarb === 0 || mFat === 0) && m.recipeUUID) {
                            const saved = await db.savedRecipes.get(String(m.recipeUUID));
                            if (saved) {
                                const n = saved.nutrition || {};
                                return {
                                    ...m,
                                    proteinGrams: m.proteinGrams || saved.proteinGrams || saved.protein || n.totalProtein || n.protein || 0,
                                    carbsGrams: m.carbsGrams || saved.carbsGrams || saved.carbohydrates || saved.carbs || n.totalCarbs || n.totalCarbohydrates || n.carbohydrates || n.carbs || 0,
                                    fatGrams: m.fatGrams || saved.fatGrams || saved.fat || n.totalFat || n.fat || 0,
                                    calories: m.calories || saved.calories || saved.kcal || n.totalCalories || n.calories || n.kcal || 0
                                };
                            }
                        }
                        return m;
                    }));
                    setHydratedMeals(results);
                } catch (e) {
                    console.error("Share hydration error", e);
                } finally {
                    setIsHydrating(false);
                }
            };
            performHydration();
        } else if (!isOpen) {
            setHydratedMeals(meals);
        }
    }, [isOpen, meals]);
    
    const isNativeShareSupported = typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare;

    const generateImage = async (output: 'DOWNLOAD' | 'SHARE') => {
        if (isHydrating) return; // Wait for data
        const elementId = `share-card-capture-${format}`;
        const element = document.getElementById(elementId);
        if (!element) return;

        setIsGenerating(true);
        console.log(`Generating ${format} image for ${output}...`);
        try {
            // High quality settings
            const options = {
                quality: 0.95, // Slightly lower for better compatibility and performance
                pixelRatio: 1.5, // Reduced from 2 to avoid memory limits while maintaining sharpness
                cacheBust: true,
                width: 1080,
                height: format === 'STORY' ? 1920 : 1080,
                backgroundColor: '#f7f2ea', // Match the card background
            };

            if (output === 'DOWNLOAD') {
                const dataUrl = await toJpeg(element, options);
                if (!dataUrl) throw new Error('Failed to generate image data URL');
                
                // Convert dataURL to Blob for a more reliable download in Chrome
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `cacomi-menu-${format.toLowerCase()}-${date.toISOString().split('T')[0]}.jpg`;
                link.href = url;
                link.click();
                
                // Cleanup
                setTimeout(() => URL.revokeObjectURL(url), 100);
            } else if (output === 'SHARE' && isNativeShareSupported) {
                const blob = await toBlob(element, options);
                if (!blob) return;

                const file = new File([blob], `cacomi-menu.jpg`, { type: 'image/jpeg' });
                
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Cacomi - Menú del Día',
                        text: '¡Mira mi plan de comidas para hoy en Cacomi!'
                    });
                }
            }
        } catch (err) {
            console.error('Error generating image:', err);
            // Fallback for font errors
            if (err instanceof Error && err.message.includes('cssRules')) {
                console.warn('Font rules blocked, trying without fonts...');
                try {
                    const fallbackOptions = { 
                        pixelRatio: 1.5, 
                        skipFonts: true,
                        backgroundColor: '#f7f2ea',
                        width: 1080,
                        height: format === 'STORY' ? 1920 : 1080,
                    };
                    if (output === 'DOWNLOAD') {
                        const dataUrl = await toJpeg(element, fallbackOptions);
                        if (!dataUrl) throw new Error('Failed to generate fallback data URL');
                        
                        const response = await fetch(dataUrl);
                        const blob = await response.blob();
                        
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.download = `cacomi-menu-${format.toLowerCase()}-${date.toISOString().split('T')[0]}.jpg`;
                        link.href = url;
                        link.click();
                        setTimeout(() => URL.revokeObjectURL(url), 100);
                    }
                } catch (fallbackErr) {
                    console.error('Fallback failed:', fallbackErr);
                }
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const previewContainerRef = React.useRef<HTMLDivElement>(null);
    const [scale, setScale] = React.useState(0.5);

    React.useEffect(() => {
        if (!previewContainerRef.current) return;
        
        const updateScale = () => {
            const container = previewContainerRef.current;
            if (!container) return;

            const padding = 64; // Base padding inside studio
            const availableW = container.clientWidth - padding;
            const availableH = container.clientHeight - padding;
            
            const cardW = 1080;
            const cardH = format === 'STORY' ? 1920 : 1080;
            
            const scaleW = availableW / cardW;
            const scaleH = availableH / cardH;
            
            // Use the smaller scale to ensure it fits both width and height
            const finalScale = Math.min(scaleW, scaleH, 1); // Max scale 1 (full size)
            setScale(finalScale);
        };

        const observer = new ResizeObserver(updateScale);
        observer.observe(previewContainerRef.current);
        updateScale(); // Initial call
        
        return () => observer.disconnect();
    }, [format, isOpen]);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-6xl" noPadding>
            <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900">
                
                {/* Left Side: Professional Preview Studio */}
                <div 
                    ref={previewContainerRef}
                    className="md:w-[55%] lg:w-[60%] bg-[#f5f5f5] dark:bg-black/40 p-2 sm:p-6 flex items-center justify-center relative overflow-hidden group border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5 h-[220px] md:h-auto md:min-h-0"
                >
                    {/* Artistic Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px]" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500 blur-[120px]" />
                    </div>

                    <div 
                        className={cn(
                            "bg-[#f7f2ea] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] transition-all duration-500 overflow-hidden shrink-0 border border-black/5 rounded-[24px] lg:rounded-[40px] relative z-10"
                        )}
                        style={{ 
                            width: '1080px',
                            height: format === 'STORY' ? '1920px' : '1080px',
                            transform: `scale(${scale})`,
                            transformOrigin: 'center'
                        }}
                    >
                        <DailyMenuShareCard date={date} meals={hydratedMeals} planMetadata={planMetadata} language={language} format={format} />
                    </div>
                </div>

                {/* Right Side: Controls & Branding */}
                <div className="md:w-[45%] lg:w-[40%] bg-white dark:bg-gray-900 p-6 sm:p-8 lg:p-12 flex flex-col overflow-y-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-1 rounded-full bg-primary" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Cacomi Social</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                            {language === 'es' ? 'Comparte tu éxito' : 'Share your success'}
                        </h2>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-4 mb-8">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                             {language === 'es' ? 'Seleccionar Formato' : 'Select Format'}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setFormat('POST')}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                                    format === 'POST' 
                                        ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/10" 
                                        : "bg-transparent border-gray-100 dark:border-white/5 text-muted-foreground hover:border-gray-200"
                                )}
                            >
                                <Square className={cn("w-5 h-5", format === 'POST' ? "fill-primary/20" : "")} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Post</span>
                            </button>
                            <button
                                onClick={() => setFormat('STORY')}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                                    format === 'STORY' 
                                        ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/10" 
                                        : "bg-transparent border-gray-100 dark:border-white/5 text-muted-foreground hover:border-gray-200"
                                )}
                            >
                                <Smartphone className={cn("w-5 h-5", format === 'STORY' ? "fill-primary/20" : "")} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Stories</span>
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto space-y-3">
                        <button
                            onClick={() => generateImage('DOWNLOAD')}
                            disabled={isGenerating || isHydrating}
                            className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-primary text-primary-foreground rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-50"
                        >
                            {(isGenerating || isHydrating) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                            {isHydrating ? (language === 'es' ? 'Cargando datos...' : 'Loading data...') : (language === 'es' ? 'Descargar' : 'Download')}
                        </button>
                        
                        {isNativeShareSupported && (
                            <button
                                onClick={() => generateImage('SHARE')}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-[#111b27] text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-black transition-all"
                            >
                                <Share2 className="w-5 h-5" />
                                {language === 'es' ? 'Compartir' : 'Share'}
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {language === 'es' ? '← Cerrar' : '← Close'}
                        </button>
                    </div>
                </div>
            </div>
            {/* Hidden Full Size Render (For html-to-image to target) */}
            <div 
                className="absolute opacity-0 pointer-events-none select-none overflow-hidden" 
                style={{ top: '-10000px', left: '-10000px', width: '1080px', height: '1920px' }}
                aria-hidden="true"
            >
                 <DailyMenuShareCard date={date} meals={hydratedMeals} planMetadata={planMetadata} language={language} format="POST" isCapture />
                 <DailyMenuShareCard date={date} meals={hydratedMeals} planMetadata={planMetadata} language={language} format="STORY" isCapture />
            </div>
        </Modal>
    );
}
