'use client';

import React from 'react';
import { useSettings } from '@context/SettingsContext';

export function Footer() {
    const { t } = useSettings();

    return (
        <footer className="mt-16 pb-24 md:pb-8 text-center" role="contentinfo">
            <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Cacomi. {t.common?.rights || 'Todos los derechos reservados.'}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-4 px-4">
                <a href="/about" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
                    {t.common?.aboutLink || 'Acerca de'}
                </a>
                <a href="/terms" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
                    {t.auth.termsLink}
                </a>
                <a href="/privacy" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
                    {t.auth.privacyLink}
                </a>
            </div>
        </footer>
    );
}
