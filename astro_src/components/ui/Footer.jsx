'use client';

import React from 'react';
import { useSettings } from '@context/SettingsContext';
import { InstagramIcon, FacebookIcon } from './Icons';

export function Footer() {
    const { t } = useSettings();

    return (
        <footer className="mt-16 pb-24 md:pb-8 text-center" role="contentinfo">
            <div className="flex justify-center gap-6 mb-6">
                <a 
                    href={t.common?.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#E4405F] transition-all duration-300 hover:scale-110"
                    aria-label="Instagram"
                >
                    <InstagramIcon className="w-5 h-5" />
                </a>
                <a 
                    href={t.common?.facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#1877F2] transition-all duration-300 hover:scale-110"
                    aria-label="Facebook"
                >
                    <FacebookIcon className="w-5 h-5" />
                </a>
            </div>
            
            <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Cacomi. {t.common?.rights || 'Todos los derechos reservados.'}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-4 px-4">
                <a href="/about" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
                    {t.common?.aboutLink || 'Acerca de'}
                </a>
                <a href="/blog" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
                    {t.common?.blogLink || 'Blog & Guías'}
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
