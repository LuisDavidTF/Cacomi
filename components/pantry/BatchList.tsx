import * as React from 'react';
import type { LocalPantryItem } from '@/lib/db';
import { Button } from '@/components/shadcn/button';
import { Trash2, Pencil, Calendar } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { cn } from '@/lib/utils';
import { AddBatchModal } from './AddBatchModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface BatchListProps {
    items: LocalPantryItem[];
    onUpdate: (id: number, updates: Partial<LocalPantryItem>) => Promise<void>;
    onRemove: (id: number) => Promise<void>;
}

export function BatchList({ items, onUpdate, onRemove }: BatchListProps) {
    const { t } = useSettings();
    const [editingItem, setEditingItem] = React.useState<LocalPantryItem | null>(null);
    const [deleteItem, setDeleteItem] = React.useState<LocalPantryItem | null>(null);

    const getDaysUntilExpiration = (dateStr?: string | null) => {
        if (!dateStr) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exp = new Date(dateStr);
        exp.setHours(0, 0, 0, 0);
        const diffTime = exp.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getExpirationDetails = (days?: number | null) => {
        if (days === null || days === undefined) return null;

        if (days < 0) {
            const daysAbs = Math.abs(days);
            return {
                label: `${t.common.expiredPre} ${daysAbs} ${t.common.expiredPost}`,
                color: 'text-destructive bg-destructive/10 border-destructive/20 font-medium'
            };
        }
        if (days === 0) {
            return {
                label: t.common.expiresToday,
                color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800 font-medium'
            };
        }
        if (days <= 3) {
            return {
                label: `${t.common.expiresIn} ${days} ${t.common.days}`,
                color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800 font-medium'
            };
        }
        // Stable/Good state
        return {
            label: `${t.common.expiresIn} ${days} ${t.common.days}`,
            color: 'text-primary bg-primary/5 border-primary/10'
        };
    };

    return (
        <div className="space-y-2">
            {items.map(item => {
                const days = getDaysUntilExpiration(item.expirationDate);
                const status = getExpirationDetails(days);
                const displayUnit = t.units?.[item.unit] || item.unit;

                return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border sm:hover:border-primary/20 transition-colors group">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 w-full">
                            <span className="font-medium text-foreground min-w-[100px]">{item.quantity} {displayUnit}</span>

                            {item.expirationDate && status ? (
                                <div className={cn(
                                    "flex items-center text-xs px-3 py-1 rounded-full border transition-colors",
                                    status.color
                                )}>
                                    <Calendar className="w-3 h-3 mr-1.5 opacity-70" />
                                    {status.label}
                                </div>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-2 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                                onClick={() => setEditingItem(item)}
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteItem(item)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                );
            })}

            {/* Edit Modal */}
            {editingItem && (
                <AddBatchModal
                    isOpen={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    existingData={{
                        quantity: editingItem.quantity,
                        unit: editingItem.unit,
                        expirationDate: editingItem.expirationDate
                    }}
                    onSave={async (updates) => {
                        if (editingItem.id) {
                            await onUpdate(editingItem.id, updates);
                        }
                        setEditingItem(null);
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={() => {
                    if (deleteItem?.id) onRemove(deleteItem.id);
                }}
                itemName={`${deleteItem?.quantity} ${t.units?.[deleteItem?.unit || ''] || deleteItem?.unit}`}
            />
        </div>
    );
}
