import * as React from 'react';
import { useState } from 'react';
import type { LocalPantryItem } from '@/lib/db';
import { BatchList } from './BatchList';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddBatchModal } from './AddBatchModal';
import { Button } from '@/components/shadcn/button';
import { Card } from '@/components/shadcn/card';
import { useSettings } from '@/context/SettingsContext';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface PantryItemGroupProps {
    ingredientId: number;
    name: string;
    items: LocalPantryItem[];
    onUpdate: (id: number, updates: Partial<LocalPantryItem>) => Promise<void>;
    onRemove: (id: number) => Promise<void>;
    onAddBatch: (item: Omit<LocalPantryItem, 'id' | 'isSynced'>) => Promise<void>;
}

export function PantryItemGroup({ ingredientId, name, items, onUpdate, onRemove, onAddBatch }: PantryItemGroupProps) {
    const { t } = useSettings();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Calculate total quantity (assuming same unit for simplicity, or just showing first unit found)
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const rawUnit = items[0]?.unit || '';
    const displayUnit = t.units?.[rawUnit] || rawUnit;

    // Determine status (red if any batch is expired/expiring soon)
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    let isCritical = false; // Expired
    let isWarning = false;  // Expiring soon

    items.forEach(item => {
        if (!item.expirationDate) return;
        const exp = new Date(item.expirationDate);
        if (exp < now) isCritical = true;
        else if (exp <= threeDaysFromNow) isWarning = true;
    });

    const handleDeleteAll = async () => {
        // Delete all items in this group
        // We do this by calling onRemove for each ID. 
        // In a real app, might want a bulk delete API, but this works for local DB loop.
        const promises = items.map(item => item.id && onRemove(item.id));
        await Promise.all(promises);
    };

    return (
        <Card className={cn(
            "border border-border/50 shadow-sm overflow-hidden transition-all duration-300",
            isExpanded ? "ring-2 ring-primary/10 shadow-md" : "hover:border-primary/30 hover:shadow-md"
        )}>
            <div
                className="p-5 flex justify-between items-center cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border transition-colors",
                        isCritical
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : isWarning
                                ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800"
                                : "bg-primary/10 text-primary border-primary/20"
                    )}>
                        {items.length}
                    </div>
                    <div>
                        <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors">{name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{t.pantry.total} <strong className="text-foreground">{totalQuantity} {displayUnit}</strong></span>
                            {(isCritical || isWarning) && (
                                <span className={cn(
                                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
                                    isCritical
                                        ? "bg-destructive/10 text-destructive"
                                        : "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
                                )}>
                                    {t.pantry.attention}
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Allow deleting entire group from header if expanded or just show chevron */}
                    {isExpanded && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModalOpen(true);
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                    <div className="text-muted-foreground group-hover:text-primary transition-colors bg-secondary/10 p-2 rounded-full">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-border/50 bg-muted/30 p-4 animate-in slide-in-from-top-2 duration-200">
                    <BatchList
                        items={items}
                        onUpdate={onUpdate}
                        onRemove={onRemove}
                    />
                    <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
                        <Button
                            variant="ghost"
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsAddModalOpen(true);
                            }}
                        >
                            <span className="text-lg mr-1">+</span> {t.pantry.addExistencia}
                        </Button>
                    </div>
                </div>
            )}

            {isAddModalOpen && (
                <AddBatchModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={async (batchData) => {
                        await onAddBatch({
                            ingredientId,
                            name,
                            ...batchData
                        });
                        setIsAddModalOpen(false);
                    }}
                    defaultUnit={rawUnit}
                />
            )}

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteAll}
                itemName={name}
                description={`${t.feed.deleteConfirmGeneric} (${items.length} items)`}
            />
        </Card>
    );
}
