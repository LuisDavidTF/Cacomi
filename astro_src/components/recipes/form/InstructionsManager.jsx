import React from 'react';
import { TrashIcon } from '@components/ui/Icons';
import { Button } from '@components/ui/Button';
import { useSettings } from '@context/SettingsContext';

/**
 * Manages the rendering and interaction for the instructions list.
 * Expects a simple Array<String> data structure.
 */
export function InstructionsManager({ instructions, onChange, onAdd, onRemove, error }) {
  const { t } = useSettings();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-foreground">
          {t.createRecipe.instrTitle}
        </label>
        {error && (
          <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded border border-destructive/20 font-medium">
            {error}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {instructions.map((step, index) => (
          <div key={index} className="flex gap-3 items-start group">
            {/* Visual index is decoupled from data persistence (1-based for UI) */}
            <span className="mt-2.5 text-xs font-bold text-muted-foreground w-12 text-right select-none">
              {t.createRecipe.step} {index + 1}
            </span>

            <div className="flex-grow relative">
              <textarea
                value={step}
                onChange={(e) => onChange(index, e.target.value)}
                placeholder={`${t.createRecipe.stepPlaceholder} ${index + 1}...`}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-ring focus:border-ring text-sm resize-none transition-all bg-background border-input text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="mt-2 text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
              title="Eliminar paso"
              // Prevent removing the last item to ensure form usability
              disabled={instructions.length <= 1}
              aria-disabled={instructions.length <= 1}
            >
              <TrashIcon className={`w-5 h-5 ${instructions.length <= 1 ? 'opacity-30' : ''}`} />
            </button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={onAdd}
        className="text-primary hover:text-primary/80 text-sm pl-0 hover:bg-transparent font-medium"
      >
        {t.createRecipe.addStep}
      </Button>
    </div>
  );
}