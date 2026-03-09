"use client";

import { Button } from "@/components/shadcn/button";
import { useSettings } from "@/context/SettingsContext";

export const VIEW_AS_OPTIONS = {
    ME: "me",
    PUBLIC: "public",
} as const;

export type ViewAsType = typeof VIEW_AS_OPTIONS[keyof typeof VIEW_AS_OPTIONS];

interface ViewAsToggleProps {
    viewAs: ViewAsType;
    onChange: (view: ViewAsType) => void;
}

export function ViewAsToggle({ viewAs, onChange }: ViewAsToggleProps) {
    const { t } = useSettings();

    return (
        <div className="flex items-center space-x-2 rounded-full border bg-muted/50 p-1 shadow-sm">
            <Button
                variant={viewAs === VIEW_AS_OPTIONS.ME ? "default" : "ghost"}
                size="sm"
                className="rounded-full px-4"
                onClick={() => onChange(VIEW_AS_OPTIONS.ME)}
            >
                {t?.profile?.viewAsMe || "Ver como yo"}
            </Button>
            <Button
                variant={viewAs === VIEW_AS_OPTIONS.PUBLIC ? "default" : "ghost"}
                size="sm"
                className="rounded-full px-4"
                onClick={() => onChange(VIEW_AS_OPTIONS.PUBLIC)}
            >
                {t?.profile?.viewAsPublic || "Público"}
            </Button>
        </div>
    );
}
