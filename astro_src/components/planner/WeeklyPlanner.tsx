import React, { useState, useEffect, useRef } from 'react';
import { 
    ChevronLeft, 
    ChevronRight, 
    Sparkles, 
    Search, 
    X,
    Lock,
    CalendarDays,
    User,
    Target,
    Activity,
    Wallet,
    Info,
    AlertCircle,
    CheckCircle2,
    RotateCcw
} from 'lucide-react';
import { useSettings } from '@context/SettingsContext';
import { useAuth } from '@context/AuthContext';
import { RecipeSidebar } from './RecipeSidebar';
import { ChefNoteCard } from './ChefNoteCard';
import { MealTrackingModal, type MealTrackingData } from './MealTrackingModal';
import { WeeklyCheckinModal } from './WeeklyCheckinModal';
import { PlannerDay } from './PlannerDay';
import { NutritionalSummary } from './NutritionalSummary';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { PlanResponse, Meal, GroupedMeals } from '@/types/planner';
import { db } from '@/lib/db';
import { generateUUIDv7 } from '@/lib/utils';

// ─── Helpers ───────────────────────────────────────────────────────────────

function getSundayOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
}

function addDays(date: Date, n: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

function formatDateToString(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

// The "editable window" is today through today+6 (next 7 days)
const editWindowEnd = addDays(today, 6);

function isDayEditable(date: Date): boolean {
    return true; // All days are editable as per user request
}

function CustomCalendarModal({ isOpen, onClose, selectedDate, onSelect, language }: { isOpen: boolean, onClose: () => void, selectedDate: Date, onSelect: (d: Date) => void, language: string }) {
    const [viewDate, setViewDate] = useState(selectedDate);

    useEffect(() => {
        if (isOpen) setViewDate(selectedDate);
    }, [isOpen, selectedDate]);

    if (!isOpen) return null;

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    
    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const monthName = viewDate.toLocaleDateString(language, { month: 'long', year: 'numeric' });
    const weekDays = language === 'es' ? ['D', 'L', 'M', 'M', 'J', 'V', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-background border border-border/50 shadow-2xl rounded-3xl p-6 w-[340px] relative animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"><ChevronLeft className="w-5 h-5"/></button>
                    <h3 className="font-bold text-foreground capitalize">{monthName}</h3>
                    <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"><ChevronRight className="w-5 h-5"/></button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(d => (
                        <div key={d} className="text-center text-xs font-bold text-muted-foreground">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-10 h-10" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
                        const isSelected = d.toDateString() === selectedDate.toDateString();
                        const isToday = d.toDateString() === new Date().toDateString();
                        return (
                            <button
                                key={i}
                                onClick={() => { onSelect(d); onClose(); }}
                                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm transition-all
                                    ${isSelected ? 'bg-primary text-primary-foreground font-bold shadow-md scale-105' : 
                                      isToday ? 'bg-primary/10 text-primary font-bold hover:bg-primary/20' : 
                                      'text-foreground hover:bg-muted font-medium'}
                                `}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Component ─────────────────────────────────────────────────────────────
export function WeeklyPlanner() {
    const { t, language } = useSettings();
    const { isAuthenticated } = useAuth();
    const [currentVisibleDate, setCurrentVisibleDate] = useState<Date>(today);
    const [futureDaysLimit, setFutureDaysLimit] = useState(30);
    
    // Generate calendar (-15 to +futureDaysLimit from today)
    const calendarDays = React.useMemo(() => {
        const start = addDays(today, -15);
        return Array.from({ length: 16 + futureDaysLimit }, (_, i) => addDays(start, i));
    }, [futureDaysLimit]);
    const [planData, setPlanData] = useState<PlanResponse | null>(null);
    const [groupedMeals, setGroupedMeals] = useState<GroupedMeals>({});

    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [pendingMealSlot, setPendingMealSlot] = useState<{ date: string, type: string } | null>(null);
    const [isDraggingRecipe, setIsDraggingRecipe] = useState(false);
    const [draggingRecipeData, setDraggingRecipeData] = useState<any | null>(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Block background scroll when sidebar is open
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isSidebarOpen]);
    const dayPillsContainerRef = useRef<HTMLDivElement>(null);
    const targetScrollDateRef = useRef<Date>(today);
    const lastClickTimeRef = useRef<number>(0);
    const longPressTimerRef = useRef<any>(null);
    const startPosRef = useRef({ x: 0, y: 0 });

    // View Mode State
    const [viewMode, setViewMode] = useState<'WEEK' | 'DAY'>('DAY');
    const [selectedDateIndex, setSelectedDateIndex] = useState<number>(15); // Default to today (index 15)

    // AI & Tracking States
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiChefMessage, setAiChefMessage] = useState<string | null>(null);
    const [selectedMeal, setSelectedMeal] = useState<MealTrackingData | null>(null);
    const [isCheckinOpen, setIsCheckinOpen] = useState(false);
    
    // AI Consent State
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [consentGiven, setConsentGiven] = useState(false);
    const [totalSpent, setTotalSpent] = useState(0);
    const [notification, setNotification] = useState<{ 
        title: string; 
        message: string; 
        type: 'info' | 'error' | 'success' | 'warning';
        btnText?: string;
    } | null>(null);

    const [hasLocalChanges, setHasLocalChanges] = useState(false);
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

    // Custom Pointer Drag Logic (for Mobile/Tablet)
    useEffect(() => {
        const onPointerMove = (e: PointerEvent) => {
            // Cancel long press if moved significantly
            if (longPressTimerRef.current && !draggingRecipeData) {
                const dist = Math.sqrt(Math.pow(e.clientX - startPosRef.current.x, 2) + Math.pow(e.clientY - startPosRef.current.y, 2));
                if (dist > 40) { // Increased threshold to 40px to allow for natural finger movement during long press
                    clearTimeout(longPressTimerRef.current);
                    longPressTimerRef.current = null;
                }
            }

            if (!draggingRecipeData) return;

            setDragPosition({ x: e.clientX, y: e.clientY });
            if (!isDraggingRecipe) {
                setIsDraggingRecipe(true);
                setIsSidebarOpen(false);
            }
        };

        const onPointerUp = (e: PointerEvent) => {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }

            if (isDraggingRecipe && draggingRecipeData) {
                // Find drop target
                const elements = document.elementsFromPoint(e.clientX, e.clientY);
                const slot = elements.find(el => el.hasAttribute('data-slot-date')) as HTMLElement;
                if (slot) {
                    const date = slot.getAttribute('data-slot-date')!;
                    const type = slot.getAttribute('data-slot-type')!;
                    const id = slot.getAttribute('data-slot-id') || undefined;
                    handleSelectRecipeForSlot(draggingRecipeData, date, type, id);
                }
            }
            setDraggingRecipeData(null);
            setIsDraggingRecipe(false);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
        };
    }, [draggingRecipeData, isDraggingRecipe]);

    const handlePointerDown = (e: React.PointerEvent, recipe: any) => {
        startPosRef.current = { x: e.clientX, y: e.clientY };
        
        if (e.pointerType === 'touch') {
            // Clear any existing timer
            if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
            
            longPressTimerRef.current = setTimeout(() => {
                setDraggingRecipeData(recipe);
                setDragPosition({ x: e.clientX, y: e.clientY });
                setIsDraggingRecipe(true);
                setIsSidebarOpen(false);
                if (window.navigator.vibrate) window.navigator.vibrate([60, 40, 60]); // Distinct double vibration
                longPressTimerRef.current = null;
            }, 1200); // 1.2s long press as requested by user
        } else {
            setDraggingRecipeData(recipe);
            setDragPosition({ x: e.clientX, y: e.clientY });
        }
    };

    // Touch Drag and Drop Polyfill
    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            const draggable = (e.target as HTMLElement).closest('[draggable="true"]');
            if (!draggable) return;

            // We don't want to prevent default for all touches, only for drag candidates
            // But we need to handle the drag manually on touch
        };

        // Note: For simplicity and reliability without a full library, 
        // we'll rely on the "Selection Mode" as the primary touch path, 
        // but we'll improve the Selection Mode to handle the "notch" click as a "drag-like" experience.
        // However, to satisfy the specific request of "allowing dragging from notch",
        // we'll add a simple pointer-based ghosting if we detect a drag-like movement.
    }, []);

    const handleSelectRecipeForSlot = async (recipe: any, date?: string, type?: string, mealIdToReplace?: string) => {
        const targetDate = date || pendingMealSlot?.date;
        const targetType = type || pendingMealSlot?.type;

        if (!targetDate || !targetType) return;

        // Determine if we should replace an existing meal
        let idToUpdate = mealIdToReplace;
        
        // If no explicit ID to replace, check if the slot is a main meal and already occupied
        if (!idToUpdate && ['BREAKFAST', 'LUNCH', 'DINNER'].includes(targetType.toUpperCase())) {
            const existingMainMeal = await db.plannedMeals
                .where({ mealDate: targetDate, mealType: targetType.toUpperCase() })
                .filter(m => m.isDeleted === 0)
                .first();
            if (existingMainMeal) idToUpdate = existingMainMeal.id;
        }

        try {
            if (idToUpdate) {
                // UPDATE existing meal
                await db.plannedMeals.update(idToUpdate, {
                    recipeUUID: recipe.publicId || recipe.id,
                    recipeName: recipe.name,
                    imageUrl: recipe.imageUrl,
                    proteinGrams: recipe.proteinGrams || 0,
                    calories: recipe.calories || 0,
                    estimatedCost: recipe.estimatedCost || 0,
                    isSynced: 0,
                    isDeleted: 0
                });
            } else {
                // ADD new meal
                const newMeal = {
                    id: generateUUIDv7(),
                    planId: planData?.planId || null,
                    recipeUUID: recipe.publicId || recipe.id,
                    recipeName: recipe.name,
                    imageUrl: recipe.imageUrl,
                    mealDate: targetDate,
                    mealType: targetType.toUpperCase() as any,
                    portionMultiplier: 1.0,
                    proteinGrams: recipe.proteinGrams || 0,
                    calories: recipe.calories || 0,
                    estimatedCost: recipe.estimatedCost || 0,
                    pantryUsage: 0,
                    selectionLogicCode: 'PROTEIN_FILL' as any,
                    aiReasoning: 'Manual addition',
                    isSynced: 0,
                    isDeleted: 0,
                    isNew: 1
                };
                await db.plannedMeals.add(newMeal);
            }
            
            // Reconstruct plan data with the changes
            const allMeals = await db.plannedMeals.where('isDeleted').equals(0).toArray();
            
            setPlanData(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    meals: allMeals
                };
            });

            setPendingMealSlot(null);
            setIsSidebarOpen(false);

            setNotification({
                title: idToUpdate 
                    ? (language === 'es' ? '¡Receta Sustituida!' : 'Recipe Replaced!') 
                    : (language === 'es' ? '¡Receta Añadida!' : 'Recipe Added!'),
                message: language === 'es' ? `Se actualizó con "${recipe.name}".` : `Updated with "${recipe.name}".`,
                type: 'success'
            });
        } catch (err) {
            console.error("Error managing meal:", err);
        }
    };
    
    const handleDeleteMeal = async (mealId: string) => {
        try {
            const meal = await db.plannedMeals.get(mealId);
            if (!meal) return;

            if (meal.isNew === 1) {
                // Manual addition -> Permanent delete
                await db.plannedMeals.delete(mealId);
            } else {
                // Original recipe -> Soft delete
                await db.plannedMeals.update(mealId, { isDeleted: 1, isSynced: 0 });
            }
            
            // Update local state
            const allMeals = await db.plannedMeals.where('isDeleted').equals(0).toArray();
            setPlanData(prev => prev ? { ...prev, meals: allMeals } : null);
            
            setNotification({
                title: language === 'es' ? 'Receta Quitada' : 'Recipe Removed',
                message: language === 'es' ? 'Se ha eliminado la receta del plan.' : 'The recipe has been removed from the plan.',
                type: 'info'
            });
        } catch (err) {
            console.error("Error deleting meal:", err);
        }
    };

    // Detect local changes
    useEffect(() => {
        const checkLocalChanges = async () => {
            if (!planData?.planId) return;
            const changes = await db.plannedMeals
                .where('planId').equals(planData.planId)
                .filter(m => m.isSynced === 0 || m.isDeleted === 1)
                .count();
            setHasLocalChanges(changes > 0);
        };
        checkLocalChanges();
    }, [planData]);

    const handleRestorePlan = () => {
        setShowRestoreConfirm(true);
    };

    const confirmRestorePlan = async () => {
        try {
            setShowRestoreConfirm(false);
            setIsGenerating(true); // Show loading state
            
            // 1. Restore deleted meals by setting isDeleted: 0 and isSynced: 1 
            const modified = await db.plannedMeals
                .where('planId').equals(planData?.planId || 0)
                .filter(m => m.isDeleted === 1 || m.isSynced === 0)
                .toArray();
            
            for (const m of modified) {
                await db.plannedMeals.update(m.id, { isDeleted: 0, isSynced: 1 });
            }

            // 2. Force re-fetch (this will handle clearing manual additions)
            await fetchPlan(true);
            
            setNotification({
                title: language === 'es' ? 'Plan Restaurado' : 'Plan Restored',
                message: language === 'es' ? 'Se ha recuperado la versión original del servidor.' : 'The original server version has been recovered.',
                type: 'success'
            });
        } catch (err) {
            console.error("Error restoring plan:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const fetchPlan = async (force: boolean = false) => {
        try {
            const response = await fetch('/api/proxy/planner');
            if (response.ok) {
                const data: PlanResponse = await response.json();
                
                // 1. Save metadata separately
                const { meals, ...metadata } = data;
                await db.planMetadata.put({
                    ...metadata,
                    lastUpdated: new Date().toISOString()
                });

                // 2. Save individual meals
                // We overwrite existing meals for this plan if they are already synced or if force is true
                for (const meal of meals) {
                    const existing = await db.plannedMeals
                        .filter(m => m.logId === meal.logId || (m.planId === data.planId && m.mealDate === meal.mealDate && m.mealType === meal.mealType))
                        .first();

                    if (existing) {
                        // Only overwrite if it hasn't been modified locally (isSynced === 1) OR if force is true
                        if (existing.isSynced === 1 || force) {
                            await db.plannedMeals.update(existing.id, {
                                ...meal,
                                planId: data.planId,
                                isSynced: 1,
                                isDeleted: 0
                            });
                        }
                    } else {
                        // New meal from backend
                        await db.plannedMeals.add({
                            ...meal,
                            id: generateUUIDv7(),
                            planId: data.planId,
                            isSynced: 1,
                            isDeleted: 0,
                            isNew: 0
                        });
                    }
                }
                
                // 3. Final cleanup: reset deletion flags for any meal that is in the backend response
                // but marked as deleted locally
                if (force) {
                    // Manual additions are PRESERVED as per user preference
                }
                
                // Update state
                const allMeals = await db.plannedMeals.where('isDeleted').equals(0).toArray();
                const reconstructedPlan: PlanResponse = {
                    ...metadata,
                    meals: allMeals
                };

                setPlanData(prev => {
                    if (prev?.status === 'GENERATING' && data.status === 'COMPLETED') {
                        setTimeout(() => {
                            setNotification({
                                title: language === 'es' ? '¡Plan Listo!' : 'Plan Ready!',
                                message: language === 'es' ? '¡Tu plan de comidas inteligente está listo!' : 'Your smart meal plan is ready!',
                                type: 'success'
                            });
                        }, 500);
                    }
                    return reconstructedPlan;
                });
            } else {
                console.error('Failed to fetch plan:', response.status);
                await fallbackToLocal();
            }
        } catch (err) {
            console.error('Error fetching plan:', err);
            await fallbackToLocal();
        }
    };

    const fallbackToLocal = async () => {
        const allMetadata = await db.planMetadata.toArray();
        if (allMetadata.length > 0) {
            const latestMetadata = allMetadata.sort((a, b) => b.planId - a.planId)[0];
            const allMeals = await db.plannedMeals.where('isDeleted').equals(0).toArray();
            
            setPlanData({
                ...latestMetadata,
                meals: allMeals
            } as PlanResponse);
        }
    };

    useEffect(() => {
        const bootstrap = async () => {
            // Initial fast load from local DB
            await fallbackToLocal();
            // Refresh from backend
            fetchPlan();
        };

        bootstrap();
        const hasSeenPlannerGuide = document.cookie.includes('seen_planner_guide=true');
        if (!hasSeenPlannerGuide) setShowOnboarding(true);
    }, []);

    // Polling effect
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (planData?.status === 'GENERATING') {
            const hasMeals = planData?.meals && planData.meals.length > 0;
            const delay = hasMeals ? 60 * 60 * 1000 : 60 * 1000; // 1 hr if has meals, else 1 min
            interval = setInterval(() => {
                fetchPlan();
            }, delay);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [planData?.status]);



    const dismissOnboarding = () => {
        setShowOnboarding(false);
        document.cookie = "seen_planner_guide=true; path=/; max-age=31536000; samesite=lax";
    };

    // Group meals by date
    useEffect(() => {
        if (planData?.meals) {
            const grouped = planData.meals.reduce((acc: GroupedMeals, meal: Meal) => {
                const day = meal.mealDate;

                if (!acc[day]) acc[day] = [];
                acc[day].push(meal);
                return acc;
            }, {});
            
            // Sort meals to interleave SNACKs
            Object.keys(grouped).forEach(day => {
                const dayMeals = grouped[day];
                const breakfasts = dayMeals.filter(m => m.mealType.toUpperCase() === 'BREAKFAST');
                const lunches = dayMeals.filter(m => m.mealType.toUpperCase() === 'LUNCH');
                const dinners = dayMeals.filter(m => m.mealType.toUpperCase() === 'DINNER');
                const snacks = dayMeals.filter(m => m.mealType.toUpperCase() === 'SNACK');
                const others = dayMeals.filter(m => !['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].includes(m.mealType.toUpperCase()));

                const sorted = [];
                if (breakfasts.length) sorted.push(...breakfasts);
                
                const snacksBeforeLunch = Math.ceil(snacks.length / 2);
                for (let i = 0; i < snacksBeforeLunch; i++) {
                    if (snacks.length) sorted.push(snacks.shift()!);
                }

                if (lunches.length) sorted.push(...lunches);

                while(snacks.length) {
                    sorted.push(snacks.shift()!);
                }

                if (dinners.length) sorted.push(...dinners);
                sorted.push(...others);

                grouped[day] = sorted;
            });

            setGroupedMeals(grouped);
        }
    }, [planData]);

    // Initialize scroll to today
    useEffect(() => {
        const t = setTimeout(() => scrollToDate(today, 'auto'), 100);
        return () => clearTimeout(t);
    }, []);

    const scrollToDate = (date: Date, behavior: ScrollBehavior = 'smooth') => {
        targetScrollDateRef.current = date;
        lastClickTimeRef.current = Date.now();
        
        const dateStr = formatDateToString(date);

        if (viewMode === 'DAY') {
            const dateMidnight = new Date(date);
            dateMidnight.setHours(0,0,0,0);
            const idx = calendarDays.findIndex(d => d.getTime() === dateMidnight.getTime());
            if (idx !== -1) {
                setSelectedDateIndex(idx);
                setTimeout(() => {
                    const pill = document.getElementById(`day-pill-${dateStr}`);
                    if (pill && dayPillsContainerRef.current) {
                        const container = dayPillsContainerRef.current;
                        container.scrollTo({
                            left: pill.offsetLeft - container.offsetLeft - container.clientWidth / 2 + pill.clientWidth / 2,
                            behavior
                        });
                    }
                }, 50);
            }
        }

        const element = document.getElementById(`day-${dateStr}`);
        if (element && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollPos = element.offsetLeft - container.offsetLeft;
            container.scrollTo({ left: scrollPos, behavior });
        }
        setCurrentVisibleDate(date);
    };

    const handleScroll = () => {
        if (scrollContainerRef.current && scrollContainerRef.current.children.length > 0) {
            const { scrollLeft, children } = scrollContainerRef.current;

            // Fast math calculation for the visible day to avoid layout thrashing
            const childWidth = (children[0] as HTMLElement).offsetWidth;
            const gap = 20; // 20px for gap-5
            const idx = Math.max(0, Math.min(calendarDays.length - 1, Math.floor((scrollLeft + 10) / (childWidth + gap))));
            const newDate = calendarDays[idx];
            
            // Expand calendar if approaching the end (e.g. 5 days away)
            if (idx > calendarDays.length - 5) {
                setFutureDaysLimit(prev => prev + 30);
            }
            
            // Only update state if month or year changes to prevent massive re-renders while scrolling
            if (newDate && 
               (newDate.getMonth() !== currentVisibleDate.getMonth() || 
                newDate.getFullYear() !== currentVisibleDate.getFullYear())) {
                setCurrentVisibleDate(newDate);
            }
        }
    };

    const getCurrentScrollDate = () => {
        if (!scrollContainerRef.current || !scrollContainerRef.current.children.length) return currentVisibleDate;
        const { scrollLeft } = scrollContainerRef.current;
        const childWidth = (scrollContainerRef.current.children[0] as HTMLElement).offsetWidth;
        const idx = Math.max(0, Math.min(calendarDays.length - 1, Math.floor((scrollLeft + 10) / (childWidth + 20))));
        return calendarDays[idx];
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const dayWidth = container.querySelector('.group\\/day')?.clientWidth || 320;
            const gap = 20;
            container.scrollBy({
                left: direction === 'left' ? -(dayWidth + gap) : (dayWidth + gap),
                behavior: 'smooth'
            });
        }
    };

    const handleNextWeek = () => {
        const baseDate = (Date.now() - lastClickTimeRef.current < 500) ? targetScrollDateRef.current : getCurrentScrollDate();
        scrollToDate(addDays(baseDate, 7), 'auto');
    };
    const handlePrevWeek = () => {
        const baseDate = (Date.now() - lastClickTimeRef.current < 500) ? targetScrollDateRef.current : getCurrentScrollDate();
        scrollToDate(addDays(baseDate, -7), 'auto');
    };

    const formatDateRange = () => {
        const opts: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
        return currentVisibleDate.toLocaleDateString(language, opts);
    };

    // ─── AI Generation (Concierge) ───
    // ─── AI Generation (Service) ───
    const handleGenerateAI = () => {
        setConsentGiven(false);
        setShowConsentModal(true);
    };

    const confirmGeneration = async () => {
        setShowConsentModal(false);

        console.log("AI Generation requested with consent:", consentGiven);
        setIsGenerating(true);
        
        try {
            const response = await fetch('/api/proxy/planner/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({}) // Sending empty object as requested
            });
            
            const text = await response.text();
            let data: any = {};
            try { data = JSON.parse(text); } catch(e) {}
            
            if (response.status === 409) {
                if (data.message?.includes('coins')) {
                    setNotification({
                        title: language === 'es' ? 'Límite de Generación' : 'Generation Limit',
                        message: language === 'es' 
                            ? 'Ya generaste tu menú para esta semana o utilizaste tus Cacomi coins para generar recetas con IA y no tienes suficientes para el plan.' 
                            : 'You have already generated your menu for this week or used your Cacomi coins to generate recipes with AI and do not have enough left for the plan.',
                        type: 'warning'
                    });
                } else if (data.message?.includes('metas')) {
                    setNotification({
                        title: language === 'es' ? 'Perfil Incompleto' : 'Incomplete Profile',
                        message: language === 'es' 
                            ? 'Aún no completas tu información nutricional o perfil. (Próximamente: Formulario de perfil)' 
                            : 'You have not yet completed your nutritional information or profile. (Coming soon: Profile form)',
                        type: 'info'
                    });
                } else {
                    setNotification({
                        title: 'Error',
                        message: data.message || 'Error de conflicto al solicitar la generación del plan.',
                        type: 'error'
                    });
                }
                return;
            }
            
            // Success
            await fetchPlan();
        } catch (error) {
            console.error("Error generating plan:", error);
            setNotification({
                title: 'Error',
                message: language === 'es' ? "Error de conexión al solicitar el plan." : "Connection error while requesting plan.",
                type: 'error'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveMealTracking = (mealPlanRecipeId: number, data: any) => {
        console.log("Tracking Guardado (PATCH API):", mealPlanRecipeId, data);
        // In a real app, optimistically update the `plan` state
        setSelectedMeal(null);
    };

    const handleSaveCheckin = (data: any) => {
        console.log("Check-in Guardado (POST API):", data);
        setIsCheckinOpen(false);
    };

    // Mini calendar change handler
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            const parts = e.target.value.split('-');
            const d = new Date(Number(parts[0]), Number(parts[1])-1, Number(parts[2]));
            scrollToDate(d, 'auto');
        }
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-10 md:py-14 animate-in fade-in duration-500 relative">

            {/* ── Ambient glow ── */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            {/* ── CONCIERGE LOADING SCREEN ── */}
            {isGenerating && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="flex flex-col items-center max-w-sm text-center">
                        <div className="relative mb-8">
                            <div className="w-20 h-20 bg-primary/20 rounded-full animate-ping absolute inset-0 mx-auto" />
                            <div className="w-20 h-20 bg-primary rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center relative z-10 animate-pulse">
                                <Sparkles className="w-10 h-10 text-primary-foreground" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">
                            {t.planner?.concierge?.loading || 'Nuestros chefs están diseñando tu menú...'}
                        </h2>
                        <p className="text-muted-foreground">Por favor espera un momento mientras procesamos tus preferencias.</p>
                    </div>
                </div>
            )}

            {/* ── ONBOARDING ── */}
            {showOnboarding && !isGenerating && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-background border border-border/50 shadow-2xl rounded-3xl p-10 max-w-md w-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">{t.announcement?.title}</h2>
                            <p className="text-muted-foreground leading-relaxed mb-8">{t.announcement?.desc}</p>
                            <button
                                onClick={dismissOnboarding}
                                className="w-full py-3.5 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
                            >
                                {t.announcement?.btn}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── AI CONSENT MODAL ── */}
            {showConsentModal && (
                <div 
                    className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowConsentModal(false);
                    }}
                >
                    <div className="bg-background border border-border/50 shadow-2xl rounded-3xl p-8 max-w-md w-full relative">
                        <button onClick={() => setShowConsentModal(false)} className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 text-primary">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold mb-3">{t.planner?.consent?.title || 'Entrenamiento de IA'}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            {t.planner?.consent?.desc || 'Para ofrecerte mejores planes cada semana, analizamos y entrenamos nuestros modelos con los resultados generados.'}
                        </p>

                        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-4">
                            <p className="text-[10px] text-destructive font-bold uppercase tracking-wider mb-1">⚠️ Atención</p>
                            <p className="text-[11px] text-foreground/70 leading-normal">
                                {language === 'es'
                                    ? 'Generar un nuevo plan sobrescribirá o eliminará cualquier receta que hayas seleccionado previamente en esta semana.'
                                    : 'Generating a new plan will overwrite or delete any recipes you have previously selected for this week.'}
                            </p>
                        </div>
                        
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6">
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mb-1">Próximamente</p>
                            <p className="text-[11px] text-foreground/70 leading-normal">
                                {language === 'es'
                                    ? 'El respeto estricto al presupuesto semanal y la fijación de recetas favoritas están en desarrollo y llegarán pronto.'
                                    : 'Strict weekly budget adherence and pinning favorite recipes are in development and coming soon.'}
                            </p>
                        </div>
                        
                        <label className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors mb-6 group">
                            <input 
                                type="checkbox" 
                                checked={consentGiven}
                                onChange={(e) => setConsentGiven(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background"
                            />
                            <span className="text-xs text-muted-foreground/90 leading-relaxed font-medium group-hover:text-foreground transition-colors">
                                {t.planner?.consent?.checkbox || 'Acepto que mis datos anonimizados sean usados y supervisados por un humano para mejorar el modelo de IA de Cacomi.'}
                            </span>
                        </label>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowConsentModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                            >
                                {t.planner?.consent?.cancelBtn || 'Cancelar'}
                            </button>
                            <button 
                                onClick={confirmGeneration}
                                disabled={!consentGiven}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t.planner?.consent?.acceptBtn || 'Aceptar y Generar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── NOTIFICATION MODAL ── */}
            {notification && (
                <div 
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in"
                    onClick={() => setNotification(null)}
                >
                    <div 
                        className="bg-background border border-border/50 shadow-2xl rounded-3xl p-8 max-w-md w-full relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 
                            ${notification.type === 'error' ? 'bg-destructive/10 text-destructive' : 
                              notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 
                              notification.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
                              'bg-primary/10 text-primary'}`}
                        >
                            {notification.type === 'error' && <AlertCircle className="w-7 h-7" />}
                            {notification.type === 'success' && <CheckCircle2 className="w-7 h-7" />}
                            {notification.type === 'warning' && <AlertCircle className="w-7 h-7" />}
                            {notification.type === 'info' && <Info className="w-7 h-7" />}
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-3">{notification.title}</h2>
                        <p className="text-muted-foreground leading-relaxed mb-8 whitespace-pre-wrap">
                            {notification.message}
                        </p>
                        
                        <button
                            onClick={() => setNotification(null)}
                            className={`w-full py-3.5 rounded-full font-bold active:scale-[0.98] transition-all shadow-lg 
                                ${notification.type === 'error' ? 'bg-destructive text-destructive-foreground shadow-destructive/25' : 
                                  notification.type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-600/25' : 
                                  'bg-primary text-primary-foreground shadow-primary/25'}`}
                        >
                            {notification.btnText || (language === 'es' ? 'Entendido' : 'Got it')}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Confirmation Modal for Restore ── */}
            <Modal
                isOpen={showRestoreConfirm}
                onClose={() => setShowRestoreConfirm(false)}
                title={language === 'es' ? 'Recuperar Plan Original' : 'Recover Original Plan'}
            >
                <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                        <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-bold text-primary uppercase tracking-wider">
                                {language === 'es' ? 'Recuperar recetas' : 'Recover recipes'}
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {language === 'es' 
                                    ? 'Esta acción volverá a mostrar todas las recetas originales generadas por la IA que hayas quitado. Tus recetas añadidas manualmente se mantendrán intactas.'
                                    : 'This action will show all original AI-generated recipes you removed. Your manually added recipes will remain intact.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button 
                            onClick={confirmRestorePlan}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-none h-12 text-sm font-black uppercase tracking-widest"
                        >
                            {language === 'es' ? 'Sí, recuperar originales' : 'Yes, recover originals'}
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => setShowRestoreConfirm(false)}
                            className="w-full h-12 text-sm font-bold opacity-60 hover:opacity-100"
                        >
                            {language === 'es' ? 'Cancelar' : 'Cancel'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ── NOTCH ── */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                aria-label={t.planner?.exploreRecipes}
                className="xl:hidden fixed right-0 top-1/2 -translate-y-1/2 z-[60]
                           flex flex-col items-center justify-center gap-3
                           bg-primary text-primary-foreground
                           w-11 h-36 rounded-l-[2rem]
                           shadow-[0_6px_28px_rgba(0,0,0,0.25)]
                           hover:w-14 transition-[width] duration-200 group"
            >
                <Search className="w-5 h-5 shrink-0" />
                <ChevronLeft className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* ── SIDEBAR DRAWER ── */}
            <div
                className={`fixed inset-0 z-[70] transition-all duration-300 xl:hidden
                            ${isSidebarOpen ? (isDraggingRecipe ? 'bg-transparent' : 'bg-black/50 backdrop-blur-sm') : 'bg-transparent'} 
                            ${isSidebarOpen && !isDraggingRecipe ? 'pointer-events-auto' : 'pointer-events-none'}`}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        setIsSidebarOpen(false);
                        setPendingMealSlot(null);
                    }
                }}
            >
                <div className={`absolute right-0 top-0 bottom-0 w-[min(100vw,600px)] bg-background
                                 flex flex-col shadow-2xl
                                 transition-all duration-500
                                 ${(isSidebarOpen && !isDraggingRecipe) ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95 pointer-events-none'}`}>
                    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md px-6 py-4 border-b border-border/40 flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Search className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-widest">{t.planner?.exploreRecipes}</h2>
                                {pendingMealSlot && (
                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1 animate-pulse">
                                        {language === 'es' ? 'Seleccionando para' : 'Selecting for'} {pendingMealSlot.type}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {pendingMealSlot && (
                                <button 
                                    onClick={() => {
                                        setPendingMealSlot(null);
                                        setIsSidebarOpen(false);
                                    }}
                                    className="px-3 py-1.5 bg-muted text-muted-foreground hover:text-foreground rounded-lg text-[10px] font-bold transition-colors"
                                >
                                    {language === 'es' ? 'Cancelar' : 'Cancel'}
                                </button>
                            )}
                            <button onClick={() => { setIsSidebarOpen(false); setPendingMealSlot(null); }} className="p-2 bg-muted/60 rounded-xl hover:bg-muted transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden px-4 md:px-6 pb-2">
                        <RecipeSidebar 
                            isMobile 
                            selectionMode={!!pendingMealSlot}
                            onSelectRecipe={(recipe) => handleSelectRecipeForSlot(recipe)}
                            onDragStateChange={(isDragging) => setIsDraggingRecipe(isDragging)}
                            onPointerDown={handlePointerDown}
                        />
                    </div>
                </div>
            </div>

            {/* ── MAIN LAYOUT ── */}
            <div className="relative z-10 flex flex-col gap-8">
                
                {/* ─── Header & Profile (Horizontal Dense Layout) ─── */}
                    <div className="flex flex-col gap-5 pb-6 border-b border-border/30">
                        {/* Top Row: Title & Actions */}
                        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black border border-primary/20 mb-2 shadow-sm w-fit">
                                    <CalendarDays className="w-3 h-3" />
                                    <span className="uppercase tracking-widest leading-none">{t.nav?.beta || 'BETA'}</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-foreground">
                                    {t.planner?.title}
                                </h1>
                                <p className="text-muted-foreground text-sm font-medium mt-1.5">
                                    {formatDateRange()}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* View Toggle */}
                                <div className="flex items-center bg-muted/50 p-1.5 rounded-xl border border-border/50 shadow-inner">
                                    <button 
                                        onClick={() => {
                                            setViewMode('DAY');
                                            const todayMidnight = new Date();
                                            todayMidnight.setHours(0, 0, 0, 0);
                                            const todayIdx = calendarDays.findIndex(d => d.getTime() === todayMidnight.getTime());
                                            if (todayIdx !== -1) setSelectedDateIndex(todayIdx);
                                            else setSelectedDateIndex(15);
                                        }}
                                        className={`px-3.5 py-1.5 text-xs sm:text-sm font-black rounded-lg transition-all ${viewMode === 'DAY' ? 'bg-background shadow-md text-primary ring-1 ring-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-background/40'}`}
                                    >
                                        {t.planner?.byDay || 'Día'}
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('WEEK')}
                                        className={`px-3.5 py-1.5 text-xs sm:text-sm font-black rounded-lg transition-all ${viewMode === 'WEEK' ? 'bg-background shadow-md text-primary ring-1 ring-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-background/40'}`}
                                    >
                                        {t.planner?.byWeek || 'Semana'}
                                    </button>
                                </div>

                                {/* AI Button */}
                                <div className="relative">
                                    {planData?.status === 'GENERATING' ? (
                                        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl font-bold text-sm border border-primary/20">
                                            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                            {language === 'es' ? 'Generando...' : 'Generating...'}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleGenerateAI}
                                            disabled={isGenerating || !isAuthenticated}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:scale-100 disabled:shadow-none group"
                                        >
                                            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                            {t.planner?.generateAI}
                                        </button>
                                    )}
                                </div>

                                {/* AI Info & Disclaimers */}
                                <div className="group relative">
                                    <button className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted/40 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                                        <Info className="w-4 h-4" />
                                    </button>
                                    
                                    {/* Tooltip / Popover Content */}
                                    <div className="absolute top-full right-0 mt-2 w-[280px] sm:w-[320px] p-4 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-active:opacity-100 group-active:visible transition-all z-[100] cursor-default">
                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/70 leading-none">IA Transparente</p>
                                                    <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                                        {t.planner?.aiDisclaimer}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-px bg-border/40" />
                                            <div className="flex gap-3">
                                                <Wallet className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/80 dark:text-emerald-400/80 leading-none">Precios Estimados</p>
                                                    <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 leading-relaxed font-medium">
                                                        {t.planner?.priceDisclaimer}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Arrow */}
                                        <div className="absolute -top-1.5 right-3 w-3 h-3 bg-background border-t border-l border-border/50 rotate-45" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row: Profile & Nutrition */}
                        {planData && (
                            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center animate-in fade-in duration-300">
                                {/* Profile Overview */}
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-4 py-2 bg-muted/20 border border-border/30 rounded-xl text-xs text-muted-foreground font-medium w-fit">
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-primary" /> 
                                        <span className="text-foreground font-bold">{t.planner?.profileOverview || 'Perfil'}:</span>
                                        <span>{planData.heightCm}cm, {planData.currentWeight}kg</span>
                                    </div>
                                    
                                    <div className="w-1 h-1 rounded-full bg-border" />
                                    
                                    <div className="flex items-center gap-1.5">
                                        <Target className="w-3.5 h-3.5 text-primary" /> 
                                        <span className="uppercase tracking-widest text-[9px] font-bold">{planData.goal?.replace('_', ' ')}</span>
                                    </div>

                                    <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />
                                    
                                    <div className="flex items-center gap-1.5 hidden sm:flex">
                                        <Activity className="w-3.5 h-3.5 text-primary" /> 
                                        <span className="uppercase tracking-widest text-[9px] font-bold">{planData.activityLevel?.replace('_', ' ')}</span>
                                    </div>
                                </div>

                                {/* Nutrition and Cost Summary */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <NutritionalSummary 
                                        isHorizontal 
                                        targetCalories={planData?.targetCalories}
                                        targetProtein={planData?.targetProtein}
                                        meals={planData?.meals || []}
                                    />
                                    {totalSpent > 0 && (
                                        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-100 dark:border-emerald-500/20 rounded-xl shadow-sm transition-colors">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                                <Wallet className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400/80 uppercase tracking-widest leading-none mb-0.5">
                                                    {language === 'es' ? 'Costo' : 'Cost'}
                                                </p>
                                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tabular-nums leading-none">
                                                    ${totalSpent.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {!isAuthenticated && (
                            <div className="mt-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl w-fit flex items-center gap-3 shadow-sm">
                                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                                <div>
                                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold leading-none">
                                        {language === 'es' ? '¿Cansado de planificar?' : 'Tired of planning?'}
                                    </p>
                                    <a href="/login" className="text-[9px] text-indigo-500 font-black uppercase tracking-widest hover:underline mt-1 inline-block">
                                        {language === 'es' ? 'Desbloquea Menú Inteligente Gratis' : 'Unlock Free Smart Menu'} <ChevronRight className="w-2.5 h-2.5 inline -mt-0.5" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ─── Week Navigation Bar ─── */}
                    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                        <div className="flex items-center gap-2">
                            {/* Prev */}
                            <button
                                onClick={handlePrevWeek}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/50 bg-background
                                           text-sm font-medium text-muted-foreground shrink-0
                                           hover:border-primary/40 hover:text-primary transition-all shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.planner?.prevWeek || 'Anterior'}</span>
                            </button>

                            {/* Mini Calendar / Center Label */}
                            <button
                                onClick={() => setIsCalendarOpen(true)}
                                className="relative overflow-hidden rounded-full border border-border/50 bg-background hover:border-primary/40 transition-all shadow-sm flex items-center justify-center cursor-pointer"
                            >
                                <div className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-foreground">
                                    <CalendarDays className="w-4 h-4 text-primary" />
                                    <span>Calendario</span>
                                </div>
                            </button>

                            {/* Next */}
                            <button
                                onClick={handleNextWeek}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/50 bg-background
                                           text-sm font-medium text-muted-foreground shrink-0
                                           hover:border-primary/40 hover:text-primary transition-all shadow-sm"
                            >
                                <span className="hidden sm:inline">{t.planner?.nextWeek || 'Siguiente'}</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Restore button */}
                        {hasLocalChanges && (
                            <button
                                onClick={handleRestorePlan}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full
                                           border border-amber-500/40 bg-amber-500/5 text-amber-600 dark:text-amber-400
                                           text-sm font-bold shrink-0
                                           hover:bg-amber-500/10 hover:border-amber-500/60
                                           active:scale-95 transition-all shadow-sm ml-auto"
                            >
                                <RotateCcw className="w-4 h-4" />
                                {language === 'es' ? 'Restaurar' : 'Restore'}
                            </button>
                        )}

                        {/* Today button */}
                        <button
                            onClick={() => scrollToDate(today, 'auto')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full
                                       border border-primary/40 bg-primary/5 text-primary
                                       text-sm font-bold shrink-0
                                       hover:bg-primary/10 hover:border-primary/60
                                       active:scale-95 transition-all shadow-sm ${hasLocalChanges ? 'ml-0' : 'ml-auto'} xl:mr-[360px]`}
                        >
                            {t.planner?.today || 'Hoy'}
                        </button>
                    </div>


                    {/* ─── Chef Note ─── */}
                    {aiChefMessage && <ChefNoteCard message={aiChefMessage} />}

                    {viewMode === 'DAY' && (
                        <div 
                            ref={dayPillsContainerRef}
                            className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide scroll-smooth touch-pan-x"
                        >
                            {calendarDays.map((date, idx) => {
                                const isSelected = idx === selectedDateIndex;
                                const isTodayDate = date.toDateString() === new Date().toDateString();
                                return (
                                    <button
                                        key={idx}
                                        id={`day-pill-${formatDateToString(date)}`}
                                        onClick={() => {
                                            setSelectedDateIndex(idx);
                                            scrollToDate(date, 'smooth');
                                        }}
                                        className={`flex flex-col items-center min-w-[70px] py-2 px-3 rounded-2xl border transition-all ${
                                            isSelected 
                                                ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105' 
                                                : 'bg-background border-border/50 hover:border-primary/40'
                                        }`}
                                    >
                                        <span className={`text-[10px] uppercase font-bold mb-1 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                            {date.toLocaleDateString(language, { weekday: 'short' })}
                                        </span>
                                        <span className="text-xl font-bold">{date.getDate()}</span>
                                        {isTodayDate && (
                                            <div className={`mt-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* ─── Layout Split for Grid and Sidebar ─── */}
                    <div className="flex flex-col xl:flex-row gap-10 xl:items-start mt-4">
                        <div className="flex-1 min-w-0">
                            {/* ─── Weekly Grid / Daily View ─── */}
                            {viewMode === 'WEEK' ? (
                        <div className="relative group/cal animate-in fade-in duration-300">
                            {/* Scroll buttons (top) visible on all screens */}
                            <div className="flex justify-end gap-2 mb-4">
                                <button onClick={() => scroll('left')} className="p-2.5 bg-muted/60 hover:bg-primary/20 hover:text-primary transition-colors rounded-xl text-muted-foreground shadow-sm">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={() => scroll('right')} className="p-2.5 bg-muted/60 hover:bg-primary/20 hover:text-primary transition-colors rounded-xl text-muted-foreground shadow-sm">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div
                                ref={scrollContainerRef}
                                onScroll={handleScroll}
                                className="flex flex-nowrap gap-4 md:gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory touch-pan-x"
                            >
                            {calendarDays.map((date, idx) => (
                                <PlannerDay
                                    key={idx}
                                    id={`day-${formatDateToString(date)}`}
                                    date={date}
                                    meals={groupedMeals[formatDateToString(date)] || []}
                                    isEditable={isDayEditable(date)}
                                    onMealClick={(md) => setSelectedMeal(md)}
                                    onAddMeal={(type) => {
                                        const slotDate = formatDateToString(date);
                                        if (pendingMealSlot?.date === slotDate && pendingMealSlot?.type === type) {
                                            setPendingMealSlot(null);
                                            setIsSidebarOpen(false);
                                        } else {
                                            setPendingMealSlot({ date: slotDate, type });
                                            setIsSidebarOpen(true);
                                        }
                                    }}
                                    onDropRecipe={(recipe, type, mealId) => handleSelectRecipeForSlot(recipe, formatDateToString(date), type, mealId)}
                                    onDeleteMeal={handleDeleteMeal}
                                    pendingMealSlot={pendingMealSlot}
                                    viewMode={viewMode}
                                />
                            ))}
                            </div>

                            </div>
                    ) : (
                        // ─── DAY MODE ───
                        <div className="animate-in fade-in duration-300">
                            {(() => {
                                const activeDate = calendarDays[selectedDateIndex];
                                return (
                                    <PlannerDay
                                        date={activeDate}
                                        meals={groupedMeals[formatDateToString(activeDate)] || []}
                                        isEditable={isDayEditable(activeDate)}
                                        onMealClick={(md) => setSelectedMeal(md)}
                                        onAddMeal={(type) => {
                                            const slotDate = formatDateToString(activeDate);
                                            if (pendingMealSlot?.date === slotDate && pendingMealSlot?.type === type) {
                                                setPendingMealSlot(null);
                                                setIsSidebarOpen(false);
                                            } else {
                                                setPendingMealSlot({ date: slotDate, type });
                                                setIsSidebarOpen(true);
                                            }
                                        }}
                                        onDropRecipe={(recipe, type, mealId) => handleSelectRecipeForSlot(recipe, formatDateToString(activeDate), type, mealId)}
                                        onDeleteMeal={handleDeleteMeal}
                                        pendingMealSlot={pendingMealSlot}
                                        viewMode={viewMode}
                                    />
                                );
                            })()}
                        </div>
                    )}
                        </div>
                        
                         {/* ─── Sidebar (xl+) ─── */}
                        <aside className="hidden xl:flex flex-col w-[300px] 2xl:w-[340px] shrink-0 sticky top-24">
                            <RecipeSidebar 
                                selectionMode={!!pendingMealSlot}
                                onSelectRecipe={(recipe) => handleSelectRecipeForSlot(recipe)}
                                onDragStateChange={(isDragging) => setIsDraggingRecipe(isDragging)}
                                onPointerDown={handlePointerDown}
                            />
                        </aside>
                    </div>
                </div>


                {/* Drag Ghost Card */}
                {draggingRecipeData && isDraggingRecipe && (
                    <div 
                        className="fixed z-[9999] pointer-events-none w-32 aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-primary ring-4 ring-primary/20"
                        style={{ 
                            left: dragPosition.x, 
                            top: dragPosition.y,
                            transform: 'translate(-50%, -50%) scale(1.1)',
                        }}
                    >
                        <img src={draggingRecipeData.imageUrl || draggingRecipeData.image} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2 text-center">
                            <span className="text-[10px] font-bold text-white line-clamp-2">{draggingRecipeData.name}</span>
                        </div>
                    </div>
                )}

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}} />
            {/* ── MODALS ── */}
            <CustomCalendarModal 
                isOpen={isCalendarOpen} 
                onClose={() => setIsCalendarOpen(false)} 
                selectedDate={currentVisibleDate} 
                onSelect={(d) => scrollToDate(d, 'auto')} 
                language={language}
            />

            <MealTrackingModal
                isOpen={!!selectedMeal}
                onClose={() => setSelectedMeal(null)}
                mealData={selectedMeal}
                onSave={handleSaveMealTracking}
            />

            <WeeklyCheckinModal
                isOpen={isCheckinOpen}
                onClose={() => setIsCheckinOpen(false)}
                onSave={handleSaveCheckin}
            />
        </div>
    );
}

