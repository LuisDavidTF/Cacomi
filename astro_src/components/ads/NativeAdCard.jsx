'use client';

import React, { useEffect, useRef } from 'react';
import { getEnv } from '@utils/env';

export function NativeAdCard({ adSlotId, variant = 'card' }) {
    const PUBLIC_ENABLE_ADS = getEnv('PUBLIC_ENABLE_ADS') || getEnv('NEXT_PUBLIC_ENABLE_ADS');
    if (PUBLIC_ENABLE_ADS !== 'true') return null;

    const adRef = useRef(null);

    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    const isBanner = variant === 'banner';
    const isSidebar = variant === 'sidebar';

    if (isSidebar) {
        return (
            <div className="group bg-card/50 dark:bg-card/50 rounded-2xl border border-border/40 shadow-xs flex p-3 gap-3 relative transition-all duration-300 hover:border-primary/20">
                <div className="absolute top-2 right-2 z-10">
                    <span className="bg-muted text-muted-foreground text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase tracking-tighter opacity-60">
                        Anuncio
                    </span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-muted/40 flex items-center justify-center shrink-0 overflow-hidden">
                    <ins
                        className="adsbygoogle block"
                        style={{ display: "block", width: "100%", height: "100%" }}
                        data-ad-format="fluid"
                        data-ad-layout-key="-6t+ed+2i-1n-4w"
                        data-ad-client="ca-pub-2928206942835905"
                        data-ad-slot={adSlotId || "1234567890"}
                    />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="h-3 w-3/4 bg-muted/50 rounded mb-1.5 animate-pulse" />
                    <div className="h-2 w-1/2 bg-muted/30 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className={`group bg-card dark:bg-card rounded-2xl border border-border/50 shadow-sm flex overflow-hidden relative transition-all duration-500 w-full
            ${isBanner ? 'flex-col md:flex-row md:max-h-[160px] max-w-4xl mx-auto' : 'flex-col h-full mx-auto'}
        `}>
            {/* "Sponsored" Label */}
            <div className="absolute top-3 right-3 z-10">
                <span className="bg-yellow-100/95 text-yellow-800 text-[9px] font-black px-2.5 py-1 rounded-full shadow-sm uppercase tracking-widest border border-yellow-200 backdrop-blur-sm">
                    Anuncio
                </span>
            </div>

            {/* Ad Container */}
            <div className={`relative bg-muted/30 flex items-center justify-center overflow-hidden shrink-0
                ${isBanner ? 'w-full md:w-[240px] aspect-video md:aspect-square' : 'w-full aspect-[4/3]'}
            `}>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] mb-2 opacity-30">Publicidad</span>
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

            {/* Content area */}
            <div className={`p-5 flex flex-col flex-grow bg-card relative
                ${isBanner ? 'justify-center' : ''}
            `}>
                <div className="h-4 w-3/4 bg-muted/50 rounded mb-2 animate-pulse" />
                {!isBanner && <div className="h-3 w-full bg-muted/30 rounded mb-1 animate-pulse" />}
                <div className="h-3 w-2/3 bg-muted/30 rounded animate-pulse" />

                <div className={`pt-4 mt-auto border-t border-border flex justify-between items-center
                    ${isBanner ? 'hidden md:flex' : ''}
                `}>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Patrocinado</span>
                    <div className="h-7 w-20 bg-primary/10 rounded-lg animate-pulse" />
                </div>
            </div>
        </div>
    );
}
