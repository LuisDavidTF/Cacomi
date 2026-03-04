'use client';

import React, { useState } from 'react';
import { useSettings } from '@context/SettingsContext';

/**
 * SmartImage Component
 * Conditionally renders an image based on user's Data Saver settings.
 * Replaces standard <img> tag.
 */
export function SmartImage({ src, alt, className, ...props }) {
    const { shouldLoadImage } = useSettings();
    const [forceLoad, setForceLoad] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Fallback immediately if no source
    const effectiveSrc = src || null;

    // Decide whether to show the real image
    const showImage = (forceLoad || shouldLoadImage()) && !error && effectiveSrc;

    if (!showImage) {
        return (
            <div
                className={`${className} bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center cursor-pointer group hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative overflow-hidden`}
                onClick={(e) => {
                    if (error) return; // Don't trigger load if it already failed
                    e.stopPropagation();
                    setForceLoad(true);
                }}
                role="button"
                aria-label={error ? "Error cargando imagen" : "Cargar imagen"}
            >
                <div className="text-center p-2 z-10 flex flex-col items-center">
                    {error ? (
                        // Offline / Error State Icon
                        <>
                            <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth={1.5} />
                            </svg>
                            <span className="text-xs text-gray-400 dark:text-gray-500">No disponible</span>
                        </>
                    ) : (
                        // Click to Load State
                        <>
                            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-1 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 dark:text-gray-400">Tocar para ver</span>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <img
            src={effectiveSrc}
            alt={alt}
            className={`${className} object-cover`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            {...props}
        />
    );
}
