'use client';

import React from 'react';
import { Button } from '@components/ui/Button';
import { useSettings } from '@context/SettingsContext';

export function LandingHero() {
    const { t } = useSettings();

    return (
        <section className="relative overflow-hidden bg-background py-16 md:py-24 lg:py-32">
            <div className="container relative z-10 px-4 md:px-6 mx-auto text-center">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                        <span className="block">{t.common.appName || 'Culina Smart'}</span>
                        <span className="block text-primary mt-2">
                            {t.landing?.heroTitle || 'Planificación de Comidas Inteligente'}
                        </span>
                    </h1>

                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
                        {t.landing?.heroSubtitle || 'Descubre una nueva forma de cocinar con recetas generadas por IA...'}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                        <Button
                            size="lg"
                            onClick={() => window.location.href = '/register'}
                            className="text-lg px-8 py-6 shadow-lg shadow-primary/25"
                        >
                            {t.landing?.ctaStart || 'Comenzar Gratis'}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => {
                                const element = document.getElementById('latest-recipes');
                                element?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-lg px-8 py-6"
                        >
                            {t.landing?.ctaExplore || 'Explorar Recetas'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Decorative background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 dark:opacity-5 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary via-purple-500 to-amber-500 rounded-full blur-[100px]" />
            </div>
        </section>
    );
}
