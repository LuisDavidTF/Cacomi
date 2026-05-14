'use client';

import React from 'react';
import { Button } from '@components/ui/Button';
import { useSettings } from '@context/SettingsContext';
import { Sparkles, Users, ShoppingBag, ArrowRight } from 'lucide-react';

export function CompactWelcome() {
    const { t } = useSettings();
    const [expanded, setExpanded] = React.useState({});

    const toggleExpand = (key) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const FeatureCard = ({ icon: Icon, color, title, desc, id }) => {
        const isExpanded = expanded[id];
        
        return (
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0 mt-1`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold">{title}</h3>
                    <p className={`text-xs text-muted-foreground mt-1 leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {desc}
                    </p>
                    <button 
                        onClick={() => toggleExpand(id)}
                        className="text-[10px] font-bold text-primary hover:underline mt-1 focus:outline-none"
                    >
                        {isExpanded ? 'Ver menos' : 'Ver más'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto bg-card border border-border/50 rounded-[2rem] p-6 md:p-10 shadow-xl shadow-primary/5 relative overflow-hidden group">
                {/* Decorative background blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-bold uppercase tracking-wider border border-primary/20">
                        <Sparkles className="w-3 h-3" />
                        <span>{t.common?.appName || 'Cacomi'} • Smart Kitchen</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                        {t.landing?.heroTitle || 'Planificación de Comidas Inteligente'}
                    </h1>

                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                        {t.landing?.heroSubtitle}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
                        <FeatureCard 
                            id="ai"
                            icon={Sparkles} 
                            color="bg-amber-500/10 text-amber-500" 
                            title={t.features?.aiTitle} 
                            desc={t.features?.aiDesc} 
                        />
                        <FeatureCard 
                            id="community"
                            icon={Users} 
                            color="bg-blue-500/10 text-blue-500" 
                            title={t.features?.communityTitle || 'Comunidad'} 
                            desc={t.features?.communityDesc || 'Comparte tus creaciones y descubre nuevos sabores.'} 
                        />
                        <FeatureCard 
                            id="marketplace"
                            icon={ShoppingBag} 
                            color="bg-emerald-500/10 text-emerald-500" 
                            title={t.features?.marketplaceTitle || 'Marketplace'} 
                            desc={t.features?.marketplaceDesc} 
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            size="lg"
                            onClick={() => window.location.href = '/register'}
                            className="rounded-xl px-8 font-bold group shadow-lg shadow-primary/20"
                        >
                            {t.auth?.registerBtn || 'Crear Cuenta'}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => window.location.href = '/about'}
                            className="rounded-xl px-8 font-semibold bg-background/50"
                        >
                            {t.floatingWelcome?.learnMore || '¿Cómo funciona?'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
