"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormInput } from "@/components/ui/FormInput";

interface SetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SetPasswordModal({ isOpen, onClose }: SetPasswordModalProps) {
    const { setPassword } = useAuth();
    const { t } = useSettings();
    const { showToast } = useToast();

    const [password, setPasswordValue] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError(t.auth.passwordWeak);
            return;
        }

        if (password !== confirmPassword) {
            setError(t.auth.passMismatch);
            return;
        }

        setIsLoading(true);
        try {
            await setPassword(password);
            showToast(t.auth.setPasswordSuccess, "success");
            onClose();
        } catch (err: any) {
            setError(err.message || "Error al establecer la contraseña");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.auth.setPassword}>
            <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                    {t.auth.setPasswordDesc}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        id="new-password"
                        label={t.auth.password}
                        type="password"
                        value={password}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        required
                    />
                    <FormInput
                        id="confirm-password"
                        label={t.auth.confirmPassword}
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <p className="text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                            {t.common.cancel}
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            {t.auth.setPassword}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
