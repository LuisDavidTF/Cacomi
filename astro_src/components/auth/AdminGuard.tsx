import React, { useState, useEffect } from 'react';
import { useSettings } from '@context/SettingsContext';

/**
 * AdminGuard component
 * Validates the existence of a short-lived admin token.
 * If invalid or absent, presents a mock elevation of privileges dialog.
 */
export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const { t } = useSettings();

    // Check if the short-lived session token exists in sessionStorage (mock setup)
    useEffect(() => {
        const adminSession = sessionStorage.getItem('culina_admin_token');
        if (adminSession) {
            const tokenData = JSON.parse(adminSession);
            // Verify if it hasn't expired (e.g. 30 minutes life)
            if (Date.now() - tokenData.timestamp < 30 * 60 * 1000) {
                setIsAuthorized(true);
            } else {
                sessionStorage.removeItem('culina_admin_token');
            }
        }
    }, []);

    const handleElevate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(false);
        
        // Mock API call to backend /api/admin/elevate
        setTimeout(() => {
            if (pin === '2024') { // Mock PIN validation
                const tokenData = {
                    token: 'mock_short_lived_token_38fje29x',
                    timestamp: Date.now()
                };
                sessionStorage.setItem('culina_admin_token', JSON.stringify(tokenData));
                setIsAuthorized(true);
            } else {
                setError(true);
            }
            setIsLoading(false);
        }, 800);
    };

    if (isAuthorized) {
        return <>{children}</>;
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-300">
            <div className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full text-red-600 dark:text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">
                    {t.admin?.noPermission || 'Restricted Area'}
                </h2>
                <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
                    {t.admin?.enterPin || 'Please elevate your privileges by entering your Admin PIN.'}
                </p>

                <form onSubmit={handleElevate} className="space-y-4">
                    <div>
                        <input 
                            type="password" 
                            name="pin"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="****"
                            className="w-full text-center tracking-[0.5em] text-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                            maxLength={4}
                            autoComplete="off"
                        />
                        {error && (
                            <p className="text-xs text-red-500 mt-2 text-center animate-in slide-in-from-top-1">Invalid PIN. Try '2024'</p>
                        )}
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading || pin.length < 4}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <span className="animate-spin mr-2">C</span>
                        ) : null}
                        {t.admin?.authBtn || 'Authorize'}
                    </button>
                </form>
            </div>
        </div>
    );
};
