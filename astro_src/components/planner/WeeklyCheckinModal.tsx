import React, { useState, useEffect } from 'react';
import { X, Sparkles, Activity, BrainCircuit, Heart, MessageSquare } from 'lucide-react';
import { useSettings } from '@context/SettingsContext';

interface WeeklyCheckinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any) => void;
}

export function WeeklyCheckinModal({ isOpen, onClose, onSave }: WeeklyCheckinModalProps) {
    const { t, language } = useSettings();
    const checkinTexts = t.planner?.checkin;

    const [stressLevel, setStressLevel] = useState('MODERATE');
    const [energyLevel, setEnergyLevel] = useState('MODERATE');
    const [userNotes, setUserNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const energyLevels = [
        { value: 'LOW', label: language === 'es' ? 'Poca energía' : 'Low energy', icon: '😴' },
        { value: 'MODERATE', label: language === 'es' ? 'Normal' : 'Normal', icon: '🔋' },
        { value: 'HIGH', label: language === 'es' ? '¡Mucha energía!' : 'High energy!', icon: '⚡' }
    ];

    const stressLevels = [
        { value: 'LOW', label: language === 'es' ? 'Relajado' : 'Relaxed', icon: '🧘' },
        { value: 'MODERATE', label: language === 'es' ? 'Normal' : 'Normal', icon: '⚖️' },
        { value: 'HIGH', label: language === 'es' ? 'Estresado' : 'Stressed', icon: '🤯' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ stressLevel, energyLevel, userNotes });
    };

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <form
                onSubmit={handleSubmit}
                className="bg-background border border-border/50 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] rounded-[32px] w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8 duration-500 relative"
            >

                {/* Premium Background Decoration */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="flex justify-between items-center p-8 pb-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary shadow-lg shadow-primary/30 text-primary-foreground flex items-center justify-center rotate-3 transition-transform hover:rotate-0">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">{checkinTexts?.title || (language === 'es' ? 'Reflexión Semanal' : 'Weekly Reflection')}</h2>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-70">Tu opinión guía al Chef AI</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-3 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-2xl transition-all active:scale-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 pt-4 overflow-y-auto space-y-10 relative z-10 custom-scrollbar">

                    {/* Nudge Text */}
                    <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl flex gap-4 items-start animate-in fade-in slide-in-from-top-2 duration-700">
                        <Heart className="w-5 h-5 text-primary shrink-0 mt-1" />
                        <p className="text-sm leading-relaxed font-medium text-foreground/80">
                            {language === 'es'
                                ? 'Para diseñar tu menú de la próxima semana, el Chef necesita saber cómo te sientes hoy. ¡Solo toma un momento!'
                                : 'To design next week\'s menu, the Chef needs to know how you feel today. It only takes a moment!'}
                        </p>
                    </div>

                    {/* Energy Level */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            {language === 'es' ? '¿Cómo estuvo tu energía?' : 'How was your energy?'}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {energyLevels.map((lvl) => (
                                <button
                                    key={`energy-${lvl.value}`}
                                    type="button"
                                    onClick={() => setEnergyLevel(lvl.value)}
                                    className={`group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300
                                        ${energyLevel === lvl.value
                                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-xl shadow-emerald-500/20 scale-105'
                                            : 'bg-background border-border/50 text-muted-foreground hover:border-emerald-500/30 hover:bg-emerald-500/5'}`}
                                >
                                    <span className="text-2xl transition-transform group-hover:scale-110">{lvl.icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-tight text-center leading-tight">{lvl.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stress Level */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            <BrainCircuit className="w-4 h-4 text-indigo-500" />
                            {language === 'es' ? '¿Qué tan estresado te sentiste?' : 'How stressed did you feel?'}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {stressLevels.map((lvl) => (
                                <button
                                    key={`stress-${lvl.value}`}
                                    type="button"
                                    onClick={() => setStressLevel(lvl.value)}
                                    className={`group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300
                                        ${stressLevel === lvl.value
                                            ? 'bg-indigo-500 text-white border-indigo-400 shadow-xl shadow-indigo-500/20 scale-105'
                                            : 'bg-background border-border/50 text-muted-foreground hover:border-indigo-500/30 hover:bg-indigo-500/5'}`}
                                >
                                    <span className="text-2xl transition-transform group-hover:scale-110">{lvl.icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-tight text-center leading-tight">{lvl.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            {checkinTexts?.notes || (language === 'es' ? 'Experiencia esta semana' : 'Experience this week')}
                        </label>
                        <textarea
                            value={userNotes}
                            onChange={(e) => setUserNotes(e.target.value)}
                            rows={4}
                            placeholder={language === 'es' ? "¿Qué tal te parecieron las porciones, el tiempo de cocina o el sabor?" : "How did you find the portions, cooking time, or flavor?"}
                            className="w-full p-5 bg-muted/30 border border-border/50 rounded-3xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-background transition-all resize-none shadow-inner"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-border/30 bg-muted/10 shrink-0 relative z-10">
                    <button
                        type="submit"
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {checkinTexts?.save || (language === 'es' ? 'Guardar y Continuar' : 'Save & Continue')}
                    </button>
                </div>
            </form>
        </div>
    );
}

