/** @jsxImportSource react */
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/shadcn/dialog"
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Label } from '@/components/shadcn/label';
import { useSettings } from '@/context/SettingsContext';

interface AddBatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { quantity: number; unit: string; expirationDate: string | null }) => Promise<void>;
    defaultUnit?: string;
    existingData?: { quantity: number; unit: string; expirationDate: string | null };
}

export function AddBatchModal({ isOpen, onClose, onSave, defaultUnit = 'pza', existingData }: AddBatchModalProps) {
    const { t } = useSettings();
    const [quantity, setQuantity] = useState(existingData?.quantity?.toString() || '');
    const [unit, setUnit] = useState(existingData?.unit || defaultUnit);
    const [expirationDate, setExpirationDate] = useState(existingData?.expirationDate || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setQuantity(existingData?.quantity?.toString() || '');
            setUnit(existingData?.unit || defaultUnit);
            setExpirationDate(existingData?.expirationDate || '');
        }
    }, [isOpen, defaultUnit, existingData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let parsedQuantity = parseFloat(quantity);
            let finalUnit = unit;

            if (unit === 'kg') {
                parsedQuantity *= 1000;
                finalUnit = 'g';
            } else if (unit === 'L') {
                parsedQuantity *= 1000;
                finalUnit = 'ml';
            } else if (unit === 'pza') {
                finalUnit = 'pz';
            }

            await onSave({
                quantity: parsedQuantity,
                unit: finalUnit,
                expirationDate: expirationDate || null
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{existingData ? t.pantry.editExistencia : t.pantry.addExistenciaTitle}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                        <Label htmlFor="quantity" className="text-left sm:text-right">
                            {t.pantry.quantity}
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            step="0.01"
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder={t.pantry.qtyPlaceholder}
                            className="col-span-1 sm:col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                        <Label htmlFor="unit" className="text-left sm:text-right">
                            {t.pantry.unit}
                        </Label>
                        {/* Fallback to native select styled as Input since Select component wasn't explicitly scaffolded in this turn 
                             and I want to avoid adding too many files if not requested. 
                             But wait, I can use cn to style it like an input.
                         */}
                        <select
                            id="unit"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 col-span-1 sm:col-span-3"
                        >
                            <option value="pza">{t.units.pza}</option>
                            <option value="kg">{t.units.kg}</option>
                            <option value="g">{t.units.g}</option>
                            <option value="L">{t.units.L}</option>
                            <option value="ml">{t.units.ml}</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                        <Label htmlFor="expiration" className="text-left sm:text-right">
                            {t.pantry.expiration}
                        </Label>
                        <Input
                            id="expiration"
                            type="date"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            className="col-span-1 sm:col-span-3"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                            {t.pantry.cancel}
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !quantity}>
                            {isSubmitting ? t.pantry.saving : t.pantry.save}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
