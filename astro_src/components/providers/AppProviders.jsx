import React from 'react';
import { AuthProvider } from '@context/AuthContext';
import { ToastProvider } from '@context/ToastContext';
import { SettingsProvider } from '@context/SettingsContext';

export function AppProviders({ children }) {
    return (
        <AuthProvider>
            <SettingsProvider>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}
