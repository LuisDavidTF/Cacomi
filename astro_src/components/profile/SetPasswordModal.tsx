"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormInput } from "@/components/ui/FormInput";
import { Check, Circle, ShieldCheck, ShieldAlert } from "lucide-react";

interface SetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SetPasswordModal({ isOpen, onClose }: SetPasswordModalProps) {
    const { user, setPassword, changePassword } = useAuth();
    const { t } = useSettings();
    const { showToast } = useToast();

    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPasswordValue] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"SET" | "CHANGE">("SET");

    // Clear state when modal closes
    useEffect(() => {
        if (!isOpen) {
            // Delay clearing to ensure browser can still 'see' the values for its save dialog if needed
            const timer = setTimeout(() => {
                setCurrentPassword("");
                setPasswordValue("");
                setConfirmPassword("");
                setError(null);
                setIsSuccess(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const requirements = useMemo(() => [
        { label: t.auth.reqLength, met: password.length >= 8 },
        { label: t.auth.reqUpper, met: /[A-Z]/.test(password) },
        { label: t.auth.reqLower, met: /[a-z]/.test(password) },
        { label: t.auth.reqNumber, met: /[0-9]/.test(password) },
        { label: t.auth.reqSymbol, met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
        { label: t.auth.passMatch || 'Coinciden', met: password.length > 0 && password === confirmPassword }
    ], [password, confirmPassword, t]);

    const isStrong = requirements.slice(0, 5).every(req => req.met);
    const canSubmit = isStrong && password === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isStrong) {
            setError(t.auth.passwordSafeError);
            return;
        }

        if (password !== confirmPassword) {
            setError(t.passMismatch || t.auth.passMismatch);
            return;
        }

        setIsLoading(true);
        try {
            if (mode === "SET") {
                try {
                    await setPassword(password);
                    setIsSuccess(true);
                    showToast(t.auth.setPasswordSuccess, "success");
                    setTimeout(onClose, 2000);
                } catch (err: any) {
                    if (err.message?.includes("ya tiene una contraseña") || err.message?.includes("already set")) {
                        setMode("CHANGE");
                        setError(t.auth.changePasswordDesc);
                    } else {
                        throw err;
                    }
                }
            } else {
                await changePassword(currentPassword, password);
                setIsSuccess(true);
                showToast(t.auth.changePasswordSuccess, "success");
                setTimeout(onClose, 2000);
            }
        } catch (err: any) {
            setError(err.message || "Error al procesar la solicitud");
        } finally {
            setIsLoading(false);
        }
    };

    const title = mode === "SET" ? t.auth.setPassword : t.auth.changePassword;
    const description = mode === "SET" ? t.auth.setPasswordDesc : t.auth.changePasswordDesc;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <ShieldCheck className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">
                            {mode === "SET" ? t.auth.setPasswordSuccess : t.auth.changePasswordSuccess}
                        </h3>
                        <p className="text-muted-foreground text-center max-w-[250px]">
                            Tu seguridad es nuestra prioridad. Redirigiendo...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 mb-2">
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                {description}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4" method="POST">
                            {/* Hidden fields to satisfy browser password managers */}
                            <input 
                                type="hidden" 
                                name="username" 
                                value={user?.email || ""} 
                                autoComplete="username" 
                            />

                            {mode === "CHANGE" && (
                                <FormInput
                                    id="current-password"
                                    label={t.auth.currentPassword}
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    name="current-password"
                                />
                            )}

                            <div className="space-y-2">
                                <FormInput
                                    id="new-password"
                                    label={mode === "SET" ? t.auth.password : t.auth.newPassword}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPasswordValue(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    name="new-password"
                                    placeholder="••••••••"
                                />

                                {/* Visual Validator */}
                                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/30 border border-border/50">
                                    <div className="col-span-2 flex items-center gap-2 mb-1">
                                        {isStrong ? (
                                            <ShieldCheck className="w-4 h-4 text-primary" />
                                        ) : (
                                            <ShieldAlert className="w-4 h-4 text-muted-foreground/60" />
                                        )}
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isStrong ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {isStrong ? 'Segura' : 'Requerimientos'}
                                        </span>
                                    </div>
                                    {requirements.map((req, i) => (
                                        <div key={i} className="flex items-center gap-2 transition-all duration-300">
                                            {req.met ? (
                                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-primary">
                                                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                                                </div>
                                            ) : (
                                                <div className="flex h-4 w-4 items-center justify-center rounded-full border border-muted-foreground/30">
                                                    <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                                </div>
                                            )}
                                            <span className={`text-[11px] transition-colors ${req.met ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                {req.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <FormInput
                                id="confirm-password"
                                label={t.auth.confirmPassword}
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                name="confirm-password"
                                placeholder="••••••••"
                            />

                            {error && (
                                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                                    <p className="text-sm text-destructive font-medium">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                                    {t.common.cancel}
                                </Button>
                                <Button type="submit" isLoading={isLoading} className="px-8 shadow-sm" disabled={!canSubmit && password.length > 0}>
                                    {title}
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </Modal>
    );
}
