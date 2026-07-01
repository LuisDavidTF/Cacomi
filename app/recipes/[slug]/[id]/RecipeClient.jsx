'use client';

import React, { useState, useEffect } from 'react';
import { SmartImage } from '@components/ui/SmartImage';
import { ClockIcon, UserIcon } from '@components/ui/Icons';
import { useApiClient } from '@hooks/useApiClient';
import { useSettings } from '@context/SettingsContext';
import { CacheManager } from '@utils/cacheManager';
import { useRouter } from 'next/navigation';
import { useAuth } from '@context/AuthContext';
import { Button } from '@components/ui/Button';
import { EditIcon, TrashIcon } from '@components/ui/Icons';
import { useToast } from '@context/ToastContext';
import { Modal } from '@components/ui/Modal';
import { BadgeCheck } from 'lucide-react';

function useRecipeData(id, initialData) {
    const [recipe, setRecipe] = useState(initialData || null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(!initialData);
    const api = useApiClient();

    useEffect(() => {
        // If we have initial data, we just save it to cache and return (or maybe fetch fresh in background?)
        // For now, let's treat initialData as authoritative for the first render.
        if (initialData) {
            CacheManager.saveVisitedRecipe(initialData);
            setLoading(false);
            // We could optionally fetch fresh data here silently
            return;
        }

        let mounted = true;
        let foundInCache = false;

        // 1. Check Offline Storage first (Visited -> Feed)
        const visited = CacheManager.getVisitedRecipe(id);
        if (visited) {
            if (mounted) {
                setRecipe(visited);
                setLoading(false);
                foundInCache = true;
            }
        } else {
            // Fallback to feed cache
            const feed = CacheManager.getFeed();
            const feedRecipe = feed?.recipes?.find(r => String(r.id) === String(id));
            if (feedRecipe && mounted) {
                setRecipe(feedRecipe);
                setLoading(false);
                foundInCache = true;
            }
        }

        // 2. Fetch fresh data
        api.getRecipeById(id)
            .then(data => {
                if (!mounted) return;
                const recipeData = data?.data || data;
                setRecipe(recipeData);
                setLoading(false);

                // SAVE VISITED
                CacheManager.saveVisitedRecipe(recipeData);
            })
            .catch(err => {
                console.error("Fetch failed", err);
                if (!mounted) return;
                if (!foundInCache) {
                    setError(err.message);
                    setLoading(false);
                }
            });

        return () => { mounted = false; };
    }, [id, api, initialData]);

    return { recipe, error, loading };
}

function RecipeDetailContent({ recipe }) {
    const { user } = useAuth();
    const { t, language } = useSettings();
    const router = useRouter();
    const { showToast } = useToast();
    const api = useApiClient();

    const [deleteModalState, setDeleteModalState] = React.useState({ isOpen: false });

    if (!recipe) return null;

    // Safe accessor for user ID comparison - Robust against String/Int mismatches and undefined
    // FALLBACK: Name comparison (requested by user due to missing API IDs)
    const normalize = (str) => String(str || '').trim().toLowerCase();

    const isOwner = user && (
        (user.id && recipe.user_id && String(user.id) === String(recipe.user_id)) ||
        (user.id && recipe.user?.id && String(user.id) === String(recipe.user.id)) ||
        (user.name && (
            normalize(user.name) === normalize(recipe.authorName) ||
            normalize(user.name) === normalize(recipe.author_name) ||
            normalize(user.name) === normalize(recipe.user?.name)
        ))
    );

    const handleEdit = () => router.push(`/edit-recipe/${recipe.id}`);
    const handleDelete = () => setDeleteModalState({ isOpen: true });

    const confirmDelete = async () => {
        try {
            await api.deleteRecipe(recipe.id);
            showToast(t.feed.deleted, 'success');
            router.push('/');
            router.refresh();
        } catch (error) {
            showToast(error.message || 'Error', 'error');
        }
    };

    // Use the image directly from the recipe object. The SmartImage component handles errors/fallbacks.
    let imageUrl = recipe.imageUrl;

    // Resolve relative URLs
    if (imageUrl && imageUrl.startsWith('/')) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl) {
            // Avoid double slashes if apiUrl ends with /
            const base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
            imageUrl = `${base}${imageUrl}`;
        }
    } else if (!imageUrl) {
        // If no image URL exists, use a default placeholder
        imageUrl = `https://placehold.co/600x400/059669/ffffff?text=${t.recipe.chef || 'Culina'}`;
    }

    return (
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-xs overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300">

            {/* Hero Header with Image */}
            <div className="relative w-full h-72 sm:h-96 bg-gray-100">
                <SmartImage
                    src={imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-6 md:p-8 text-white w-full flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2 shadow-sm flex items-center gap-2 flex-wrap">
                                {recipe.name}
                                {(recipe.verified || recipe.isVerified || recipe.is_verified) && (
                                    <span className="inline-flex items-center" title={t.recipe.verifiedBadgeTooltip || "Receta Verificada por Chefs de Cacomi"}>
                                        <BadgeCheck className="text-blue-400 w-7 h-7 fill-blue-400/20 flex-shrink-0 drop-shadow-md" />
                                    </span>
                                )}
                            </h1>
                            <div className="flex items-center gap-4 text-sm font-medium">
                                <span className="flex items-center bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                                    <ClockIcon className="w-4 h-4 mr-2" />
                                    {recipe.preparationTimeMinutes} {t.recipe.time}
                                </span>
                                <span className="flex items-center bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                                    <UserIcon className="w-4 h-4 mr-2" />
                                    {recipe.authorName || recipe.user?.name || t.recipe.chef}
                                </span>
                            </div>
                        </div>

                        {isOwner && (
                            <div className="hidden sm:flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={handleEdit}
                                    className="border-0"
                                >
                                    <EditIcon className="w-4 h-4 mr-2" /> {t.common.edit}
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleDelete}
                                    className="bg-red-500/80 hover:bg-red-600/90 backdrop-blur-md"
                                >
                                    <TrashIcon className="w-4 h-4 mr-2" /> {t.common.delete}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 grid gap-8 md:grid-cols-[2fr_1fr]">

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Legal AI & User-Generated Content Disclaimer */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold">
                            <span className="text-lg">⚠️</span>
                            <h3>{t.recipe.aiWarningTitle || 'Advertencia de Contenido'}</h3>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {t.recipe.aiWarningDesc}
                        </p>
                        <hr className="border-amber-500/20 my-2" />
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                            {t.recipe.chefVerificationNotice}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2 flex-wrap">
                            <span>{t.recipe.verifiedBadgeDesc}</span>
                            <span className="inline-flex items-center bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold gap-1 shadow-xs border border-blue-500/20">
                                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                                {language === 'es' ? 'Verificado' : language === 'fr' ? 'Vérifié' : 'Verified'}
                            </span>
                        </div>
                    </div>

                    {/* Mobile Actions */}
                    {isOwner && (
                        <div className="flex sm:hidden gap-3 mb-6">
                            <Button
                                variant="secondary"
                                onClick={handleEdit}
                                className="flex-1"
                            >
                                <EditIcon className="w-4 h-4 mr-2" /> {t.common.edit}
                            </Button>
                            <Button variant="danger" onClick={handleDelete} className="flex-1">
                                <TrashIcon className="w-4 h-4 mr-2" /> {t.common.delete}
                            </Button>
                        </div>
                    )}

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-3 flex items-center">
                            {t.recipe.desc}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                            {recipe.description}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4 flex items-center">
                            {t.recipe.instr}
                        </h2>
                        <div className="space-y-6">
                            {recipe.instructions?.length > 0 ? (
                                recipe.instructions.map((instruction, index) => (
                                    <div key={index} className="flex gap-4 group">
                                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            {index + 1}
                                        </span>
                                        <p className="text-gray-700 dark:text-gray-300 leading-7 mt-1">
                                            {instruction}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">{t.recipe.noInstr}</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar / Ingredients */}
                <aside>
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-100 dark:border-gray-700 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                            {t.recipe.ingr}
                        </h3>
                        <ul className="space-y-3">
                            {recipe.ingredients?.length > 0 ? (
                                recipe.ingredients.map((ing, i) => (
                                    <li key={ing.id || i} className="flex items-start justify-between text-sm">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{ing.name || ing.ingredient?.name}</span>
                                        <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                                            {ing.quantity} {ing.unitOfMeasure || ing.unit_of_measure}
                                        </span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500 italic text-sm">{t.recipe.noIngr}</li>
                            )}
                        </ul>
                    </div>
                </aside>

            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalState.isOpen}
                onClose={() => setDeleteModalState({ isOpen: false })}
                title={t.feed.deleteTitle}
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        {t.feed.deleteConfirm} <strong>{recipe.name}</strong>?
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteModalState({ isOpen: false })}
                        >
                            {t.feed.cancel}
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            {t.feed.confirmDelete}
                        </Button>
                    </div>
                </div>
            </Modal>
        </article>
    );
}

export default function RecipeClient({ recipe: initialRecipe, recipeId, correctSlug, currentSlug }) {
    const { recipe, error, loading } = useRecipeData(recipeId, initialRecipe);
    const { t } = useSettings();
    const router = useRouter();

    useEffect(() => {
        // HBO-style URL correction
        if (correctSlug && correctSlug !== currentSlug) {
            // HBO-style URL correction using History API directly to avoid triggering Next.js interception/modals
            const newPath = `/recipes/${correctSlug}/${recipeId}`;
            window.history.replaceState({ ...window.history.state, as: newPath, url: newPath }, '', newPath);
        }
    }, [correctSlug, currentSlug, recipeId]); // Removed router dependence

    if (loading) {
        return <div className="p-10 text-center">{t.recipe.loading}</div>;
    }

    if (error) {
        return (
            <div className="p-10 text-center text-red-500">
                <p>{t.recipe.error} {error}</p>
                <p className="text-sm mt-2 text-gray-500">{t.recipe.checkNet}</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
            <RecipeDetailContent recipe={recipe} />
        </div>
    );
}
