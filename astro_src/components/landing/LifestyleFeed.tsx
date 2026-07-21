'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@context/SettingsContext';
import { Clock, User, Bookmark, BookmarkCheck, RefreshCw, X, ArrowRight } from 'lucide-react';
import { slugify } from '@/utils/slugify';

// Import correct components
import { RecipeCard } from '@components/recipes/RecipeCard';
import { RecipeFeed } from '@components/recipes/RecipeFeed';

// Import hooks and layout components for delete functionality
import { useApiClient } from '@hooks/useApiClient';
import { useToast } from '@context/ToastContext';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';

interface Recipe {
    id: string | number;
    publicId?: string;
    name: string;
    description: string;
    preparationTimeMinutes: number;
    authorName?: string;
    imageUrl?: string;
    type?: string;
    mealType?: string;
    calories?: number;
    protein?: number;
    user_id?: string | number;
    user?: {
        id: string | number;
        name?: string;
    };
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

interface Magazine {
    id: string;
    number: number;
    title: string;
    description: string;
    image?: string;
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
    revistas: Magazine[];
    latestRevista: LatestRevista | null;
    isAuthenticated: boolean;
}

export function LifestyleFeed({ initialRecipes, initialArticles, revistas, latestRevista, isAuthenticated }: LifestyleFeedProps) {
    const { t, language } = useSettings();
    const [activeTab, setActiveTab] = useState<string>('all');
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    // Delete recipe functionality state
    const api = useApiClient();
    const { showToast } = useToast();
    const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; recipe: any }>({ isOpen: false, recipe: null });

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

    // Save items to localStorage
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

    // Recipe handlers for editing and deleting
    const handleEdit = (recipe: any) => {
        window.location.href = `/edit-recipe/${recipe.publicId || recipe.id}`;
    };

    const handleDelete = (recipe: any) => {
        setDeleteModalState({ isOpen: true, recipe });
    };

    const confirmDelete = async () => {
        if (!deleteModalState.recipe) return;
        const recipeId = deleteModalState.recipe.publicId || deleteModalState.recipe.id;
        try {
            await api.deleteRecipe(recipeId);
            showToast(language === 'es' ? 'Receta eliminada' : 'Recipe deleted', 'success');
            setDeleteModalState({ isOpen: false, recipe: null });
            // Reload page to reflect changes
            window.location.reload();
        } catch (error: any) {
            showToast(error.message || 'Error', 'error');
        }
    };

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
                                {t?.vida?.heroTitle || 'Vida. Curando cada sombra, cada textura.'}
                            </h1>
                            <p className="text-[#5c5a57] dark:text-gray-300 text-base md:text-lg leading-relaxed max-w-xl font-light">
                                {t?.vida?.heroSubtitle || 'Un diario visual dedicado a la cocina lenta, el diseño minimalista y los rituales diarios que nos reconectan con la tierra y el silencio.'}
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
                                        <button 
                                            onClick={(e) => toggleSave(latestRevista.id, e)} 
                                            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-[#2c2b2a] hover:bg-white active:scale-95 transition-all shadow-md z-30"
                                            title={savedIds.includes(latestRevista.id) ? (language === 'es' ? 'Guardada' : 'Saved') : (language === 'es' ? 'Guardar' : 'Save')}
                                        >
                                            {savedIds.includes(latestRevista.id) ? (
                                                <BookmarkCheck className="w-4 h-4 text-[#e07e53]" />
                                            ) : (
                                                <Bookmark className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
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
                </div>

                {/* Clean Filter Tabs (Explorar Todo, Recetas, Revistas, Artículos) */}
                <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
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
                        onClick={() => setActiveTab('magazines')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${activeTab === 'magazines' ? 'bg-[#e07e53] text-white border-transparent' : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        {language === 'es' ? 'Revistas' : 'Magazines'}
                    </button>

                    <button 
                        onClick={() => setActiveTab('articles')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${activeTab === 'articles' ? 'bg-[#e07e53] text-white border-transparent' : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        {language === 'es' ? 'Artículos' : 'Articles'}
                    </button>
                </div>

                {/* Tabs Grid Renderer */}
                
                {/* 1. TAB: Explorar Todo (Curated Preview Rows) */}
                {activeTab === 'all' && (
                    <div className="space-y-16">
                        {/* Row 1: Artículos Destacados (First 4 articles) */}
                        <div className="space-y-6">
                            <div className="text-left border-b border-border/20 pb-3 flex justify-between items-center">
                                <h3 className="text-xl font-serif font-bold text-[#2c2b2a] dark:text-white">Artículos Recomendados</h3>
                                <button onClick={() => setActiveTab('articles')} className="text-xs font-bold text-[#e07e53] hover:underline flex items-center gap-1">
                                    Ver todos <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {initialArticles.slice(0, 4).map(item => {
                                    const isSaved = savedIds.includes(item.id);
                                    return (
                                        <div 
                                            key={item.id} 
                                            onClick={() => setSelectedArticle(item)}
                                            className="group bg-card border border-border/40 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:-translate-y-0.5 text-left cursor-pointer"
                                        >
                                            <div className="aspect-[4/3] w-full overflow-hidden relative bg-muted shrink-0">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                                <span className={`absolute top-3 left-3 shadow-md ${getCategoryStyles(item.category)}`}>{item.category}</span>
                                                <button onClick={(e) => toggleSave(item.id, e)} className="absolute bottom-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-[#2c2b2a] hover:bg-white active:scale-95 transition-all shadow-md z-30">
                                                    {isSaved ? <BookmarkCheck className="w-4 h-4 text-[#e07e53]" /> : <Bookmark className="w-4 h-4 text-gray-500" />}
                                                </button>
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.readTime} min</span>
                                                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {item.author}</span>
                                                </div>
                                                <h3 className="font-serif text-base font-bold leading-tight mb-2 text-[#2c2b2a] dark:text-white group-hover:text-[#e07e53] transition-colors line-clamp-2">{item.title}</h3>
                                                <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-6 flex-grow">{item.description}</p>
                                                <span className="mt-auto pt-2 inline-flex items-center text-xs font-bold text-[#e07e53] group-hover:translate-x-0.5 transition-transform self-start">
                                                    Leer relato <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Row 2: Recetas Recientes (First 4 recipes with full RecipeCard styling) */}
                        <div className="space-y-6">
                            <div className="text-left border-b border-border/20 pb-3 flex justify-between items-center">
                                <h3 className="text-xl font-serif font-bold text-[#2c2b2a] dark:text-white">Recetas de la Comunidad</h3>
                                <button onClick={() => setActiveTab('recipes')} className="text-xs font-bold text-[#e07e53] hover:underline flex items-center gap-1">
                                    Ver todas <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {initialRecipes.data.slice(0, 4).map(recipe => (
                                    <RecipeCard
                                        key={recipe.id}
                                        recipe={recipe}
                                        viewHref={`/recipes/${slugify(recipe.name)}/${recipe.publicId || recipe.id}`}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. TAB: Recetas (Full original RecipeFeed component with all features, filter categories, offline check, edit/delete) */}
                {activeTab === 'recipes' && (
                    <div className="text-left">
                        <RecipeFeed initialData={initialRecipes} />
                    </div>
                )}

                {/* 3. TAB: Revistas (Full Grid of Editions) */}
                {activeTab === 'magazines' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {revistas.map(revista => (
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
                                        title={savedIds.includes(revista.id) ? (language === 'es' ? 'Guardada' : 'Saved') : (language === 'es' ? 'Guardar' : 'Save')}
                                    >
                                        {savedIds.includes(revista.id) ? (
                                            <BookmarkCheck className="w-4 h-4 text-[#e07e53]" />
                                        ) : (
                                            <Bookmark className="w-4 h-4 text-gray-500" />
                                        )}
                                    </button>
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">{revista.date}</span>
                                    <h3 className="font-serif text-base font-bold leading-tight mb-2 text-[#2c2b2a] dark:text-white group-hover:text-[#e07e53] transition-colors line-clamp-2">{revista.title}</h3>
                                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-6 flex-grow">{revista.description}</p>
                                    <span className="mt-auto pt-2 inline-flex items-center text-xs font-bold text-[#e07e53] group-hover:translate-x-0.5 transition-transform">
                                        Leer revista <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                {/* 4. TAB: Artículos (Full Grid of Blog Posts) */}
                {activeTab === 'articles' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {initialArticles.map(item => {
                            const isSaved = savedIds.includes(item.id);
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => setSelectedArticle(item)}
                                    className="group bg-card border border-border/40 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:-translate-y-0.5 text-left cursor-pointer"
                                >
                                    <div className="aspect-[4/3] w-full overflow-hidden relative bg-muted shrink-0">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                        <span className={`absolute top-3 left-3 shadow-md ${getCategoryStyles(item.category)}`}>{item.category}</span>
                                        <button onClick={(e) => toggleSave(item.id, e)} className="absolute bottom-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-[#2c2b2a] hover:bg-white active:scale-95 transition-all shadow-md z-30">
                                            {isSaved ? <BookmarkCheck className="w-4 h-4 text-[#e07e53]" /> : <Bookmark className="w-4 h-4 text-gray-500" />}
                                        </button>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.readTime} min</span>
                                            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {item.author}</span>
                                        </div>
                                        <h3 className="font-serif text-base font-bold leading-tight mb-2 text-[#2c2b2a] dark:text-white group-hover:text-[#e07e53] transition-colors line-clamp-2">{item.title}</h3>
                                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-6 flex-grow">{item.description}</p>
                                        <span className="mt-auto pt-2 inline-flex items-center text-xs font-bold text-[#e07e53] group-hover:translate-x-0.5 transition-transform self-start">
                                            Leer relato <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </section>

            {/* Article Detail Modal */}
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

                            <div className="prose prose-gray dark:prose-invert lg:prose-lg max-w-none text-muted-foreground font-light leading-relaxed text-sm md:text-base">
                                {renderMarkdown(selectedArticle.content)}
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

            {/* Delete Confirmation Modal for Explorar Todo row */}
            <Modal
                isOpen={deleteModalState.isOpen}
                onClose={() => setDeleteModalState({ isOpen: false, recipe: null })}
                title={t?.feed?.deleteTitle || 'Eliminar Receta'}
            >
                <div className="space-y-4 text-left">
                    <p className="text-foreground">
                        {t?.feed?.deleteConfirm || '¿Estás seguro de que deseas eliminar la receta'} <strong>{deleteModalState.recipe?.name}</strong>?
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteModalState({ isOpen: false, recipe: null })}
                        >
                            {t?.feed?.cancel || 'Cancelar'}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDelete}
                        >
                            {t?.feed?.confirmDelete || 'Eliminar'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// Lightweight Markdown parser to React elements to avoid raw bold tags (**text**) in modals
function renderMarkdown(text: string) {
    if (!text) return null;
    
    const lines = text.split('\n');
    let insideList = false;
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        
        // Handle Headings
        if (trimmed.startsWith('### ')) {
            insideList = false;
            elements.push(
                <h4 key={`h3-${index}`} className="text-base font-bold text-[#2c2b2a] dark:text-white font-serif mt-6 mb-2">
                    {parseInlineStyles(trimmed.slice(4))}
                </h4>
            );
            return;
        }
        if (trimmed.startsWith('## ')) {
            insideList = false;
            elements.push(
                <h3 key={`h2-${index}`} className="text-lg font-bold text-[#2c2b2a] dark:text-white font-serif mt-8 mb-3">
                    {parseInlineStyles(trimmed.slice(3))}
                </h3>
            );
            return;
        }
        if (trimmed.startsWith('# ')) {
            insideList = false;
            elements.push(
                <h2 key={`h1-${index}`} className="text-xl font-bold text-[#2c2b2a] dark:text-white font-serif mt-10 mb-4">
                    {parseInlineStyles(trimmed.slice(2))}
                </h2>
            );
            return;
        }
        
        // Handle Lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            insideList = true;
            elements.push(
                <li key={`li-${index}`} className="list-disc ml-6 mb-2 text-muted-foreground text-sm md:text-base font-light">
                    {parseInlineStyles(trimmed.slice(2))}
                </li>
            );
            return;
        }

        // Handle Blockquotes
        if (trimmed.startsWith('> ')) {
            insideList = false;
            elements.push(
                <blockquote key={`bq-${index}`} className="border-l-4 border-[#e07e53] pl-4 italic text-muted-foreground my-4 bg-muted/20 py-2 pr-4 rounded-r-lg">
                    {parseInlineStyles(trimmed.slice(2))}
                </blockquote>
            );
            return;
        }
        
        // Handle Empty lines
        if (trimmed === '') {
            insideList = false;
            elements.push(<div key={`spacer-${index}`} className="h-3" />);
            return;
        }
        
        // Handle normal paragraphs
        insideList = false;
        elements.push(
            <p key={`p-${index}`} className="leading-relaxed mb-4 text-sm md:text-base text-muted-foreground font-light">
                {parseInlineStyles(line)}
            </p>
        );
    });
    
    return elements;
}

function parseInlineStyles(text: string): React.ReactNode {
    const parts = text.split('**');
    return parts.map((part, index) => {
        if (index % 2 === 1) {
            return <strong key={`b-${index}`} className="font-bold text-[#2c2b2a] dark:text-white">{part}</strong>;
        }
        const subParts = part.split('*');
        return subParts.map((subPart, subIndex) => {
            if (subIndex % 2 === 1) {
                return <em key={`i-${subIndex}`} className="italic">{subPart}</em>;
            }
            return subPart;
        });
    });
}

