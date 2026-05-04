import React, { useState, useEffect, useMemo } from 'react';
import { 
    ShoppingCart, 
    CheckCircle2, 
    AlertCircle, 
    Package, 
    Copy, 
    Check, 
    Search, 
    ShoppingBag,
    Plus,
    Calendar,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useSettings } from '@context/SettingsContext';
import { generateShoppingList, type ShoppingListItem } from '@/lib/shoppingList';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';

interface ShoppingListModalProps {
    isOpen: boolean;
    onClose: () => void;
    meals: any[];
}

export function ShoppingListModal({ isOpen, onClose, meals }: ShoppingListModalProps) {
    const { t, language } = useSettings();
    const [list, setList] = useState<ShoppingListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'FULL' | 'TO_BUY'>('TO_BUY');
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Pantry adding state
    const [buyingItem, setBuyingItem] = useState<ShoppingListItem | null>(null);
    const [boughtQty, setBoughtQty] = useState<number>(0);
    const [expiryDate, setExpiryDate] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            loadList();
        }
    }, [isOpen, meals]);

    const loadList = async () => {
        setIsLoading(true);
        try {
            const data = await generateShoppingList(meals);
            setList(data);
        } catch (err) {
            console.error("Error generating shopping list:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        const filteredList = viewMode === 'TO_BUY' 
            ? list.filter(item => item.status !== 'IN_PANTRY') 
            : list;

        const text = filteredList.map(item => {
            const toBuy = Math.max(0, item.quantityNeeded - item.quantityInPantry);
            const qtyStr = viewMode === 'TO_BUY' ? toBuy : item.quantityNeeded;
            return `- ${item.name}: ${qtyStr} ${item.unit}`;
        }).join('\n');

        navigator.clipboard.writeText(`🛒 ${t.shoppingList.title} - Cacomi\n\n${text}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStartBuying = (item: ShoppingListItem) => {
        const toBuy = Math.max(0, item.quantityNeeded - item.quantityInPantry);
        setBuyingItem(item);
        setBoughtQty(toBuy);
        
        const date = new Date();
        date.setDate(date.getDate() + 14);
        setExpiryDate(date.toISOString().split('T')[0]);
    };

    const handleConfirmBuy = async () => {
        if (!buyingItem) return;

        try {
            await db.pantryItems.add({
                id: crypto.randomUUID(),
                ingredientId: null,
                ingredientName: buyingItem.name,
                quantity: boughtQty,
                unitType: buyingItem.unit,
                expirationDate: expiryDate,
                addedDate: new Date().toISOString(),
                isDeleted: 0,
                isSynced: 0,
                isNew: 1
            });

            await loadList();
            setBuyingItem(null);
        } catch (err) {
            console.error("Error adding to pantry:", err);
        }
    };

    const groupedItems = useMemo(() => {
        const filtered = list.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesView = viewMode === 'FULL' || item.status !== 'IN_PANTRY';
            return matchesSearch && matchesView;
        });

        // Group by canonical name
        const groups: Record<string, ShoppingListItem[]> = {};
        filtered.forEach(item => {
            if (!groups[item.canonicalName]) groups[item.canonicalName] = [];
            groups[item.canonicalName].push(item);
        });

        return Object.entries(groups).sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
    }, [list, searchQuery, viewMode]);

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={t.shoppingList.title}
        >
            <div className="space-y-6">
                {/* View Switcher */}
                <div className="flex p-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
                    <button
                        onClick={() => setViewMode('TO_BUY')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300",
                            viewMode === 'TO_BUY' 
                                ? "bg-white dark:bg-gray-800 text-primary shadow-lg shadow-primary/10 ring-1 ring-primary/5" 
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        {t.shoppingList.toBuy}
                    </button>
                    <button
                        onClick={() => setViewMode('FULL')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300",
                            viewMode === 'FULL' 
                                ? "bg-white dark:bg-gray-800 text-primary shadow-lg shadow-primary/10 ring-1 ring-primary/5" 
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                    >
                        <Package className="w-4 h-4" />
                        {t.shoppingList.fullList}
                    </button>
                </div>

                {/* Search & Actions */}
                <div className="flex gap-2">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder={t.planner.searchPlaceholder || "Search..."}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button 
                        variant="secondary" 
                        onClick={handleCopy}
                        className="rounded-xl px-3 group"
                    >
                        {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                    </Button>
                </div>

                {/* Pantry Note */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-2xl border border-primary/10 text-[10px] font-bold text-primary/80 uppercase tracking-widest">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.shoppingList.pantryNote}
                    </div>
                    <div className="flex items-center gap-2 p-2.5 px-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/20 text-[9px] font-bold text-amber-700 dark:text-amber-400/80">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {language === 'es' ? 'Función experimental: Estamos trabajando para unificar ingredientes automáticamente.' : 'Experimental feature: We are working to unify ingredients automatically.'}
                    </div>
                </div>

                {/* List Content */}
                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                    {isLoading ? (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                            <p className="text-sm text-gray-500 font-medium animate-pulse">{language === 'es' ? 'Analizando ingredientes...' : 'Analyzing ingredients...'}</p>
                        </div>
                    ) : groupedItems.length > 0 ? (
                        groupedItems.map(([canonicalName, items]) => (
                            <div key={canonicalName} className="space-y-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-2">
                                    {canonicalName}
                                </h3>
                                <div className="space-y-2">
                                    {items.map((item, index) => {
                                        const toBuy = Math.max(0, item.quantityNeeded - item.quantityInPantry);
                                        const displayQty = viewMode === 'TO_BUY' ? toBuy : item.quantityNeeded;

                                        return (
                                            <div 
                                                key={`${item.name}-${index}`}
                                                className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => handleStartBuying(item)}
                                                        className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm border",
                                                            item.status === 'IN_PANTRY' 
                                                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border-emerald-100 dark:border-emerald-500/20" 
                                                                : "bg-gray-50 dark:bg-gray-700/50 text-gray-400 border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary"
                                                        )}
                                                    >
                                                        {item.status === 'IN_PANTRY' ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                                    </button>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">
                                                            {item.status === 'IN_PANTRY' ? t.shoppingList.inPantry : 
                                                             item.status === 'PARTIAL' ? `${t.shoppingList.partial} (${item.quantityInPantry} ${item.unit})` :
                                                             t.shoppingList.needToBuy}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-lg font-black text-primary tabular-nums">
                                                            {displayQty === 0 
                                                                ? (language === 'es' ? 'Al gusto' : 'To taste') 
                                                                : (displayQty % 1 === 0 ? displayQty : displayQty.toFixed(1))}
                                                        </span>
                                                        {displayQty > 0 && (
                                                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                                {item.unit}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-2 border border-dashed border-gray-200 dark:border-gray-700">
                                <Package className="w-10 h-10 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium italic">
                                {searchQuery ? (language === 'es' ? 'No se encontraron resultados.' : 'No results found.') : t.shoppingList.empty}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Buying / Add to Pantry Overlay */}
            {buyingItem && (
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md p-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-full max-w-sm bg-background border border-border/50 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                        
                        <button 
                            onClick={() => setBuyingItem(null)}
                            className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-foreground">{buyingItem.name}</h3>
                            <p className="text-xs text-muted-foreground font-medium mt-1">{t.shoppingList.buyAction}</p>
                        </div>

                        <div className="space-y-6">
                            {/* Quantity Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    {t.shoppingList.boughtQuantity} ({buyingItem.unit})
                                </label>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setBoughtQty(Math.max(0, boughtQty - 1))}
                                        className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors font-bold text-lg"
                                    >
                                        -
                                    </button>
                                    <input 
                                        type="number"
                                        value={boughtQty}
                                        onChange={(e) => setBoughtQty(Number(e.target.value))}
                                        className="flex-1 h-12 bg-muted/50 border border-border/50 rounded-xl text-center font-black text-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                    <button 
                                        onClick={() => setBoughtQty(boughtQty + 1)}
                                        className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors font-bold text-lg"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Expiry Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    {t.shoppingList.expirationDate}
                                </label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input 
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="w-full h-12 bg-muted/50 border border-border/50 rounded-xl pl-12 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <Button 
                                onClick={handleConfirmBuy}
                                className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 mt-4"
                            >
                                {t.shoppingList.saveToPantry}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
