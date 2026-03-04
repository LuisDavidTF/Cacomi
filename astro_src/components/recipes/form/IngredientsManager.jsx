import React from 'react';
import { TrashIcon } from '@components/ui/Icons';
import { Button } from '@components/ui/Button';
import { useSettings } from '@context/SettingsContext';

export function IngredientsManager({ ingredients, onChange, onAdd, onRemove, error }) {
  const { t } = useSettings();

  const inputClasses = "w-full px-3 py-2 border rounded-lg text-sm shadow-sm bg-background border-input text-foreground focus:ring-ring focus:border-ring placeholder:text-muted-foreground transition-colors";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-foreground">
          {t.createRecipe.ingrTitle}
        </label>
        {error && (
          <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded border border-destructive/20 font-medium">
            {error}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {ingredients.map((ing, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-start">
            {/* Ingredient Name */}
            <div className="col-span-5">
              <input
                type="text"
                placeholder={t.createRecipe.ingrName}
                value={ing.name}
                onChange={(e) => onChange(index, 'name', e.target.value)}
                className={inputClasses}
              />
            </div>
            {/* Quantity */}
            <div className="col-span-3">
              <input
                type="text"
                placeholder={t.createRecipe.ingrQty}
                value={ing.quantity}
                onChange={(e) => onChange(index, 'quantity', e.target.value)}
                className={inputClasses}
              />
            </div>
            {/* Unit */}
            <div className="col-span-3">
              <input
                type="text"
                placeholder={t.createRecipe.ingrUnit}
                value={ing.unit_of_measure}
                onChange={(e) => onChange(index, 'unit_of_measure', e.target.value)}
                className={inputClasses}
              />
            </div>
            {/* Actions */}
            <div className="col-span-1 flex justify-center pt-2">
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10 disabled:opacity-50"
                disabled={ingredients.length <= 1}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={onAdd}
        className="text-primary hover:text-primary/80 text-sm pl-0 hover:bg-transparent font-medium"
      >
        {t.createRecipe.addIngr}
      </Button>
    </div>
  );
}