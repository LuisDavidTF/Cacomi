import React, { useState } from 'react';
import { X, Sparkles, Activity, BrainCircuit } from 'lucide-react';
import { useSettings } from '@context/SettingsContext';

interface WeeklyCheckinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any) => void;
}

export function WeeklyCheckinModal({ isOpen, onClose, onSave }: WeeklyCheckinModalProps) {
    const { t } = useSettings();
    const checkinTexts = t.planner?.checkin;

    const [stressLevel, setStressLevel] = useState('MEDIUM');
    const [energyLevel, setEnergyLevel] = useState('MEDIUM');
    const [userNotes, setUserNotes] = useState('');

    if (!isOpen) return null;

    const levels = [
        { value: 'LOW', label: checkinTexts?.levels?.low || 'Bajo' },
        { value: 'MEDIUM', label: checkinTexts?.levels?.medium || 'Medio' },
        { value: 'HIGH', label: checkinTexts?.levels?.high || 'Alto' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ stressLevel, energyLevel, userNotes });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <form onSubmit={handleSubmit} className="bg-background border border-border/50 shadow-2xl rounded-3xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 relative">
                
                {/* Decorative header glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

                <div className="flex justify-between items-center p-6 border-b border-border/30 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">{checkinTexts?.title || '¿Cómo te sentiste esta semana?'}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 relative z-10">
                    
                    {/* Energy Level */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            {checkinTexts?.energy || 'Nivel de energía'}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {levels.map((lvl) => (
                                <button
                                    key={`energy-${lvl.value}`}
                                    type="button"
                                    onClick={() => setEnergyLevel(lvl.value)}
                                    className={`px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all
                                        ${energyLevel === lvl.value 
                                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                                            : 'bg-background border-border/50 text-muted-foreground hover:border-border'}`}
                                >
                                    {lvl.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stress Level */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold">
                            <BrainCircuit className="w-4 h-4 text-indigo-500" />
                            {checkinTexts?.stress || 'Nivel de estrés'}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {levels.map((lvl) => (
                                <button
                                    key={`stress-${lvl.value}`}
                                    type="button"
                                    onClick={() => setStressLevel(lvl.value)}
                                    className={`px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all
                                        ${stressLevel === lvl.value 
                                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                                            : 'bg-background border-border/50 text-muted-foreground hover:border-border'}`}
                                >
                                    {lvl.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold">
                            {checkinTexts?.notes || 'Notas adicionales'}
                        </label>
                        <textarea
                            value={userNotes}
                            onChange={(e) => setUserNotes(e.target.value)}
                            rows={3}
                            placeholder="Ej. Salí mucho a comer esta semana, no tuve tiempo de preparar los snacks..."
                            className="w-full p-3 bg-muted/40 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-border/30 bg-muted/10 shrink-0 relative z-10">
                    <button
                        type="submit"
                        className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
                    >
                        {checkinTexts?.save || 'Completar Check-in'}
                    </button>
                </div>
            </form>
        </div>
    );
}
