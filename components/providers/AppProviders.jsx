'use client';

import React from 'react';
import { AuthProvider } from '@context/AuthContext';
import { SettingsProvider } from '@context/SettingsContext';
import { ToastProvider } from '@context/ToastContext';

export function AppProviders({ children }) {
    return (
        <SettingsProvider>
            <AuthProvider>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </AuthProvider>
        </SettingsProvider>
    );
}
