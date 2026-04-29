'use client';

import React from 'react';
import { Button } from '@components/ui/Button';
import { useSettings } from '@context/SettingsContext';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export function LandingHero() {
    const { t } = useSettings();

    return (
        <section className="relative overflow-hidden bg-background py-16 md:py-20 lg:py-24">
            
            {/* Interfaz visual fluida: Fondo con imagen para teléfonos móviles (se oculta en escritorio) */}
            <div className="absolute inset-0 z-0 lg:hidden">
                <img 
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop" 
                    alt="Cacomi Background Mobile" 
                    className="w-full h-[65%] object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/90 to-background" />
            </div>

            <div className="absolute inset-0 z-0 flex justify-end items-center pointer-events-none hidden lg:flex">
                <div className="w-[500px] h-[500px] md:w-[600px] md:h-[600px] bg-primary/10 rounded-full blur-[100px] absolute -right-20 mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <div className="container relative z-10 px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    
                    {/* Left Column (Text) */}
                    <div className="flex flex-col items-start text-left max-w-2xl order-last lg:order-first">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-xs font-semibold shadow-sm border border-primary/20 backdrop-blur-md mt-6 lg:mt-0">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{t.landing?.evolution || 'La evolución de tu cocina'}</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground !leading-[1.1] mb-6">
                            <span className="block mb-2">{t.common?.appName || 'Cacomi'}</span>
                            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-500 pb-1">
                                {t.landing?.heroTitle || 'Planificación de Comidas Inteligente'}
                            </span>
                        </h1>

                        <p className="text-base text-muted-foreground sm:text-lg leading-relaxed mb-10 max-w-xl">
                            {t.landing?.heroSubtitle || 'Descubre una nueva forma de cocinar con recetas generadas por IA, gestiona tu despensa y organiza tus comidas semanales en un solo lugar.'}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Button
                                size="lg"
                                onClick={() => window.location.href = '/register'}
                                className="text-base px-8 py-6 shadow-xl shadow-primary/20 rounded-2xl hover:scale-105 transition-transform w-full sm:w-auto font-bold group"
                            >
                                {t.landing?.ctaStart || 'Comenzar Ahora'}
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => {
                                    const element = document.getElementById('latest-recipes');
                                    element?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="text-base px-8 py-6 rounded-2xl bg-background/50 backdrop-blur-sm border-border/80 hover:bg-muted transition-colors w-full sm:w-auto font-semibold"
                            >
                                {t.landing?.ctaExplore || 'Explorar Recetas'}
                            </Button>
                        </div>
                        
                        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                           <div className="flex items-center gap-1.5">
                               <CheckCircle2 className="w-4 h-4 text-primary" /> {t.landing?.aiChef || 'IA Chef Integrada'}
                           </div>
                           <div className="flex items-center gap-1.5 backdrop-blur-sm bg-background/30 px-2 py-1 rounded-md">
                               <CheckCircle2 className="w-4 h-4 text-primary" /> {t.landing?.noCommitment || 'Empieza sin compromiso'}
                           </div>
                        </div>
                    </div>

                    {/* Right Column (Visual Image) - Oculto en móvil y tableta porque ahora usa la imagen de fondo */}
                    <div className="hidden lg:flex justify-end relative order-last">
                        {/* Blob decorativo de fondo */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent rounded-[3rem] blur-2xl transform rotate-3" />
                        
                        {/* Contenedor principal de imagen */}
                        <div className="relative w-full max-w-[500px] aspect-[4/5] rounded-[2.5rem] border border-border/50 shadow-2xl overflow-hidden group">
                           <img 
                               src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop" 
                               alt="Cacomi Cooking" 
                               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                           />
                           {/* Overlay gradiente inferior para fundirse a negro sutilmente */}
                           <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-80" />
                        </div>

                        {/* Tarjeta Flotante Inteligente */}
                        <div className="absolute -bottom-6 -left-8 bg-card backdrop-blur-xl border border-border/60 p-5 rounded-2xl shadow-xl hover:-translate-y-2 transition-transform duration-300 max-w-[280px]">
                           <div className="flex items-start gap-3">
                               <div className="w-12 h-12 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-1">
                                   <Sparkles className="w-6 h-6 text-primary" />
                               </div>
                               <div>
                                   <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{t.landing?.pantryAnalysis || 'Análisis de Despensa'}</p>
                                   <p className="text-sm font-bold text-foreground">{t.landing?.ingredientsRecipe || '3 Ingredientes = 12 Recetas*'}</p>
                                   <p className="text-[9px] text-muted-foreground italic mt-0.5 leading-tight">{t.landing?.aiCreativity || '*Los resultados varían según la creatividad de IA.'}</p>
                               </div>
                           </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

