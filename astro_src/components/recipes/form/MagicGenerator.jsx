'use client'

import React, { useState } from 'react';
import { SparklesIcon } from '@components/ui/Icons';
import { Button } from '@components/ui/Button';
import { useSettings } from '@context/SettingsContext';

/**
 * Handles AI-powered recipe draft generation.
 * Acts as an adapter between the unstable AI output and the strict Form Schema.
 */
export function MagicGenerator({ onDraftGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useSettings();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || t.createRecipe.magicError);
      }

      const rawDraft = await res.json();

      // --- ADAPTER LAYER ---
      // Normalizes AI response to ensure compatibility with the new List<String> schema.
      // Handles legacy Object format {"1": "Val"} and new Array format ["Val"].
      let normalizedInstructions = [''];

      if (Array.isArray(rawDraft.instructions)) {
        normalizedInstructions = rawDraft.instructions.length > 0
          ? rawDraft.instructions
          : [''];
      } else if (typeof rawDraft.instructions === 'object' && rawDraft.instructions !== null) {
        normalizedInstructions = Object.values(rawDraft.instructions);
      }

      // Sanitize payload before injecting into the form state
      const sanitizedDraft = {
        name: rawDraft.name || '',
        description: rawDraft.description || '',
        // API v2 returns preparationTimeMinutes
        preparationTime: rawDraft.preparationTimeMinutes || rawDraft.preparationTime || '',
        // Use a generic placeholder if AI fails to provide a valid image URL
        // API v2 returns imageUrl
        imageUrl: rawDraft.imageUrl || rawDraft.image_url || 'https://placehold.co/600x400/e2e8f0/475569?text=AI+Generated',
        ingredients: Array.isArray(rawDraft.ingredients)
          ? rawDraft.ingredients.map(ing => ({
            name: ing.name || '',
            quantity: ing.quantity || '',
            // Map API/AI's unitOfMeasure to internal unit_of_measure
            unit_of_measure: ing.unitOfMeasure || ing.unit_of_measure || ''
          }))
          : [],
        instructions: normalizedInstructions,
        type: rawDraft.type || 'lunch',
      };

      onDraftGenerated(sanitizedDraft);

    } catch (err) {
      console.error('[MagicGenerator] Generation failed:', err);
      setError(err.message || t.createRecipe.magicError);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="relative p-5 border border-primary/20 rounded-xl bg-primary/5 shadow-sm transition-all hover:shadow-md">

      {/* Loading Overlay: Prevents interaction during async operation */}
      {isGenerating && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-xl transition-all">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <span className="text-sm font-semibold text-primary animate-pulse">
            {t.createRecipe.magicLoading}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
          <SparklesIcon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          {t.createRecipe.magicTitle}
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {t.createRecipe.magicDesc}
      </p>

      <div className="space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.createRecipe.magicPlaceholder}
          rows={2}
          disabled={isGenerating}
          className="w-full px-4 py-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring focus:border-ring text-sm bg-background text-foreground placeholder:text-muted-foreground resize-none"
        />

        {error && (
          <div className="text-xs text-destructive font-medium pl-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleGenerate}
            isLoading={isGenerating}
            disabled={isGenerating || !prompt.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm text-xs px-5 border-transparent"
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            {t.createRecipe.magicBtn}
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-2 opacity-80">
          {t.createRecipe.magicDisclaimer}
        </p>
      </div>
    </div>
  );
}