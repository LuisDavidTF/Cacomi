import React from 'react';
import { formatDateToString } from '@/lib/utils';
import { useSettings } from '@context/SettingsContext';
import { PlannerSlot } from './PlannerSlot';
import { Plus } from 'lucide-react';

interface PlannerDayProps {
    date: Date;
    meals: any[];
    isEditable?: boolean;
    onMealClick?: (meal: any) => void;
    onAddMeal?: (type: string) => void;
    onDropRecipe?: (recipe: any, date: string, type: string, mealId?: string) => void;
    onDeleteMeal?: (mealId: string) => void;
    onPinMeal?: (mealId: string) => void;
    pendingMealSlot?: { date: string; type: string } | null;
    onPointerDown?: (e: React.PointerEvent, recipe: any, mealId?: string) => void;
    viewMode?: 'WEEK' | 'DAY';
    id?: string;
}


function SnackDivider({ isEditable, onClick, viewMode, vertical }: { isEditable: boolean; onClick?: () => void; viewMode?: 'WEEK' | 'DAY', vertical?: boolean }) {

    const { t } = useSettings();
    const label = t.planner?.snack || 'Snack';

    if (!isEditable) {
        return <div className={vertical ? "w-px h-full bg-border/20 mx-1" : "h-px w-full bg-border/20 my-1"} />;
    }

    return (
        <div className={`relative flex items-center group/snack transition-all
                        ${vertical 
                            ? 'flex-row md:flex-col py-1 md:py-0 px-0 md:px-1 w-full md:w-auto md:h-auto md:min-h-[120px] md:self-stretch' 
                            : 'flex-row py-1 px-0 w-full'}`}>
            {/* Lines */}
            <div className={`${vertical ? 'h-px md:w-px flex-1' : 'h-px flex-1'}
                            bg-primary/20 group-hover/snack:bg-primary/40
                            [@media(pointer:coarse)]:bg-primary/30
                            transition-colors`} />

            {/* Button */}
            <button
                onClick={onClick}
                title={`+ ${label}`}
                className={`shrink-0 rounded-full
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
                           ${vertical ? 'mx-2 md:mx-0 md:my-2 w-6 h-6 md:w-6 md:h-6 [@media(pointer:coarse)]:w-7 [@media(pointer:coarse)]:h-7' : 'mx-2 w-6 h-6 [@media(pointer:coarse)]:w-7 [@media(pointer:coarse)]:h-7'}`}
            >
                <Plus className="w-3 h-3 [@media(pointer:coarse)]:w-3.5 [@media(pointer:coarse)]:h-3.5" />
            </button>


            <div className={`${vertical ? 'h-px md:w-px flex-1' : 'h-px flex-1'}
                            bg-primary/20 group-hover/snack:bg-primary/40
                            [@media(pointer:coarse)]:bg-primary/30
                            transition-colors`} />
        </div>
    );
}

export function PlannerDay({ date, meals, isEditable = true, onMealClick, onAddMeal, onDropRecipe, onDeleteMeal, onPinMeal, onPointerDown, pendingMealSlot, viewMode = 'WEEK', id }: PlannerDayProps) {

    const { t } = useSettings();
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
    const dayNumber = date.getDate();
    const isToday = new Date().toDateString() === date.toDateString();
    const dateStr = formatDateToString(date);

    // Group main meals to ensure they always have a slot
    const breakfast = meals.find(m => m.mealType === 'BREAKFAST');
    const lunch = meals.find(m => m.mealType === 'LUNCH');
    const dinner = meals.find(m => m.mealType === 'DINNER');
    // Snacks are extra slots
    const snacks = meals.filter(m => m.mealType === 'SNACK');

    const renderSlot = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack', meal?: any) => {
        const typeUpper = type.toUpperCase() as any;
        const label = t.planner?.[type] || t.recipeTypes?.[typeUpper] || type;
        const time = type === 'breakfast' ? '08:30' : type === 'lunch' ? '14:00' : type === 'dinner' ? '20:30' : '--:--';

        return (
            <div className={viewMode === 'DAY' ? 'w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.33%-3rem)] max-w-[500px] grow shrink-0' : 'w-full'}>
                <PlannerSlot 
                    date={dateStr}
                    type={type} 
                    label={label} 
                    time={time} 
                    isEditable={isEditable} 
                    recipe={meal ? {
                        ...meal,
                        name: meal.recipeName,
                        image: meal.imageUrl
                    } : undefined}
                    onClick={meal ? () => onMealClick?.(meal) : () => onAddMeal?.(type)}
                    onDropRecipe={(recipe) => onDropRecipe?.(recipe, dateStr, typeUpper, meal?.id)}
                    onDelete={() => meal && onDeleteMeal?.(meal.id)}
                    onPin={() => meal && onPinMeal?.(meal.id)}
                    onPointerDown={(e, recipe) => onPointerDown?.(e, recipe, meal?.id)}
                    isSelected={pendingMealSlot?.date === dateStr && pendingMealSlot?.type === type}
                />
            </div>
        );
    };

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
            <div className={`relative z-10 w-full flex ${viewMode === 'DAY' ? 'flex-row flex-wrap gap-4 md:gap-6 justify-center items-stretch' : 'flex-col gap-1'}`}>
                
                {renderSlot('breakfast', breakfast)}

                <SnackDivider isEditable={isEditable} onClick={() => onAddMeal?.('snack')} viewMode={viewMode} vertical={viewMode === 'DAY'} />
                
                {renderSlot('lunch', lunch)}

                <SnackDivider isEditable={isEditable} onClick={() => onAddMeal?.('snack')} viewMode={viewMode} vertical={viewMode === 'DAY'} />
                
                {renderSlot('dinner', dinner)}

                {/* Additional Snacks from DB */}
                {snacks.map((snack, idx) => (
                    <React.Fragment key={snack.id || idx}>
                         <SnackDivider isEditable={isEditable} onClick={() => onAddMeal?.('snack')} viewMode={viewMode} vertical={viewMode === 'DAY'} />
                         {renderSlot('snack', snack)}
                    </React.Fragment>
                ))}

                {/* Final Add Button (Always available if editable) */}
                {isEditable && (
                    <div className="w-full">
                        <SnackDivider isEditable={isEditable} onClick={() => onAddMeal?.('snack')} viewMode={viewMode} vertical={false} />
                    </div>
                )}
            </div>
        </div>
    );
}
