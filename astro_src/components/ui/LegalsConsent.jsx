'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { useSettings } from '@context/SettingsContext';

/**
 * LegalsConsent Component
 * Uses both localStorage and a cookie flag for maximum reliability 
 * across Astro and Next.js environments.
 * Renamed from CookieConsent to avoid client-side AdBlockers.
 */
export function LegalsConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useSettings();

    useEffect(() => {
        // Check both localStorage and document.cookie for the consent flag
        const hasConsent = localStorage.getItem('culina_cookie_consent') === 'true' ||
            document.cookie.includes('culina_cookie_consent=true');

        if (!hasConsent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        // Set localStorage for client-side persistence
        localStorage.setItem('culina_cookie_consent', 'true');

        // Set a real cookie for potential server-side checks or cross-framework consistency
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        document.cookie = `culina_cookie_consent=true; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;

        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-all duration-500 ease-in-out dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-sm text-foreground/90 leading-relaxed text-center md:text-left">
                    <p className="font-medium mb-1">
                        {t.cookie?.text || 'Utilizamos cookies para mejorar tu experiencia.'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {t.cookie?.accept || 'Al continuar, aceptas nuestra '}
                        <a href="/privacy" className="font-medium text-primary hover:underline underline-offset-4">
                            {t.auth.privacyLink || 'Política de Privacidad'}
                        </a>
                        {' '}{t.auth.and || 'y'}{' '}
                        <a href="/terms" className="font-medium text-primary hover:underline underline-offset-4">
                            {t.auth.termsLink || 'Términos de Uso'}
                        </a>.
                    </p>
                </div>
                <div className="flex-shrink-0 w-full md:w-auto">
                    <Button
                        onClick={acceptCookies}
                        className="w-full md:w-auto whitespace-nowrap shadow-md hover:shadow-lg transition-all px-8 py-2 bg-primary text-primary-foreground font-semibold rounded-lg"
                    >
                        {t.cookie?.btn || 'Aceptar y Continuar'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
