
'use client'

import React, { useState, useEffect } from 'react';

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [isRendered, setIsRendered] = useState(true);

    useEffect(() => {
        // We wait a bit for the app to settle, then fade out
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Completely remove from DOM after transition
            setTimeout(() => setIsRendered(false), 800);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    if (!isRendered) return null;

    return (
        <div 
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#010006] transition-opacity duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div className="relative">
                {/* Decorative glow behind logo */}
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[60px] animate-pulse" />
                
                <img 
                    src="/images/brand/logo_navbar_dark.png" 
                    alt="Cacomi" 
                    className={`h-24 w-auto object-contain relative z-10 transition-transform duration-1000 ${isVisible ? 'scale-100' : 'scale-110'}`}
                    style={{
                        maskImage: 'radial-gradient(ellipse at center, black 75%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at center, black 75%, transparent 100%)'
                    }}
                />
            </div>

            {/* Premium Loading Bar */}
            <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-full animate-loading-slide" />
            </div>

            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 animate-pulse">
                Inteligencia Alimentaria
            </p>

            <style jsx>{`
                @keyframes loading-slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-loading-slide {
                    animation: loading-slide 1.5s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
