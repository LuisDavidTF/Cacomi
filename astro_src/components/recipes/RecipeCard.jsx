'use client';

import React, { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useSettings } from '@context/SettingsContext';
import { ClockIcon, EditIcon, TrashIcon, UserIcon, FlameIcon, ActivityIcon, ShareIcon } from '@components/ui/Icons';
import { ShareModal } from '@components/ui/ShareModal';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecommendedMenuStore } from '@store/useRecommendedMenuStore';

export function RecipeCard({ recipe, viewHref, onEdit, onDelete }) {
  const { user } = useAuth();
  const { t, language } = useSettings();
  const { addMeal, selection } = useRecommendedMenuStore();
  
  const isAdmin = user?.role === 'ADMIN';
  const isSelected = selection.some(m => m.recipeUUID === (recipe.publicId || recipe.id));

  const handleAddToRecommended = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const uuid = recipe.publicId || recipe.id;
      const isAlreadySelected = selection.some(m => m.recipeUUID === uuid);

      if (isAlreadySelected) {
          useRecommendedMenuStore.getState().removeMeal(uuid);
          return;
      }

      addMeal({
          recipeUUID: uuid,
          recipeName: recipe.name,
          imageUrl: recipe.imageUrl || 'https://placehold.co/600x400/f3f4f6/9ca3af',
          calories: Math.round(recipe.calories || recipe.nutrition?.totalCalories || 0),
          proteinGrams: Math.round(recipe.protein || recipe.nutrition?.totalProtein || 0),
          carbsGrams: Math.round(recipe.carbs || recipe.nutrition?.totalCarbohydrates || 0),
          fatGrams: Math.round(recipe.fat || recipe.nutrition?.totalFat || 0),
          mealType: 'LUNCH',
          portionMultiplier: 1,
          selectionLogicCode: 'PROTEIN_FILL',
          aiReasoning: 'Este plato es ideal para mantener tu energía hoy.',
          estimatedCost: recipe.estimatedCost || 0
      });
  };
  // Safe accessor for user ID comparison - Robust against String/Int mismatches and undefined
  // FALLBACK: Name comparison (requested by user due to missing API IDs)
  // Normalized to handle "Luis" vs "luis" and potential missing fields
  const normalize = (str) => String(str || '').trim().toLowerCase();

  if (user) {
    // Debug info removed
  }

  const isOwner = user && (
    (user.id && recipe.user_id && String(user.id) === String(recipe.user_id)) ||
    (user.id && recipe.user?.id && String(user.id) === String(recipe.user.id)) ||
    (user.name && (
      normalize(user.name) === normalize(recipe.authorName) ||
      normalize(user.name) === normalize(recipe.author_name) ||
      normalize(user.name) === normalize(recipe.user?.name)
    ))
  );

  // Data correctness mapping from provided JSON
  const imageUrl = recipe.imageUrl || 'https://placehold.co/600x400/f3f4f6/9ca3af?text=Sin+Imagen';
  const prepTime = recipe.preparationTimeMinutes;
  const authorName = recipe.authorName || recipe.user?.name;
  const typeValue = recipe.type || recipe.mealType;
  const translatedType = typeValue ? (t.recipeTypes?.[typeValue.toUpperCase()] || typeValue) : null;
  const calories = recipe.calories || recipe.nutrition?.totalCalories || recipe.nutrition?.calories;
  const protein = recipe.protein || recipe.nutrition?.totalProtein || recipe.nutrition?.protein;

  const [imgSrc, setImgSrc] = useState(imageUrl);
  const [showShare, setShowShare] = useState(false);

  const handleNavigate = () => {
    if (typeof window !== 'undefined') {
      const scrollPos = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      sessionStorage.setItem('Cacomi_feed_scroll', scrollPos.toString());
    }
  };

  return (
    <>
      <a 
        href={viewHref}
        onClick={handleNavigate}
        className="group cursor-pointer bg-card dark:bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col h-full overflow-hidden text-left"
      >
        {/* Image Container */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imgSrc}
            alt={recipe.name}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc('https://placehold.co/600x400/f3f4f6/9ca3af?text=Error+Carga')}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

          {/* Floating Badges */}
          {translatedType && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-white/95 backdrop-blur-md text-emerald-800 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                {translatedType}
              </span>
            </div>
          )}

          <div className={cn(
            "absolute top-3 left-3 z-10 transition-opacity duration-300",
            isAdmin ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <div className="flex gap-2">
                {isAdmin && (
                  <button 
                      onClick={handleAddToRecommended} 
                      className={cn(
                        "p-2 rounded-full transition-all shadow-sm",
                        isSelected 
                          ? "bg-primary text-white scale-110" 
                          : "bg-white/90 text-primary hover:bg-primary hover:text-primary-foreground"
                      )}
                      title="Añadir al Menú Recomendado"
                  >
                      <Sparkles className={cn("w-4 h-4", isSelected && "animate-pulse")} />
                  </button>
                )}

                <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowShare(true); }} 
                    className="bg-white/90 p-2 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                    title={t.share.shareGeneric}
                >
                    <ShareIcon className="w-4 h-4" />
                </button>

                {isOwner && (
                    <>
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(recipe); }} 
                        className="bg-white/90 p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                    >
                        <EditIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(recipe); }} 
                        className="bg-white/90 p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                    </>
                )}
            </div>
          </div>

        <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium mb-2">
            {prepTime > 0 && (
              <span className="flex items-center bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
                <ClockIcon className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                {prepTime} min
              </span>
            )}
            {authorName && (
              <span className="flex items-center bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm" title="Autor">
                <UserIcon className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                {authorName}
              </span>
            )}
            {calories > 0 || protein > 0 ? (
                <>
                {calories > 0 && (
                  <span className="flex items-center bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm" title="Calorías">
                    <FlameIcon className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
                    {Math.round(calories)} kcal
                  </span>
                )}
                {protein > 0 && (
                  <span className="flex items-center bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm" title="Proteína">
                    <ActivityIcon className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                    {Number(protein).toFixed(1)}g
                  </span>
                )}
                </>
            ) : (
                <span className="flex items-center bg-amber-500/80 text-[10px] px-2 py-1 rounded-md backdrop-blur-sm text-white font-bold animate-pulse">
                    <ActivityIcon className="w-3 h-3 mr-1.5" />
                    {language === 'es' ? 'Calculando info nutricional...' : 'Calculating nutrition...'}
                </span>
            )}
          </div>

        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow bg-card relative transition-colors duration-300">
        <h3 className="text-xl font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors" title={recipe.name}>
          {recipe.name}
        </h3>

        {recipe.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow leading-relaxed font-light">
            {recipe.description}
          </p>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border mt-auto">
          <div
            className="w-full inline-flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group/btn relative z-20"
          >
            {t.feed.view}
            <svg className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
      </a>

      <ShareModal 
        isOpen={showShare} 
        onClose={() => setShowShare(false)} 
        recipe={recipe} 
      />
    </>
  );
}
