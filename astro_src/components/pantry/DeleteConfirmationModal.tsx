/** @jsxImportSource react */
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/shadcn/dialog"
import { Button } from '@/components/shadcn/button';
import { useSettings } from '@/context/SettingsContext';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    itemName?: string;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    itemName
}: DeleteConfirmationModalProps) {
    const { t } = useSettings();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title || t.feed.deleteTitle}</DialogTitle>
                    <DialogDescription>
                        {description || (itemName
                            ? `${t.feed.deleteConfirm} "${itemName}"?`
                            : t.feed.deleteConfirmGeneric)
                        }
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose}>
                        {t.feed.cancel}
                    </Button>
                    <Button variant="destructive" onClick={() => {
                        onConfirm();
                        onClose();
                    }}>
                        {t.feed.confirmDelete}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
