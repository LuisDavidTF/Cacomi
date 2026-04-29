import React from 'react';
import { Search, Clock, Zap, Leaf, Heart, Filter } from 'lucide-react';
import { useSettings } from '@context/SettingsContext';



interface RecipeSidebarProps {
    isMobile?: boolean;
}

export function RecipeSidebar({ isMobile = false }: RecipeSidebarProps) {
    const { t } = useSettings();

    return (
        <div className={`bg-muted/20 md:bg-muted/30 border border-border/40 md:border-border/50 rounded-[2.5rem] p-8 md:p-6 space-y-10 md:space-y-8 animate-in slide-in-from-right duration-700 ${isMobile ? 'border-none bg-transparent p-0' : ''}`}>
            <div>
                {!isMobile && (
                    <h2 className="text-2xl md:text-xl font-black tracking-tight mb-6 flex items-center gap-3">
                        <Filter className="w-5 h-5 text-primary" />
                        {t.planner?.exploreRecipes}
                    </h2>
                )}
                
                <div className="relative group mb-8 md:mb-6">
                    <Search className="absolute left-5 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-4 md:h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder={t.planner?.searchPlaceholder}
                        className="w-full pl-14 md:pl-11 pr-5 md:pr-4 py-4 md:py-3 bg-background border border-border/50 rounded-2xl md:rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xl md:shadow-sm"
                    />
                </div>

                <div className="flex flex-wrap gap-2.5">
                    <span className="px-5 md:px-4 py-2 md:py-1.5 bg-primary text-secondary-foreground rounded-full text-xs font-black cursor-pointer hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                        {t.planner?.tags?.healthy}
                    </span>
                    <span className="px-5 md:px-4 py-2 md:py-1.5 bg-background border border-border/50 text-muted-foreground rounded-full text-xs font-black cursor-pointer hover:bg-muted transition-colors">
                        {t.planner?.tags?.quick}
                    </span>
                    <span className="px-5 md:px-4 py-2 md:py-1.5 bg-background border border-border/50 text-muted-foreground rounded-full text-xs font-black cursor-pointer hover:bg-muted transition-colors">
                        {t.planner?.tags?.vegan}
                    </span>
                </div>
            </div>

            <div className="space-y-6 md:space-y-4">
                {/* Recipes will be dynamically loaded here */}
                <p className="text-xs text-muted-foreground text-center py-10 italic">
                    {t.planner?.noRecipesFound || 'No se encontraron recetas.'}
                </p>
            </div>
        </div>
    );
}
