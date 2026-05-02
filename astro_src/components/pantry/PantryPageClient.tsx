/** @jsxImportSource react */
import React, { useState } from 'react';
import { usePantry } from '@hooks/usePantry';
import { PantryList } from './PantryList';
import { AddIngredientModal } from './AddIngredientModal';
import { PantryStatusHeader } from './PantryStatusHeader';
// Fixing potential broken paths in original file
import { Button } from '@/components/shadcn/button';
import { useSettings } from '@context/SettingsContext';
import { useAuth } from '@context/AuthContext';
import { Plus, Loader2 } from 'lucide-react';

export default function PantryPageClient() {
    const { isLoading: isAuthLoading } = useAuth();
    const { t } = useSettings();
    const {
        items,
        isLoading: isPantryLoading,
        syncStatus,
        syncCountdown,
        addItem,
        updateItem,
        removeItem,
        pauseSync,
        resumeSync
    } = usePantry();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

    React.useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isAuthLoading) {
        return (
            <div className="flex justify-center p-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-12 mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-4 mb-1">
                        <h1 className="text-3xl font-bold text-foreground">{t.pantry.title}</h1>
                        <PantryStatusHeader status={syncStatus} syncCountdown={syncCountdown} />
                    </div>
                    <p className="text-muted-foreground">{t.pantry.subtitle}</p>
                </div>
                <Button onClick={() => { pauseSync(); setIsAddModalOpen(true); }} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {t.pantry.addProduct}
                </Button>
            </div>

            {isOffline && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="p-2 bg-amber-500 rounded-lg text-white shadow-lg shadow-amber-500/20">
                        <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                        {t.pantry.offlineNotice}
                    </p>
                </div>
            )}

            {isPantryLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <PantryList
                        items={items}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                        onAdd={addItem}
                        pauseSync={pauseSync}
                        resumeSync={resumeSync}
                    />
                </div>
            )}

            {isAddModalOpen && (
                <AddIngredientModal
                    isOpen={isAddModalOpen}
                    onClose={() => { resumeSync(); setIsAddModalOpen(false); }}
                    onSave={async (data) => {
                        await addItem({
                            ingredientId: null,
                            ingredientName: data.name,
                            quantity: data.quantity,
                            unitType: data.unit as 'g' | 'ml' | 'pz',
                            expirationDate: data.expirationDate
                        });
                    }}
                />
            )}
        </div>
    );
}
