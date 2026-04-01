'use client';
import React, { useState } from 'react';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import { useSettings } from '@context/SettingsContext';

export function FeatureAnnouncement({ version }: { version: string }) {
    const [isVisible, setIsVisible] = useState(true);
    const { t } = useSettings();

    const handleDismiss = () => {
        setIsVisible(false);
        // Guardar la versión como vista con duración de 1 año
        document.cookie = `seen_features_version=${version}; path=/; max-age=31536000; samesite=lax`;
    };

    if (!isVisible) return null;

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 rounded-2xl p-6 sm:p-8 my-8 shadow-sm group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors" />
            
            <button 
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors z-10"
                aria-label={t.announcement?.ariaClose || "Cerrar anuncio"}
            >
                <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/15 text-primary text-xs sm:text-sm font-semibold rounded-full mb-4">
                    <Sparkles className="w-4 h-4" />
                    {t.announcement?.newUpdate || "Nueva Actualización"} {version}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                    {t.announcement?.title || "¡Descubre lo nuevo en Culina Smart!"}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base mb-6 leading-relaxed">
                    {t.announcement?.desc || "Hemos implementado mejoras clave en el desempeño de la aplicación, el planificador semanal y en nuestras recomendaciones por inteligencia artificial. Continúa explorando para descubrir una experiencia más fluida y rápida."}
                </p>
                
                <button 
                    onClick={handleDismiss}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:scale-[1.03] transition-transform"
                >
                    {t.announcement?.btn || "¡Entendido, vamos!"}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
