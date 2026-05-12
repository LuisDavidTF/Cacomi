'use client';

import React, { useState, useEffect } from 'react';
import { ClockIcon, UserIcon, CalendarIcon, ChevronLeftIcon, HeartIcon, FlameIcon, ActivityIcon, WheatIcon, DropletIcon } from '@components/ui/Icons';
import { SmartImage } from '@components/ui/SmartImage';
import { useSettings } from '@context/SettingsContext';
import { RichText } from '@components/ui/RichText';
import { CacheManager } from '@utils/cacheManager';
import { useToast } from '@context/ToastContext';
import { Button } from '@components/ui/Button';
import { RecipeCard } from './RecipeCard';
import { ShareIcon } from '@components/ui/Icons';
import { ShareModal } from '@components/ui/ShareModal';
import { slugify } from '@utils/slugify';
import { getEnv } from '@utils/env';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { CloudDownload, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * RecipeDetail Component
 * Optimized for mobile and desktop, restoring the stable design 
 * from the previous Next.js implementation.
 */
export function RecipeDetail({ recipe: initialRecipe, recipeId: providedId }) {
    const { t, language } = useSettings();
    const { showToast } = useToast();

    // Extract ID from URL if not provided (useful for static shells or direct navigations)
    const [recipeId, setRecipeId] = useState(providedId);
    
    useEffect(() => {
        if (!providedId && typeof window !== 'undefined') {
            const parts = window.location.pathname.split('/').filter(Boolean);
            // URL structure is /recipes/[slug]/[id] OR /recipes/[id]
            // We want the last part
            const idFromUrl = parts[parts.length - 1];
            if (idFromUrl && idFromUrl !== 'recipes') {
                setRecipeId(idFromUrl);
            }
        }
    }, [providedId]);

    const [recipe, setRecipe] = useState(initialRecipe);
    const [isLoading, setIsLoading] = useState(!initialRecipe);
    const [showShare, setShowShare] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Dexie: Check if recipe is downloaded
    const isDownloaded = useLiveQuery(
        async () => {
            if (!recipe) return false;
            const id = recipe.publicId || recipe.id;
            const match = await db.savedRecipes.get(String(id));
            return !!match;
        },
        [recipe]
    );

    const toggleDownload = async () => {
        if (!recipe) return;
        const id = String(recipe.publicId || recipe.id);
        
        if (isDownloaded) {
            await db.savedRecipes.delete(id);
            showToast(language === 'es' ? 'Eliminado de tus guardados' : 'Removed from saved recipes', 'info');
        } else {
            setIsDownloading(true);
            try {
                // Ensure we save the FULL recipe data
                await db.savedRecipes.put({
                    ...recipe,
                    id,
                    savedAt: new Date().toISOString()
                });

                // Also try to cache the page HTML for full offline navigation support
                if ('caches' in window) {
                    try {
                        const cache = await caches.open('pages');
                        const req = new Request(window.location.pathname);
                        const resp = await fetch(req);
                        if (resp.ok) {
                            await cache.put(req, resp.clone());
                        }
                    } catch (e) {
                        console.warn('HTML cache failed, but data is in Dexie', e);
                    }
                }

                showToast(language === 'es' ? 'Receta guardada para uso offline' : 'Recipe saved for offline use', 'success');
            } catch (err) {
                console.error("Save error", err);
                showToast('Error al guardar', 'error');
            } finally {
                setIsDownloading(false);
            }
        }
    };

    useEffect(() => {
        const loadRecipe = async () => {
            if (initialRecipe) {
                setRecipe(initialRecipe);
                setIsLoading(false);
                return;
            }

            if (!recipeId) {
                setIsLoading(false);
                return;
            }

            // 1. Try RAM Cache
            const visited = CacheManager.getVisitedRecipe(recipeId);
            if (visited) {
                setRecipe(visited);
                setIsLoading(false);
                return;
            }

            // 2. Try Offline Dexie Storage (Crucial for Planner offline access)
            try {
                const offlineRecipe = await db.savedRecipes.get(String(recipeId));
                if (offlineRecipe) {
                    console.log("[Offline] Loaded recipe from Dexie:", recipeId);
                    setRecipe(offlineRecipe);
                    setIsLoading(false);
                    return;
                }
            } catch (err) {
                console.error("Dexie access error", err);
            }

            // 3. Try Feed Cache
            const feed = CacheManager.getFeed();
            const feedRecipe = feed?.recipes?.find(r => String(r.id) === String(recipeId));
            if (feedRecipe) {
                setRecipe(feedRecipe);
                setIsLoading(false);
                return;
            }

            // 4. Fetch from API if online
            if (typeof navigator !== 'undefined' && navigator.onLine) {
                setIsLoading(true);
                try {
                    const res = await fetch(`/api/recipes/${recipeId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setRecipe(data);
                        // Auto-save to RAM cache
                        CacheManager.saveVisitedRecipe(data);
                    }
                } catch (err) {
                    console.error("Fetch error", err);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        loadRecipe();
    }, [initialRecipe, recipeId]);

    // Google Ads Initialization
    useEffect(() => {
        const PUBLIC_ENABLE_ADS = getEnv('PUBLIC_ENABLE_ADS') || getEnv('NEXT_PUBLIC_ENABLE_ADS');
        if (PUBLIC_ENABLE_ADS === 'true' && !isLoading && recipe) {
            try {
                if (typeof window !== 'undefined' && window.adsbygoogle) {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                }
            } catch (err) {
                console.error('AdSense error in detail view:', err);
            }
        }
    }, [isLoading, recipe]);

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
                // 1. Cache the recipe page HTML (aligned with SW's pages-cache)
                const pageCache = await caches.open('pages-cache');
                const req = new Request(window.location.pathname);
                const resp = await fetch(req);
                if (resp.ok) {
                    await pageCache.put(req, resp.clone());
                }
            } catch (e) {
                console.error('Failed to cache recipe page', e);
            }

            // 2. Cache the recipe image for offline use
            const imgSrc = recipe.imageUrl;
            if (imgSrc && !imgSrc.includes('placehold.co')) {
                try {
                    const imgCache = await caches.open('images');
                    // cache.add handles the fetch + store atomically
                    // no-cors allows cross-origin Cloudflare Images CDN
                    const imgResp = await fetch(imgSrc, { mode: 'no-cors' });
                    await imgCache.put(imgSrc, imgResp);
                } catch (e) {
                    // Non-critical — image caching is best-effort
                    console.warn('Failed to cache recipe image', e);
                }
            }
        }

        showToast(t.common?.offlineSaved || 'Receta guardada para uso sin conexión', 'success');
    };

    const imageUrl = recipe.imageUrl || 'https://placehold.co/1200x800/f3f4f6/9ca3af?text=Cacomi+Smart';
    const authorName = recipe.authorName || recipe.user?.name || (t.recipe?.chef || 'Chef');
    const prepTime = recipe.preparationTimeMinutes || 0;
    const createdAt = recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : null;

    const PUBLIC_ENABLE_ADS = getEnv('PUBLIC_ENABLE_ADS') || getEnv('NEXT_PUBLIC_ENABLE_ADS');

    return (
        <article className="max-w-6xl mx-auto pt-8 pb-16 sm:pt-12 sm:pb-24 px-4 sm:px-6 lg:px-8 min-h-screen space-y-12">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300 relative">

                {/* Back Button - Positioned with more offset to clear sticky navbar */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 pointer-events-auto">
                    <a
                        href="/"
                        onClick={(e) => {
                            if (typeof window !== 'undefined') {
                                // Check if Astro View Transitions has a previous session history
                                const isInternalHistory = window.history.state && window.history.state.index > 0;
                                // Fallback for browsers
                                const hasBrowserHistory = window.history.length > 2;

                                if (isInternalHistory || hasBrowserHistory) {
                                    e.preventDefault();
                                    window.history.back();
                                }
                                // Otherwise letting the <a> tag handle it goes cleanly to href="/"
                            }
                        }}
                        className="inline-flex items-center bg-black/40 hover:bg-black/60 backdrop-blur-lg text-white border border-white/20 px-3 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-xl group"
                    >
                        <ChevronLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        {t.common?.back || 'Volver'}
                    </a>
                </div>

                {/* Hero Header with Image and Overlay Information */}
                <div className="relative w-full h-[380px] sm:h-[450px] lg:h-[500px] bg-gray-100 overflow-hidden">
                    <SmartImage
                        src={imageUrl}
                        alt={recipe.name}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                        <div className="p-6 md:p-12 text-white w-full mt-16 relative">
                            {/* Category Tag - Absolute Bottom Right */}
                            {recipe.type && (
                                <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 z-20">
                                    <span className="inline-block bg-primary px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-lg">
                                        {t.recipeTypes?.[recipe.type?.toUpperCase()] || recipe.type}
                                    </span>
                                </div>
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
                            <div className="hidden sm:flex mt-6 gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={toggleDownload}
                                    disabled={isDownloading}
                                    className={`border-0 backdrop-blur-md font-medium shadow-sm transition-all ${isDownloaded ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                                >
                                    {isDownloading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : isDownloaded ? (
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                    ) : (
                                        <CloudDownload className="w-4 h-4 mr-2" />
                                    )}
                                    {isDownloaded 
                                        ? (language === 'es' ? 'Guardado Offline' : 'Saved Offline')
                                        : (language === 'es' ? 'Descargar Receta' : 'Download Recipe')
                                    }
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowShare(true)}
                                    className="border-0 bg-primary/20 backdrop-blur-md hover:bg-primary/40 text-white font-medium shadow-sm transition-all"
                                >
                                    <ShareIcon className="w-4 h-4 mr-2" />
                                    {t.share?.shareGeneric || 'Compartir'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Grid: 2-column layout on Large Screens */}
                <div className="p-6 md:p-10 lg:p-14 grid gap-10 lg:gap-16 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_1fr] items-start">

                    {/* Column 1, Row 1: Description */}
                    <div className="space-y-8 lg:col-start-1 lg:row-start-1 min-w-0">
                        {/* Mobile Button */}
                        <div className="flex sm:hidden w-full gap-2">
                            <Button
                                variant="secondary"
                                onClick={toggleDownload}
                                disabled={isDownloading}
                                className={`flex-grow justify-center border-0 font-medium transition-all ${isDownloaded ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
                            >
                                {isDownloading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : isDownloaded ? (
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                ) : (
                                    <CloudDownload className="w-4 h-4 mr-2" />
                                )}
                                {isDownloaded 
                                    ? (language === 'es' ? 'Guardado' : 'Saved')
                                    : (language === 'es' ? 'Guardar' : 'Save')
                                }
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setShowShare(true)}
                                className="bg-primary/10 text-primary border-primary/20"
                            >
                                <ShareIcon className="w-5 h-5" />
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

                    {/* Column 2 (Sidebar): Nutrition & Ingredients -> DOM Position 2 for Mobile */}
                    <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2 min-w-0">
                        {/* Nutrition Card */}
                        {recipe.nutrition && (
                            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-8 transition-all hover:shadow-md">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center">
                                    <span className="w-1.5 h-5 bg-orange-500 rounded-full mr-3" />
                                    {t.recipe?.nutrition || 'Información Nutricional'}
                                </h3>
                                {(recipe.nutrition.totalCalories > 0 || recipe.nutrition.totalProtein > 0) ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                                            <FlameIcon className="w-6 h-6 text-orange-500 mb-2" />
                                            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-tighter">{t.recipe?.calories || 'Calorías'}</span>
                                            <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{recipe.nutrition.totalCalories?.toFixed(0)}</span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                                            <ActivityIcon className="w-6 h-6 text-blue-500 mb-2" />
                                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">{t.recipe?.protein || 'Proteína'}</span>
                                            <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{recipe.nutrition.totalProtein?.toFixed(1)}g</span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                                            <WheatIcon className="w-6 h-6 text-amber-500 mb-2" />
                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tighter">{t.recipe?.carbs || 'Carbs'}</span>
                                            <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{recipe.nutrition.totalCarbs?.toFixed(1)}g</span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                                            <DropletIcon className="w-6 h-6 text-emerald-500 mb-2" />
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">{t.recipe?.fat || 'Grasas'}</span>
                                            <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{recipe.nutrition.totalFat?.toFixed(1)}g</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-sm italic text-center animate-pulse">
                                        {t.feed.pendingNutrition}
                                    </div>
                                )}
                            </div>
                        )}

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

            {/* Premium Advertisement Banner (Google Ads Integrated) */}
            {PUBLIC_ENABLE_ADS === 'true' && (
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-900 p-8 sm:p-12 shadow-2xl group border border-white/10 min-h-[250px] flex items-center">
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-black/20 rounded-full blur-2xl" />

                    <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-center">
                        <div className="text-center md:text-left space-y-3">
                            <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                                {t.recipe?.adSponsor || 'Patrocinado'}
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                                {t.recipe?.adTitle || 'Recomendado para ti'}
                            </h3>
                            <p className="text-emerald-100/80 text-sm sm:text-base max-w-xs font-light">
                                Explora servicios y productos seleccionados especialmente para complementar tu cocina.
                            </p>
                        </div>
                        
                        {/* Google AdSense Slot */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 flex items-center justify-center min-h-[150px]">
                            <ins
                                className="adsbygoogle block"
                                style={{ display: "block", width: "100%", height: "100%", minWidth: "250px", minHeight: "100px" }}
                                data-ad-format="fluid"
                                data-ad-layout-key="-6t+ed+2i-1n-4w"
                                data-ad-client="ca-pub-2928206942835905"
                                data-ad-slot="9876543210" // Example ID for Detail View
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Similar Recipes & Discovery Loop */}
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                            {t.recipe?.similarRecipes || 'Recetas Similares'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base flex items-center">
                            <HeartIcon className="w-4 h-4 mr-2 text-red-500 animate-pulse" />
                            {t.recipe?.keepExploring || 'Sigue explorando nuevos sabores'}
                        </p>
                    </div>
                    <div className="hidden sm:block">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                            CACOMI CURATED
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {recipe.similarRecipes && recipe.similarRecipes.length > 0 ? (
                        recipe.similarRecipes.map((similar, index) => (
                            <RecipeCard
                                key={similar.id || index}
                                recipe={similar}
                                viewHref={`/recipes/${slugify(similar.name)}/${similar.id}`}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-400 italic">No hay recetas similares disponibles en este momento.</p>
                        </div>
                    )}
                </div>
            </div>
            <ShareModal 
                isOpen={showShare} 
                onClose={() => setShowShare(false)} 
                recipe={recipe} 
            />
        </article>
    );
}

