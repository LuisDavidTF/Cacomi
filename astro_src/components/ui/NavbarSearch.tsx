'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { slugify } from '@/utils/slugify';

export function NavbarSearch({ isMobile = false }: { isMobile?: boolean }) {
    const { t, language } = useSettings();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // For dropdown results
    const [isExpanded, setIsExpanded] = useState(false); // For expanding the input
    
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (!query) {
                    setIsExpanded(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [query]);

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/recipes/search/name?name=${encodeURIComponent(query)}&page=0&size=5`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data || []);
                    setIsOpen(true);
                }
            } catch (err) {
                console.error("Search error", err);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleExpand = () => {
        setIsExpanded(true);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    // Calculate dimensions based on mobile or desktop
    const expandedWidthClass = isMobile 
        ? "w-[calc(100vw-120px)] sm:w-64" // On mobile it takes available space
        : "w-48 lg:w-64 xl:w-80"; // Desktop widths

    return (
        <div className="relative z-50 flex items-center justify-end h-10 w-10" ref={containerRef}>
            {/* Expand Button (Visible when collapsed) */}
            <button 
                onClick={handleExpand}
                className={`absolute inset-0 m-auto flex items-center justify-center p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                aria-label="Buscar recetas"
            >
                <Search className="w-5 h-5" />
            </button>

            {/* Expandable Input Area */}
            <div 
                className={`absolute right-0 flex items-center transition-all duration-300 ease-out
                    ${isExpanded ? `${expandedWidthClass} opacity-100` : 'w-10 opacity-0 pointer-events-none'}
                `}
            >
                <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (!isOpen && e.target.value) setIsOpen(true);
                        }}
                        onFocus={() => {
                            if (query) setIsOpen(true);
                        }}
                        placeholder={language === 'es' ? 'Buscar recetas...' : 'Search recipes...'}
                        className="block w-full pl-9 pr-10 py-1.5 md:py-2 border border-border/50 rounded-full text-sm leading-5 bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground text-foreground shadow-sm"
                    />
                    {isLoading ? (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                    ) : query ? (
                        <button 
                            onClick={handleClear}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Dropdown Results */}
            <div className={`absolute right-0 top-full mt-2 w-[300px] sm:w-[320px] bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden transition-all duration-200 origin-top-right ${isOpen && query && isExpanded ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                {results.length > 0 ? (
                    <ul className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
                        {results.map((recipe) => (
                            <li key={recipe.publicId || recipe.id}>
                                <a 
                                    href={`/recipes/${slugify(recipe.name)}/${recipe.publicId || recipe.id}`}
                                    onClick={() => { setIsOpen(false); setIsExpanded(false); }}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/60 transition-colors"
                                >
                                    {recipe.imageUrl ? (
                                        <img src={recipe.imageUrl} alt={recipe.name} className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Search className="w-4 h-4 text-primary" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">{recipe.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                                                {t.recipeTypes?.[recipe.mealType?.toUpperCase()] || recipe.mealType}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : !isLoading && query ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                        {language === 'es' ? 'No se encontraron recetas' : 'No recipes found'}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
