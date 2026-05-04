"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import { EditProfileModal } from "./EditProfileModal";
import { Button } from "@/components/shadcn/button";
import { Camera, MapPin, CalendarDays, Link as LinkIcon, Activity } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { BiometricModal } from "../planner/BiometricModal";
import { Ruler, KeyRound } from "lucide-react";
import { SetPasswordModal } from "./SetPasswordModal";

export function ProfileDashboard() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const api = useApiClient();
    const { t } = useSettings();

    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
    const [isSetPasswordModalOpen, setIsSetPasswordModalOpen] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            if (!user) {
                setIsLoading(false);
                return;
            }
            try {
                const data = await api.getUserProfile();
                setProfileData(data);
            } catch (err: any) {
                setError(err.message || t?.profile?.errorLoad || "Error al cargar el perfil");
            } finally {
                setIsLoading(false);
            }
        }

        if (!isAuthLoading) {
            fetchProfile();
        }
    }, [user, isAuthLoading, api]);

    const handleSaveProfile = async (newData: any) => {
        const updated = await api.updateUserProfile(newData);
        setProfileData(updated);
    };

    if (isAuthLoading || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
                <p className="text-sm text-muted-foreground animate-pulse">{t?.profile?.loading || "Cargando perfil..."}</p>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="p-8 text-center text-destructive">
                <p>{error || t?.profile?.noProfile || "No se pudo cargar el perfil"}</p>
            </div>
        );
    }


    return (
        <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border bg-background shadow-sm">
            {/* Cover Banner */}
            <div className="relative h-48 w-full bg-gradient-to-r from-primary/40 via-primary/70 to-primary sm:h-64" />

            {/* Profile Info Section */}
            <div className="relative px-4 pb-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between">

                    {/* Avatar */}
                    <div className="relative -mt-16 sm:-mt-24 mb-4 sm:mb-0">
                        <div className="relative inline-block rounded-full border-4 border-background bg-muted">
                            {profileData.profilePictureUrl ? (
                                <img
                                    src={profileData.profilePictureUrl}
                                    alt={profileData.name}
                                    className="h-32 w-32 rounded-full object-cover sm:h-40 sm:w-40"
                                />
                            ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 text-4xl font-bold text-primary sm:h-40 sm:w-40">
                                    {profileData.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 py-4 sm:py-0">
                        <div className="relative hidden sm:block">
                            <Button
                                variant="outline"
                                className="rounded-full border-primary/20 text-primary opacity-60 pointer-events-none cursor-not-allowed"
                                disabled
                            >
                                <Activity className="w-4 h-4 mr-2" />
                                {t?.nav?.progress || "Mi Progreso"}
                            </Button>
                            <span className="absolute -top-2 -right-1 bg-primary/10 text-primary text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-primary/20 backdrop-blur-md shadow-sm z-10 tracking-widest">
                                {t?.nav?.comingSoon || 'Soon'}
                            </span>
                        </div>
                        <Button onClick={() => setIsBiometricModalOpen(true)} variant="outline" className="rounded-full border-primary/30 text-primary text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
                            <Ruler className="w-4 h-4 mr-2" />
                            <span className="hidden xs:inline">{t?.profile?.biometric || "Metas Nutricionales"}</span>
                            <span className="xs:hidden">{t?.nav?.goals || "Metas"}</span>
                        </Button>
                        <Button onClick={() => setIsEditModalOpen(true)} className="rounded-full text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
                            {t?.profile?.editProfile || "Editar Perfil"}
                        </Button>
                        <Button onClick={() => setIsSetPasswordModalOpen(true)} variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 text-primary/70 hover:text-primary transition-colors" title={t?.auth?.setPassword}>
                            <KeyRound className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* User Details */}
                <div className="mt-2 text-left">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{profileData.name}</h1>
                    <p className="text-muted-foreground">{profileData.email}</p>

                    {profileData.biography && (
                        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground sm:text-base">
                            {profileData.biography}
                        </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                            <CalendarDays className="mr-1 h-4 w-4" />
                            <span>{t?.profile?.joined || "Se unió recientemente"}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 border-t" />

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={profileData}
                onSave={handleSaveProfile}
            />

            <BiometricModal 
                isOpen={isBiometricModalOpen}
                onClose={() => setIsBiometricModalOpen(false)}
                onSaveSuccess={() => {
                    // Success!
                }}
                language={t?.language || 'es'}
            />

            <SetPasswordModal 
                isOpen={isSetPasswordModalOpen} 
                onClose={() => setIsSetPasswordModalOpen(false)} 
            />
        </div>
    );
}
