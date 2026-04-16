import React, { useState, useEffect, useMemo } from 'react';
import { 
    CheckCircle, Edit3, Trash2, Check, X, AlertOctagon, 
    Search, FileText, ChevronRight, RefreshCw, Info, 
    DollarSign, Dumbbell, Flame, TrendingUp, Loader2
} from 'lucide-react';
import { SELECTION_LOGIC, SELECTION_LOGIC_LABELS, type SelectionLogicCode } from '../../constants/training';
import { ManualTrainingService } from '../../lib/services/admin';
import { useAuth } from '../../context/AuthContext';

// --- Backend Models (Aligning with Java Records) ---

interface TrainingLogsDayResponse {
    logId: number;
    recipeId: number;
    recipeName: string;
    dayOfWeek: string;    // "LUNES", "MARTES", etc.
    mealType: string;     // "BREAKFAST", "LUNCH", "DINNER"
    portionMultiplier: number;
    proteinGrams: number;
    calories: number;
    estimatedCost: number;
    pantryUsage: number;
    selectionLogicCode: SelectionLogicCode;
    aiReasoning: string;
}

interface UserProfile {
    gender: string;
    birthDate: string;
    activityLevel: string;
    heightCm: number;
    currentWeight: number;
    goal: string;
    targetCalories: number;
    targetWeight: number;
    targetProtein: number;
    weeklyBudget: number;
}

interface TrainingLogsWeekResponse {
    planId: number;
    profile: UserProfile; // We'll map the flat profile fields into this nested object for UI cleaness
    days: TrainingLogsDayResponse[]; // Flat list from backend
    aiPrompt: string;
    globalPlanAudit: string;
}

// --- UI Models (Transformed for rendering) ---

interface DaySummary {
    name: string;
    date?: string;
    meals: TrainingLogsDayResponse[];
}

interface TrainingLogsWeekRequest {
    planId: number;
    globalPlanAudit: string;
    isValid: boolean;
    updatedLogs: {
        logId: number;
        portionMultiplier: number;
        selectionLogicCode: string;
        aiReasoning: string;
    }[];
}

/** 
 * Groups flat training logs into a weekly summary for the grid UI.
 */
const groupLogsByDay = (logs: TrainingLogsDayResponse[]): DaySummary[] => {
    const dayOrder = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
    const groups: Record<string, TrainingLogsDayResponse[]> = {};
    
    logs.forEach(log => {
        const day = log.dayOfWeek.toUpperCase();
        if (!groups[day]) groups[day] = [];
        groups[day].push(log);
    });

    return dayOrder.map(day => ({
        name: day.substring(0, 3), // "LUN", "MAR"...
        meals: groups[day] || []
    })).filter(d => d.meals.length > 0);
};

// Metric calculation helpers
const calculateMetrics = (logs: TrainingLogsDayResponse[]) => {
    let weeklyCost = 0;
    let weeklyCalories = 0;
    let weeklyProtein = 0;
    
    logs.forEach(m => {
        weeklyCost += m.estimatedCost * m.portionMultiplier;
        weeklyCalories += m.calories * m.portionMultiplier;
        weeklyProtein += m.proteinGrams * m.portionMultiplier;
    });

    return {
        weeklyCost,
        weeklyCalories,
        avgDailyProtein: weeklyProtein / 7,
        avgDailyCalories: weeklyCalories / 7
    };
};

export const ReviewLogsBoard = () => {
    const { token } = useAuth();
    const [plans, setPlans] = useState<TrainingLogsWeekResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [globalAuditText, setGlobalAuditText] = useState("");
    
    // UI states
    const [statusBanner, setStatusBanner] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Modal & Flyout tracking
    const [previewRecipe, setPreviewRecipe] = useState<TrainingLogsDayResponse | null>(null);
    
    interface ReplaceTx {
        logId: number;
        originalRecipeName: string;
        currentLogic: string;
        currentPortion: number;
    }
    const [replaceTx, setReplaceTx] = useState<ReplaceTx | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReplacementId, setSelectedReplacementId] = useState<number | null>(null);
    const [replaceReasonLogic, setReplaceReasonLogic] = useState<SelectionLogicCode | ''>('');
    const [replaceAiReasoningText, setReplaceAiReasoningText] = useState<string>('');
    const [replacePortion, setReplacePortion] = useState<string>('1.0');

    // Recipes search (currently disabled as it requires a real backend search)
    const searchResults = useMemo(() => {
        return [];
    }, [searchQuery]);

    const currentPlan = plans[0];
    const daySummaries = useMemo(() => {
        return currentPlan ? groupLogsByDay(currentPlan.days) : [];
    }, [currentPlan]);
    
    const tracking = currentPlan ? calculateMetrics(currentPlan.days) : null;
    const weeklyBudgetLimit = currentPlan ? (currentPlan.profile.weeklyBudget) : 0;

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const response = await ManualTrainingService.getPlans(token);
            // The backend ManualTrainingResponse has a "plan" field which is List<TrainingLogsWeekResponse>
            // We map the incoming data into our structured TrainingLogsWeekResponse
            const mappedPlans = (response.plan || []).map((p: any) => ({
                ...p,
                profile: {
                    gender: p.gender,
                    birthDate: p.birthDate,
                    activityLevel: p.activityLevel,
                    heightCm: p.heightCm,
                    currentWeight: p.currentWeight,
                    goal: p.goal,
                    targetCalories: p.targetCalories,
                    targetWeight: p.targetWeight,
                    targetProtein: p.targetProtein,
                    weeklyBudget: p.weeklyBudget
                }
            }));
            setPlans(mappedPlans);
        } catch (error) {
            console.error('[ReviewLogs] Failed to fetch plans:', error);
            showBanner('Error al cargar planes del servidor', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentPlan) {
            setGlobalAuditText(currentPlan.globalPlanAudit || currentPlan.aiPrompt);
        }
    }, [currentPlan]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (plans.length === 0 || isSubmitting) return;
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
    }, [plans, isEditing, replaceTx, isSubmitting]);

    const showBanner = (msg: string, type: 'success' | 'error') => {
        setStatusBanner({ msg, type });
        setTimeout(() => setStatusBanner(null), 3000);
    };

    const nextPlan = () => {
        setPlans(prev => prev.slice(1));
        setIsEditing(false);
        setPreviewRecipe(null);
        setReplaceTx(null);
    };

    const handleAction = async (isValid: boolean) => {
        if (!currentPlan || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            const updatedLogs = currentPlan.days.map(meal => ({
                logId: meal.logId,
                portionMultiplier: meal.portionMultiplier,
                aiReasoning: meal.aiReasoning || "Aprobado automáticamente por el humano sin modificaciones.",
                selectionLogicCode: meal.selectionLogicCode
            }));

            const payload: TrainingLogsWeekRequest = {
                planId: currentPlan.planId,
                globalPlanAudit: globalAuditText,
                isValid,
                updatedLogs
            };

            await ManualTrainingService.updatePlan(payload, token);
            showBanner(isValid ? `Plan ${currentPlan.planId} Aprobado 🟢` : `Plan ${currentPlan.planId} Rechazado 🔴`, isValid ? 'success' : 'error');
            nextPlan();
        } catch (error) {
            console.error('[ReviewLogs] Action failed:', error);
            showBanner('Error al guardar decisión en el servidor', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApprove = () => handleAction(true);
    const handleReject = () => handleAction(false);
    const handleSaveEditAndApprove = () => handleAction(true);

    const confirmReplacement = () => {
        if (!replaceTx || !replaceReasonLogic || replaceAiReasoningText.length < 10) return;
        
        const updatedPlans = [...plans];
        const targetMeal = updatedPlans[0].days.find(d => d.logId === replaceTx.logId);

        if (targetMeal) {
            targetMeal.selectionLogicCode = replaceReasonLogic as SelectionLogicCode;
            targetMeal.portionMultiplier = parseFloat(replacePortion) || 1.0;
            targetMeal.aiReasoning = replaceAiReasoningText;
            
            // Note: Recipe swapping is disabled until real backend search is integrated
        }

        setPlans(updatedPlans);
        setReplaceTx(null);
        setSearchQuery('');
        setSelectedReplacementId(null);
        setReplaceReasonLogic('');
        setReplaceAiReasoningText('');
        setReplacePortion('1.0');
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Cargando tanda de entrenamiento...</p>
            </div>
        );
    }

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
                            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1"><Info className="w-3 h-3"/> Perfil Usuario</span>
                            <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 line-clamp-1" title={currentPlan.profile.goal}>{currentPlan.profile.goal}</div>
                            <div className="text-xs text-slate-500 mt-1">{currentPlan.profile.gender} • {currentPlan.profile.currentWeight}kg • {currentPlan.profile.heightCm}cm</div>
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
                                <span className="text-[10px] text-slate-500">Meta: {currentPlan.profile.targetCalories}</span>
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
                                <span className={`text-base font-bold ${tracking.avgDailyProtein < currentPlan.profile.targetProtein ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    {tracking.avgDailyProtein.toFixed(0)}g
                                </span>
                                <span className="text-xs text-slate-500">/ {currentPlan.profile.targetProtein}g req.</span>
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
                        <span className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">
                            NIVEL: {currentPlan.profile.activityLevel}
                        </span>
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
                            {daySummaries.map((day, dIdx) => (
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
                                                        ${(meal.estimatedCost * meal.portionMultiplier).toFixed(2)}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded">
                                                        {(meal.proteinGrams * meal.portionMultiplier).toFixed(0)}g Prot
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
                                                                    logId: meal.logId,
                                                                    originalRecipeName: meal.recipeName, 
                                                                    currentLogic: meal.selectionLogicCode, 
                                                                    currentPortion: meal.portionMultiplier
                                                                });
                                                                setReplaceReasonLogic(meal.selectionLogicCode);
                                                                setReplacePortion(meal.portionMultiplier.toString());
                                                                setReplaceAiReasoningText(meal.aiReasoning || "");
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
                                    <TrendingUp className="w-3 h-3"/> Razonamiento del Modelo
                                </h4>
                                {previewRecipe.aiReasoning && (
                                    <div className="mt-1">
                                        <p className="text-sm text-indigo-900/80 dark:text-indigo-300/80">"{previewRecipe.aiReasoning}"</p>
                                    </div>
                                )}
                            </div>
                            
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 px-1">Distribución Numérica</h4>
                            
                            <div className="grid grid-cols-2 gap-3 mb-6 px-1">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Costo Unitario</div>
                                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                        ${(previewRecipe.estimatedCost * previewRecipe.portionMultiplier).toFixed(2)}
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
                                    <span className="font-bold">{(previewRecipe.proteinGrams * previewRecipe.portionMultiplier).toFixed(1)}g</span>
                                </li>
                                <li className="text-sm text-slate-600 dark:text-slate-300 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <span>Energía / Kcal</span>
                                    </div>
                                    <span className="font-bold">{(previewRecipe.calories * previewRecipe.portionMultiplier).toFixed(1)} kcal</span>
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
                                {previewRecipe.aiReasoning && (
                                    <div className="mt-1">
                                        <p className="text-sm text-indigo-900/80 dark:text-indigo-300/80">"{previewRecipe.aiReasoning}"</p>
                                    </div>
                                )}
                            </div>
                            
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 px-1">Distribución Numérica</h4>
                            
                            <div className="grid grid-cols-2 gap-3 mb-6 px-1">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Costo Unitario</div>
                                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                        ${(previewRecipe.estimatedCost * previewRecipe.portionMultiplier).toFixed(2)}
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
                                    <span className="font-bold">{(previewRecipe.proteinGrams * previewRecipe.portionMultiplier).toFixed(1)}g</span>
                                </li>
                                <li className="text-sm text-slate-600 dark:text-slate-300 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <span>Energía / Kcal</span>
                                    </div>
                                    <span className="font-bold">{(previewRecipe.calories * previewRecipe.portionMultiplier).toFixed(1)} kcal</span>
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
