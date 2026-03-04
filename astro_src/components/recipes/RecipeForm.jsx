'use client'

import React, { useRef } from 'react';
import { FormInput } from '@components/ui/FormInput';
import { Button } from '@components/ui/Button';
import { ErrorState } from '@components/ui/ErrorState';
import { useSettings } from '@context/SettingsContext';

// Feature Components
import { InstructionsManager } from './form/InstructionsManager';
import { IngredientsManager } from './form/IngredientsManager';
import { MagicGenerator } from './form/MagicGenerator';

// Logic Hook & Context
import { useRecipeForm } from '@hooks/useRecipeForm';
import { useAuth } from '@context/AuthContext';

export function RecipeForm({ recipeId }) {
  const {
    formData,
    status,
    errors,
    apiError,
    isOwner,
    handlers
  } = useRecipeForm(recipeId);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t } = useSettings();

  const isEditMode = !!recipeId;

  if (status === 'loading' || isAuthLoading) {
    return <div className="p-12 text-center text-gray-500 dark:text-gray-400 animate-pulse">Cargando datos de la receta...</div>;
  }

  // --- STRICT AUTHORIZATION UI BLOCK ---
  // If we have data and user, but ownership fails: block and redirect.
  if (isEditMode && user && !isOwner && status === 'idle') {
    if (typeof window !== 'undefined') window.location.href = `/recipes/${recipeId}`;
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 text-center">
        <p className="text-destructive font-bold">Redirigiendo... No tienes permiso.</p>
      </div>
    );
  }

  if (status === 'error') {
    return <ErrorState message={apiError} onRetry={handlers.retry} />;
  }

  return (
    <div className="max-w-3xl mx-auto mt-6 p-8 bg-card rounded-xl shadow-lg border border-border mb-20 transition-colors duration-300">
      <div className="mb-8 border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground">
          {isEditMode ? t.createRecipe.editTitle : t.createRecipe.newTitle}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isEditMode ? t.createRecipe.editSubtitle : t.createRecipe.newSubtitle}
        </p>
      </div>

      {/* AI Feature - Only for Create Mode */}
      {!isEditMode && (
        <div className="mb-8">
          <MagicGenerator onDraftGenerated={handlers.handleDraftLoaded} />
        </div>
      )}

      <form onSubmit={handlers.submit} className="space-y-8">

        {/* --- General Information Section --- */}
        <div className="space-y-5">
          <FormInput
            id="name"
            label={t.createRecipe.name}
            value={formData.name}
            onChange={(e) => handlers.setFieldValue('name', e.target.value)}
            error={errors.name}
            required
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t.createRecipe.desc}</label>
            <textarea
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-ring focus:border-ring shadow-sm transition-colors bg-background text-foreground ${errors.description ? 'border-destructive' : 'border-input'}`}
              value={formData.description}
              onChange={(e) => handlers.setFieldValue('description', e.target.value)}
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
            <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {t.createRecipe.sensitiveWarn}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormInput
              id="prepTime"
              label={t.createRecipe.prepTime}
              type="number"
              value={formData.preparationTime}
              onChange={(e) => handlers.setFieldValue('preparationTime', e.target.value)}
              error={errors.preparationTime}
            />
            <FormInput
              id="imageUrl"
              label={t.createRecipe.imgUrl}
              value={formData.imageUrl}
              onChange={(e) => handlers.setFieldValue('imageUrl', e.target.value)}
              error={errors.imageUrl}
            />
          </div>
          <p className="text-[10px] text-muted-foreground -mt-3 text-right">
            {t.createRecipe.imageRights}
          </p>
        </div>

        <hr className="border-border" />

        {/* --- Ingredients Section --- */}
        <IngredientsManager
          ingredients={formData.ingredients}
          onChange={handlers.handleIngredientChange}
          onAdd={() => handlers.modifyList('ingredients', 'add')}
          onRemove={(index) => handlers.modifyList('ingredients', 'remove', index)}
          error={errors.ingredientsRoot}
        />

        <hr className="border-border" />

        {/* --- Instructions Section (Strict Array Handling) --- */}
        <InstructionsManager
          instructions={formData.instructions}
          onChange={handlers.handleInstructionChange}
          onAdd={() => handlers.modifyList('instructions', 'add')}
          onRemove={(index) => handlers.modifyList('instructions', 'remove', index)}
          error={errors.instructionsRoot}
        />

        <hr className="border-border" />

        {/* --- Metadata Section --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/50 p-5 rounded-lg border border-border">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
              {t.createRecipe.type}
            </label>
            <select
              value={formData.type}
              onChange={(e) => handlers.setFieldValue('type', e.target.value)}
              className="w-full bg-background border border-input rounded-md text-sm py-2 px-3 focus:ring-ring focus:border-ring text-foreground"
            >
              <option value="breakfast">{t.createRecipe.breakfast}</option>
              <option value="lunch">{t.createRecipe.lunch}</option>
              <option value="dinner">{t.createRecipe.dinner}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
              {t.createRecipe.visibility}
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => handlers.setFieldValue('visibility', e.target.value)}
              className="w-full bg-background border border-input rounded-md text-sm py-2 px-3 focus:ring-ring focus:border-ring text-foreground"
            >
              <option value="public">{t.createRecipe.public}</option>
              <option value="private">{t.createRecipe.private}</option>
            </select>
          </div>
        </div>

        {apiError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{apiError}</span>
          </div>
        )}

        {/* --- Action Buttons --- */}
        <div className="flex gap-4 pt-4">
          <a
            href="/"
            className="flex-1 flex items-center justify-center px-4 py-3 border border-border rounded-lg shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-border transition-colors"
          >
            {t.createRecipe.cancel}
          </a>
          <Button
            type="submit"
            isLoading={status === 'submitting'}
            className="flex-1 py-3 text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            {isEditMode ? t.createRecipe.save : t.createRecipe.publish}
          </Button>
        </div>

      </form>
    </div>
  );
}