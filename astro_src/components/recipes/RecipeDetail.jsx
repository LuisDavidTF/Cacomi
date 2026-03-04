'use client';

import React, { useState, useEffect } from 'react';
import { ClockIcon, UserIcon, CalendarIcon, ChevronLeftIcon } from '@components/ui/Icons';
import { SmartImage } from '@components/ui/SmartImage';
import { useSettings } from '@context/SettingsContext';
import { RichText } from '@components/ui/RichText';
import { CacheManager } from '@utils/cacheManager';
import { useToast } from '@context/ToastContext';
import { Button } from '@components/ui/Button';

/**
 * RecipeDetail Component
 * Optimized for mobile and desktop, restoring the stable design 
 * from the previous Next.js implementation.
 */
export function RecipeDetail({ recipe: initialRecipe, recipeId }) {
    const { t } = useSettings();
    const { showToast } = useToast();
    const [recipe, setRecipe] = useState(initialRecipe);
    const [isLoading, setIsLoading] = useState(!initialRecipe);

    useEffect(() => {
        if (!initialRecipe && recipeId) {
            const visited = CacheManager.getVisitedRecipe(recipeId);
            if (visited) {
                setRecipe(visited);
            } else {
                const feed = CacheManager.getFeed();
                const feedRecipe = feed?.recipes?.find(r => String(r.id) === String(recipeId));
                if (feedRecipe) setRecipe(feedRecipe);
            }
            setIsLoading(false);
        } else if (initialRecipe) {
            setRecipe(initialRecipe);
            setIsLoading(false);
        }
    }, [initialRecipe, recipeId]);

    if (isLoading) return <div className="p-10 text-center">{t.recipe?.loading || 'Cargando...'}</div>;

    if (!recipe) {
        return (
            <div className="p-10 text-center text-red-500">
                <p>{t.recipe?.error || 'Receta no encontrada.'}</p>
                <p className="text-sm mt-2 text-gray-500">{t.recipe?.checkNet || 'Verifica tu conexión a internet.'}</p>
                <a href="/" className="inline-block mt-4 text-primary hover:underline">&larr; Volver al inicio</a>
            </div>
        );
    }

    const handleSaveOffline = async () => {
        CacheManager.saveVisitedRecipe(recipe);
        if ('caches' in window) {
            try {
                const cache = await caches.open('pages');
                const req = new Request(window.location.pathname);
                const resp = await fetch(req);
                if (resp.ok) {
                    await cache.put(req, resp.clone());
                }
            } catch (e) {
                console.error('Failed to cache HTML', e);
            }
        }
        showToast(t.common?.offlineSaved || 'Receta guardada para uso sin conexión', 'success');
    };

    const imageUrl = recipe.imageUrl || 'https://placehold.co/1200x800/f3f4f6/9ca3af?text=Culina+Smart';
    const authorName = recipe.authorName || recipe.user?.name || (t.recipe?.chef || 'Chef');
    const prepTime = recipe.preparationTimeMinutes || 0;
    const createdAt = recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : null;

    return (
        <article className="max-w-6xl mx-auto pt-8 pb-8 sm:pt-12 sm:pb-12 px-4 sm:px-6 lg:px-8 min-h-screen">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300 relative">

                {/* Back Button - Positioned with more offset to clear sticky navbar */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 pointer-events-auto">
                    <a
                        href="/"
                        onClick={(e) => {
                            if (typeof window !== 'undefined' && window.history.length > 1) {
                                e.preventDefault();
                                window.history.back();
                            }
                        }}
                        className="inline-flex items-center bg-black/40 hover:bg-black/60 backdrop-blur-lg text-white border border-white/20 px-3 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-xl group"
                    >
                        <ChevronLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        {t.common?.back || 'Volver'}
                    </a>
                </div>

                {/* Hero Header with Image and Overlay Information */}
                <div className="relative w-full h-72 sm:h-[450px] bg-gray-100 overflow-hidden">
                    <SmartImage
                        src={imageUrl}
                        alt={recipe.name}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                        <div className="p-6 md:p-12 text-white w-full">
                            {/* Category Tag */}
                            {recipe.type && (
                                <span className="inline-block bg-primary px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4">
                                    {recipe.type}
                                </span>
                            )}

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 lg:mb-6 leading-tight drop-shadow-md">
                                {recipe.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium">
                                <span className="flex items-center bg-white/20 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 shadow-sm">
                                    <ClockIcon className="w-4 h-4 mr-2 text-emerald-400" />
                                    {prepTime} {t.recipe?.time || 'min'}
                                </span>
                                <span className="flex items-center bg-white/20 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 shadow-sm">
                                    <UserIcon className="w-4 h-4 mr-2 text-blue-400" />
                                    {authorName}
                                </span>
                                {createdAt && (
                                    <span className="flex items-center bg-white/20 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 shadow-sm">
                                        <CalendarIcon className="w-4 h-4 mr-2 text-purple-400" />
                                        {createdAt}
                                    </span>
                                )}
                            </div>

                            {/* Desktop Button */}
                            <div className="hidden sm:flex mt-6">
                                <Button
                                    variant="secondary"
                                    onClick={handleSaveOffline}
                                    className="border-0 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-medium shadow-sm transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-4 h-4 mr-2" viewBox="0 0 16 16">
                                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                                        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                                    </svg>
                                    {t.common?.saveOffline || 'Guardar Offline'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Grid: 2-column layout on Large Screens */}
                {/* 
                   Mobile DOM order: Description -> Ingredients -> Instructions 
                   Desktop (lg): Description (1,1), Ingredients (2, 1 spans 2), Instructions (1,2)
                   lg:grid-rows-[auto_1fr] ensures the Description row doesn't stretch to match the sidebar's height.
                */}
                <div className="p-6 md:p-10 lg:p-14 grid gap-10 lg:gap-16 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_1fr] items-start">

                    {/* Column 1, Row 1: Description */}
                    <div className="space-y-8 lg:col-start-1 lg:row-start-1 min-w-0">
                        {/* Mobile Button */}
                        <div className="flex sm:hidden w-full">
                            <Button
                                variant="secondary"
                                onClick={handleSaveOffline}
                                className="w-full justify-center bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-4 h-4 mr-2" viewBox="0 0 16 16">
                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                                </svg>
                                {t.common?.saveOffline || 'Guardar Offline'}
                            </Button>
                        </div>
                        {/* Description */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center">
                                <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3" />
                                {t.recipe?.desc || 'Descripción'}
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg font-light italic">
                                {recipe.description || 'Sin descripción detallada.'}
                            </p>
                        </section>


                    </div>

                    {/* Column 2 (Sidebar): Ingredients -> DOM Position 2 for Mobile */}
                    <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2 min-w-0">
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-600 lg:sticky lg:top-8 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-600 pb-3 flex items-center">
                                <span className="w-1.5 h-5 bg-purple-500 rounded-full mr-3" />
                                {t.recipe?.ingr || 'Ingredientes'}
                            </h3>
                            <ul className="space-y-4">
                                {recipe.ingredients?.length > 0 ? (
                                    recipe.ingredients.map((ingredient, i) => {
                                        const name = typeof ingredient === 'object' ? ingredient.name : ingredient;
                                        const meta = typeof ingredient === 'object' ? `${ingredient.quantity || ''} ${ingredient.unitOfMeasure || ''}`.trim() : null;

                                        return (
                                            <li key={i} className="flex items-start justify-between text-sm sm:text-base group">
                                                <span className="text-gray-800 dark:text-gray-300 font-medium group-hover:text-primary transition-colors">{name}</span>
                                                {meta && (
                                                    <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-lg border border-gray-100 dark:border-gray-700 shadow-px">
                                                        {meta}
                                                    </span>
                                                )}
                                            </li>
                                        );
                                    })
                                ) : (
                                    <li className="text-gray-500 italic text-sm">{t.recipe?.noIngr || 'No se especificaron ingredientes.'}</li>
                                )}
                            </ul>
                        </div>
                    </aside>

                    {/* Column 1, Row 2: Instructions -> DOM Position 3 for Mobile */}
                    <div className="space-y-8 lg:col-start-1 lg:row-start-2 min-w-0">
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 sm:mb-8 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3" />
                                {t.recipe?.instr || 'Pasos de Preparación'}
                            </h2>
                            <div className="space-y-6 sm:space-y-10">
                                {recipe.instructions?.length > 0 ? (
                                    recipe.instructions.map((step, index) => {
                                        const stepText = typeof step === 'object' ? (step.text || step.description || JSON.stringify(step)) : step;
                                        return (
                                            <div key={index} className="flex gap-4 sm:gap-6 group">
                                                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary font-bold text-sm sm:text-base group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm border border-primary/5">
                                                    {index + 1}
                                                </span>
                                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg mt-1 font-normal">
                                                    <RichText text={stepText} />
                                                </p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 italic text-sm sm:text-base">{t.recipe?.noInstr || 'No se especificaron instrucciones.'}</p>
                                )}
                            </div>
                        </section>
                    </div>

                </div>
            </div>
        </article>
    );
}
