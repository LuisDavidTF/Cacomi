/** @jsxImportSource react */
import React from 'react';
import type { LocalPantryItem } from '@/lib/db';
import { PantryItemGroup } from './PantryItemGroup';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent } from '@/components/shadcn/card';
import { Plus } from 'lucide-react';
import { AddIngredientModal } from './AddIngredientModal';
import { useSettings } from '@/context/SettingsContext';

interface PantryListProps {
    items: LocalPantryItem[];
    onUpdate: (id: string, updates: Partial<LocalPantryItem>) => Promise<void>;
    onRemove: (id: string) => Promise<void>;
    onAdd: (item: Omit<LocalPantryItem, 'id' | 'isSynced' | 'isDeleted' | 'isNew' | 'addedDate'>) => Promise<void>;
    pauseSync: () => void;
    resumeSync: () => void;
}

export function PantryList({ items, onUpdate, onRemove, onAdd, pauseSync, resumeSync }: PantryListProps) {
    const { t } = useSettings();
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

    // React 19: No useMemo for simple grouping needed if React Compiler interprets it, 
    // but explicit grouping function is cleaner.
    const groupedItems = (() => {
        const groups = new Map<number, LocalPantryItem[]>();

        items.forEach(item => {
            const current = groups.get(item.ingredientId || 0) || [];
            current.push(item);
            groups.set(item.ingredientId || 0, current);
        });

        return Array.from(groups.entries()).map(([ingredientId, batchItems]) => ({
            ingredientId,
            name: batchItems[0]?.ingredientName || t.pantry.unknownIngredient,
            items: batchItems
        })).sort((a, b) => a.name.localeCompare(b.name));
    })();

    return (
        <div className="space-y-6">
            <Card className="border-border/50 shadow-sm transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold text-foreground">{t.pantry.title}</h2>
                            <p className="text-sm text-muted-foreground font-medium">{items.length} {t.pantry.registeredProducts}</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => { pauseSync(); setIsAddModalOpen(true); }}
                        className="w-full sm:w-auto shadow-primary/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t.pantry.addProduct}
                    </Button>
                </CardContent>
            </Card>

            <AddIngredientModal
                isOpen={isAddModalOpen}
                onClose={() => { resumeSync(); setIsAddModalOpen(false); }}
                onSave={async (data) => {
                    try {
                        await onAdd({
                            ingredientId: null,
                            ingredientName: data.name,
                            quantity: data.quantity,
                            unitType: data.unit as 'g' | 'ml' | 'pz',
                            expirationDate: data.expirationDate
                        });
                    } finally {
                        resumeSync(); // CRITICAL: Ensure sync resumes after adding
                    }
                }}
            />

            <div className="space-y-4">
                {groupedItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        {t.pantry.noIngredients}
                    </div>
                ) : (
                    groupedItems.map(group => (
                        <PantryItemGroup
                            key={group.ingredientId || group.name}
                            ingredientId={group.ingredientId}
                            name={group.name}
                            items={group.items}
                            onUpdate={onUpdate}
                            onRemove={onRemove}
                            onAddBatch={onAdd}
                            pauseSync={pauseSync}
                            resumeSync={resumeSync}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
