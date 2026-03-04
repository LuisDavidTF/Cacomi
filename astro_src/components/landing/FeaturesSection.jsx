'use client';

import React from 'react';
import { SparklesIcon, PantryIcon, UserIcon, CalendarIcon } from '@components/ui/Icons';
import { useSettings } from '@context/SettingsContext';

export function FeaturesSection() {
    const { t } = useSettings();

    const features = [
        {
            title: t.features?.aiTitle || "Recetas con IA",
            description: t.features?.aiDesc || "Nuestra inteligencia artificial analiza tus ingredientes...",
            Icon: SparklesIcon,
        },
        {
            title: t.features?.pantryTitle || "Gestión de Despensa",
            description: t.features?.pantryDesc || "Mantén un inventario digital...",
            Icon: PantryIcon,
        },
        {
            title: t.features?.communityTitle || "Comunidad Activa",
            description: t.features?.communityDesc || "Comparte tus propias creaciones...",
            Icon: UserIcon,
        },
        {
            title: t.features?.planningTitle || "Planificación Semanal",
            description: t.features?.planningDesc || "Organiza tus menús semanales...",
            Icon: CalendarIcon,
        }
    ];

    return (
        <section className="py-16 bg-muted/30 border-y border-border">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
                        {t.landing?.featureTitle || "Todo lo que necesitas para cocinar mejor"}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {t.landing?.featureSubtitle || "Culina Smart no es solo un recetario..."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                <feature.Icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
