'use client';

import React, { useState, useEffect } from 'react';
import { RecipeFeed } from '@components/recipes/RecipeFeed';
import { useSettings } from '@context/SettingsContext';
import { Bookmark, BookmarkCheck, Clock, User, ArrowRight, BookOpen } from 'lucide-react';
import { slugify } from '@/utils/slugify';

interface SavedItemsDashboardProps {
    initialArticles: any[];
    initialRevistas: any[];
}

export function SavedItemsDashboard({ initialArticles, initialRevistas }: SavedItemsDashboardProps) {
    const { t, language } = useSettings();
    const [activeTab, setActiveTab] = useState<'recipes' | 'articles' | 'magazines'>('recipes');
    const [savedIds, setSavedIds] = useState<string[]>([]);

    // Load saved items from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('cacomi_saved_lifestyle');
        if (stored) {
            try {
                setSavedIds(JSON.parse(stored));
            } catch (e) {
                console.error("Error parsing saved items", e);
            }
        }
    }, []);

    // Toggle save status
    const toggleSave = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        let newSavedIds = [];
        if (savedIds.includes(id)) {
            newSavedIds = savedIds.filter(item => item !== id);
        } else {
            newSavedIds = [...savedIds, id];
        }
        setSavedIds(newSavedIds);
        localStorage.setItem('cacomi_saved_lifestyle', JSON.stringify(newSavedIds));
    };

    // Filter saved blog posts and magazines
    const savedArticles = initialArticles.filter(item => savedIds.includes(item.id));
    const savedRevistas = initialRevistas.filter(item => savedIds.includes(item.id));

    // Get color classes for categories
    const getCategoryStyles = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('receta') || cat.includes('nutrición')) {
            return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] rounded-full font-bold tracking-wider uppercase';
        }
        if (cat.includes('bienestar') || cat.includes('filosofía') || cat.includes('comunidad')) {
            return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-[10px] rounded-full font-bold tracking-wider uppercase';
        }
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] rounded-full font-bold tracking-wider uppercase';
    };

    return (
        <div className="container mx-auto px-4 md:px-8 py-10 max-w-6xl">
            {/* Header */}
            <div className="text-left mb-10 border-b border-border/40 pb-6">
                <h1 className="text-3xl sm:text-4xl font-serif text-[#2c2b2a] dark:text-white font-light">
                    {language === 'es' ? 'Elementos Guardados' : 'Saved Items'}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {language === 'es' ? 'Accede a tus recetas descargadas, relatos inspiradores y revistas semanales guardadas.' : 'Access your offline recipes, inspiring stories, and saved weekly magazines.'}
                </p>
            </div>

            {/* Apple Segmented Pill Navigation */}
            <div className="flex bg-black/[0.04] dark:bg-white/[0.06] p-1.5 rounded-full max-w-sm sm:max-w-md mb-10 mx-auto sm:mx-0">
                {/* Recetas */}
                <button 
                    onClick={() => setActiveTab('recipes')} 
                    className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${activeTab === 'recipes' ? 'bg-white dark:bg-neutral-800 text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    {language === 'es' ? 'Recetas' : 'Recipes'}
                </button>
                
                {/* Relatos */}
                <button 
                    onClick={() => setActiveTab('articles')} 
                    className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${activeTab === 'articles' ? 'bg-white dark:bg-neutral-800 text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    {language === 'es' ? 'Relatos' : 'Stories'}
                </button>

                {/* Revistas */}
                <button 
                    onClick={() => setActiveTab('magazines')} 
                    className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${activeTab === 'magazines' ? 'bg-white dark:bg-neutral-800 text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    {language === 'es' ? 'Revistas' : 'Magazines'}
                </button>
            </div>

            {/* Tab content */}
            <div>
                {/* 1. RECIPES */}
                {activeTab === 'recipes' && (
                    <div className="text-left">
                        <RecipeFeed forceSavedMode={true} />
                    </div>
                )}

                {/* 2. ARTICLES (Stories) */}
                {activeTab === 'articles' && (
                    <div>
                        {savedArticles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {savedArticles.map(item => (
                                    <div key={item.id} className="group bg-card border border-border/40 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:-translate-y-0.5 text-left">
                                        <div className="aspect-[4/3] w-full overflow-hidden relative bg-muted shrink-0">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                            <span className={`absolute top-3 left-3 shadow-md ${getCategoryStyles(item.category)}`}>{item.category}</span>
                                            <button onClick={(e) => toggleSave(item.id, e)} className="absolute bottom-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-[#2c2b2a] hover:bg-white active:scale-95 transition-all shadow-md z-30">
                                                <BookmarkCheck className="w-4 h-4 text-[#e07e53]" />
                                            </button>
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.readTime} min</span>
                                                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {item.author}</span>
                                            </div>
                                            <h3 className="font-serif text-base font-bold leading-tight mb-2 text-[#2c2b2a] dark:text-white group-hover:text-[#e07e53] transition-colors line-clamp-2">{item.title}</h3>
                                            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-6 flex-grow">{item.description}</p>
                                            <a href={`/blog/${item.id}`} className="mt-auto pt-2 inline-flex items-center text-xs font-bold text-[#e07e53] hover:translate-x-0.5 transition-transform self-start">
                                                {language === 'es' ? 'Leer relato' : 'Read story'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <BookOpen className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-bold text-foreground mb-1">
                                    {language === 'es' ? 'No tienes relatos guardados' : 'No saved stories'}
                                </h3>
                                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                                    {language === 'es' ? 'Explora relatos sobre slow cooking, filosofía y comunidad Cacomi para guardarlos.' : 'Explore stories about slow cooking, philosophy, and community to save them.'}
                                </p>
                                <a 
                                    href="/" 
                                    className="px-6 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/95 transition-colors"
                                >
                                    {language === 'es' ? 'Explorar Relatos' : 'Explore Stories'}
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. MAGAZINES */}
                {activeTab === 'magazines' && (
                    <div>
                        {savedRevistas.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {savedRevistas.map(revista => (
                                    <a 
                                        key={revista.id} 
                                        href={`/revista/${revista.id}`}
                                        className="group bg-card border border-border/40 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:-translate-y-0.5 text-left"
                                    >
                                        <div className="aspect-[4/3] w-full overflow-hidden relative bg-muted shrink-0">
                                            <img src={revista.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'} alt={revista.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                            <span className="absolute top-3 left-3 bg-[#e07e53] text-white shadow-md px-2.5 py-0.5 text-[9px] rounded-full font-bold tracking-wider">
                                                EDICIÓN #{revista.number}
                                            </span>
                                            <button 
                                                onClick={(e) => toggleSave(revista.id, e)} 
                                                className="absolute bottom-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-[#2c2b2a] hover:bg-white active:scale-95 transition-all shadow-md z-30"
                                            >
                                                <BookmarkCheck className="w-4 h-4 text-[#e07e53]" />
                                            </button>
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">{revista.date}</span>
                                            <h3 className="font-serif text-base font-bold leading-tight mb-2 text-[#2c2b2a] dark:text-white group-hover:text-[#e07e53] transition-colors line-clamp-2">{revista.title}</h3>
                                            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-6 flex-grow">{revista.description}</p>
                                            <span className="mt-auto pt-2 inline-flex items-center text-xs font-bold text-[#e07e53] group-hover:translate-x-0.5 transition-transform">
                                                {language === 'es' ? 'Leer revista' : 'Read magazine'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                            </span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <BookOpen className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-bold text-foreground mb-1">
                                    {language === 'es' ? 'No tienes revistas guardadas' : 'No saved magazines'}
                                </h3>
                                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                                    {language === 'es' ? 'Guarda nuestras revistas semanales con reflexiones exclusivas para leerlas cuando quieras.' : 'Save our weekly magazines with exclusive reflections to read them anytime.'}
                                </p>
                                <a 
                                    href="/" 
                                    className="px-6 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/95 transition-colors"
                                >
                                    {language === 'es' ? 'Explorar Revistas' : 'Explore Magazines'}
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
