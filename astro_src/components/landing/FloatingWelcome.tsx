'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, Info } from 'lucide-react';
import { useSettings } from '@context/SettingsContext';
import { Button } from '@components/ui/Button';

export function FloatingWelcome() {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useSettings();

    const [isCookieNoticeVisible, setIsCookieNoticeVisible] = useState(false);

    useEffect(() => {
        // Check if user has already seen the welcome or is logged in
        const seen = document.cookie.includes('seen_welcome=true');
        
        // Detect if cookie notice is likely visible
        const checkConsent = () => {
            const hasConsent = document.cookie.includes('Cacomi_cookie_consent=true');
            setIsCookieNoticeVisible(!hasConsent);
        };
        
        checkConsent();
        const interval = setInterval(checkConsent, 2000);

        if (!seen) {
            // Delay appearance for a smoother entrance after page load
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => {
                clearTimeout(timer);
                clearInterval(interval);
            };
        }
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        // Set cookie to not show again for 1 year
        document.cookie = `seen_welcome=true; path=/; max-age=31536000; samesite=lax`;
    };

    const handleAction = (href: string) => {
        handleDismiss();
        window.location.href = href;
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className={`fixed left-6 right-6 md:left-auto md:right-8 z-[150] max-w-sm w-full transition-all duration-500 ease-in-out ${
                        isCookieNoticeVisible 
                            ? "bottom-48 md:bottom-32" 
                            : "bottom-[5.5rem] md:bottom-8"
                    }`}
                >
                    <div className="relative overflow-hidden bg-card/90 backdrop-blur-2xl border border-primary/20 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] group">
                        {/* Decorative Premium Elements */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/30 transition-colors duration-700 pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-colors duration-700 pointer-events-none" />
                        
                        <button 
                            onClick={handleDismiss}
                            className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all z-20"
                            aria-label={t.announcement?.ariaClose || "Cerrar"}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="relative z-10">
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-[10px] uppercase tracking-widest font-extrabold rounded-full mb-5 border border-primary/20"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                {t.common?.appName || "Cacomi"}
                            </motion.div>
                            
                            <h3 className="text-2xl font-black tracking-tight mb-3 text-foreground leading-tight">
                                {t.floatingWelcome?.title}
                            </h3>
                            <p className="text-muted-foreground text-sm sm:text-base mb-8 leading-relaxed font-medium">
                                {t.floatingWelcome?.subtitle}
                            </p>
                            
                            <div className="flex flex-col gap-4">
                                <Button 
                                    onClick={() => handleAction('/register')}
                                    className="w-full justify-between rounded-2xl py-7 px-8 text-base font-bold shadow-xl shadow-primary/20 group/btn"
                                >
                                    <span>{t.floatingWelcome?.cta}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                
                                <button 
                                    onClick={() => handleAction('/about')}
                                    className="flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all py-2 group/info"
                                >
                                    <Info className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                    <span className="border-b border-transparent group-hover:border-primary/30 transition-all">
                                        {t.floatingWelcome?.learnMore}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
