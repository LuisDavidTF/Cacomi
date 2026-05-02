import React, { useState, useEffect } from 'react';
import { WifiOff, X, Info, Zap } from 'lucide-react';
import { useSettings } from '@context/SettingsContext';

export function OfflineHelper() {
    const { language } = useSettings();
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [showModal, setShowModal] = useState(false);
    const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => {
            setIsOnline(false);
            if (!hasBeenDismissed) {
                setShowModal(true);
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check initial state
        if (!navigator.onLine && !hasBeenDismissed) {
            setShowModal(true);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [hasBeenDismissed]);

    if (isOnline || !showModal) return null;

    const texts = {
        es: {
            title: 'Modo Offline Activado',
            message: 'Te encuentras en modo offline. Para brindarte la mejor experiencia, estamos cargando tus recetas guardadas directamente desde tu dispositivo.',
            tipTitle: 'Tip de Rendimiento',
            tipMessage: 'Si notas un retraso en la navegación, intenta desactivar tus datos móviles o el Wi-Fi por completo. Esto evita que tu dispositivo pierda tiempo esperando una conexión débil o sin saldo ("zombie"), permitiendo que la app responda al instante usando su base de datos local.',
            button: 'Entendido, gracias',
            valueProp: 'Cacomi funciona mejor cuando no tiene que esperar por internet.'
        },
        en: {
            title: 'Offline Mode Active',
            message: 'You are currently offline. To provide the best experience, we are loading your saved recipes directly from your device.',
            tipTitle: 'Performance Tip',
            tipMessage: 'If you notice navigation delays, try turning off mobile data or Wi-Fi completely. This prevents your device from wasting time waiting for a weak or empty ("zombie") connection, allowing the app to respond instantly using its local database.',
            button: 'Got it, thanks',
            valueProp: 'Cacomi works best when it doesn\'t have to wait for the internet.'
        }
    };

    const t = texts[language] || texts.es;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-background border border-border shadow-2xl rounded-[32px] max-w-md w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <div className="relative p-8">
                    <button 
                        onClick={() => { setShowModal(false); setHasBeenDismissed(true); }}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary animate-pulse">
                            <WifiOff className="w-8 h-8" />
                        </div>

                        <h2 className="text-2xl font-black tracking-tight mb-3 text-foreground">
                            {t.title}
                        </h2>
                        
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            {t.message}
                        </p>

                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 text-left mb-8 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap className="w-12 h-12 text-indigo-500" />
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                                <Info className="w-4 h-4" />
                                <span className="text-xs font-black uppercase tracking-widest">{t.tipTitle}</span>
                            </div>
                            <p className="text-sm text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed font-medium">
                                {t.tipMessage}
                            </p>
                        </div>

                        <button
                            onClick={() => { setShowModal(false); setHasBeenDismissed(true); }}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {t.button}
                        </button>
                        
                        <p className="mt-6 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                            {t.valueProp}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
