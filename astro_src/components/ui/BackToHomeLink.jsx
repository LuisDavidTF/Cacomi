'use client';

import React from 'react';
import { useSettings } from '@context/SettingsContext';

export function BackToHomeLink({ className }) {
    const { t } = useSettings();

    return (
        <a href="/" className={className || "text-primary hover:underline font-medium"}>
            &larr; {t.notFound?.backHome || 'Volver al Inicio'}
        </a>
    );
}
