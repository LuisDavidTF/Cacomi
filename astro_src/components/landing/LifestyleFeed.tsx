'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@context/SettingsContext';
import { Clock, User, Bookmark, BookmarkCheck, RefreshCw, X, ArrowRight, BookOpen } from 'lucide-react';
import { slugify } from '@/utils/slugify';

interface Recipe {
    id: string | number;
    publicId?: string;
    name: string;
    description: string;
    prepTime: number;
    userName?: string;
    imageUrl?: string;
    mealType?: string;
}

interface Article {
    id: string;
    title: string;
    description: string;
    content: string;
    category: 'FILOSOFÍA' | 'RECETAS' | 'INTERIORES' | 'ATELIER' | 'COMUNIDAD';
    author: string;
    readTime: number;
    image: string;
    date: string;
}

interface LatestRevista {
    id: string;
    number: number;
    title: string;
    description: string;
    image?: string;
}

interface LifestyleFeedProps {
    initialRecipes: { data: Recipe[]; meta?: { nextCursor: string | null } };
    initialArticles: Article[];
    latestRevista: LatestRevista | null;
    isAuthenticated: boolean;
}

export function LifestyleFeed({ initialRecipes, initialArticles, latestRevista, isAuthenticated }: LifestyleFeedProps) {
    const { t, language } = useSettings();
    const [activeTab, setActiveTab] = useState<string>('all');
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    
    // Pagination state for recipes
    const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes.data || []);
    const [nextCursor, setNextCursor] = useState<string | null>(initialRecipes.meta?.nextCursor || null);
    const [loadingMore, setLoadingMore] = useState(false);

    // Load saved articles/recipes from localStorage on mount
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

    // Save items to localStorage when state changes
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

    // Fetch more recipes from the API route for pagination/scrolling
    const loadMoreRecipes = async () => {
        if (loadingMore || !nextCursor) return;
        setLoadingMore(true);
        try {
            const response = await fetch(`/api/recipes?limit=12&cursor=${nextCursor}`);
            if (response.ok) {
                const data = await response.json();
                setRecipes(prev => [...prev, ...(data.data || [])]);
                setNextCursor(data.meta?.nextCursor || null);
            }
        } catch (e) {
            console.error("Error loading more recipes:", e);
        } finally {
            setLoadingMore(false);
        }
    };

    // Combine static articles and dynamic recipes into feed items
    const getCombinedItems = () => {
        const recipeItems: Article[] = recipes.map(recipe => ({
            id: `recipe-${recipe.publicId || recipe.id}`,
            title: recipe.name,
            description: recipe.description || 'Deliciosa receta saludable para disfrutar hoy.',
            content: `/recipes/${slugify(recipe.name)}/${recipe.publicId || recipe.id}`, // points to recipe detail
            category: 'RECETAS',
            author: recipe.userName || 'Chef Cacomi',
            readTime: recipe.prepTime || 15,
            image: recipe.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
            date: '2026-07-20'
        }));

        return [...initialArticles, ...recipeItems];
    };

    const allItems = getCombinedItems();

    // Filter items based on active tab
    const getFilteredItems = () => {
        if (activeTab === 'saved') {
            return allItems.filter(item => savedIds.includes(item.id));
        }
        if (activeTab === 'recipes') {
            return allItems.filter(item => item.category === 'RECETAS');
        }
        if (activeTab === 'philosophy') {
            return allItems.filter(item => item.category === 'FILOSOFÍA');
        }
        if (activeTab === 'interiors') {
            return allItems.filter(item => item.category === 'INTERIORES');
        }
        if (activeTab === 'community') {
            return allItems.filter(item => item.category === 'RECETAS' && item.author !== 'Chef Cacomi');
        }
        return allItems; // Explorar Todo (default)
    };

    const filteredItems = getFilteredItems();

    // High Contrast, solid, extremely legible category styles
    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'FILOSOFÍA':
                return 'bg-[#7E5109] text-white dark:bg-[#b07d2b] shadow-xs px-2.5 py-0.5 text-[9px] rounded-full font-bold tracking-wider';
            case 'RECETAS':
                return 'bg-[#196F3D] text-white dark:bg-[#27ae60] shadow-xs px-2.5 py-0.5 text-[9px] rounded-full font-bold tracking-wider';
            case 'INTERIORES':
                return 'bg-[#1A5276] text-white dark:bg-[#2980b9] shadow-xs px-2.5 py-0.5 text-[9px] rounded-full font-bold tracking-wider';
            case 'ATELIER':
                return 'bg-[#5D6D7E] text-white dark:bg-[#7f8c8d] shadow-xs px-2.5 py-0.5 text-[9px] rounded-full font-bold tracking-wider';
            default:
                return 'bg-[#78281F] text-white dark:bg-[#c0392b] shadow-xs px-2.5 py-0.5 text-[9px] rounded-full font-bold tracking-wider';
        }
    };

    return (
        <div className="w-full">
            {/* Elegant Brand Hero */}
            <section className="relative bg-[#fcf9f5] dark:bg-card/30 border-b border-[#f3e9dc] dark:border-border/30 overflow-hidden py-16 lg:py-24">
                <div className="container mx-auto px-4 md:px-8 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Hero Text */}
                        <div className="lg:col-span-7 text-left space-y-6">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2c2b2a] dark:text-white leading-tight font-light">
                                {t?.vida?.heroTitle || 'Vida. Descubre el arte de vivir con intención.'}
                            </h1>
                            <p className="text-[#5c5a57] dark:text-gray-300 text-base md:text-lg leading-relaxed max-w-xl font-light">
                                {t?.vida?.heroSubtitle || 'Explora un diario visual dedicado a las texturas, rituales y filosofías que definen el estilo de vida de la comunidad Cacomi.'}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 pt-4">
                                {isAuthenticated ? (
                                    <button 
                                        onClick={() => {
                                            const el = document.getElementById('discover-relatos');
                                            el?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="px-6 py-3 rounded-full bg-[#e07e53] hover:bg-[#d06e43] text-white font-semibold shadow-md shadow-[#e07e53]/10 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        {t?.vida?.btnExplore || 'Explorar Relatos'}
                                    </button>
                                ) : (
                                    <a 
                                        href="/register"
                                        className="px-6 py-3 rounded-full bg-[#e07e53] hover:bg-[#d06e43] text-white font-semibold shadow-md shadow-[#e07e53]/10 transition-all hover:scale-[1.02] active:scale-95 text-center"
                                    >
                                        {t?.auth?.registerBtn || 'Crear Cuenta'}
                                    </a>
                                )}
                                <a 
                                    href="/about"
                                    className="px-6 py-3 rounded-full bg-[#f4e6d9] hover:bg-[#e8d5c4] text-[#2c2b2a] font-semibold transition-all border border-[#e8d5c4] text-center"
                                >
                                    {t?.vida?.btnAbout || 'Conócenos'}
                                </a>
                            </div>
                        </div>

                        {/* Featured Magazine Card */}
                        <div className="lg:col-span-5 relative flex justify-center">
                            {latestRevista ? (
                                <a 
                                    href={`/revista/${latestRevista.id}`}
                                    className="group relative w-full max-w-[360px] bg-white dark:bg-card border border-border/50 rounded-3xl overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 block text-left"
                                >
                                    <div className="aspect-[4/5] w-full overflow-hidden relative">
                                        <img 
                                            src={latestRevista.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'} 
                                            alt={latestRevista.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                                    </div>
                                    
                                    {/* Overlay Floating Info Card */}
                                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 border border-white/20 p-5 rounded-2xl shadow-lg">
                                        <span className="text-[10px] font-black tracking-widest text-[#e07e53] uppercase block mb-1">
                                            {t?.vida?.featuredChapter || `EDICIÓN #${latestRevista.number}`}
                                        </span>
                                        <h3 className="font-serif text-base font-bold text-[#2c2b2a] dark:text-white leading-snug group-hover:text-[#e07e53] transition-colors line-clamp-2">
                                            {latestRevista.title}
                                        </h3>
                                    </div>
                                </a>
                            ) : (
                                <div className="w-full max-w-[360px] aspect-[4/5] bg-muted/30 border border-dashed border-border rounded-3xl flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">No hay revista disponible</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Discover Section */}
            <section id="discover-relatos" className="container mx-auto px-4 md:px-8 py-16 max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-border/40 pb-6">
                    <div className="text-left">
                        <h2 className="text-3xl font-serif text-[#2c2b2a] dark:text-white font-light">
                            {t?.vida?.discoverTitle || 'Descubre Relatos'}
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            {t?.vida?.discoverSubtitle || 'Explora las mejores ideas para una vida consciente.'}
                        </p>
                    </div>
                    
                    {/* Refresh / Update Button */}
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 rounded-full border border-border text-xs font-semibold text-[#e07e53] bg-white dark:bg-card hover:bg-muted active:scale-95 transition-all flex items-center gap-2 self-start md:self-auto shadow-xs border-[#e8d5c4]/60"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {language === 'es' ? 'Actualizar Feed' : 'Refresh Feed'}
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
                    <button 
                        onClick={() => setActiveTab('saved')}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${activeTab === 'saved' ? 'bg-[#e07e53] text-white border-transparent' : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        {t?.vida?.tabSaved || 'Guardados'}
                        {savedIds.length > 0 && <span className="ml-1 bg-white/20 text-white rounded-full text-[9px] px-1.5 py-0.5 leading-none">{savedIds.length}</span>}
                    </button>

                    <button 
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-[#e07e53] text-white border-transparent' : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        {t?.vida?.tabAll || 'Explorar Todo'}
                    </button>

                    <button 
                        onClick={() => setActiveTab('recipes')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${activeTab === 'recipes' ? 'bg-[#e07e53] text-white border-transparent' : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        {t?.vida?.tabRecipes || 'Recetas'}
                    </button>

                    <button 
                        onClick={() => setActiveTab('philosophy')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${activeTab === 'philosophy' ? 'bg-[#e07e53] text-white border-transparent' : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        {t?.vida?.tabPhilosophy || 'Filosofía'}
                    </button>

                    <button 
                        onClick={() => setActiveTab('interiors')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${activeTab === 'interiors' ? 'bg-[#e07e53] text-white border-transparent' : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        {t?.vida?.tabInteriors || 'Interiores'}
                    </button>

                    <button 
                        onClick={() => setActiveTab('community')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${activeTab === 'community' ? 'bg-[#e07e53] text-white border-transparent' : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        {t?.vida?.tabCommunity || 'Comunidad'}
                    </button>
                </div>

                {/* Articles/Recipes Grid */}
                {filteredItems.length > 0 ? (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredItems.map(item => {
                                const isRecipe = item.category === 'RECETAS';
                                const isSaved = savedIds.includes(item.id);

                                return (
                                    <div 
                                        key={item.id}
                                        className="group bg-card border border-border/40 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:-translate-y-0.5 text-left"
                                    >
                                        {/* Image & Bookmark action */}
                                        <div className="aspect-[4/3] w-full overflow-hidden relative bg-muted shrink-0">
                                            <img 
                                                src={item.image} 
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300"></div>

                                            {/* High-contrast solid Category Badge */}
                                            <span className={`absolute top-3 left-3 tracking-wider shadow-md ${getCategoryStyles(item.category)}`}>
                                                {item.category}
                                            </span>

                                            {/* Bookmark Button */}
                                            <button 
                                                onClick={(e) => toggleSave(item.id, e)}
                                                className="absolute bottom-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-[#2c2b2a] hover:bg-white active:scale-95 transition-all shadow-md"
                                                aria-label="Guardar relato"
                                            >
                                                {isSaved ? (
                                                    <BookmarkCheck className="w-4 h-4 text-[#e07e53]" />
                                                ) : (
                                                    <Bookmark className="w-4 h-4 text-gray-500" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-5 flex flex-col flex-grow">
                                            {/* Meta: time and author */}
                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                                                    {item.readTime} {t?.vida?.readTime || 'min'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3.5 h-3.5 text-muted-foreground/60" />
                                                    {item.author}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="font-serif text-lg font-bold leading-tight mb-2 text-[#2c2b2a] dark:text-white group-hover:text-[#e07e53] transition-colors line-clamp-2">
                                                {item.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-6 flex-grow">
                                                {item.description}
                                            </p>

                                            {/* Footer action link */}
                                            <div className="mt-auto pt-2">
                                                {isRecipe ? (
                                                    <a 
                                                        href={item.content}
                                                        className="inline-flex items-center text-xs font-bold text-[#e07e53] hover:translate-x-0.5 transition-transform"
                                                    >
                                                        {t?.vida?.viewRecipe || 'Ver receta'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                                    </a>
                                                ) : (
                                                    <button 
                                                        onClick={() => setSelectedArticle(item)}
                                                        className="inline-flex items-center text-xs font-bold text-[#e07e53] hover:translate-x-0.5 transition-transform"
                                                    >
                                                        {t?.vida?.readArticle || 'Leer relato'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Cargar Más Button (Pagination/Infinite Scroll fallback) */}
                        {nextCursor && (activeTab === 'recipes' || activeTab === 'all') && (
                            <div className="flex justify-center mt-12">
                                <button
                                    onClick={loadMoreRecipes}
                                    disabled={loadingMore}
                                    className="px-8 py-3 rounded-full bg-white dark:bg-card border border-border/80 text-xs font-bold text-[#e07e53] hover:bg-muted transition-all flex items-center gap-2 shadow-xs"
                                >
                                    {loadingMore ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-[#e07e53] border-t-transparent rounded-full animate-spin"></div>
                                            {language === 'es' ? 'Cargando...' : 'Loading...'}
                                        </>
                                    ) : (
                                        language === 'es' ? 'Ver más recetas' : 'Load more recipes'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-border rounded-3xl bg-muted/10">
                        <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-muted-foreground">
                            {activeTab === 'saved' 
                                ? (language === 'es' ? 'No tienes relatos guardados todavía.' : 'No saved stories yet.')
                                : (language === 'es' ? 'No hay publicaciones en esta categoría.' : 'No stories in this category.')}
                        </p>
                    </div>
                )}
            </section>

            {/* Article Detail Modal (Slide-over/Modal Reader for Real Long-form Articles) */}
            {selectedArticle && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedArticle(null)}></div>
                    <div className="bg-background w-full max-w-2xl h-full relative z-10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Detail Header */}
                        <div className="border-b border-border/40 p-4 flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider bg-muted text-muted-foreground">
                                {selectedArticle.category}
                            </span>
                            <button 
                                onClick={() => setSelectedArticle(null)}
                                className="p-2 rounded-full hover:bg-muted text-muted-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Detail Content (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-left">
                            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted">
                                <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold">
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedArticle.readTime} min</span>
                                    <span className="flex items-center gap-1"><User className="w-4 h-4" /> {selectedArticle.author}</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2c2b2a] dark:text-white leading-tight">
                                    {selectedArticle.title}
                                </h2>
                            </div>

                            <div className="prose prose-gray dark:prose-invert lg:prose-lg max-w-none text-muted-foreground font-light leading-relaxed whitespace-pre-line text-sm md:text-base">
                                {selectedArticle.content}
                            </div>
                        </div>

                        {/* Detail Footer */}
                        <div className="border-t border-border/40 p-4 bg-muted/10 flex justify-between items-center">
                            <button 
                                onClick={(e) => toggleSave(selectedArticle.id, e)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted"
                            >
                                {savedIds.includes(selectedArticle.id) ? (
                                    <>
                                        <BookmarkCheck className="w-4 h-4 text-[#e07e53]" />
                                        {language === 'es' ? 'Guardado' : 'Saved'}
                                    </>
                                ) : (
                                    <>
                                        <Bookmark className="w-4 h-4 text-muted-foreground" />
                                        {language === 'es' ? 'Guardar Relato' : 'Save Story'}
                                    </>
                                )}
                            </button>
                            <button 
                                onClick={() => setSelectedArticle(null)}
                                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
                            >
                                {language === 'es' ? 'Cerrar Lector' : 'Close Reader'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
