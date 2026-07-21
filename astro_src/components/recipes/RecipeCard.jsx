'use client';

import React, { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useSettings } from '@context/SettingsContext';
import { ClockIcon, EditIcon, TrashIcon, UserIcon, FlameIcon, ActivityIcon, ShareIcon } from '@components/ui/Icons';
import { ShareModal } from '@components/ui/ShareModal';
import { Sparkles, MoreVertical, Bookmark, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecommendedMenuStore } from '@store/useRecommendedMenuStore';
import { RichText } from '@components/ui/RichText';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export function RecipeCard({ recipe, viewHref, onEdit, onDelete }) {
  const { user } = useAuth();
  const { t, language } = useSettings();
  const { addMeal, selection } = useRecommendedMenuStore();
  
  const isAdmin = user?.role === 'ADMIN';
  const isSelected = selection.some(m => m.recipeUUID === (recipe.publicId || recipe.id));

  const [showRecommendedModal, setShowRecommendedModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('lun');
  const [selectedType, setSelectedType] = useState('LUNCH');
  const [showMenu, setShowMenu] = useState(false);

  const isRecipeSaved = useLiveQuery(async () => {
      const match = await db.savedRecipes.get(String(recipe.publicId || recipe.id));
      return !!match;
  }, [recipe.publicId, recipe.id]);

  const handleToggleSave = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const recipeId = String(recipe.publicId || recipe.id);
      const isCurrentlySaved = await db.savedRecipes.get(recipeId);
      if (isCurrentlySaved) {
          await db.savedRecipes.delete(recipeId);
      } else {
          const normalized = {
              id: recipeId,
              name: recipe.name,
              description: recipe.description || '',
              imageUrl: recipe.imageUrl || '',
              preparationTimeMinutes: recipe.preparationTimeMinutes || recipe.prepTime || 0,
              authorName: recipe.authorName || recipe.user?.name || '',
              calories: recipe.calories || recipe.nutrition?.totalCalories || 0,
              protein: recipe.protein || recipe.nutrition?.totalProtein || 0,
              carbs: recipe.carbs || recipe.nutrition?.totalCarbohydrates || 0,
              fat: recipe.fat || recipe.nutrition?.totalFat || 0,
              mealType: recipe.mealType || recipe.type || 'LUNCH',
              ingredients: recipe.ingredients || [],
              steps: recipe.steps || [],
              savedAt: new Date().toISOString()
          };
          await db.savedRecipes.put(normalized);
      }
  };

  const handleStarClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const uuid = recipe.publicId || recipe.id;
      const isAlreadySelected = selection.some(m => m.recipeUUID === uuid);

      if (isAlreadySelected) {
          useRecommendedMenuStore.getState().removeMeal(uuid);
          return;
      }

      setShowRecommendedModal(true);
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
  const rawImageUrl = recipe.imageUrl || 'https://placehold.co/600x400/f3f4f6/9ca3af?text=Sin+Imagen';
  // Avoid manual transformations on client-side if the URL might contain a Cloudinary signature (s--xxx--)
  // Modifying a signed URL causes a 401 Unauthorized error from Cloudinary.
  const imageUrl = rawImageUrl;
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
            loading="lazy"
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

        {showRecommendedModal && (
              <div 
                  className="absolute inset-0 z-30 bg-black/95 backdrop-blur-md p-4 flex flex-col justify-center animate-in fade-in duration-200"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                  <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-1.5 justify-center">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      Menú Recomendado
                  </h4>
                  
                  <div className="space-y-3">
                      <div>
                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Día</label>
                          <select 
                              value={selectedDay}
                              onChange={(e) => setSelectedDay(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-xs text-white font-bold focus:outline-none"
                          >
                              <option value="lun">Lunes</option>
                              <option value="mar">Martes</option>
                              <option value="mie">Miércoles</option>
                              <option value="jue">Jueves</option>
                              <option value="vie">Viernes</option>
                              <option value="sab">Sábado</option>
                              <option value="dom">Domingo</option>
                          </select>
                      </div>

                      <div>
                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Tipo de Comida</label>
                          <select 
                              value={selectedType}
                              onChange={(e) => setSelectedType(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-xs text-white font-bold focus:outline-none"
                          >
                              <option value="BREAKFAST">Desayuno</option>
                              <option value="SNACK_1">Colación 1</option>
                              <option value="LUNCH">Almuerzo</option>
                              <option value="SNACK_2">Colación 2</option>
                              <option value="DINNER">Cena</option>
                          </select>
                      </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                      <button
                          onClick={() => setShowRecommendedModal(false)}
                          className="flex-1 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                          Cancelar
                      </button>
                      <button
                          onClick={() => {
                              const uuid = recipe.publicId || recipe.id;
                              addMeal({
                                  recipeUUID: uuid,
                                  recipeName: recipe.name,
                                  imageUrl: recipe.imageUrl || 'https://placehold.co/600x400/f3f4f6/9ca3af',
                                  calories: Math.round(recipe.calories || recipe.nutrition?.totalCalories || 0),
                                  proteinGrams: Math.round(recipe.protein || recipe.nutrition?.totalProtein || 0),
                                  carbsGrams: Math.round(recipe.carbs || recipe.nutrition?.totalCarbohydrates || 0),
                                  fatGrams: Math.round(recipe.fat || recipe.nutrition?.totalFat || 0),
                                  mealType: selectedType,
                                  dayOfWeek: selectedDay,
                                  portionMultiplier: 1,
                                  selectionLogicCode: 'PROTEIN_FILL',
                                  aiReasoning: 'Este plato es ideal para mantener tu energía hoy.',
                                  estimatedCost: recipe.estimatedCost || 0
                              });
                              setShowRecommendedModal(false);
                          }}
                          className="flex-1 py-2 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                          Añadir
                      </button>
                  </div>
              </div>
          )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow bg-card relative transition-colors duration-300">
        <h3 className="text-xl font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors" title={recipe.name}>
          {recipe.name}
        </h3>

        {recipe.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow leading-relaxed font-light">
            <RichText text={recipe.description} />
          </p>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border mt-auto flex items-center justify-between gap-3 relative z-20">
          <div
            className="flex-1 inline-flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group/btn"
          >
            {t.feed.view}
            <svg className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          {/* Save / Bookmark Recipe Button */}
          <button 
              onClick={handleToggleSave} 
              className="p-2.5 rounded-xl border border-border/60 text-muted-foreground hover:bg-muted dark:hover:bg-slate-800 transition-all hover:scale-[1.05] active:scale-95 shadow-2xs flex items-center justify-center bg-card shrink-0"
              title={isRecipeSaved ? (language === 'es' ? 'Guardada' : 'Saved') : (language === 'es' ? 'Guardar' : 'Save')}
          >
              {isRecipeSaved ? (
                  <BookmarkCheck className="w-4 h-4 text-[#e07e53]" />
              ) : (
                  <Bookmark className="w-4 h-4 text-gray-500" />
              )}
          </button>

          {/* Three dots actions menu */}
          <div className="relative">
            <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }} 
                className="p-2.5 rounded-xl border border-border/60 text-muted-foreground hover:bg-muted dark:hover:bg-slate-800 transition-all hover:scale-[1.05] active:scale-95 shadow-2xs flex items-center justify-center bg-card"
                title={language === 'es' ? 'Más opciones' : 'More options'}
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                {/* Backdrop overlay to close when clicking outside */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); }}
                />
                
                {/* Menu items */}
                <div 
                  className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-900 border border-border/80 rounded-2xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150 text-left"
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  {isAdmin && (
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); handleStarClick(e); }} 
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors",
                          isSelected 
                            ? "bg-primary/10 text-primary" 
                            : "text-foreground hover:bg-muted"
                        )}
                    >
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>{language === 'es' ? 'Recomendar' : 'Recommend'}</span>
                    </button>
                  )}

                  <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); setShowShare(true); }} 
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                      <ShareIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="ml-1">{t.share.shareGeneric}</span>
                  </button>

                  {isOwner && (
                      <>
                      <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); onEdit(recipe); }} 
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50/50 transition-colors"
                      >
                          <EditIcon className="w-4 h-4" />
                          <span>{language === 'es' ? 'Editar Receta' : 'Edit Recipe'}</span>
                      </button>
                      <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); onDelete(recipe); }} 
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50/50 transition-colors"
                      >
                          <TrashIcon className="w-4 h-4" />
                          <span>{language === 'es' ? 'Eliminar Receta' : 'Delete Recipe'}</span>
                      </button>
                      </>
                  )}
                </div>
              </>
            )}
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
