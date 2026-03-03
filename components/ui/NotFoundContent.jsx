import React from 'react';
import { useSettings } from '@context/SettingsContext';
import { Button } from '@components/ui/Button';

export function NotFoundContent() {
    const { t } = useSettings();

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-primary/10 p-6 rounded-full mb-6">
                <svg className="w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
                {t.notFound?.title || 'Página no encontrada'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mb-8">
                {t.notFound?.message || 'Lo sentimos, la página que buscas no existe o ha sido movida.'}
            </p>
            <a href="/">
                <Button size="lg">{t.notFound?.backHome || 'Volver al inicio'}</Button>
            </a>
        </div>
    );
}
