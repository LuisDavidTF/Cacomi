"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/shadcn/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";

interface UserProfile {
    name: string;
    biography?: string;
    profilePictureUrl?: string;
}

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile;
    onSave: (data: UserProfile) => Promise<void>;
}

export function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
    const { t } = useSettings();

    const [name, setName] = useState(user.name || "");
    const [biography, setBiography] = useState(user.biography || "");
    const [profilePictureUrl, setProfilePictureUrl] = useState(user.profilePictureUrl || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setName(user.name || "");
            setBiography(user.biography || "");
            setProfilePictureUrl(user.profilePictureUrl || "");
            setError(null);
        }
    }, [isOpen, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Dirty checking
        if (
            name === (user.name || "") &&
            biography === (user.biography || "") &&
            profilePictureUrl === (user.profilePictureUrl || "")
        ) {
            // No changes made, just close
            onClose();
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await onSave({ name, biography, profilePictureUrl });
            onClose();
        } catch (err: any) {
            setError(err.message || "Error al actualizar el perfil.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t?.profile?.editProfile || "Editar Perfil"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t?.profile?.name || "Nombre"}</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t?.profile?.namePlaceholder || "Tu nombre"}
                            required
                            minLength={3}
                            maxLength={20}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="profilePictureUrl">{t?.profile?.photoUrl || "URL de Foto de Perfil"}</Label>
                        <Input
                            id="profilePictureUrl"
                            type="url"
                            value={profilePictureUrl}
                            onChange={(e) => setProfilePictureUrl(e.target.value)}
                            placeholder={t?.profile?.photoPlaceholder || "https://ejemplo.com/foto.jpg"}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="biography">{t?.profile?.biography || "Biografía"}</Label>
                        <textarea
                            id="biography"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={biography}
                            onChange={(e) => setBiography(e.target.value)}
                            placeholder={t?.profile?.bioPlaceholder || "Escribe algo sobre ti..."}
                            maxLength={200}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            {t?.profile?.cancel || "Cancelar"}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (t?.profile?.saving || "Guardando...") : (t?.profile?.save || "Guardar cambios")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
