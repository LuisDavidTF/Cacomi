import React from 'react';
import { ChefHat, Sparkles } from 'lucide-react';
import { useSettings } from '@context/SettingsContext';

interface ChefNoteCardProps {
    message: string;
}

export function ChefNoteCard({ message }: ChefNoteCardProps) {
    const { t } = useSettings();

    if (!message) return null;

    return (
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-sm mb-8 group">
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/30 transition-colors" />

            <div className="relative z-10 flex items-start gap-4">
                {/* Icon Container */}
                <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                    <ChefHat className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-1.5 uppercase tracking-wider">
                        {t.planner?.concierge?.noteTitle || "Nota del Chef:"}
                        <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}
