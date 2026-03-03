import React, { useState } from 'react';
import { usePantry } from '@hooks/usePantry';
import { PantryList } from './PantryList';
import { AddIngredientModal } from './AddIngredientModal';
import { Button } from '@components/ui/Button';
import { useSettings } from '@context/SettingsContext';
import { useAuth } from '@context/AuthContext';
import { PlusIcon } from '@components/ui/Icons';
import { Spinner } from '@components/ui/Spinner';

export default function PantryPageClient() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { t } = useSettings();
    const { items, isLoading: isPantryLoading, addItem, updateItem, removeItem } = usePantry();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    if (isAuthLoading) {
        return (
            <div className="flex justify-center p-24">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-12 mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t.pantry.title}</h1>
                    <p className="text-muted-foreground mt-1">{t.pantry.subtitle}</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    {t.pantry.addProduct}
                </Button>
            </div>

            {isPantryLoading ? (
                <div className="flex justify-center p-12">
                    <Spinner />
                </div>
            ) : (
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <PantryList
                        items={items}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                        onAdd={addItem}
                    />
                </div>
            )}

            {isAddModalOpen && (
                <AddIngredientModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={async (data) => {
                        await addItem({
                            ingredientId: Date.now(), // In a real app, this should come from a searchable ingredient DB
                            ...data
                        });
                    }}
                />
            )}
        </div>
    );
}
