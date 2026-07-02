"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import { EditProfileModal } from "./EditProfileModal";
import { Button } from "@/components/shadcn/button";
import { Camera, MapPin, CalendarDays, Link as LinkIcon, Activity, Package, Calendar, Clock, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { BiometricModal } from "../planner/BiometricModal";
import { Ruler, KeyRound } from "lucide-react";
import { SetPasswordModal } from "./SetPasswordModal";
import { db } from "../../lib/db";
import { useLiveQuery } from "dexie-react-hooks";

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
    const [expandedPreorderId, setExpandedPreorderId] = useState<string | null>(null);

    // Load preorders for current user from Dexie
    const userPreorders = useLiveQuery(
        () => db.preorders.where('userEmail').equals(user?.email || '').reverse().sortBy('date'),
        [user]
    ) || [];

    useEffect(() => {
        async function fetchProfile() {
            if (!user) {
                setIsLoading(false);
                return;
            }
            try {
                const data = await api.getUserProfile();
                setProfileData(data);
                
                // Save/Sync user profile to Dexie
                const profileRecord = {
                    id: user.id ? String(user.id) : 'current',
                    name: data.name,
                    email: data.email,
                    biography: data.biography,
                    profilePictureUrl: data.profilePictureUrl,
                    gender: data.gender || 'MALE',
                    birthDate: data.birthDate || '',
                    heightCm: data.heightCm || 0,
                    currentWeightKg: data.currentWeightKg || 0,
                    activityLevel: data.activityLevel || 'SEDENTARY',
                    goalType: data.goalType || 'MAINTENANCE',
                    targetWeightKg: data.targetWeightKg || 0,
                    lastUpdated: new Date().toISOString()
                };
                await db.userProfile.put(profileRecord);
                
                // Duplicate as 'current' for ease of query
                await db.userProfile.put({
                    ...profileRecord,
                    id: 'current'
                });
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

        // Update local Dexie copy
        const currentLocal = await db.userProfile.get('current');
        if (currentLocal) {
            await db.userProfile.put({
                ...currentLocal,
                name: updated.name,
                biography: updated.biography,
                profilePictureUrl: updated.profilePictureUrl
            });
        }
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

            {/* Preorder History Section */}
            <div className="mt-6 border-t p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-foreground font-sans">
                    <Package className="w-5 h-5 text-primary" />
                    {t?.preorder?.historyTitle || "Historial de Preventas"}
                </h2>

                {userPreorders.length === 0 ? (
                    <div className="text-center py-8 px-4 border border-dashed border-border rounded-2xl bg-muted/10">
                        <Package className="w-8 h-8 text-muted-foreground/60 mx-auto mb-3 opacity-40" />
                        <p className="text-xs text-muted-foreground font-semibold">
                            {t?.preorder?.noHistory || "No tienes preventas registradas todavía."}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 mt-1 max-w-xs mx-auto">
                            {t?.preorder?.noHistorySub || "Tus compras de combos semanales aparecerán aquí para que puedas hacerles seguimiento."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {userPreorders.map((order) => {
                            const isExpanded = expandedPreorderId === order.id;
                            const orderDate = new Date(order.date).toLocaleDateString(t?.language || 'es', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });

                            return (
                                <div key={order.id} className="border border-border rounded-2xl overflow-hidden bg-muted/5 hover:bg-muted/10 transition-all">
                                    {/* Order Summary Row */}
                                    <div 
                                        onClick={() => setExpandedPreorderId(isExpanded ? null : order.id)}
                                        className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer select-none"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-black text-xs text-foreground bg-muted border px-2 py-0.5 rounded-md">
                                                    #{order.orderNumber}
                                                </span>
                                                <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded border border-emerald-500/20">
                                                    {t?.preorder?.statusConfirmed || "Confirmado"}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 pt-1">
                                                <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" /> {orderDate}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                            <div className="text-left sm:text-right text-xs">
                                                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider block">
                                                    {order.paymentPlan === 'half' ? (t?.preorder?.payHalfLabel || "Anticipo 50%") : (t?.preorder?.payFullLabel || "Pago 100%")}
                                                </span>
                                                <span className="font-bold text-foreground">
                                                    {t?.preorder?.amountPaidLabel || "Pagado"}: <strong className="text-primary font-black">${order.amountPaid} MXN</strong>
                                                </span>
                                                {order.remaining > 0 && (
                                                    <span className="block text-[10px] text-amber-500 font-semibold mt-0.5">
                                                        {t?.preorder?.remainingLabel || "Pendiente"}: ${order.remaining} MXN
                                                    </span>
                                                )}
                                            </div>
                                            <div className="shrink-0 p-1 rounded-full hover:bg-muted text-muted-foreground/75 transition-colors">
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Details (Expandable) */}
                                    {isExpanded && (
                                        <div className="px-4 pb-5 pt-2 border-t border-border/40 bg-white dark:bg-slate-900/40 space-y-4 text-xs animate-in slide-in-from-top-1 duration-200">
                                            <div className="border-b border-border/50 pb-2">
                                                <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground font-sans">
                                                    {t?.preorder?.orderItems || "Combos en este pedido"}
                                                </h4>
                                            </div>

                                            <div className="space-y-3">
                                                {order.meals.map((meal, index) => (
                                                    <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-muted/20 border border-border/50 rounded-xl">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-black uppercase text-primary px-1.5 py-0.5 bg-primary/10 rounded">
                                                                    {meal.day.toUpperCase()}
                                                                </span>
                                                                <span className="font-bold text-foreground">{meal.comboName}</span>
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground font-medium pl-1">
                                                                Porciones: {Object.entries(meal.portions).map(([type, mult]) => `${type === 'BREAKFAST' ? 'Desayuno' : type === 'LUNCH' ? 'Almuerzo' : 'Colación'}: x${mult.toFixed(2)}`).join(', ')}
                                                            </div>
                                                        </div>
                                                        {meal.extras && meal.extras.length > 0 && (
                                                            <div className="text-left sm:text-right">
                                                                <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest block">Extras</span>
                                                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                    {meal.extras.join(', ')}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center text-[10px] text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/30">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {t?.preorder?.deliverySchedule || "Entrega programada para"}: <strong>{order.deliveryDateRange}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

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
