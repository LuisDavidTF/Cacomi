'use client';

import React, { useEffect, useRef } from 'react';

export function NativeAdCard({ adSlotId }) {
    const adRef = useRef(null);

    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && window.adsbygoogle) {
                // Only push if not already pushed to avoid "adsbygoogle.push() error: No slot size for availableWidth=0"
                // typically caused by calling push multiple times on same slot or hidden slot
                // However, standard implementation is just to push {}
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    return (
        <div className="group bg-card dark:bg-card rounded-2xl border border-border/50 shadow-sm flex flex-col h-full overflow-hidden relative">
            {/* "Sponsored" Label mimicking the recipe type badge */}
            <div className="absolute top-3 right-3 z-10">
                <span className="bg-yellow-100/95 text-yellow-800 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider border border-yellow-200">
                    Anuncio
                </span>
            </div>

            {/* Ad Container - Mimics Image Container */}
            <div className="relative w-full aspect-[4/3] bg-muted/30 flex items-center justify-center overflow-hidden">
                {/* Placeholder for Development/When Ad is Loading */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                    <span className="text-xs uppercase tracking-widest mb-2 opacity-50">Publicidad</span>
                    {/* The Google AdSense Ins Element */}
                    <ins
                        className="adsbygoogle block"
                        style={{ display: "block", width: "100%", height: "100%" }}
                        data-ad-format="fluid"
                        data-ad-layout-key="-6t+ed+2i-1n-4w"
                        data-ad-client="ca-pub-2928206942835905"
                        data-ad-slot={adSlotId || "1234567890"}
                    />
                </div>
            </div>

            {/* Content area mimicking recipe details */}
            <div className="p-5 flex flex-col flex-grow bg-card relative">
                <div className="h-6 w-3/4 bg-muted/50 rounded mb-2 animate-pulse" />
                <div className="h-4 w-full bg-muted/30 rounded mb-1 animate-pulse" />
                <div className="h-4 w-2/3 bg-muted/30 rounded animate-pulse" />

                <div className="pt-4 mt-auto border-t border-border flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Patrocinado</span>
                    <div className="h-8 w-24 bg-primary/10 rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    );
}
