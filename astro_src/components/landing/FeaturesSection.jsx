'use client';

import React, { useState } from 'react';
import { SparklesIcon, PantryIcon, UserIcon, CalendarIcon } from '@components/ui/Icons';
import { useSettings } from '@context/SettingsContext';

export function FeaturesSection() {
    const { t } = useSettings();
    const [activeTab, setActiveTab] = useState(0);

    const features = [
        {
            title: t.features?.aiTitle || "Recetas con IA",
            description: t.features?.aiDesc || "Nuestra inteligencia artificial analiza tus ingredientes disponibles para sugerirte recetas deliciosas y evitar el desperdicio de alimentos.",
            Icon: SparklesIcon,
            image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800",
            activeStyles: {
                wrapper: 'bg-amber-500/5 border-amber-500/20 shadow-lg shadow-amber-500/5',
                icon: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm'
            }
        },
        {
            title: t.features?.pantryTitle || "Gestión de Despensa",
            description: t.features?.pantryDesc || "Mantén un inventario digital de tu cocina. Recibe alertas de caducidad y sabe siempre qué tienes a mano.",
            Icon: PantryIcon,
            image: "https://images.unsplash.com/photo-1606859191214-25806e8e2423?auto=format&fit=crop&q=80&w=800",
            activeStyles: {
                wrapper: 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5',
                icon: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
            }
        },
        {
            title: t.features?.communityTitle || "Comunidad Activa",
            description: t.features?.communityDesc || "Comparte tus propias creaciones culinarias y descubre recetas de chefs caseros de todo el mundo.",
            Icon: UserIcon,
            image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
            activeStyles: {
                wrapper: 'bg-blue-500/5 border-blue-500/20 shadow-lg shadow-blue-500/5',
                icon: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm'
            }
        },
        {
            title: t.features?.planningTitle || "Planificación Semanal",
            description: t.features?.planningDesc || "Organiza tus menús semanales con facilidad y genera listas de compras automáticas.",
            Icon: CalendarIcon,
            image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=800",
            activeStyles: {
                wrapper: 'bg-rose-500/5 border-rose-500/20 shadow-lg shadow-rose-500/5',
                icon: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 shadow-sm'
            }
        }
    ];

    return (
        <section className="py-16 md:py-24 bg-background relative overflow-hidden border-y border-border/50">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                        {t.landing?.featureTitle || "Todo lo que necesitas para cocinar mejor"}
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground">
                        {t.landing?.featureSubtitle || "Cacomi no es solo un recetario, es tu asistente personal de cocina."}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center max-w-6xl mx-auto">
                    {/* Left side: Feature List (Accordion-like) */}
                    <div className="space-y-4">
                        {features.map((feature, index) => {
                            const isActive = activeTab === index;
                            return (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={`w-full text-left p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-500 border ${
                                        isActive 
                                            ? `backdrop-blur-xl scale-[1.02] ${feature.activeStyles.wrapper}` 
                                            : 'bg-transparent border-transparent hover:bg-muted/30 opacity-70 hover:opacity-100 cursor-pointer'
                                    }`}
                                >
                                    <div className="flex items-start gap-4 sm:gap-5">
                                        <div className={`mt-1 flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                                            isActive ? feature.activeStyles.icon : 'bg-primary/10 text-primary'
                                        }`}>
                                            <feature.Icon className="w-5 sm:w-6 h-5 sm:h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold transition-all duration-500 ${
                                                isActive ? 'text-xl sm:text-2xl text-foreground mb-2 sm:mb-3' : 'text-lg sm:text-xl text-muted-foreground'
                                            }`}>
                                                {feature.title}
                                            </h3>
                                            <div className={`overflow-hidden transition-all duration-500 grid ${
                                                isActive ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
                                            }`}>
                                                <div className="overflow-hidden">
                                                    <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed mb-4">
                                                        {feature.description}
                                                    </p>
                                                    {/* Mostrar imagen incrustada dentro del propio accordion SOLO en móvil */}
                                                    <div className="lg:hidden w-full aspect-[4/3] rounded-2xl overflow-hidden mt-2 relative">
                                                        <img
                                                            src={feature.image}
                                                            alt={feature.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right side: Dynamic Image Display (Escritorio Sólamente) */}
                    <div className="hidden lg:block relative h-[500px] xl:h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/50 group">
                        {/* Blob decorativo detrás de la imagen para enmarcarla */}
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-700" />
                        
                        {features.map((feature, index) => (
                            <img
                                key={index}
                                src={feature.image}
                                alt={feature.title}
                                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                                    activeTab === index 
                                        ? 'opacity-100 scale-100 translate-x-0 blur-none' 
                                        : 'opacity-0 scale-105 translate-x-8 lg:-translate-y-8 blur-[2px] pointer-events-none'
                                }`}
                            />
                        ))}
                        
                        {/* Overlay gradiente lateral */}
                        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent opacity-60 pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    );
}

