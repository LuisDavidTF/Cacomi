/** @jsxImportSource react */
import React from 'react';
import {
    CloudIcon,
    CloudOffIcon,
    RefreshCwIcon,
    CheckCircle2Icon,
    AlertCircleIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type SyncStatus = 'local' | 'offline' | 'syncing' | 'synced' | 'pending';

interface PantryStatusHeaderProps {
    status: SyncStatus;
    syncCountdown?: number | null;
}

export function PantryStatusHeader({ status, syncCountdown }: PantryStatusHeaderProps) {
    const getStatusConfig = () => {
        switch (status) {
            case 'local':
                return {
                    icon: <CloudOffIcon className="w-4 h-4 text-muted-foreground" />,
                    text: 'Modo Local (Invitado)',
                    bgColor: 'bg-muted/50',
                    textColor: 'text-muted-foreground',
                    pulse: false
                };
            case 'offline':
                return {
                    icon: <CloudOffIcon className="w-4 h-4 text-destructive" />,
                    text: 'Sin conexión',
                    bgColor: 'bg-destructive/10',
                    textColor: 'text-destructive',
                    pulse: false
                };
            case 'syncing':
                return {
                    icon: <RefreshCwIcon className="w-4 h-4 text-primary animate-spin" />,
                    text: 'Sincronizando...',
                    bgColor: 'bg-primary/10',
                    textColor: 'text-primary',
                    pulse: true
                };
            case 'pending':
                return {
                    icon: <AlertCircleIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />,
                    text: syncCountdown != null
                        ? `Sync en ${syncCountdown}s...`
                        : 'Cambios Locales (Esperando Sync)',
                    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                    textColor: 'text-yellow-700 dark:text-yellow-500',
                    pulse: true
                };
            case 'synced':
                return {
                    icon: <CheckCircle2Icon className="w-4 h-4 text-green-600 dark:text-green-500" />,
                    text: 'Sincronizado',
                    bgColor: 'bg-green-100 dark:bg-green-900/20',
                    textColor: 'text-green-700 dark:text-green-500',
                    pulse: false
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            config.bgColor,
            config.textColor,
            config.pulse && "animate-pulse"
        )}>
            {config.icon}
            <span>{config.text}</span>
        </div>
    );
}
