'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@components/ui/Button';
import { useToast } from '@context/ToastContext';
import { CacheManager } from '@utils/cacheManager';
import { useApiClient } from '@hooks/useApiClient';
import { Modal } from '@components/ui/Modal';
import { StorageHelper } from '@utils/storageHelper';
import { Database, ShoppingBasket, Calendar, Box, Trash2 } from 'lucide-react';

function SettingsSection({ title, children }) {
    return (
        <div className="bg-card shadow-sm rounded-xl overflow-hidden border border-border mb-6 transition-colors duration-300">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const { imageStrategy, setStrategy, clearCache, isWifi, theme, setTheme, language, setLanguage, t } = useSettings();
    const { showToast } = useToast();
    const { isAuthenticated } = useAuth();
    const apiClient = useApiClient();
    const [isClearing, setIsClearing] = useState(null); // category being cleared
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, category: null });
    const [storageBreakdown, setStorageBreakdown] = useState({
        total: 0,
        categories: { app: 0, pantry: 0, recipes: 0, planner: 0 }
    });

    const loadStorageData = async () => {
        const breakdown = await StorageHelper.getStorageBreakdown();
        setStorageBreakdown(breakdown);
    };

    useEffect(() => {
        loadStorageData();
    }, []);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
    };

    const handleClearCategory = async (category) => {
        setConfirmModal({ isOpen: true, category });
    };

    const executeClear = async () => {
        const { category } = confirmModal;
        if (!category) return;

        setIsClearing(category);
        setConfirmModal({ isOpen: false, category: null });
        try {
            await StorageHelper.clearCategory(category);
            await loadStorageData();
            showToast(t.settings.clearing, 'success');
        } catch (error) {
            showToast('Error', 'error');
        } finally {
            setIsClearing(null);
        }
    };

    const handleDeactivateAccount = async () => {
        setIsDeleting(true);
        try {
            await apiClient.deactivateAccount();
            showToast(language === 'es' ? 'Cuenta desactivada exitosamente.' : 'Account deactivated successfully.', 'success');
            setTimeout(() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }, 1000);
        } catch (error) {
            showToast(error.message || 'Error', 'error');
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 mb-20">
            <h1 className="text-3xl font-bold text-foreground mb-2">{t.settings.title}</h1>
            <p className="text-muted-foreground mb-8">{t.settings.subtitle}</p>

            {/* APARIENCIA */}
            <SettingsSection title={t.settings.appearance}>
                <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'system'].map((th) => (
                        <button
                            key={th}
                            onClick={() => handleThemeChange(th)}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${theme === th
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-input hover:border-primary/50 text-muted-foreground'
                                }`}
                        >
                            {th === 'light' && '☀️'}
                            {th === 'dark' && '🌑'}
                            {th === 'system' && '💻'}
                        </button>
                    ))}
                </div>
            </SettingsSection>

            {/* IDIOMA Y REGIÓN */}
            <SettingsSection title={t.settings.language}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-foreground">{t.settings.languageTitle}</p>
                        <p className="text-sm text-muted-foreground">{t.settings.languageDesc}</p>
                    </div>
                    <div className="flex gap-2">
                        {[
                            { code: 'es', label: '🇪🇸 ES' },
                            { code: 'en', label: '🇺🇸 EN' },
                            { code: 'fr', label: '🇫🇷 FR' }
                        ].map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 ${language === lang.code
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-input text-muted-foreground hover:border-primary/50'
                                    }`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between opacity-50 cursor-not-allowed group">
                    <div>
                        <p className="font-medium text-muted-foreground group-hover:cursor-not-allowed">{t.settings.translation}</p>
                        <p className="text-xs text-muted-foreground group-hover:cursor-not-allowed">{t.settings.translationDesc}</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in cursor-not-allowed">
                        <input disabled type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-card border-4 appearance-none cursor-not-allowed" />
                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-muted cursor-not-allowed"></label>
                    </div>
                </div>
            </SettingsSection>

            {/* AHORRO DE DATOS */}
            <SettingsSection title={t.settings.dataSaver}>
                <p className="text-sm text-muted-foreground mb-4">
                    {t.settings.dataSaverDesc}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => setStrategy('always')}
                        className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${imageStrategy === 'always'
                            ? 'border-primary bg-primary/10'
                            : 'border-input hover:border-primary/50'
                            }`}
                    >
                        <div className={`font-semibold text-sm ${imageStrategy === 'always' ? 'text-primary' : 'text-foreground'}`}>{t.settings.always}</div>
                        <div className="text-xs text-muted-foreground mt-1">{t.settings.alwaysDesc}</div>
                    </button>

                    <button
                        onClick={() => setStrategy('wifi-only')}
                        className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${imageStrategy === 'wifi-only'
                            ? 'border-primary bg-primary/10'
                            : 'border-input hover:border-primary/50'
                            }`}
                    >
                        <div className={`font-semibold text-sm ${imageStrategy === 'wifi-only' ? 'text-primary' : 'text-foreground'}`}>{t.settings.wifi}</div>
                        <div className="text-xs text-muted-foreground mt-1">{t.settings.wifiDesc}</div>
                    </button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full ${isWifi ? 'bg-primary' : 'bg-amber-500'}`}></div>
                    Conexión actual: {isWifi ? 'WiFi' : 'Datos Móviles'}
                </div>
            </SettingsSection>

            {/* ALMACENAMIENTO OFFLINE */}
            <SettingsSection title={t.settings.storage}>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">{t.settings.usage}</span>
                    <span className="text-xl font-black text-foreground">{StorageHelper.formatBytes(storageBreakdown.total)}</span>
                </div>
                
                {/* Segmented Bar */}
                <div className="w-full bg-muted rounded-full h-4 mb-8 overflow-hidden flex">
                    {storageBreakdown.total > 0 ? (
                        <>
                            <div 
                                className="bg-indigo-500 h-full transition-all duration-500" 
                                style={{ width: `${(storageBreakdown.categories.app / storageBreakdown.total) * 100}%` }}
                                title={`App: ${StorageHelper.formatBytes(storageBreakdown.categories.app)}`}
                            />
                            <div 
                                className="bg-emerald-500 h-full transition-all duration-500" 
                                style={{ width: `${(storageBreakdown.categories.recipes / storageBreakdown.total) * 100}%` }}
                                title={`Recipes: ${StorageHelper.formatBytes(storageBreakdown.categories.recipes)}`}
                            />
                            <div 
                                className="bg-amber-500 h-full transition-all duration-500" 
                                style={{ width: `${(storageBreakdown.categories.pantry / storageBreakdown.total) * 100}%` }}
                                title={`Pantry: ${StorageHelper.formatBytes(storageBreakdown.categories.pantry)}`}
                            />
                            <div 
                                className="bg-pink-500 h-full transition-all duration-500" 
                                style={{ width: `${(storageBreakdown.categories.planner / storageBreakdown.total) * 100}%` }}
                                title={`Planner: ${StorageHelper.formatBytes(storageBreakdown.categories.planner)}`}
                            />
                        </>
                    ) : (
                        <div className="w-full h-full bg-muted" />
                    )}
                </div>

                {/* Category Details */}
                <div className="space-y-4">
                    {[
                        { id: 'app', label: t.settings.app, size: storageBreakdown.categories.app, icon: Database, color: 'text-indigo-500', canClear: false },
                        { id: 'recipes', label: t.settings.recipes, size: storageBreakdown.categories.recipes, icon: Box, color: 'text-emerald-500', canClear: true },
                        { id: 'pantry', label: t.settings.pantry, size: storageBreakdown.categories.pantry, icon: ShoppingBasket, color: 'text-amber-500', canClear: true },
                        { id: 'planner', label: t.settings.planner, size: storageBreakdown.categories.planner, icon: Calendar, color: 'text-pink-500', canClear: true }
                    ].map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-background shadow-sm ${cat.color}`}>
                                    <cat.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground leading-none mb-1">{cat.label}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{StorageHelper.formatBytes(cat.size)}</p>
                                </div>
                            </div>
                            
                            {cat.canClear && cat.size > 0 && (
                                <button
                                    onClick={() => handleClearCategory(cat.id)}
                                    disabled={isClearing === cat.id}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                    title={t.settings.clear}
                                >
                                    {isClearing === cat.id ? (
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <p className="text-[10px] text-muted-foreground mt-6 text-center uppercase tracking-[0.2em] opacity-60">
                    {t.settings.storageDesc}
                </p>
            </SettingsSection>

            {/* CUENTA Y PRIVACIDAD (Solo usuarios autenticados) */}
            {isAuthenticated && (
                <SettingsSection title={t.settings.account || 'Cuenta y Privacidad'}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-foreground mb-1">
                                {t.settings.deleteAccountDesc || 'Solicitar la baja permanente de tus datos.'}
                            </p>
                            <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                                {t.createRecipe.disclaimerRetention}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(true)}
                            disabled={isDeleting}
                            isLoading={isDeleting}
                            className="text-destructive font-medium border border-destructive/20 hover:bg-destructive hover:text-destructive-foreground transition-colors shrink-0"
                        >
                            {t.settings.deleteAccount || 'Eliminar mi cuenta'}
                        </Button>
                    </div>
                </SettingsSection>
            )}

            <div className="text-center text-xs text-muted-foreground mt-8">
                Cacomi v1.2.0 • Build 2026
            </div>

            {/* Modal de confirmación para eliminar cuenta */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                title={
                    language === 'es' ? '¿Eliminar cuenta?' :
                        language === 'en' ? 'Delete account?' :
                            'Supprimer le compte ?'
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {language === 'es' ? '¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Esta acción no se puede deshacer y perderás el acceso a todas tus recetas privadas e inventario.' :
                            language === 'en' ? 'Are you sure you want to permanently delete your account? This action cannot be undone and you will lose access to all your private recipes and inventory.' :
                                'Êtes-vous sûr de vouloir supprimer votre compte définitivement ? Cette action est irréversible et vous perdrez l\'accès à toutes vos recetas privées et à votre inventaire.'}
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isDeleting}
                        >
                            {t.settings.cancel || 'Cancelar'}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeactivateAccount}
                            isLoading={isDeleting}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            {t.settings.deleteAccount || 'Eliminar'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal de confirmación de limpieza de almacenamiento (PSICOLOGÍA APLICADA) */}
            <Modal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, category: null })}
                title={language === 'es' ? '¿Limpiar estos datos?' : 'Clear this data?'}
            >
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                        {confirmModal.category === 'recipes' && (
                            <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                                {language === 'es' 
                                    ? 'Perderás el acceso instantáneo sin conexión a tus recetas favoritas. La IA tendrá que volver a aprender tus gustos desde cero. ¿Seguro que quieres borrar esta valiosa biblioteca?' 
                                    : 'You will lose instant offline access to your favorite recipes. The AI will have to relearn your tastes from scratch. Are you sure you want to delete this valuable library?'}
                            </p>
                        )}
                        {confirmModal.category === 'pantry' && (
                            <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                                {language === 'es' 
                                    ? 'Si borras tu despensa, Cacomi dejará de saber qué tienes en casa. No podremos sugerirte recetas mágicas basadas en tus ingredientes actuales. ¡Tendrás que registrar todo de nuevo!' 
                                    : 'If you clear your pantry, Cacomi will stop knowing what you have at home. We won\'t be able to suggest magic recipes based on your current ingredients. You\'ll have to re-register everything!'}
                            </p>
                        )}
                        {confirmModal.category === 'planner' && (
                            <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                                {language === 'es' 
                                    ? 'Tu planificación semanal te ayuda a comer mejor y ahorrar tiempo. Borrarla significa perder tu organización de los próximos días. ¿Prefieres improvisar?' 
                                    : 'Your weekly planning helps you eat better and save time. Clearing it means losing your organization for the coming days. Would you rather improvise?'}
                            </p>
                        )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground italic px-2">
                        {language === 'es' 
                            ? 'Nota: Siempre puedes volver a descargar estos datos, pero borrarlos ahora interrumpirá tu experiencia inteligente.'
                            : 'Note: You can always re-download this data, but clearing it now will interrupt your smart experience.'}
                    </p>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setConfirmModal({ isOpen: false, category: null })}
                        >
                            {language === 'es' ? 'Mantener mis datos' : 'Keep my data'}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={executeClear}
                            className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-destructive/20"
                        >
                            {language === 'es' ? 'Sí, borrar por espacio' : 'Yes, clear for space'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
