'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@context/SettingsContext';
import { Button } from '@components/ui/Button';
import { useToast } from '@context/ToastContext';
import { CacheManager } from '@utils/cacheManager';

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
    const [isClearing, setIsClearing] = useState(false);
    const [stats, setStats] = useState({ feedCount: 0, visitedCount: 0 });

    useEffect(() => {
        // Load stats
        const s = CacheManager.getStats();
        setStats(s);
    }, []);

    const handleThemeChange = (newTheme) => {
        // Context handles persistence and application
        setTheme(newTheme);
    };

    const handleClearCache = async () => {
        if (!confirm('¿Estás seguro?')) return;

        setIsClearing(true);
        try {
            await clearCache();
            CacheManager.clearAll(); // Ensure utility clears its keys too
            showToast(t.settings.clearing, 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            showToast('Error', 'error');
        } finally {
            setIsClearing(false);
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
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{t.settings.usage}</span>
                    <span className="text-sm font-bold text-foreground">{stats.feedCount + stats.visitedCount} {t.settings.recipes}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 mb-6">
                    <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((stats.feedCount + stats.visitedCount) / 250) * 100, 100)}%` }}
                    ></div>
                </div>

                <div className="flex justify-end">
                    <Button variant="danger" onClick={handleClearCache} disabled={isClearing} size="sm" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        {isClearing ? t.settings.clearing : t.settings.clear}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    {t.settings.storageDesc}
                </p>
            </SettingsSection>

            {/* CUENTA Y PRIVACIDAD */}
            <SettingsSection title={t.settings.account || 'Cuenta y Privacidad'}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        {t.settings.deleteAccountDesc || 'Solicitar la baja permanente de tus datos.'}
                    </p>
                    <Button
                        variant="ghost"
                        disabled={true}
                        className="text-destructive/50 border border-destructive/10 cursor-not-allowed"
                    >
                        {t.settings.deleteAccount || 'Eliminar mi cuenta'} (Próximamente)
                    </Button>
                </div>
            </SettingsSection>

            <div className="text-center text-xs text-muted-foreground mt-8">
                Culina Smart v1.2.0 • Build 2026
            </div>


        </div>
    );
}
