import React, { useState, useEffect, useMemo } from 'react';
import { 
    CheckCircle, Edit3, Trash2, Check, X, AlertOctagon, 
    Search, FileText, ChevronRight, RefreshCw, Info, 
    DollarSign, Dumbbell, Flame, TrendingUp
} from 'lucide-react';
import { SELECTION_LOGIC, SELECTION_LOGIC_LABELS, type SelectionLogicCode } from '../../constants/training';

interface UserProfile {
    weightKg: number;
    heightCm: number;
    goal: string;
    monthlyBudget: number;
    targetDailyCalories: number;
    targetDailyProtein: number;
    allergies: string[];
}

interface DayResponse {
    logId: number;
    type: 'Desayuno' | 'Comida' | 'Cena'; 
    recipeId: string;
    recipeName: string;
    
    // Expanded Backend Metrics
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    price: number;
    pantryUsage: number;
    initialAiReasoning: string;

    selectionLogicCode: SelectionLogicCode;
    portionMultiplier: number;
    aiReasoning?: string;
    isValid?: boolean;
}

interface DaySummary {
    name: string;
    date: string;
    meals: DayResponse[];
}

interface TrainingLogsWeekResponse {
    planId: number;
    profile: UserProfile;
    days: DaySummary[];
    aiPrompt: string;
}

interface TrainingLogsWeekRequest {
    planId: number;           
    globalPlanAudit: string;  
    updatedLogs: {            
      logId: number;          
      isValid: boolean;       
      portionMultiplier: number; 
      selectionLogicCode: string; 
      aiReasoning: string;    
    }[];
}

// Global mockup database 
const MOCK_RECIPE_DB = [
    { recipeId: 'REC-2300', recipeName: 'Huevos Ahogados en Salsa Roja', calories: 420, protein: 28, carbs: 12, fat: 25, price: 35.5, pantryUsage: 0.15 },
    { recipeId: 'REC-2301', recipeName: 'Pollo en Crema de Champiñones', calories: 580, protein: 45, carbs: 15, fat: 30, price: 65.0, pantryUsage: 0.20 },
    { recipeId: 'REC-2302', recipeName: 'Tostadas de Atún Picante', calories: 350, protein: 32, carbs: 25, fat: 12, price: 40.0, pantryUsage: 0.05 },
    { recipeId: 'REC-2303', recipeName: 'Avena Nocturna con Matcha y Chía', calories: 310, protein: 15, carbs: 45, fat: 8, price: 28.0, pantryUsage: 0.30 },
    { recipeId: 'REC-2304', recipeName: 'Panqué integral de Plátano', calories: 250, protein: 8, carbs: 35, fat: 10, price: 22.0, pantryUsage: 0.10 },
    { recipeId: 'REC-2305', recipeName: 'Filete de Salmón con Espárragos', calories: 520, protein: 42, carbs: 8, fat: 35, price: 110.0, pantryUsage: 0.05 },
    { recipeId: 'REC-2306', recipeName: 'Tacos de Cecina con Nopales', calories: 480, protein: 38, carbs: 40, fat: 18, price: 75.0, pantryUsage: 0.15 },
    { recipeId: 'REC-2307', recipeName: 'Sopa de Códito con Crema', calories: 410, protein: 12, carbs: 55, fat: 15, price: 30.0, pantryUsage: 0.25 },
    { recipeId: 'REC-2308', recipeName: 'Ensalada César con Pollo Asado', calories: 390, protein: 35, carbs: 12, fat: 22, price: 55.0, pantryUsage: 0.10 },
    { recipeId: 'REC-2309', recipeName: 'Smoothie Verde de Piña', calories: 150, protein: 2, carbs: 32, fat: 0, price: 25.0, pantryUsage: 0.05 },
    { recipeId: 'REC-2310', recipeName: 'Pechuga Rellena de Panela', calories: 470, protein: 55, carbs: 5, fat: 22, price: 68.0, pantryUsage: 0.10 },
    { recipeId: 'REC-2311', recipeName: 'Lentejas con Plátano Macho', calories: 550, protein: 22, carbs: 85, fat: 10, price: 35.0, pantryUsage: 0.30 },
    { recipeId: 'REC-2312', recipeName: 'Chilaquiles con Pollo', calories: 600, protein: 35, carbs: 65, fat: 22, price: 50.0, pantryUsage: 0.20 },
];

const generateMockPlans = (count: number): TrainingLogsWeekResponse[] => {
    const profiles: UserProfile[] = [
        { weightKg: 68, heightCm: 165, goal: 'Mantenimiento Familiar', monthlyBudget: 4000, targetDailyCalories: 1800, targetDailyProtein: 100, allergies: ['Lácteos'] },
        { weightKg: 85, heightCm: 180, goal: 'Hipertrofia Muscular', monthlyBudget: 6000, targetDailyCalories: 3000, targetDailyProtein: 180, allergies: [] },
        { weightKg: 75, heightCm: 170, goal: 'Diabético Tipo 2 - Control', monthlyBudget: 5000, targetDailyCalories: 1600, targetDailyProtein: 120, allergies: ['Mariscos'] },
        { weightKg: 55, heightCm: 160, goal: 'Pérdida de Peso Acelerada', monthlyBudget: 3500, targetDailyCalories: 1400, targetDailyProtein: 110, allergies: ['Gluten'] },
    ];

    let logCounterId = 5000;

    const generateDays = (profile: UserProfile) => {
        const dNames = ['LUN','MAR','MIE','JUE','VIE','SAB','DOM'];
        return dNames.map(dayName => {
            const rBase = Math.floor(Math.random() * 5); 
            const b = MOCK_RECIPE_DB[rBase] || MOCK_RECIPE_DB[0];
            const l = MOCK_RECIPE_DB[rBase + 1] || MOCK_RECIPE_DB[1];
            const d = MOCK_RECIPE_DB[rBase + 2] || MOCK_RECIPE_DB[2];

            const getRandomLogic = (): SelectionLogicCode => Object.values(SELECTION_LOGIC)[Math.floor(Math.random() * 5)] as SelectionLogicCode;

            const mapMeal = (recipe: typeof MOCK_RECIPE_DB[0], type: 'Desayuno'|'Comida'|'Cena') => {
                const logic = getRandomLogic();
                let reasoningText = `La IA determinó que ${recipe.recipeName} es óptimo basándose en la meta de ${profile.goal}.`;
                if(logic === 'BUDGET_SAVER') reasoningText = `El costo reducido de $${recipe.price} MXN ayuda a mantener el margen semanal estricto.`;
                if(logic === 'PROTEIN_FILL') reasoningText = `Aporta ${recipe.protein}g críticos para alcanzar el objetivo diario de ${profile.targetDailyProtein}g.`;

                return {
                    logId: logCounterId++, 
                    type: type, 
                    recipeId: recipe.recipeId, 
                    recipeName: recipe.recipeName, 
                    calories: recipe.calories, 
                    protein: recipe.protein,
                    carbs: recipe.carbs,
                    fat: recipe.fat,
                    price: recipe.price,
                    pantryUsage: recipe.pantryUsage,
                    initialAiReasoning: reasoningText,
                    selectionLogicCode: logic, 
                    portionMultiplier: 1.0 
                };
            };

            return {
                name: dayName,
                date: `2026-04-${15 + dNames.indexOf(dayName)}`,
                meals: [
                    mapMeal(b, 'Desayuno'),
                    mapMeal(l, 'Comida'),
                    mapMeal(d, 'Cena')
                ]
            };
        });
    };

    return Array.from({ length: count }).map((_, i) => {
        const p = profiles[i % profiles.length];
        return {
            planId: 1000 + i,
            profile: JSON.parse(JSON.stringify(p)), // Deep copy 
            days: generateDays(p),
            aiPrompt: `Auditoría AI de generación: Filtro restrictivo cruzando metas calóricas y financieras superado.`
        };
    });
};

const INITIAL_PLANS: TrainingLogsWeekResponse[] = generateMockPlans(15);

// Metric calculation helpers
const calculateMetrics = (days: DaySummary[]) => {
    let weeklyCost = 0;
    let weeklyCalories = 0;
    let weeklyProtein = 0;
    
    // Contemplate portion Multipliers!
    days.forEach(day => {
        day.meals.forEach(m => {
            weeklyCost += m.price * m.portionMultiplier;
            weeklyCalories += m.calories * m.portionMultiplier;
            weeklyProtein += m.protein * m.portionMultiplier;
        });
    });

    return {
        weeklyCost,
        weeklyCalories,
        avgDailyProtein: weeklyProtein / 7,
        avgDailyCalories: weeklyCalories / 7
    };
};

export const ReviewLogsBoard = () => {
    const [plans, setPlans] = useState<TrainingLogsWeekResponse[]>(INITIAL_PLANS);
    const [isEditing, setIsEditing] = useState(false);
    const [globalAuditText, setGlobalAuditText] = useState("");
    
    // UI states
    const [statusBanner, setStatusBanner] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
    
    // Modal & Flyout tracking
    const [previewRecipe, setPreviewRecipe] = useState<DayResponse | null>(null);
    
    interface ReplaceTx {
        dayIndex: number;
        mealIndex: number;
        originalRecipeName: string;
        currentLogic: string;
        currentPortion: number;
    }
    const [replaceTx, setReplaceTx] = useState<ReplaceTx | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReplacementId, setSelectedReplacementId] = useState<string | null>(null);
    const [replaceReasonLogic, setReplaceReasonLogic] = useState<SelectionLogicCode | ''>('');
    const [replaceAiReasoningText, setReplaceAiReasoningText] = useState<string>('');
    const [replacePortion, setReplacePortion] = useState<string>('1.0');

    const searchResults = useMemo(() => {
        if (!searchQuery) return MOCK_RECIPE_DB.slice(0, 3);
        return MOCK_RECIPE_DB.filter(r => r.recipeName.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery]);

    // Derived states
    const currentPlan = plans[0];
    const tracking = currentPlan ? calculateMetrics(currentPlan.days) : null;
    const weeklyBudgetLimit = currentPlan ? (currentPlan.profile.monthlyBudget / 4) : 0;

    useEffect(() => {
        if (currentPlan) {
            setGlobalAuditText(currentPlan.aiPrompt);
        }
    }, [currentPlan]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (plans.length === 0) return;
            if (replaceTx) return; 

            if (e.key === 'Enter' && !isEditing) {
                e.preventDefault();
                handleApprove();
            } else if ((e.key === ' ' || e.key === 'Delete') && !isEditing) {
                e.preventDefault();
                handleReject();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [plans, isEditing, replaceTx]);

    const showBanner = (msg: string, type: 'success' | 'error') => {
        setStatusBanner({ msg, type });
        setTimeout(() => setStatusBanner(null), 2000);
    };

    const nextPlan = () => {
        setPlans(prev => prev.slice(1));
        setIsEditing(false);
        setPreviewRecipe(null);
        setReplaceTx(null);
    };

    const buildAndSendPayload = (isValid: boolean) => {
        const updatedLogs: TrainingLogsWeekRequest['updatedLogs'] = [];

        currentPlan.days.forEach(day => {
            day.meals.forEach(meal => {
                updatedLogs.push({
                    logId: meal.logId,
                    isValid: isValid, 
                    portionMultiplier: meal.portionMultiplier,
                    aiReasoning: meal.aiReasoning || "Aprobado automáticamente por el humano sin modificaciones.",
                    selectionLogicCode: meal.selectionLogicCode
                });
            });
        });

        const request: TrainingLogsWeekRequest = {
            planId: currentPlan.planId,
            globalPlanAudit: globalAuditText,
            updatedLogs
        };

        console.log("🚀 [BACKEND PAYLOAD COMPILED]:", JSON.stringify(request, null, 2));
    };

    const handleApprove = () => {
        buildAndSendPayload(true);
        showBanner(`Plan ${currentPlan.planId} Aprobado 🟢`, 'success');
        nextPlan();
    };

    const handleReject = () => {
        buildAndSendPayload(false);
        showBanner(`Plan ${currentPlan.planId} Rechazado 🔴`, 'error');
        nextPlan();
    };

    const handleSaveEditAndApprove = () => {
        buildAndSendPayload(true);
        showBanner(`Plan ${currentPlan.planId} Editado y Guardado 🟡`, 'success');
        nextPlan();
    };

    const confirmReplacement = () => {
        if (!replaceTx || !replaceReasonLogic || replaceAiReasoningText.length < 10) return;
        
        const updatedPlans = [...plans];
        const targetDay = updatedPlans[0].days[replaceTx.dayIndex];
        const targetMeal = targetDay.meals[replaceTx.mealIndex];

        if (selectedReplacementId) {
            const newRecipe = MOCK_RECIPE_DB.find(r => r.recipeId === selectedReplacementId);
            if (newRecipe) {
                targetMeal.recipeId = newRecipe.recipeId;
                targetMeal.recipeName = newRecipe.recipeName;
                targetMeal.calories = newRecipe.calories;
                targetMeal.protein = newRecipe.protein;
                targetMeal.carbs = newRecipe.carbs;
                targetMeal.fat = newRecipe.fat;
                targetMeal.price = newRecipe.price;
                targetMeal.pantryUsage = newRecipe.pantryUsage;
            }
        }
        
        targetMeal.selectionLogicCode = replaceReasonLogic as SelectionLogicCode;
        targetMeal.portionMultiplier = parseFloat(replacePortion) || 1.0;
        targetMeal.aiReasoning = replaceAiReasoningText;

        setPlans(updatedPlans);
        setReplaceTx(null);
        setSearchQuery('');
        setSelectedReplacementId(null);
        setReplaceReasonLogic('');
        setReplaceAiReasoningText('');
        setReplacePortion('1.0');
    };

    if (plans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-indigo-100 dark:bg-indigo-900/40 p-6 rounded-full mb-6">
                    <CheckCircle className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">¡Todo validado!</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    Has revisado toda la tanda de planes. Revisa la consola para ver los Payloads (JSON).
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-[90rem] mx-auto w-full flex flex-col lg:flex-row gap-6 relative items-start">
            
            {/* LEFT AREA: Cards Flow */}
            <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col gap-6">
                
                {/* Header & Metric Compliance Tracker */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Auditoría Integral</h1>
                            <p className="text-slate-500 dark:text-slate-400">Verificando Plan ID-{currentPlan.planId} ({plans.length} en cola)</p>
                        </div>
                        {statusBanner && (
                            <div className={`px-4 py-2 rounded-lg font-medium text-sm animate-in fade-in slide-in-from-top-4 ${statusBanner.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                                {statusBanner.msg}
                            </div>
                        )}
                    </div>

                    {/* COMPLIANCE TRACKER STRIP */}
                    {tracking && currentPlan && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-slate-100 dark:divide-slate-800">
                        {/* Profile Info */}
                        <div className="px-2 xl:px-4">
                            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1"><Info className="w-3 h-3"/> Meta Usuario</span>
                            <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 line-clamp-1" title={currentPlan.profile.goal}>{currentPlan.profile.goal}</div>
                            <div className="text-xs text-slate-500 mt-1">{currentPlan.profile.weightKg}kg • {currentPlan.profile.heightCm}cm</div>
                        </div>
                        
                        {/* Budget Tracker */}
                        <div className="px-2 xl:px-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Presupuesto (Semanal)</span>
                                <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
                                    ${tracking.weeklyCost.toFixed(0)} / ${weeklyBudgetLimit.toFixed(0)}
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
                                <div 
                                    className={`h-1.5 rounded-full transition-all ${tracking.weeklyCost > weeklyBudgetLimit ? 'bg-red-500' : tracking.weeklyCost > (weeklyBudgetLimit*0.8) ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                    style={{ width: `${Math.min(100, (tracking.weeklyCost / weeklyBudgetLimit) * 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Calories Average */}
                        <div className="px-2 xl:px-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Flame className="w-3 h-3"/> Kcal Diarias (Promedio)</span>
                                <span className="text-[10px] text-slate-500">Meta: {currentPlan.profile.targetDailyCalories}</span>
                            </div>
                            <div className="font-bold text-base text-slate-800 dark:text-slate-200">
                                {tracking.avgDailyCalories.toFixed(0)} <span className="text-xs font-normal text-slate-500">kcal/día</span>
                            </div>
                        </div>

                        {/* Protein Average */}
                        <div className="px-2 xl:px-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Dumbbell className="w-3 h-3"/> Prot. Diaria (Promedio)</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-base font-bold ${tracking.avgDailyProtein < currentPlan.profile.targetDailyProtein ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    {tracking.avgDailyProtein.toFixed(0)}g
                                </span>
                                <span className="text-xs text-slate-500">/ {currentPlan.profile.targetDailyProtein}g requerido</span>
                            </div>
                        </div>
                    </div>
                    )}
                </div>

                {/* Main Stack */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 flex flex-col">
                    
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/30 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                        {isEditing && (
                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 animate-pulse">
                                <Edit3 className="w-3 h-3" /> MODO EDICIÓN INDIRECTA
                            </span>
                        )}
                        {currentPlan.profile.allergies.length > 0 && (
                            <span className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">
                                Alergias: {currentPlan.profile.allergies.join(', ')}
                            </span>
                        )}
                    </div>
                    
                    {/* View mode prompt */}
                    {!isEditing && (
                        <div className="mx-4 md:mx-6 mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl">
                             <div className="flex items-center gap-2 mb-1">
                                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-400">Auditoría Global (Prompt AI Semanal)</h4>
                             </div>
                             <p className="text-sm text-indigo-900/80 dark:text-indigo-300/80 italic">"{currentPlan.aiPrompt}"</p>
                        </div>
                    )}

                    <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
                        <div className="space-y-6 md:space-y-4">
                            {currentPlan.days.map((day, dIdx) => (
                                <div key={day.name} className="flex flex-col xl:flex-row gap-2 xl:gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 xl:pb-4 last:border-0 last:pb-0">
                                    
                                    <div className="xl:w-16 flex-shrink-0 flex items-center xl:items-start gap-2 pt-1 xl:pt-2">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 xl:bg-transparent xl:dark:bg-transparent px-3 py-1 xl:px-0 xl:py-0 rounded-full xl:rounded-none">{day.name}</span>
                                    </div>
                                    
                                    <div className="flex-grow flex xl:grid xl:grid-cols-3 gap-3 overflow-x-auto pb-2 xl:pb-0 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 xl:mx-0 xl:px-0">
                                        {day.meals.map((meal, mIdx) => (
                                            <div 
                                                key={meal.logId} 
                                                className={`w-[85%] sm:w-[300px] xl:w-auto flex-shrink-0 snap-center xl:snap-align-none group relative bg-white dark:bg-slate-800 border-2 rounded-xl p-3 shadow-sm transition-all flex flex-col gap-1 cursor-pointer overflow-hidden ${previewRecipe?.logId === meal.logId ? 'border-indigo-500 shadow-indigo-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:shadow-md'}`}
                                                onClick={() => !isEditing && setPreviewRecipe(meal)}
                                            >
                                                {/* Header ID/Type */}
                                                <div className="flex items-start justify-between mb-1">
                                                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded">{meal.type}</span>
                                                    <span className="text-[10px] text-slate-300 dark:text-slate-500 font-mono">#{meal.logId}</span>
                                                </div>
                                                
                                                {/* Name */}
                                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-tight line-clamp-2 xl:mt-1">
                                                    {meal.recipeName}
                                                </p>
                                                
                                                {/* Macros & Price Compact Row */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                                                        ${(meal.price * meal.portionMultiplier).toFixed(2)}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded">
                                                        {(meal.protein * meal.portionMultiplier).toFixed(0)}g Prot
                                                    </span>
                                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                        {(meal.calories * meal.portionMultiplier).toFixed(0)} kcal
                                                    </span>
                                                </div>

                                                <div className="mt-auto pt-3 flex items-center justify-between">
                                                    <div className="text-[9px] text-indigo-400 truncate w-3/4">
                                                        {SELECTION_LOGIC_LABELS[meal.selectionLogicCode]}
                                                    </div>
                                                    {isEditing && (
                                                        <button 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                setReplaceTx({
                                                                    dayIndex: dIdx, mealIndex: mIdx, 
                                                                    originalRecipeName: meal.recipeName, 
                                                                    currentLogic: meal.selectionLogicCode, 
                                                                    currentPortion: meal.portionMultiplier
                                                                });
                                                                setReplaceReasonLogic(meal.selectionLogicCode);
                                                                setReplacePortion(meal.portionMultiplier.toString());
                                                                setReplaceAiReasoningText(meal.aiReasoning || meal.initialAiReasoning);
                                                            }}
                                                            className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 px-2 py-1.5 rounded bg-amber-50 xl:bg-transparent dark:bg-amber-900/20"
                                                        >
                                                            <RefreshCw className="w-3 h-3" /> CAMBIAR
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800">
                             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Auditoría Global de la Semana (globalPlanAudit)</label>
                             <textarea 
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50"
                                rows={2}
                                value={globalAuditText}
                                onChange={e => setGlobalAuditText(e.target.value)}
                             />
                        </div>
                    )}

                    <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-2 lg:flex lg:justify-between items-center gap-3">
                        {!isEditing ? (
                            <>
                                <button onClick={handleReject} className="col-span-1 lg:w-auto flex justify-center items-center gap-2 px-4 py-3 lg:px-6 lg:py-3 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-600 dark:hover:bg-red-900/20 transition  text-xs font-bold uppercase tracking-wider">
                                    <Trash2 className="w-4 h-4" /> Rechazar
                                </button>
                                <button onClick={() => setIsEditing(true)} className="col-span-1 lg:w-auto flex justify-center items-center gap-2 px-4 py-3 lg:px-6 lg:py-3 rounded-xl hover:bg-amber-50 text-slate-500 hover:text-amber-600 dark:hover:bg-amber-900/20 transition text-xs font-bold uppercase tracking-wider">
                                    <Edit3 className="w-4 h-4" /> Editar
                                </button>
                                <button onClick={handleApprove} className="col-span-2 lg:w-auto flex justify-center items-center gap-2 px-4 py-3 lg:px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition text-xs font-bold uppercase tracking-wider rounded-xl">
                                    <Check className="w-4 h-4" /> Aprobar Plan
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(false)} className="col-span-1 lg:w-auto flex justify-center items-center gap-2 px-4 py-3 md:px-6 text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition font-medium text-xs lg:text-sm rounded-xl">
                                    Cancelar
                                </button>
                                <button onClick={handleSaveEditAndApprove} className="col-span-1 lg:w-auto flex justify-center items-center gap-2 px-4 py-3 lg:px-8 bg-amber-500 hover:bg-amber-600 text-white shadow-lg font-medium text-xs lg:text-sm rounded-xl">
                                    <Check className="w-4 h-4" /> Guardar y Aprobar
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT AREA: Desktop Detailed Review Panel */}
            <div className="hidden lg:block w-[400px] xl:w-[450px] flex-shrink-0 sticky top-10 transition-all duration-300 h-[calc(100vh-80px)]">
                {previewRecipe ? (
                    <div className="w-full h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-950/30">
                            <div className="pr-4">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Visor de Impacto y Razón</span>
                                <h3 className="text-xl font-bold leading-tight dark:text-white">{previewRecipe.recipeName}</h3>
                                <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-mono">{previewRecipe.recipeId}</div>
                            </div>
                            <button onClick={() => setPreviewRecipe(null)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        
                        <div className="p-6 flex-grow overflow-y-auto">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl mb-6 border border-indigo-100 dark:border-indigo-900/50">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-400 mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3"/> Razonamiento Original del Modelo
                                </h4>
                                <p className="text-sm text-indigo-900/80 dark:text-indigo-300/80 italic">
                                    "{previewRecipe.initialAiReasoning}"
                                </p>
                                {previewRecipe.aiReasoning && (
                                    <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800/50">
                                        <span className="text-[10px] font-bold uppercase text-amber-600">Sobreescritura Manual:</span>
                                        <p className="text-sm text-indigo-900/80 dark:text-indigo-300/80">"{previewRecipe.aiReasoning}"</p>
                                    </div>
                                )}
                            </div>
                            
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 px-1">Distribución Numérica</h4>
                            
                            <div className="grid grid-cols-2 gap-3 mb-6 px-1">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Costo Unitario</div>
                                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                        ${(previewRecipe.price * previewRecipe.portionMultiplier).toFixed(2)}
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Impacto Alacena</div>
                                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                        {(previewRecipe.pantryUsage * 100).toFixed(0)}% Utilizado
                                    </div>
                                </div>
                            </div>

                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 px-1">Macronutrientes Generados</h4>
                            <ul className="space-y-3 mb-8 px-1">
                                <li className="text-sm text-slate-600 dark:text-slate-300 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span>Proteínas</span>
                                    </div>
                                    <span className="font-bold">{(previewRecipe.protein * previewRecipe.portionMultiplier).toFixed(1)}g</span>
                                </li>
                                <li className="text-sm text-slate-600 dark:text-slate-300 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span>Carbohidratos</span>
                                    </div>
                                    <span className="font-bold">{(previewRecipe.carbs * previewRecipe.portionMultiplier).toFixed(1)}g</span>
                                </li>
                                <li className="text-sm text-slate-600 dark:text-slate-300 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                        <span>Grasas</span>
                                    </div>
                                    <span className="font-bold">{(previewRecipe.fat * previewRecipe.portionMultiplier).toFixed(1)}g</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
                        <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4 animate-bounce" />
                        <h4 className="font-bold text-slate-400 dark:text-slate-500 mb-3 text-lg">Métricas Profundas</h4>
                        <p className="text-sm text-slate-400 dark:text-slate-600">Haz clic en cualquier comida del flujo para desglosar el razonamiento nativo de la IA, costo y macros exactos.</p>
                    </div>
                )}
            </div>

            {/* MOBILE ONLY: PREVIEW RECIPE BOTTOM SHEET */}
            {previewRecipe && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-end lg:hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setPreviewRecipe(null)}></div>
                    <div className="relative w-full bg-white dark:bg-slate-900 h-[85vh] rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
                        
                        <div className="w-full h-1.5 flex justify-center pt-3 pb-1" onClick={() => setPreviewRecipe(null)}>
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        </div>

                        <div className="p-6 pt-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                            <div className="pr-4">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Visor de Impacto y Razón</span>
                                <h3 className="text-xl font-bold leading-tight dark:text-white">{previewRecipe.recipeName}</h3>
                                <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-mono">{previewRecipe.recipeId}</div>
                            </div>
                            <button onClick={() => setPreviewRecipe(null)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        
                        <div className="p-6 flex-grow overflow-y-auto">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl mb-6 border border-indigo-100 dark:border-indigo-900/50">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-400 mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3"/> Razonamiento de la IA
                                </h4>
                                <p className="text-sm text-indigo-900/80 dark:text-indigo-300/80 italic">
                                    "{previewRecipe.initialAiReasoning}"
                                </p>
                                {previewRecipe.aiReasoning && (
                                    <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800/50">
                                        <span className="text-[10px] font-bold uppercase text-amber-600">Sobreescritura Manual:</span>
                                        <p className="text-sm text-indigo-900/80 dark:text-indigo-300/80">"{previewRecipe.aiReasoning}"</p>
                                    </div>
                                )}
                            </div>
                            
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 px-1">Distribución Numérica</h4>
                            
                            <div className="grid grid-cols-2 gap-3 mb-6 px-1">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Costo Unitario</div>
                                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                        ${(previewRecipe.price * previewRecipe.portionMultiplier).toFixed(2)}
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Impacto Alacena</div>
                                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                        {(previewRecipe.pantryUsage * 100).toFixed(0)}% Utilizado
                                    </div>
                                </div>
                            </div>

                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 px-1">Macronutrientes Generados</h4>
                            <ul className="space-y-3 mb-8 px-1">
                                <li className="text-sm text-slate-600 dark:text-slate-300 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span>Proteínas</span>
                                    </div>
                                    <span className="font-bold">{(previewRecipe.protein * previewRecipe.portionMultiplier).toFixed(1)}g</span>
                                </li>
                                <li className="text-sm text-slate-600 dark:text-slate-300 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span>Carbohidratos</span>
                                    </div>
                                    <span className="font-bold">{(previewRecipe.carbs * previewRecipe.portionMultiplier).toFixed(1)}g</span>
                                </li>
                                <li className="text-sm text-slate-600 dark:text-slate-300 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                        <span>Grasas</span>
                                    </div>
                                    <span className="font-bold">{(previewRecipe.fat * previewRecipe.portionMultiplier).toFixed(1)}g</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* REPLACE / EDIT RECIPE MODAL (GLOBAL FOCUS) */}
            {replaceTx && (
                <div className="fixed inset-0 z-[110] flex items-end lg:items-center justify-center p-0 lg:p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReplaceTx(null)}></div>
                    <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 lg:border border-slate-200 dark:border-slate-800 rounded-t-3xl lg:rounded-2xl shadow-2xl flex flex-col h-[90vh] lg:h-auto animate-in slide-in-from-bottom lg:zoom-in-95 duration-200">
                        
                        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 lg:hidden"></div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-xl font-bold dark:text-white">Modificar y Re-calibrar</h3>
                                <button onClick={() => setReplaceTx(null)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"><X className="w-4 h-4"/></button>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">Ajustando métricas en: <strong className="text-slate-800 dark:text-slate-200 text-base">{replaceTx.originalRecipeName}</strong></p>
                            
                            <div className="flex gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                <div className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">Multiplicador de Porciones Generales (Afecta Costo y Proteína):</div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        step="0.05"
                                        min="0.5"
                                        max="3.0"
                                        value={replacePortion}
                                        onChange={(e) => setReplacePortion(e.target.value)}
                                        className="w-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 text-sm font-mono text-center focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="text-xs text-slate-500">x</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-0 border-b border-slate-100 dark:border-slate-800 flex-grow min-h-[150px] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="p-4 bg-white dark:bg-slate-900 sticky top-0 border-b border-slate-100 dark:border-slate-800">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Busca comida para intercambiarla completamente (Opcional)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-200"
                                    />
                                </div>
                            </div>
                            {searchResults.map(r => (
                                <div 
                                    key={r.recipeId} 
                                    onClick={() => setSelectedReplacementId(r.recipeId)}
                                    className={`px-6 py-3 cursor-pointer flex justify-between items-center border-b border-slate-100 dark:border-slate-800 last:border-0 ${selectedReplacementId === r.recipeId ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                >
                                    <div>
                                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.recipeName}</div>
                                        <div className="text-xs text-slate-500 font-mono">${r.price.toFixed(2)} • {r.protein}g Prot</div>
                                    </div>
                                    {selectedReplacementId === r.recipeId && <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-b-2xl">
                             <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Lógica de Selección (SELECTION_LOGIC) <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    value={replaceReasonLogic}
                                    onChange={(e) => setReplaceReasonLogic(e.target.value as SelectionLogicCode)}
                                    className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-200"
                                >
                                    <option value="" disabled>Selecciona directiva para entrenar al modelo...</option>
                                    {Object.entries(SELECTION_LOGIC_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{key} - {label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Razonamiento del Humano (aiReasoning Override) <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    value={replaceAiReasoningText}
                                    onChange={(e) => setReplaceAiReasoningText(e.target.value)}
                                    placeholder="Ej: Se aumentó porción x1.5 para asegurar el techo de proteína de Hipertrofia."
                                    rows={2}
                                    className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-200"
                                />
                                {replaceAiReasoningText.length > 0 && replaceAiReasoningText.length < 10 && (
                                    <p className="text-xs text-red-500 mt-1">Faltan {10 - replaceAiReasoningText.length} caracteres.</p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setReplaceTx(null)} className="flex-1 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm">
                                    Descartar
                                </button>
                                <button 
                                    onClick={confirmReplacement} 
                                    disabled={!replaceReasonLogic || replaceAiReasoningText.length < 10}
                                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-white font-bold text-sm"
                                >
                                    Fijar Ajustes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
