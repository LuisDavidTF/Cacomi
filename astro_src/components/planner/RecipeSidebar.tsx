import React from 'react';
import { Search, Clock, Zap, Leaf, Heart, Filter } from 'lucide-react';
import { useSettings } from '@context/SettingsContext';

const MOCK_RECIPES = [
    { 
        name: 'Bowl Mediterráneo', 
        time: '15 min', 
        calories: '340 kcal', 
        tag: 'LUNCH', 
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
        special: 'leaf'
    },
    { 
        name: 'Ensalada de Brotes', 
        time: '10 min', 
        calories: '210 kcal', 
        tag: 'LUNCH', 
        image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400',
        special: 'heart'
    },
    { 
        name: 'Salmon Bowl', 
        time: '20 min', 
        calories: '450 kcal', 
        tag: 'LUNCH', 
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=400',
        special: 'zap'
    }
];

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
                {MOCK_RECIPES.map((recipe, idx) => (
                    <div 
                        key={idx} 
                        className="group relative bg-background border border-border/40 rounded-[2rem] md:rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl transition-all hover:scale-[1.03] active:scale-95 cursor-grab"
                    >
                        <div className="relative aspect-[3/2] md:aspect-[4/3]">
                            <img 
                                src={recipe.image} 
                                alt={recipe.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xl text-[10px] md:text-[9px] font-black px-3 py-1 md:py-0.5 rounded-full text-foreground tracking-widest shadow-xl border border-border/30 uppercase">
                                {recipe.tag}
                            </div>
                        </div>
                        
                        <div className="p-6 md:p-4 flex flex-col gap-4 md:gap-3">
                            <div className="flex items-start justify-between gap-4">
                                <h3 className="text-base md:text-sm font-black text-foreground leading-tight line-clamp-1">{recipe.name}</h3>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {recipe.special === 'leaf' && <Leaf className="w-5 h-5 md:w-4 md:h-4 text-primary" />}
                                    {recipe.special === 'heart' && <Heart className="w-5 h-5 md:w-4 md:h-4 text-destructive fill-destructive" />}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6 md:gap-4 text-xs md:text-[10px] font-black text-muted-foreground opacity-70">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 md:w-3 md:h-3" />
                                    {recipe.time}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Zap className="w-4 h-4 md:w-3 md:h-3" />
                                    {recipe.calories}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
