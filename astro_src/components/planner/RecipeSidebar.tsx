import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Loader2, Info, Plus, ChevronRight } from 'lucide-react';
import { useSettings } from '@context/SettingsContext';
import { useRecipeFeed } from '@hooks/useRecipeFeed';
import { slugify } from '@utils/slugify';

interface RecipeSidebarProps {
    isMobile?: boolean;
    onSelectRecipe?: (recipe: any) => void;
    selectionMode?: boolean;
    onDragStateChange?: (isDragging: boolean) => void;
    onPointerDown?: (e: React.PointerEvent, recipe: any) => void;
}

export function RecipeSidebar({ isMobile = false, onSelectRecipe, selectionMode = false, onDragStateChange, onPointerDown }: RecipeSidebarProps) {
    const { t, language } = useSettings();
    const { recipes: feedRecipes, fetchMoreRecipes, hasMore: hasMoreFeed, isLoadingMore, status } = useRecipeFeed();

    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    
    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setShowAllCategories(false);
            }
        };
        if (showAllCategories) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showAllCategories]);
    
    // Fallback to feed recipes if no search query or category is active
    const displayRecipes = query || activeCategory ? searchResults : feedRecipes;

    // Search by Name
    useEffect(() => {
        if (!query.trim() && !activeCategory) {
            setSearchResults([]);
            return;
        }
        
        if (activeCategory) return; // category search is handled separately to avoid conflicts
        
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/recipes/search/name?name=${encodeURIComponent(query)}&page=0&size=20`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data || []);
                }
            } catch (err) {
                console.error("Search error", err);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, activeCategory]);

    // Search by Category
    useEffect(() => {
        if (!activeCategory) return;

        const fetchCategory = async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/recipes/search/category?category=${encodeURIComponent(activeCategory)}&page=0&size=20`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data || []);
                }
            } catch (err) {
                console.error("Category search error", err);
            } finally {
                setIsSearching(false);
            }
        };

        fetchCategory();
    }, [activeCategory]);

    const handleCategoryToggle = (category: string) => {
        if (activeCategory === category) {
            setActiveCategory(null);
        } else {
            setQuery(''); // clear text search when selecting a category
            setActiveCategory(category);
        }
    };

    // Construir la lista de categorías dinámica a partir de las traducciones
    const categories = Object.entries(t.recipeTypes || {}).map(([key, label]) => ({
        id: key,
        label: label as string
    }));

    const handleDragStart = (e: React.DragEvent, recipe: any) => {
        e.dataTransfer.setData('recipe', JSON.stringify(recipe));
        e.dataTransfer.effectAllowed = 'move';
        onDragStateChange?.(true);
        
        // Optional: improve mobile drag ghost if possible, but native is limited
    };

    const handleDragEnd = () => {
        onDragStateChange?.(false);
    };

    return (
        <div className={`bg-muted/20 md:bg-muted/30 border border-border/40 md:border-border/50 rounded-[2.5rem] p-8 md:p-6 space-y-10 md:space-y-8 animate-in slide-in-from-right duration-700 flex flex-col h-full max-h-[85vh] ${isMobile ? 'border-none bg-transparent p-0' : ''}`}>
            <div className="shrink-0">
                {!isMobile && (
                    <h2 className="text-2xl md:text-xl font-black tracking-tight mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Filter className="w-5 h-5 text-primary" />
                            {selectionMode ? (language === 'es' ? 'Seleccionar Receta' : 'Select Recipe') : (t.planner?.exploreRecipes || 'Explorar Recetas')}
                        </div>
                        {selectionMode && (
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-lg animate-pulse">
                                {language === 'es' ? 'MODO SELECCIÓN' : 'SELECTION MODE'}
                            </span>
                        )}
                    </h2>
                )}
                
                <div className="relative group mb-6 md:mb-5">
                    <Search className="absolute left-5 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-4 md:h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setActiveCategory(null);
                        }}
                        placeholder={t.planner?.searchPlaceholder || 'Buscar...'}
                        className="w-full pl-14 md:pl-11 pr-5 md:pr-4 py-4 md:py-3 bg-background border border-border/50 rounded-2xl md:rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xl md:shadow-sm"
                    />
                </div>

                <div className="flex flex-wrap gap-2.5">
                    {/* Todo Button */}
                    <button
                        onClick={() => handleCategoryToggle(null)}
                        className={`px-4 py-1.5 rounded-full text-xs font-black transition-all shadow-sm ${
                            !activeCategory 
                            ? 'bg-primary text-primary-foreground shadow-primary/20 scale-105 border-primary' 
                            : 'bg-background border border-border/50 text-muted-foreground hover:bg-muted'
                        }`}
                    >
                        {language === 'es' ? 'Todo' : 'All'}
                    </button>

                    {categories.filter(cat => activeCategory === cat.id || categories.indexOf(cat) < 3).map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryToggle(cat.id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all shadow-sm ${
                                activeCategory === cat.id 
                                ? 'bg-primary text-primary-foreground shadow-primary/20 scale-105 border-primary' 
                                : 'bg-background border border-border/50 text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}

                    <div className="relative" ref={categoryDropdownRef}>
                        <button 
                            onClick={() => setShowAllCategories(!showAllCategories)}
                            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all shadow-sm bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 flex items-center`}
                        >
                            {language === 'es' ? 'Ver más...' : 'See more...'}
                        </button>
                        
                        {/* Dropdown for remaining categories */}
                        <div className={`absolute top-full mt-2 left-0 bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl ring-1 ring-black/5 p-3 z-40 w-56 transition-all origin-top-left ${showAllCategories ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                            <div className="flex flex-wrap gap-2">
                                {categories.filter(cat => activeCategory !== cat.id && categories.indexOf(cat) >= 3).map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            handleCategoryToggle(cat.id);
                                            setShowAllCategories(false);
                                        }}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-background border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4">
                {isSearching || status === 'loading' ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-60">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                        <p className="text-xs font-bold uppercase tracking-widest text-primary">{language === 'es' ? 'Cargando...' : 'Loading...'}</p>
                    </div>
                ) : displayRecipes.length > 0 ? (
                    <>
                        {displayRecipes.map((recipe) => (
                            <div 
                                key={recipe.publicId || recipe.id} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, recipe)}
                                onDragEnd={handleDragEnd}
                                onPointerDown={(e) => onPointerDown?.(e, recipe)}
                                onClick={() => selectionMode && onSelectRecipe?.(recipe)}
                                className={`group relative p-3 bg-background rounded-2xl border border-border/50 shadow-sm transition-all cursor-grab active:cursor-grabbing touch-none
                                    ${selectionMode ? 'animate-shake border-primary/30 ring-2 ring-primary/5 hover:scale-[1.02] hover:border-primary cursor-pointer' : 'hover:shadow-md hover:border-primary/30'}
                                `}
                            >
                                <div className="flex gap-3 items-center">
                                    <div className="relative shrink-0">
                                        <img 
                                            src={recipe.imageUrl || 'https://placehold.co/100x100?text=Receta'} 
                                            alt={recipe.name} 
                                            className="w-14 h-14 rounded-xl object-cover"
                                        />
                                        {selectionMode && (
                                            <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 shadow-lg">
                                                <Plus className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors pr-8">
                                            {recipe.name}
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mt-1.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                                                {t.recipeTypes?.[recipe.mealType?.toUpperCase()] || recipe.mealType}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground flex items-center">
                                                {recipe.calories ? Math.round(recipe.calories) + ' kcal' : ''}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a 
                                            href={`/recipes/${slugify(recipe.name)}/${recipe.publicId || recipe.id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-2 bg-muted/80 hover:bg-primary hover:text-white rounded-lg transition-all"
                                            title={language === 'es' ? 'Ver receta' : 'View recipe'}
                                        >
                                            <Info className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {!query && !activeCategory && hasMoreFeed && (
                            <button 
                                onClick={() => fetchMoreRecipes()}
                                disabled={isLoadingMore}
                                className="w-full py-3 mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                            >
                                {isLoadingMore ? '...' : (language === 'es' ? 'Cargar más' : 'Load more')}
                            </button>
                        )}
                    </>
                ) : (
                    <p className="text-xs text-muted-foreground text-center py-10 italic">
                        {t.planner?.noRecipesFound || 'No se encontraron recetas.'}
                    </p>
                )}
            </div>
        </div>
    );
}
