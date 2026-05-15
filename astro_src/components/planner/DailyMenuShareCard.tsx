import React from 'react';
import type { Meal, PlanResponse } from '@/types/planner';
import { Flame, Beef, CircleDashed, Droplets, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyMenuShareCardProps {
    date: Date;
    meals: Meal[];
    planMetadata?: Omit<PlanResponse, 'meals'> | null;
    language?: string;
    format?: 'POST' | 'STORY';
}

export function DailyMenuShareCard({ date, meals, planMetadata, language = 'es', format = 'POST' }: DailyMenuShareCardProps) {
    const isStory = format === 'STORY';
    const width = 1080;
    const height = isStory ? 1920 : 1080;

    const dayName = date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { weekday: 'long' });
    const dayNumber = date.getDate();
    const monthName = date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'long' });
    
    // Sort meals by type/time
    const mealOrder = { 'BREAKFAST': 1, 'SNACK': 2, 'LUNCH': 3, 'DINNER': 5 };
    const sortedMeals = [...meals].sort((a, b) => {
        const orderA = mealOrder[a.mealType as keyof typeof mealOrder] || 4;
        const orderB = mealOrder[b.mealType as keyof typeof mealOrder] || 4;
        return orderA - orderB;
    });

    const totals = meals.reduce((acc, m) => {
        const mult = m.portionMultiplier || 1.0;
        acc.calories += (m.calories || 0);
        acc.protein += (m.proteinGrams || 0);
        acc.carbs += (m.carbsGrams || 0);
        acc.fat += (m.fatGrams || 0);
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const t = {
        es: {
            title: 'Menú del Día',
            nutrition: 'Información Nutricional',
            calories: 'Calorías',
            protein: 'Proteína',
            carbs: 'Carbohidratos',
            fat: 'Grasas',
            portion: 'porción',
            breakfast: 'Desayuno',
            lunch: 'Almuerzo',
            dinner: 'Cena',
            snack: 'Snack'
        },
        en: {
            title: 'Daily Menu',
            nutrition: 'Nutritional Info',
            calories: 'Calories',
            protein: 'Protein',
            carbs: 'Carbs',
            fat: 'Fat',
            portion: 'portion',
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            snack: 'Snack'
        }
    }[language === 'es' ? 'es' : 'en'];

    const getMealLabel = (type: string) => {
        switch (type) {
            case 'BREAKFAST': return t.breakfast;
            case 'LUNCH': return t.lunch;
            case 'DINNER': return t.dinner;
            case 'SNACK': return t.snack;
            default: return type;
        }
    };

    // Explicit category filtering
    const breakfast = meals.filter(m => m.mealType === 'BREAKFAST');
    const lunch = meals.filter(m => m.mealType === 'LUNCH');
    const dinner = meals.filter(m => m.mealType === 'DINNER');
    const snacks = meals.filter(m => m.mealType === 'SNACK');

    // High-fidelity assembly logic
    const finalMeals: (Meal & { displayTime: string })[] = [];
    
    // Slot 1: Breakfast
    breakfast.forEach(m => finalMeals.push({ ...m, displayTime: '08:30' }));
    
    // Slot 2: First Snack (Between Breakfast and Lunch)
    if (snacks[0]) {
        finalMeals.push({ ...snacks[0], displayTime: '11:00' });
    }
    
    // Slot 3: Lunch
    lunch.forEach(m => finalMeals.push({ ...m, displayTime: '14:00' }));
    
    // Slot 4: Second Snack (Between Lunch and Dinner)
    if (snacks[1]) {
        finalMeals.push({ ...snacks[1], displayTime: '17:30' });
    }
    
    // Slot 5: Dinner
    dinner.forEach(m => finalMeals.push({ ...m, displayTime: '20:30' }));
    
    // Slot 6: Remaining Snacks
    if (snacks.length > 2) {
        snacks.slice(2).forEach((m, i) => {
            finalMeals.push({ ...m, displayTime: i === 0 ? '22:30' : '--:--' });
        });
    }

    return (
        <div 
            id={`share-card-content-${format}`}
            className="bg-[#f7f2ea] flex flex-col relative overflow-hidden font-sans text-[#111b27]"
            style={{ 
                fontFamily: "'Inter', sans-serif",
                width: `${width}px`,
                height: `${height}px`,
                padding: isStory ? '120px 80px' : '80px 80px'
            }}
        >
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

            {/* Header */}
            <div className={`flex justify-between items-start z-10 ${isStory ? 'mb-10' : 'mb-4'}`}>
                <div className="flex flex-col">
                    <img src="/images/brand/logo_transparent.png" alt="Cacomi" className={`${isStory ? 'h-28' : 'h-20'} w-auto mb-2 object-contain self-start -ml-2`} />
                    <p className="text-[#de7c5d] font-black uppercase tracking-[0.2em] text-sm max-w-[320px] leading-tight">
                        {language === 'es' 
                            ? 'Tu mejor versión empieza en tu plato. Personaliza este menú en Cacomi.' 
                            : 'Your best version starts on your plate. Customize this menu on Cacomi.'}
                    </p>
                </div>
                <div className="text-right">
                    <h1 className={`${isStory ? 'text-7xl' : 'text-5xl'} font-black text-[#111b27] uppercase leading-none`} style={{ fontFamily: "'Playfair Display', serif" }}>
                        {dayName}
                    </h1>
                    <p className={`${isStory ? 'text-2xl' : 'text-xl'} font-medium text-[#111b27]/60 mt-2`}>
                        {dayNumber} de {monthName}
                    </p>
                </div>
            </div>

            {/* Main Content: Meals Grid */}
            <div className="flex-1 z-10 flex flex-col justify-start overflow-hidden pt-2">
                <div className={cn(
                    "grid w-full",
                    finalMeals.length > 4 ? "grid-cols-3 gap-4" : finalMeals.length >= 3 ? "grid-cols-2 gap-x-8 gap-y-6" : "grid-cols-1 gap-10"
                )}>
                    {finalMeals.map((meal, idx) => {
                        // Dynamic sizing based on format and meal count
                        const isSquare = format === 'POST';
                        
                        let imageSize = "w-full aspect-square";
                        let titleSize = "text-3xl";
                        let labelSize = "text-lg";
                        
                        if (isSquare) {
                            if (finalMeals.length >= 5) {
                                imageSize = "w-full aspect-square max-h-[160px]";
                                titleSize = "text-lg";
                                labelSize = "text-[10px]";
                            } else if (finalMeals.length >= 4) {
                                imageSize = "w-full aspect-square max-h-[200px]";
                                titleSize = "text-xl";
                                labelSize = "text-xs";
                            } else if (finalMeals.length >= 3) {
                                imageSize = "w-full aspect-square max-h-[280px]";
                                titleSize = "text-2xl";
                                labelSize = "text-sm";
                            } else {
                                imageSize = "w-[400px] h-[400px] mx-auto";
                                titleSize = "text-4xl";
                                labelSize = "text-xl";
                            }
                        } else {
                            // Story format (taller, more space)
                            if (finalMeals.length > 6) {
                                imageSize = "w-full aspect-square max-h-[180px]";
                                titleSize = "text-2xl";
                            } else if (finalMeals.length > 4) {
                                imageSize = "w-full aspect-square max-h-[300px]";
                                titleSize = "text-3xl";
                            } else {
                                imageSize = "w-full aspect-square";
                                titleSize = "text-5xl";
                            }
                        }
                        
                        return (
                            <div key={meal.id || idx} className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                {/* Meal Type Label */}
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1 h-4 bg-[#de7c5d] rounded-full" />
                                    <span className={`text-[#de7c5d] font-black uppercase tracking-[0.2em] ${labelSize}`}>
                                        {getMealLabel(meal.mealType)}
                                    </span>
                                </div>

                                {/* Meal Image with Floating Portion Badge */}
                                <div className="relative">
                                    <div className={cn(
                                        "rounded-[32px] overflow-hidden shadow-2xl shadow-[#111b27]/10 border-4 border-white shrink-0 bg-white",
                                        imageSize
                                    )}>
                                        <img src={meal.imageUrl || '/placeholder.jpg'} alt={meal.recipeName} className="w-full h-full object-cover" />
                                    </div>
                                    
                                    {/* Portion Multiplier Badge - Overlay */}
                                    {meal.portionMultiplier !== 1 && (
                                        <div className="absolute -top-2 -right-2 px-3 py-1.5 bg-orange-500 text-white rounded-xl text-lg font-black shadow-lg shadow-orange-500/20 border-2 border-white z-10">
                                            x{meal.portionMultiplier}
                                        </div>
                                    )}

                                    {/* Time Badge - Overlay Bottom */}
                                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                                        <Clock className="w-3 h-3" />
                                        {meal.displayTime}
                                    </div>
                                </div>

                                {/* Meal Title below image */}
                                <h2 className={`${titleSize} font-bold leading-tight line-clamp-2 px-1 mt-1`} style={{ fontFamily: "'Playfair Display', serif" }}>
                                    {meal.recipeName}
                                </h2>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer: Nutritional Info */}
            <div className={`${isStory ? 'mt-10 pt-8' : 'mt-4 pt-4'} border-t-2 border-[#111b27]/10 z-10`}>
                <div className="grid grid-cols-2 gap-8 mb-6">
                    {/* Calories */}
                    <div className="flex flex-col items-center">
                        <span className={`${isStory ? 'text-6xl' : 'text-4xl'} font-black tabular-nums text-orange-600`}>{Math.round(totals.calories)}</span>
                        <span className="text-[12px] font-black uppercase tracking-widest text-[#111b27]/40">{t.calories}</span>
                    </div>

                    {/* Protein */}
                    <div className="flex flex-col items-center">
                        <span className={`${isStory ? 'text-6xl' : 'text-4xl'} font-black tabular-nums text-blue-600`}>{Math.round(totals.protein)}<span className="text-xl font-bold ml-1 opacity-40">g</span></span>
                        <span className="text-[12px] font-black uppercase tracking-widest text-[#111b27]/40">{t.protein}</span>
                    </div>

                    {/* TODO: Add Carbs and Fats when data is available */}
                    {/*
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black tabular-nums text-yellow-600">{Math.round(totals.carbs)}g</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#111b27]/40">{t.carbs}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black tabular-nums text-emerald-600">{Math.round(totals.fat)}g</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#111b27]/40">{t.fat}</span>
                    </div>
                    */}
                </div>
                
                {/* Website URL (Spotify Style) */}
                <div className="flex justify-center items-center gap-3 py-2 px-6 bg-[#111b27] text-white rounded-full w-fit mx-auto shadow-lg shadow-[#111b27]/20">
                    <div className="w-2 h-2 rounded-full bg-[#de7c5d] animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">Visita cacomi.app</span>
                </div>
            </div>

            {/* Branding Accent */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#de7c5d]/5 rounded-full blur-3xl" />
            <div className="absolute top-0 right-0 p-20 opacity-[0.02] select-none pointer-events-none">
                <span className="text-[300px] font-black leading-none">{dayNumber}</span>
            </div>
        </div>
    );
}
