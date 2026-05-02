'use client';

// ... imports
import React, { useState, useRef, useEffect } from 'react';
import { useRecipeFeed } from '@hooks/useRecipeFeed';
import { useApiClient } from '@hooks/useApiClient';
import { useToast } from '@context/ToastContext';
import { useSettings } from '@context/SettingsContext';
import { slugify } from '@utils/slugify';
import { getEnv } from '@/utils/env';

// Components
import { RecipeCard } from '@components/recipes/RecipeCard';
import { NativeAdCard } from '@components/ads/NativeAdCard';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Spinner } from '@components/ui/Spinner';
import { LoadingState } from '@components/ui/LoadingState';
import { ErrorState } from '@components/ui/ErrorState';
import { OfflineHelper } from '@components/ui/OfflineHelper';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { WifiOff, Download } from 'lucide-react';

export function RecipeFeed({ initialData = null, forceSavedMode = false }) {
  // Use our new custom hook for data logic
  const {
    recipes,
    status,
    errorMessage,
    showSlowLoadMessage,
    hasMore,
    isLoadingMore,
    fetchMoreRecipes,
    fetchInitialRecipes,
    removeRecipe,
    isErrorLoadingMore,
    retryLoadMore
  } = useRecipeFeed({ initialData, forceSavedMode });

  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, recipe: null });
  const [activeCategory, setActiveCategory] = useState(null);
  const [categoryRecipes, setCategoryRecipes] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [categoryPage, setCategoryPage] = useState(0);
  const [hasMoreCategory, setHasMoreCategory] = useState(false);
  const [isCategoryLoadingMore, setIsCategoryLoadingMore] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const isSavedMode = forceSavedMode || isOffline || activeCategory === 'SAVED_OFFLINE';
  const categoryDropdownRef = useRef(null);

  // Sync offline status and logging for debug
  useEffect(() => {
      console.log("[RecipeFeed] Initial recipes:", recipes.length, "Status:", status, "ForceSavedMode:", forceSavedMode);
      
      if (typeof navigator !== 'undefined') {
          console.log("[RecipeFeed] Navigator.onLine:", navigator.onLine);
          setIsOffline(!navigator.onLine);
      }
      
      const handleOnline = () => { console.log("[RecipeFeed] Go Online"); setIsOffline(false); };
      const handleOffline = () => { console.log("[RecipeFeed] Go Offline"); setIsOffline(true); };
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      };
  }, []);

  useEffect(() => {
    console.log("[RecipeFeed] State Update - isOffline:", isOffline, "isSavedMode:", isSavedMode);
  }, [isOffline, isSavedMode]);

  // Fetch saved recipes from Dexie for offline mode
  const savedRecipes = useLiveQuery(
      () => db.savedRecipes.toArray(),
      []
  ) || [];

  const api = useApiClient();
  const { showToast } = useToast();
  const { t, language } = useSettings();

  const feedTitle = isSavedMode 
    ? (language === 'es' ? 'Recetas Guardadas' : 'Saved Recipes')
    : t.feed.title;

  const feedSubtitle = isSavedMode
    ? (language === 'es' ? 'Accede a tus recetas descargadas en cualquier momento, incluso sin conexión.' : 'Access your downloaded recipes anytime, even without a connection.')
    : t.feed.subtitle;

  // Construir la lista de categorías dinámica a partir de las traducciones
  const categories = Object.entries(t.recipeTypes || {}).map(([key, label]) => ({
      id: key,
      label: label
  }));

  // Close dropdown on click outside
  useEffect(() => {
      const handleClickOutside = (event) => {
          if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
              setShowAllCategories(false);
          }
      };
      if (showAllCategories) document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAllCategories]);

  // Fetch category data when activeCategory or categoryPage changes
  useEffect(() => {
      if (!activeCategory || isSavedMode || activeCategory === 'SAVED_OFFLINE') {
          setCategoryRecipes([]);
          setCategoryPage(0);
          setHasMoreCategory(false);
          return;
      }

      const fetchCategory = async () => {
          if (categoryPage === 0) setIsCategoryLoading(true);
          else setIsCategoryLoadingMore(true);

          try {
              const res = await fetch(`/api/recipes/search/category?category=${encodeURIComponent(activeCategory)}&page=${categoryPage}&size=20`);
              if (res.ok) {
                  const data = await res.json();
                  const newRecipes = data || [];
                  if (categoryPage === 0) {
                      setCategoryRecipes(newRecipes);
                  } else {
                      setCategoryRecipes(prev => {
                          // Prevent duplicates
                          const existingIds = new Set(prev.map(r => r.publicId || r.id));
                          const uniqueNew = newRecipes.filter(r => !existingIds.has(r.publicId || r.id));
                          return [...prev, ...uniqueNew];
                      });
                  }
                  setHasMoreCategory(newRecipes.length === 20);
              }
          } catch (err) {
              console.error("Category search error", err);
              showToast("Error loading categories", "error");
          } finally {
              setIsCategoryLoading(false);
              setIsCategoryLoadingMore(false);
          }
      };

      fetchCategory();
  }, [activeCategory, categoryPage]);

  const handleCategoryToggle = (category) => {
      if (activeCategory === category) {
          setActiveCategory(null);
      } else {
          setCategoryPage(0);
          setActiveCategory(category);
      }
  };

  // Global scroll listener removed to prevent Astro View Transition bugs.
  // We rely exclusively on the explicit click-based save in RecipeCard.

  // Scroll Restoration Logic
  useEffect(() => {
    if (status === 'success' && recipes.length > 0) {
      const savedScroll = sessionStorage.getItem('Cacomi_feed_scroll');
      const targetScroll = parseInt(savedScroll, 10);
      
      // Ensure we have a valid numeric target before attempting to manipulate scroll
      if (savedScroll && !isNaN(targetScroll) && targetScroll > 0) {
        let attempts = 0;

        const tryScroll = () => {
          const docHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.documentElement.clientHeight
          );
          const maxScrollable = docHeight - window.innerHeight;
          console.log(`[Scroll Restore] Attempt ${attempts}: Target=${targetScroll}, MaxScrollable=${maxScrollable}, DocHeight=${docHeight}`);
          
          if (maxScrollable >= targetScroll || attempts > 15) {
            window.scrollTo({ top: targetScroll, behavior: 'instant' });
            console.log(`[Scroll Restore] Scrolled to ${targetScroll}`);
            sessionStorage.removeItem('Cacomi_feed_scroll');
          } else {
            attempts++;
            setTimeout(tryScroll, 100);
          }
        };
        
        // Wait 250ms before even attempting, giving Astro's View Transitions time to finish any default behavior
        setTimeout(tryScroll, 250);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, recipes]); // Depend on recipes so it fires again after merge from cache

  // Intersection Observer for Infinite Scroll
  const observer = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    // Stop observing if status is bad, no more items, OR if we hit an error (manual retry needed)
    // CRITICAL: Stop observing if we are in saved mode to prevent cursors/API calls
    if (status !== 'success' || !hasMore || isErrorLoadingMore || isSavedMode) return;

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (activeCategory) {
            if (hasMoreCategory && !isCategoryLoadingMore) {
                setCategoryPage(prev => prev + 1);
            }
        } else {
            fetchMoreRecipes();
        }
      }
    }, {
      rootMargin: '200px', // Trigger fetch 200px before bottom
    });

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) observer.current.observe(currentSentinel);

    return () => {
      if (observer.current && currentSentinel) observer.current.unobserve(currentSentinel);
    };
  }, [status, hasMore, fetchMoreRecipes, isErrorLoadingMore, isLoadingMore, activeCategory, hasMoreCategory, isCategoryLoadingMore]);

  // Actions
  const handleEdit = (recipe) => window.location.href = `/edit-recipe/${recipe.publicId || recipe.id}`;
  const handleDelete = (recipe) => setDeleteModalState({ isOpen: true, recipe });

  const confirmDelete = async () => {
    if (!deleteModalState.recipe) return;
    const recipeId = deleteModalState.recipe.publicId || deleteModalState.recipe.id;
    try {
      await api.deleteRecipe(recipeId);
      showToast(t.feed.deleted, 'success');
      removeRecipe(recipeId);
      // Also remove from category recipes if active
      if (activeCategory) {
          setCategoryRecipes(prev => prev.filter(r => (r.publicId || r.id) !== recipeId));
      }
      setDeleteModalState({ isOpen: false, recipe: null });
    } catch (error) {
      showToast(error.message || 'Error', 'error');
    }
  };

  // No early return for loading/error to preserve layout structure

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section - Always visible */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground leading-tight">{feedTitle}</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {feedSubtitle}
          </p>
        </div>


        <div className="hidden md:flex flex-none lg:flex-1 items-center justify-end space-x-2 lg:space-x-3">
          {/* Manual Refresh Action (Desktop/Non-Touch Only) */}
          <Button
            variant="primary"
            onClick={fetchInitialRecipes}
            disabled={isSavedMode}
            className={`hidden md:flex items-center gap-2 self-start sm:self-end text-sm shadow-sm ${isSavedMode ? 'opacity-50 grayscale' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t.feed.update}
          </Button>
        </div>
      </div>

      <OfflineHelper />

      {isOffline && (
        <div className="mb-8 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-top-4 duration-500">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                <WifiOff className="w-6 h-6" />
            </div>
            <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
                    {language === 'es' ? 'Modo Offline: Mostrando tus Recetas Guardadas' : 'Offline Mode: Showing Your Saved Recipes'}
                </h3>
                <p className="text-sm text-indigo-600/80 dark:text-indigo-300/80">
                    {language === 'es' 
                        ? 'No tienes conexión a internet. Solo se muestran las recetas que descargaste previamente para uso offline.' 
                        : 'No internet connection. Only showing recipes you previously downloaded for offline use.'}
                </p>
            </div>
            <div className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-black uppercase tracking-widest">
                {savedRecipes.length} {language === 'es' ? 'Recetas' : 'Recipes'}
            </div>
        </div>
      )}

      {/* Category Filter */}
      {!isSavedMode && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {/* Saved Recipes Pill (Priority) */}
              <button
                  onClick={() => handleCategoryToggle('SAVED_OFFLINE')}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-black transition-all shadow-sm flex items-center gap-2 ${
                      activeCategory === 'SAVED_OFFLINE' || isSavedMode
                      ? 'bg-indigo-600 text-white shadow-indigo-200 scale-105 border-indigo-600' 
                      : 'bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100'
                  }`}
              >
                  <Download className="w-3.5 h-3.5" />
                  {language === 'es' ? 'Guardados (Offline)' : 'Saved (Offline)'}
              </button>

              {/* Todo Button */}
              <button
                  onClick={() => handleCategoryToggle(null)}
                  disabled={isOffline}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-black transition-all shadow-sm ${
                      !activeCategory && !isOffline
                      ? 'bg-primary text-primary-foreground shadow-primary/30 scale-105 border-primary' 
                      : 'bg-background border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  } ${isOffline ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                  {language === 'es' ? 'Explorar Todo' : 'Explore All'}
              </button>

              {categories.filter(cat => activeCategory === cat.id || categories.indexOf(cat) < 3).map((cat) => (
                  <button
                      key={cat.id}
                      onClick={() => handleCategoryToggle(cat.id)}
                      className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-black transition-all shadow-sm ${
                          activeCategory === cat.id 
                          ? 'bg-primary text-primary-foreground shadow-primary/30 scale-105 border-primary' 
                          : 'bg-background border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                  >
                      {cat.label}
                  </button>
              ))}

              <div className="relative" ref={categoryDropdownRef}>
                  <button 
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-black transition-all shadow-sm bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 flex items-center gap-2`}
                  >
                      {language === 'es' ? 'Ver más...' : 'See more...'}
                  </button>
                  
                  {/* Dropdown for remaining categories */}
                  <div className={`absolute top-full mt-2 left-0 sm:left-auto sm:right-0 bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl ring-1 ring-black/5 p-3 z-40 w-64 transition-all origin-top-left sm:origin-top-right ${showAllCategories ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                      <div className="flex flex-wrap gap-2">
                          {categories.filter(cat => activeCategory !== cat.id && categories.indexOf(cat) >= 3).map(cat => (
                              <button
                                  key={cat.id}
                                  onClick={() => {
                                      handleCategoryToggle(cat.id);
                                      setShowAllCategories(false);
                                  }}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-background border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              >
                                  {cat.label}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
        </div>
      )}

      {/* Content Area - Switches based on status */}
      {
        status === 'loading' ? (
          <LoadingState showSlowLoadMessage={showSlowLoadMessage} />
        ) : status === 'error' ? (
          <ErrorState message={errorMessage} onRetry={fetchInitialRecipes} />
        ) : activeCategory && isCategoryLoading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
                <Spinner />
                <p className="text-xs font-bold uppercase tracking-widest text-primary mt-3">
                    {language === 'es' ? 'Cargando Categoría...' : 'Loading Category...'}
                </p>
            </div>
        ) : (isSavedMode ? savedRecipes : (activeCategory ? categoryRecipes : recipes)).length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border shadow-sm flex flex-col items-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    {isSavedMode ? <Download className="w-8 h-8 text-muted-foreground" /> : <WifiOff className="w-8 h-8 text-muted-foreground" />}
                </div>
                <p className="text-muted-foreground text-lg mb-2 font-bold">
                    {isSavedMode 
                        ? (language === 'es' ? 'No tienes recetas guardadas' : 'No saved recipes') 
                        : (activeCategory 
                            ? (language === 'es' ? 'No hay recetas en esta categoría' : 'No recipes in this category')
                            : (language === 'es' ? 'No hay recetas todavía' : 'No recipes yet')
                          )
                    }
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {isSavedMode 
                        ? (language === 'es' ? 'Pulsa el icono de descarga en cualquier receta para verla aquí sin internet.' : 'Click the download icon on any recipe to see it here without internet.')
                        : (activeCategory
                            ? (language === 'es' ? 'Intenta con otra categoría o refresca el feed.' : 'Intenta refrescar el feed o crea una receta.')
                            : (language === 'es' ? '¡Sé el primero en crear una receta deliciosa!' : 'Be the first to create a delicious recipe!')
                          )
                    }
                </p>
                {!isSavedMode && !activeCategory && (
                    <Button
                        className="mt-6"
                        onClick={() => window.location.href = '/create-recipe'}
                    >
                        {t.feed.createFirst}
                    </Button>
                )}
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {(isSavedMode ? savedRecipes : (activeCategory ? categoryRecipes : recipes)).map((recipe, index) => {
              // Insert Ad every 6 items (index 5, 11, 17...) if ads are enabled
              // 0-based index: 5 is the 6th item.
              const PUBLIC_ENABLE_ADS = getEnv('PUBLIC_ENABLE_ADS') || getEnv('NEXT_PUBLIC_ENABLE_ADS');
              const shouldShowAd = (PUBLIC_ENABLE_ADS === 'true') && (index > 0) && (index + 1) % 6 === 0;

              return (
                <React.Fragment key={recipe.id}>
                  <RecipeCard
                    recipe={recipe}
                    viewHref={`/recipes/${slugify(recipe.name)}/${recipe.publicId || recipe.id}`}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                  {shouldShowAd && (
                    <NativeAdCard />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )
      }

      {/* Pagination Sentinel - Only show if NO error and NOT loading */}
      {/* Hiding it while loading ensures that when it reappears, it triggers a FRESH intersection event if still visible */}
      {
        !isErrorLoadingMore && !isLoadingMore && !isCategoryLoading && !isCategoryLoadingMore && (activeCategory ? hasMoreCategory : hasMore) && (
          <div ref={sentinelRef} aria-hidden="true" className="h-4 w-full" />
        )
      }

      {/* Manual Retry Button on Error */}
      {
        isErrorLoadingMore && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <p className="text-sm text-destructive">{t.feed.error}</p>
            <Button onClick={retryLoadMore} variant="outline" className="text-sm">
              {t.feed.retry}
            </Button>
          </div>
        )
      }

      {/* Loading More Indicator */}
      {
        (isLoadingMore || isCategoryLoadingMore) && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )
      }

      {/* End of Feed Message */}
      {
        !(activeCategory ? hasMoreCategory : hasMore) && !isErrorLoadingMore && (activeCategory ? categoryRecipes : recipes).length > 0 && (
          <div className="text-center py-12 border-t mt-12 border-border">
            <p className="text-muted-foreground text-sm">{t.feed.end}</p>
          </div>
        )
      }

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, recipe: null })}
        title={t.feed.deleteTitle}
      >
        <div className="space-y-4">
          <p className="text-foreground">
            {t.feed.deleteConfirm} <strong>{deleteModalState.recipe?.name}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteModalState({ isOpen: false, recipe: null })}
            >
              {t.feed.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              {t.feed.confirmDelete}
            </Button>
          </div>
        </div>
      </Modal>
    </div >
  );
}

