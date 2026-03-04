import React from 'react';

/**
 * RichText Component
 * Parses a simple markdown-like syntax:
 * - **text** -> Primary App Color (Orange)
 * - *text* -> Italic
 */
export function RichText({ text, className = "" }) {
    if (!text) return null;

    // Split the text into parts using a regex that captures our tokens
    // **text** for primary color
    // *text* for italics
    const parts = String(text).split(/(\*\*.*?\*\*|\*.*?\*)/g);

    return (
        <span className={className}>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <span key={i} className="text-primary font-bold">
                            {part.slice(2, -2)}
                        </span>
                    );
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return (
                        <i key={i} className="italic">
                            {part.slice(1, -1)}
                        </i>
                    );
                }
                return part;
            })}
        </span>
    );
}
