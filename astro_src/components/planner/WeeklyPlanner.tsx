import React, { useState, useEffect, useRef } from 'react';
import { 
    ChevronLeft, 
    ChevronRight, 
    Sparkles, 
    Search, 
    X,
    Lock,
    CalendarDays,
} from 'lucide-react';
import { useSettings } from '@context/SettingsContext';
import { RecipeSidebar } from './RecipeSidebar';
import { ChefNoteCard } from './ChefNoteCard';
import { MealTrackingModal, type MealTrackingData } from './MealTrackingModal';
import { WeeklyCheckinModal } from './WeeklyCheckinModal';
import { PlannerDay } from './PlannerDay';
import { NutritionalSummary } from './NutritionalSummary';

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

const today = new Date();
today.setHours(0, 0, 0, 0);

// The "editable window" is today through today+6 (next 7 days)
const editWindowEnd = addDays(today, 6);

function isDayEditable(date: Date): boolean {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d >= today && d <= editWindowEnd;
}

// ─── Component ─────────────────────────────────────────────────────────────
export function WeeklyPlanner() {
    const { t } = useSettings();
    // weekOffset = number of weeks from current week (0 = this week, -1 = last week, 2 = 2 weeks ahead…)
    const [weekOffset, setWeekOffset] = useState(0);
    const [plan, setPlan] = useState<any>({});
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // AI & Tracking States
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiChefMessage, setAiChefMessage] = useState<string | null>(null);
    const [selectedMeal, setSelectedMeal] = useState<MealTrackingData | null>(null);
    const [isCheckinOpen, setIsCheckinOpen] = useState(false);

    useEffect(() => {
        const hasSeenPlannerGuide = document.cookie.includes('seen_planner_guide=true');
        if (!hasSeenPlannerGuide) setShowOnboarding(true);
    }, []);

    const dismissOnboarding = () => {
        setShowOnboarding(false);
        document.cookie = "seen_planner_guide=true; path=/; max-age=31536000; samesite=lax";
    };

    // Compute the 7 days of the viewed week
    const viewedSunday = addDays(getSundayOfWeek(today), weekOffset * 7);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(viewedSunday, i));

    // Is any day in the viewed week within the editable window?
    const weekHasEditableDays = weekDays.some(isDayEditable);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            const max = scrollWidth - clientWidth;
            setScrollProgress(max > 0 ? (scrollLeft / max) * 100 : 0);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            scrollContainerRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8,
                behavior: 'smooth'
            });
        }
    };

    const formatDateRange = () => {
        const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
        const yearOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return `${weekDays[0].toLocaleDateString(undefined, opts)} – ${weekDays[6].toLocaleDateString(undefined, yearOpts)}`;
    };

    // ─── AI Mock Generation (Concierge) ───
    // ─── AI Generation (Service) ───
    const handleGenerateAI = () => {
        // Mock generation removed. 
        // Logic to be integrated with real /planner/generate API when ready.
        console.log("AI Generation requested - Mock data generation removed.");
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

    const formatWeekLabel = () => {
        if (weekOffset === 0) return t.planner?.thisWeek || 'Esta semana';
        if (weekOffset === 1) return t.planner?.nextWeek || 'Próxima semana';
        if (weekOffset === -1) return t.planner?.lastWeek || 'Semana pasada';
        if (weekOffset > 0) return `+${weekOffset} ${t.planner?.weeks || 'semanas'}`;
        return `${weekOffset} ${t.planner?.weeks || 'semanas'}`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14 animate-in fade-in duration-500 relative">

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
                            ${isSidebarOpen ? 'bg-black/50 backdrop-blur-sm pointer-events-auto' : 'bg-transparent pointer-events-none'}`}
                onClick={(e) => e.target === e.currentTarget && setIsSidebarOpen(false)}
            >
                <div className={`absolute right-0 top-0 bottom-0 w-[min(100vw,440px)] bg-background
                                 flex flex-col shadow-2xl
                                 transition-transform duration-300
                                 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md px-6 py-5 border-b border-border/40 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Search className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-widest">{t.planner?.exploreRecipes}</h2>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-muted/60 rounded-xl hover:bg-muted transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto pb-28">
                        <RecipeSidebar isMobile />
                    </div>
                </div>
            </div>

            {/* ── MAIN LAYOUT ── */}
            <div className="relative z-10 flex flex-col xl:flex-row gap-10 xl:items-start">

                {/* Calendar Column */}
                <div className="flex-1 min-w-0 space-y-8">

                    {/* ─── Header ─── */}
                    <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-8 border-b border-border/30">
                        <div className="space-y-4">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                <CalendarDays className="w-3.5 h-3.5" />
                                <span className="uppercase tracking-widest text-[10px] font-black">BETA</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground">
                                {t.planner?.title}
                            </h1>

                            <p className="text-muted-foreground text-sm font-medium">
                                {formatDateRange()}
                            </p>

                            {/* AI Button — disabled on locked weeks */}
                            <button
                                onClick={handleGenerateAI}
                                disabled={!weekHasEditableDays || isGenerating}
                                className="inline-flex items-center gap-2.5
                                           px-6 py-3
                                           bg-primary text-primary-foreground
                                           rounded-full font-bold text-sm
                                           shadow-xl shadow-primary/25
                                           hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]
                                           transition-all duration-150 group
                                           disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                            >
                                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200 group-disabled:rotate-0" />
                                {t.planner?.generateAI}
                            </button>
                        </div>

                        {/* Nutrition pills */}
                        <div className="shrink-0 self-start sm:self-center">
                            <NutritionalSummary isHorizontal />
                        </div>
                    </header>

                    {/* ─── Week Navigation Bar ─── */}
                    <div className="flex items-center gap-3 px-1">
                        {/* Prev */}
                        <button
                            onClick={() => setWeekOffset(w => w - 1)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/50 bg-background
                                       text-sm font-medium text-muted-foreground shrink-0
                                       hover:border-primary/40 hover:text-primary transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.planner?.prevWeek || 'Anterior'}</span>
                        </button>

                        {/* Week label (centered, grows) */}
                        <span className="flex-1 text-center text-sm font-bold text-foreground">{formatWeekLabel()}</span>

                        {/* Today button — own button, clearly separated, only shown when not on current week */}
                        {weekOffset !== 0 && (
                            <button
                                onClick={() => setWeekOffset(0)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full
                                           border border-primary/40 bg-primary/5 text-primary
                                           text-sm font-bold shrink-0
                                           hover:bg-primary/10 hover:border-primary/60
                                           active:scale-95 transition-all shadow-sm"
                            >
                                <CalendarDays className="w-3.5 h-3.5" />
                                {t.planner?.today || 'Hoy'}
                            </button>
                        )}

                        {/* Next */}
                        <button
                            onClick={() => setWeekOffset(w => w + 1)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/50 bg-background
                                       text-sm font-medium text-muted-foreground shrink-0
                                       hover:border-primary/40 hover:text-primary transition-all shadow-sm"
                        >
                            <span className="hidden sm:inline">{t.planner?.nextWeek || 'Siguiente'}</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* ─── Read-only banner for past/future weeks ─── */}
                    {!weekHasEditableDays && (
                        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-muted/40 border border-border/40 text-muted-foreground text-sm">
                            <Lock className="w-4 h-4 shrink-0" />
                            <p>
                                {weekOffset < 0
                                    ? (t.planner?.pastWeekNote || 'Esta semana ya pasó. Solo la semana actual y la próxima son editables.')  
                                    : (t.planner?.futureWeekNote || 'Solo puedes planificar los próximos 7 días desde hoy.')}
                            </p>
                        </div>
                    )}

                    {/* ─── Chef Note ─── */}
                    {aiChefMessage && <ChefNoteCard message={aiChefMessage} />}

                    {/* ─── Weekly Grid ─── */}
                    <div className="relative group/cal">
                        <button onClick={() => scroll('left')}
                            className="absolute -left-5 top-1/3 z-20 w-10 h-10 rounded-full
                                       bg-background border border-border/50 shadow-md
                                       flex items-center justify-center
                                       opacity-0 group-hover/cal:opacity-100 transition-opacity
                                       hover:bg-primary hover:text-primary-foreground hover:border-primary hidden md:flex">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => scroll('right')}
                            className="absolute -right-5 top-1/3 z-20 w-10 h-10 rounded-full
                                       bg-background border border-border/50 shadow-md
                                       flex items-center justify-center
                                       opacity-0 group-hover/cal:opacity-100 transition-opacity
                                       hover:bg-primary hover:text-primary-foreground hover:border-primary hidden md:flex">
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Mobile scroll buttons */}
                        <div className="flex justify-end gap-2 mb-4 md:hidden">
                            <button onClick={() => scroll('left')} className="p-2.5 bg-muted/60 rounded-xl text-muted-foreground">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => scroll('right')} className="p-2.5 bg-muted/60 rounded-xl text-muted-foreground">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="flex flex-nowrap gap-4 md:gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory touch-pan-x"
                        >
                            {weekDays.map((date, idx) => (
                                <PlannerDay
                                    key={idx}
                                    date={date}
                                    meals={plan[date.toDateString()] || []}
                                    isEditable={isDayEditable(date)}
                                    onMealClick={(md) => setSelectedMeal(md)}
                                />
                            ))}
                        </div>

                        {/* Dot progress indicator */}
                        <div className="flex justify-center gap-1.5 mt-4">
                            {weekDays.map((_, idx) => {
                                const activeIdx = Math.round((scrollProgress / 100) * 6);
                                return (
                                    <div
                                        key={idx}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIdx ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/20'}`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ─── Sidebar (xl+) ─── */}
                <aside className="hidden xl:flex flex-col w-[300px] 2xl:w-[340px] shrink-0 sticky top-24 pt-2">
                    <RecipeSidebar />
                </aside>

                <button
                    onClick={() => setIsCheckinOpen(true)}
                    className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 p-4 bg-foreground text-background rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                >
                    <Sparkles className="w-6 h-6" />
                </button>

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
            </div>

            {/* ── MODALS ── */}
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
