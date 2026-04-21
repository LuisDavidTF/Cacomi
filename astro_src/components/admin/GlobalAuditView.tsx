import React, { useState } from 'react';
import { 
    Info, Database, Pin, Target, ChevronRight, 
    X, Utensils, Zap, DollarSign, Dumbbell, Flame,
    Scale, Activity, Search, FileText, AlertCircle, Sparkles
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { 
    Dialog, DialogContent, DialogHeader, 
    DialogTitle, DialogDescription, DialogTrigger 
} from '../shadcn/dialog';

interface Ingredient {
    name: string;
    quantity: number | null;
    unitOfMeasure: string;
}

interface Recipe {
    id: number;
    name: string;
    recipeType: string;
    baseRecipeIngredientPlanRequestList: Ingredient[];
    totalCalories: string;
    totalProtein: string;
    totalCarbs: string;
    totalFat: string;
    estimatedCost?: string | number;
    price?: string | number;
    cost?: string | number;
}

interface PinnedMeal {
    dayOfWeek: string;
    mealType: string;
    recipeId: number;
}

interface PantryItem {
    name: string;
    quantity: number;
    unitOfMeasure: string;
    expirationDate: number[] | null;
}

interface GlobalAuditJSON {
    baseRecipePlanRequestList: Recipe[];
    pinnedMeals: PinnedMeal[];
    pantryItems: PantryItem[];
    weeklyBudget: string;
    goalType: string;
    targetCalories: string;
    targetProtein: string;
    targetWeight: string;
    currentWeight: string;
    currentHeight: string;
    activityLevel: string;
}

interface GlobalAuditViewProps {
    rawAudit: string;
    globalPlanAudit?: string; // New: Pipe-separated AI feedback
    planDays?: any[]; // Fallback for recipe lookup
    onSelectMeal?: (meal: any) => void;
}

/**
 * Renders the pipe-separated audit feedback in a clean, card-based list.
 */
const AuditFeedbackList: React.FC<{ text?: string }> = ({ text }) => {
    if (!text) return null;

    // Split by | and filter out empty segments or whitespace
    const segments = text.split('|').map(s => s.trim()).filter(Boolean);

    if (segments.length === 0) return null;

    return (
        <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center gap-2 px-1">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Feedback de la IA
                </h5>
            </div>
            {segments.map((segment, idx) => {
                const isTip = segment.toLowerCase().includes('tip');
                const isAlert = segment.toLowerCase().includes('presupuesto') || segment.toLowerCase().includes('desviación') || segment.toLowerCase().includes('costo');

                return (
                    <div 
                        key={idx} 
                        className={`p-3 rounded-xl border flex gap-3 transition-all animate-in fade-in slide-in-from-left-2 duration-300
                            ${isAlert ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30' : 
                              isTip ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30' : 
                              'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'}
                        `}
                    >
                        <div className="mt-0.5">
                            {isAlert ? <AlertCircle className="w-4 h-4 text-amber-500" /> : 
                             isTip ? <Sparkles className="w-4 h-4 text-emerald-500" /> : 
                             <Info className="w-4 h-4 text-indigo-400" />}
                        </div>
                        <p className={`text-[11px] leading-relaxed font-medium ${isAlert ? 'text-amber-900 dark:text-amber-200' : isTip ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-600 dark:text-slate-300'}`}>
                            {segment}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

/**
 * Reusable Catalog Modal that parses AI Prompt JSON to show all available recipes.
 */
const GlobalAuditCatalogModal: React.FC<{ data: GlobalAuditJSON | null, onSelectRecipe?: (meal: any) => void, planDays?: any[] }> = ({ data, onSelectRecipe, planDays = [] }) => {
    const { t } = useSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [viewedRecipeId, setViewedRecipeId] = useState<number | null>(null);

    const recipes = data?.baseRecipePlanRequestList || [];
    const filteredRecipes = recipes.filter((r: any) => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.recipeType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const viewedRecipe = recipes.find(r => r.id === viewedRecipeId);
    const handleBackToList = () => setViewedRecipeId(null);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setViewedRecipeId(null);
        }}>
            <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between p-4 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-2xl transition-all group shadow-lg shadow-indigo-600/10 mt-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold leading-none mb-1">{t.admin?.audit?.viewFullCatalog || "Ver Catálogo Completo"}</div>
                            <div className="text-[10px] text-white/60 font-medium">{recipes.length} recetas disponibles</div>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl">
                {viewedRecipe ? (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                        <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20">
                            <button 
                                onClick={handleBackToList}
                                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-3 group hover:translate-x-[-4px] transition-transform"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" /> VOLVER AL LISTADO
                            </button>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Ficha Técnica de Receta</span>
                                    <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-white">{viewedRecipe.name}</DialogTitle>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs font-mono text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">ID:{viewedRecipe.id}</span>
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full flex items-center gap-2 border border-indigo-100 dark:border-indigo-800/50">
                                            <span className="text-xs font-bold text-indigo-500 uppercase">{viewedRecipe.recipeType.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            <section>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-tight">
                                    <Zap className="w-4 h-4 text-amber-500" /> Rendimiento Nutricional
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-2xl border border-orange-100 dark:border-orange-800/50">
                                        <div className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase mb-1">Energía</div>
                                        <div className="text-lg font-black text-orange-700 dark:text-orange-200">{viewedRecipe.totalCalories} <span className="text-[10px] font-normal">kcal</span></div>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                                        <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Proteína</div>
                                        <div className="text-lg font-black text-blue-700 dark:text-blue-200">{viewedRecipe.totalProtein}g</div>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Carbos</div>
                                        <div className="text-lg font-black text-emerald-700 dark:text-emerald-200">{viewedRecipe.totalCarbs}g</div>
                                    </div>
                                    <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-2xl border border-rose-100 dark:border-rose-800/50">
                                        <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase mb-1">Grasas</div>
                                        <div className="text-lg font-black text-rose-700 dark:text-rose-200">{viewedRecipe.totalFat}g</div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-tight">
                                    <Utensils className="w-4 h-4 text-indigo-500" /> Lista de Ingredientes
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {viewedRecipe.baseRecipeIngredientPlanRequestList.map((ing, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/50 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                                            <span className="text-xs text-slate-700 dark:text-slate-300 capitalize font-medium">{ing.name}</span>
                                            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{ing.quantity} {ing.unitOfMeasure}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex gap-3">
                            <button 
                                onClick={handleBackToList}
                                className="flex-1 py-4 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                            >
                                Volver al catálogo
                            </button>
                            <button 
                                onClick={() => {
                                    if (onSelectRecipe) {
                                        onSelectRecipe({ 
                                            recipeId: viewedRecipe.id, 
                                            recipeName: viewedRecipe.name, 
                                            catalogRecipe: viewedRecipe
                                        });
                                    }
                                    setIsOpen(false);
                                }}
                                className="flex-[2] py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest text-xs"
                            >
                                Seleccionar para el Plan
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="p-6 pb-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {t.admin?.audit?.recipeCatalog || "Catálogo de Generación"}
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1 italic">
                                        {t.admin?.audit?.viewCatalogDesc || 'Explore todas las recetas evaluadas para esta generación.'}
                                    </DialogDescription>
                                </div>
                            </div>
                            
                            <div className="relative mt-6 mb-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text"
                                    placeholder="Buscar por nombre o tipo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 dark:text-white transition-all"
                                />
                            </div>
                        </DialogHeader>

                        <div className="flex-grow overflow-y-auto p-6 pt-2 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredRecipes.map((recipe: any) => (
                                    <div 
                                        key={recipe.id} 
                                        onClick={() => setViewedRecipeId(recipe.id)}
                                        className={`p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col gap-3 group cursor-pointer shadow-sm active:scale-[0.98]`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="pr-4">
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 block mb-1">
                                                    {recipe.recipeType.replace('_', ' ')}
                                                </span>
                                                <h6 className="font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-indigo-600 transition-colors">
                                                    {recipe.name}
                                                </h6>
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-400">ID:{recipe.id}</span>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className="text-[10px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2.5 py-1 rounded-lg">
                                                {parseFloat(recipe.totalCalories).toFixed(0)} kcal
                                            </span>
                                            <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-lg">
                                                {parseFloat(recipe.totalProtein).toFixed(0)}g Prot
                                            </span>
                                        </div>
        
                                        <div className="mt-2 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                                            <div className="flex flex-wrap gap-1.5 opacity-60">
                                                {recipe.baseRecipeIngredientPlanRequestList.slice(0, 3).map((ing: any, i: number) => (
                                                    <span key={i} className="text-[8px] bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                                                        {ing.name}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"> Ver más <ChevronRight className="w-3 h-3" /></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export const GlobalAuditView: React.FC<GlobalAuditViewProps> = ({ rawAudit, globalPlanAudit, planDays = [], onSelectMeal }) => {
    const { t } = useSettings();

    let data: GlobalAuditJSON | null = null;
    try {
        if (rawAudit && (rawAudit.trim().startsWith('{') || rawAudit.trim().startsWith('['))) {
            data = JSON.parse(rawAudit);
        }
    } catch (e) {
        console.warn('Failed to parse Global Audit JSON:', e);
    }

    if (!data) {
        return (
            <div className="flex flex-col gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-500 italic leading-relaxed">
                        {rawAudit || t.admin?.audit?.noData || 'No structured data available.'}
                    </p>
                </div>
                <AuditFeedbackList text={globalPlanAudit} />
            </div>
        );
    }

    const findRecipeName = (id: number) => {
        // 1. Check in the generation catalog
        const catRecipe = data?.baseRecipePlanRequestList?.find(r => r.id === id);
        if (catRecipe) return catRecipe.name;

        // 2. Fallback to current plan days
        const planRecipe = planDays.find(d => d.recipeId === id);
        if (planRecipe) return planRecipe.recipeName;

        return `Recipe #${id}`;
    };

    const handlePinClick = (id: number) => {
        if (!onSelectMeal) return;
        
        // 1. Find in plan days (has logId, portion, etc)
        const matchingMeal = planDays.find(d => d.recipeId === id);
        
        // 2. Find in catalog (has ingredients, etc)
        const catalogRecipe = data?.baseRecipePlanRequestList?.find(r => r.id === id);

        if (matchingMeal) {
            onSelectMeal({ ...matchingMeal, catalogRecipe });
        } else if (catalogRecipe) {
            // Case where it's pinned in JSON but not in the plan (unlikely but possible)
            onSelectMeal({ recipeId: id, recipeName: catalogRecipe.name, catalogRecipe });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            
            {/* User Goals Summary Card */}
            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-indigo-500" />
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {t.admin?.audit?.userGoals || "Objetivos Usuario"}
                    </h5>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                            {data.goalType?.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                            {data.activityLevel?.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {data.targetCalories} kcal
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dumbbell className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {data.targetProtein}g Prot
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Scale className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {data.targetWeight}kg
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            ${data.weeklyBudget}
                        </span>
                    </div>
                </div>
            </div>

            {/* Pinned Meals Strip */}
            {data.pinnedMeals?.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Pin className="w-4 h-4 text-amber-600" />
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                            {t.admin?.audit?.pinnedMeals || "Comidas Forzadas"}
                        </h5>
                    </div>
                    <div className="flex flex-col gap-2">
                        {data.pinnedMeals.map((pin, idx) => {
                            const name = findRecipeName(pin.recipeId);
                            const canLink = true; // Always allow looking up catalog info at least
                            
                            return (
                                <button 
                                    key={idx} 
                                    onClick={() => handlePinClick(pin.recipeId)}
                                    className={`flex flex-col gap-1 p-2 bg-white/60 dark:bg-slate-900 text-left rounded-lg border transition-all border-amber-200 hover:border-amber-400 hover:shadow-sm cursor-pointer`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                                            {pin.dayOfWeek} • {pin.mealType}
                                        </span>
                                        <span className="text-[8px] font-mono opacity-40">ID:{pin.recipeId}</span>
                                    </div>
                                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 flex items-center gap-1">
                                        {name} <ChevronRight className="w-3 h-3 opacity-50" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Pantry Context Card (Prettier design) */}
            {data.pantryItems?.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Database className="w-4 h-4 text-indigo-500" />
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {t.admin?.audit?.pantry || "Estado de Despensa"}
                        </h5>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {data.pantryItems.slice(0, 10).map((item, idx) => (
                            <div key={idx} className="flex flex-col bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate" title={item.name}>
                                    {item.name}
                                </span>
                                <span className="text-[9px] text-indigo-500 font-mono">
                                    {item.quantity} {item.unitOfMeasure}
                                </span>
                            </div>
                        ))}
                    </div>
                    {data.pantryItems.length > 10 && (
                        <p className="text-[9px] text-slate-400 mt-3 text-center font-medium italic">
                            + {data.pantryItems.length - 10} ingredientes más en inventario
                        </p>
                    )}
                </div>
            )}

            {/* Catalog Trigger (Requested position: Below Pantry, Before Feedback) */}
            <GlobalAuditCatalogModal 
                data={data} 
                onSelectRecipe={onSelectMeal} 
                planDays={planDays} 
            />

            {/* AI Detailed Audit Feedback */}
            <AuditFeedbackList text={globalPlanAudit} />
        </div>
    );
};
