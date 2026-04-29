import React from 'react';
import { useSettings } from '@context/SettingsContext';
import { PlannerSlot } from './PlannerSlot';
import { Plus } from 'lucide-react';

interface PlannerDayProps {
    date: Date;
    meals: any[];
    isEditable?: boolean;
    onMealClick?: (meal: any) => void;
    onAddMeal?: (type: string) => void;
    viewMode?: 'WEEK' | 'DAY';
    id?: string;
}


// Snack divider between meals:
// — Desktop (pointer:fine):  semi-visible at rest, fully revealed on hover
// — Touch   (pointer:coarse): always fully visible with solid orange button
function SnackDivider({ isEditable, onClick }: { isEditable: boolean; onClick?: () => void }) {

    const { t } = useSettings();
    const label = t.planner?.snack || 'Snack';

    if (!isEditable) {
        return <div className="h-px w-full bg-border/20 my-1" />;
    }

    return (
        <div className="relative flex items-center py-1 group/snack">
            {/* Lines */}
            <div className="flex-1 h-px
                            bg-primary/20 group-hover/snack:bg-primary/40
                            [@media(pointer:coarse)]:bg-primary/30
                            transition-colors" />

            {/* Button:
                Desktop  → opacity-50 at rest (visible but subtle), full opacity on hover
                Touch    → always full opacity, solid filled style */}
            <button
                onClick={onClick}
                title={`+ ${label}`}
                className="shrink-0 mx-2 w-6 h-6 rounded-full
                           flex items-center justify-center
                           transition-all duration-150 active:scale-90
                           border
                           border-primary/50 text-primary/60 bg-primary/5
                           opacity-50 group-hover/snack:opacity-100
                           group-hover/snack:bg-primary/15 group-hover/snack:border-primary
                           group-hover/snack:text-primary group-hover/snack:shadow-sm
                           [@media(pointer:coarse)]:opacity-100
                           [@media(pointer:coarse)]:bg-primary
                           [@media(pointer:coarse)]:border-primary
                           [@media(pointer:coarse)]:text-primary-foreground
                           [@media(pointer:coarse)]:shadow-md
                           [@media(pointer:coarse)]:shadow-primary/30
                           [@media(pointer:coarse)]:w-7
                           [@media(pointer:coarse)]:h-7"
            >
                <Plus className="w-3 h-3 [@media(pointer:coarse)]:w-3.5 [@media(pointer:coarse)]:h-3.5" />
            </button>


            <div className="flex-1 h-px
                            bg-primary/20 group-hover/snack:bg-primary/40
                            [@media(pointer:coarse)]:bg-primary/30
                            transition-colors" />
        </div>
    );
}

export function PlannerDay({ date, meals, isEditable = true, onMealClick, onAddMeal, viewMode = 'WEEK', id }: PlannerDayProps) {

    const { t } = useSettings();
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
    const dayNumber = date.getDate();
    const isToday = new Date().toDateString() === date.toDateString();

    return (
        <div id={id} className={`
            flex flex-col gap-5 p-5 sm:p-6
            rounded-3xl border transition-all duration-300 snap-start snap-always
            relative overflow-hidden group/day
            ${viewMode === 'DAY' 
                ? 'w-full max-w-4xl mx-auto' 
                : 'w-[85vw] min-w-[280px] sm:w-[320px] lg:w-[360px] shrink-0'
            }
            ${
                !isEditable
                    ? 'bg-muted/20 border-border/30 shadow-none'
                    : isToday
                        ? 'bg-primary/5 border-primary/30 shadow-md'
                        : 'bg-background border-border/50 shadow-sm hover:shadow-md hover:border-border'
            }
        `}>
            {/* Decorative watermark */}
            <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover/day:opacity-[0.06] transition-opacity pointer-events-none select-none">
                <span className="text-9xl font-black leading-none">{dayNumber}</span>
            </div>

            {/* Lock overlay for non-editable days */}
            {!isEditable && (
                <div className="absolute inset-0 z-20 rounded-3xl pointer-events-none
                                bg-muted/50 backdrop-brightness-[0.92]" />
            )}

            {/* Day Header */}
            <div className="relative z-10 text-center">
                <p className={`text-[10px] font-black tracking-[0.2em] ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {dayName}
                </p>
                <p className={`text-2xl font-bold leading-tight mt-0.5 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {dayNumber}
                </p>
                {isToday && (
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary mx-auto" />
                )}
            </div>

            {/* Meal Slots with Snack Dividers between them */}
            <div className={`relative z-10 w-full ${viewMode === 'DAY' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-1'}`}>
                {meals.length > 0 ? (
                    meals.map((meal: any, index: number) => (
                        <React.Fragment key={meal.logId || index}>
                            <PlannerSlot 
                                type={meal.mealType.toLowerCase() as any} 
                                label={t.planner?.[meal.mealType.toLowerCase()] || meal.mealType} 
                                // Backend doesn't provide time yet, using placeholders or omitting
                                time={meal.mealType === 'BREAKFAST' ? '08:30' : meal.mealType === 'LUNCH' ? '14:00' : meal.mealType === 'DINNER' ? '20:30' : '--:--'} 
                                isEditable={isEditable} 
                                recipe={{
                                    ...meal,
                                    name: meal.recipeName,
                                    image: meal.imageUrl
                                }}
                                onClick={() => onMealClick?.(meal)}
                            />
                            {index < meals.length - 1 && viewMode === 'WEEK' && (
                                <SnackDivider isEditable={isEditable} onClick={() => onAddMeal?.('snack')} />
                            )}
                        </React.Fragment>
                    ))
                ) : (
                    // 3 basic meals for empty state
                    isEditable && (
                        <>
                            <PlannerSlot 
                                type="breakfast" 
                                label={t.planner?.breakfast} 
                                time="08:30" 
                                isEditable={isEditable} 
                                onClick={() => onAddMeal?.('breakfast')}
                            />
                            {viewMode === 'WEEK' && <SnackDivider isEditable={isEditable} onClick={() => onAddMeal?.('snack')} />}
                            
                            <PlannerSlot 
                                type="lunch" 
                                label={t.planner?.lunch} 
                                time="14:00" 
                                isEditable={isEditable} 
                                onClick={() => onAddMeal?.('lunch')}
                            />
                            {viewMode === 'WEEK' && <SnackDivider isEditable={isEditable} onClick={() => onAddMeal?.('snack')} />}
                            
                            <PlannerSlot 
                                type="dinner" 
                                label={t.planner?.dinner} 
                                time="20:30" 
                                isEditable={isEditable} 
                                onClick={() => onAddMeal?.('dinner')}
                            />
                        </>
                    )
                )}
                
                {/* Final Add Button (Always available if editable) */}
                {isEditable && viewMode === 'WEEK' && (
                    <SnackDivider isEditable={isEditable} onClick={() => onAddMeal?.('snack')} />
                )}
            </div>


        </div>
    );
}
