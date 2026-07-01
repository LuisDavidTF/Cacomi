'use client';

import React from 'react';
import { useSettings } from '@context/SettingsContext';
import { BadgeCheck } from 'lucide-react';

export function LegalAiDisclaimer() {
    const { t, language } = useSettings();

    if (!t.legal) return null;

    return (
        <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-lg mt-4 space-y-3">
            <h3 className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <span>ℹ️</span> {t.legal.aiWarningTermsTitle}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.legal.aiWarningTermsDesc}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.legal.chefVerificationNotice}
            </p>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex items-center flex-wrap gap-2">
                <span>{t.legal.verificationIconExplanation}</span>
                <span className="inline-flex items-center bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold gap-1 shadow-xs border border-blue-500/20">
                    <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                    {language === 'es' ? 'Verificado' : language === 'fr' ? 'Vérifié' : 'Verified'}
                </span>
            </div>
        </div>
    );
}
