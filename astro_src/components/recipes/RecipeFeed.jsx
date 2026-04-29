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

export function RecipeFeed({ initialData = null }) {
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
  } = useRecipeFeed({ initialData });

  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, recipe: null });

  const api = useApiClient();
  const { showToast } = useToast();
  const { t } = useSettings();

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
    if (status !== 'success' || !hasMore || isErrorLoadingMore) return;

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        fetchMoreRecipes();
      }
    }, {
      rootMargin: '200px', // Trigger fetch 200px before bottom
    });

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) observer.current.observe(currentSentinel);

    return () => {
      if (observer.current && currentSentinel) observer.current.unobserve(currentSentinel);
    };
  }, [status, hasMore, fetchMoreRecipes, isErrorLoadingMore, isLoadingMore]);

  // Actions
  const handleEdit = (recipe) => window.location.href = `/edit-recipe/${recipe.id}`;
  const handleDelete = (recipe) => setDeleteModalState({ isOpen: true, recipe });

  const confirmDelete = async () => {
    if (!deleteModalState.recipe) return;
    try {
      await api.deleteRecipe(deleteModalState.recipe.id);
      showToast(t.feed.deleted, 'success');
      removeRecipe(deleteModalState.recipe.id);
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
          <h1 className="text-3xl font-bold text-foreground leading-tight">{t.feed.title}</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t.feed.subtitle}
          </p>
        </div>


        {/* Manual Refresh Action (Desktop/Non-Touch Only) */}
        <Button
          variant="primary"
          onClick={fetchInitialRecipes}
          className="hidden md:flex items-center gap-2 self-start sm:self-end text-sm shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t.feed.update}
        </Button>
      </div>

      {/* Content Area - Switches based on status */}
      {
        status === 'loading' ? (
          <LoadingState showSlowLoadMessage={showSlowLoadMessage} />
        ) : status === 'error' ? (
          <ErrorState message={errorMessage} onRetry={fetchInitialRecipes} />
        ) : recipes.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border shadow-sm">
            <p className="text-muted-foreground text-lg mb-4">{t.feed.empty}</p>
            <Button
              className="mt-2"
              onClick={() => window.location.href = '/create-recipe'}
            >
              {t.feed.createFirst}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {recipes.map((recipe, index) => {
              // Insert Ad every 6 items (index 5, 11, 17...) if ads are enabled
              // 0-based index: 5 is the 6th item.
              const PUBLIC_ENABLE_ADS = getEnv('PUBLIC_ENABLE_ADS') || getEnv('NEXT_PUBLIC_ENABLE_ADS');
              const shouldShowAd = (PUBLIC_ENABLE_ADS === 'true') && (index > 0) && (index + 1) % 6 === 0;

              return (
                <React.Fragment key={recipe.id}>
                  <RecipeCard
                    recipe={recipe}
                    viewHref={`/recipes/${slugify(recipe.name)}/${recipe.id}`}
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
        !isErrorLoadingMore && !isLoadingMore && hasMore && (
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
        isLoadingMore && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )
      }

      {/* End of Feed Message */}
      {
        !hasMore && !isErrorLoadingMore && recipes.length > 0 && (
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

