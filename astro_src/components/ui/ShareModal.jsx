'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { useSettings } from '@context/SettingsContext';
import { 
    ShareIcon, 
    CopyIcon, 
    WhatsAppIcon, 
    TelegramIcon, 
    TwitterIcon, 
    FacebookIcon,
    ClockIcon,
    UserIcon
} from './Icons';

export function ShareModal({ isOpen, onClose, recipe }) {
    const { t } = useSettings();
    const [copied, setCopied] = useState(false);

    if (!recipe) return null;

    const shareUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/recipes/${recipe.id || recipe.slug || ''}` 
        : '';
    const shareText = `${t.share.shareGeneric}: ${recipe.name} - Cacomi`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: recipe.name,
                    text: recipe.description,
                    url: shareUrl,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        }
    };

    const socialLinks = [
        { 
            name: t.share.shareWhatsApp, 
            icon: WhatsAppIcon, 
            href: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
            color: 'hover:text-[#25D366]'
        },
        { 
            name: t.share.shareTelegram, 
            icon: TelegramIcon, 
            href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
            color: 'hover:text-[#0088cc]'
        },
        { 
            name: t.share.shareFacebook, 
            icon: FacebookIcon, 
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            color: 'hover:text-[#1877F2]'
        },
        { 
            name: t.share.shareTwitter, 
            icon: TwitterIcon, 
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
            color: 'hover:text-[#1DA1F2]'
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.share.title}>
            <div className="flex flex-col gap-8">
                {/* Spotify-like Preview */}
                <div className="flex flex-col items-center">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4 self-start">
                        {t.share.preview}
                    </p>
                    <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl group border border-border/50">
                        <img 
                            src={recipe.imageUrl || 'https://placehold.co/600x800/f3f4f6/9ca3af?text=Cacomi'} 
                            alt={recipe.name}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                    <span className="text-primary-foreground font-black text-xs italic">C</span>
                                </div>
                                <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">Cacomi App</span>
                            </div>
                            <h4 className="text-2xl font-black leading-tight mb-2 italic">
                                {recipe.name}
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] font-medium opacity-80">
                                <span className="flex items-center">
                                    <UserIcon className="w-3 h-3 mr-1" />
                                    {recipe.authorName || t.recipe.chef}
                                </span>
                                {recipe.preparationTimeMinutes > 0 && (
                                    <span className="flex items-center">
                                        <ClockIcon className="w-3 h-3 mr-1" />
                                        {recipe.preparationTimeMinutes} min
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sharing Options */}
                <div className="space-y-6">
                    <div className="grid grid-cols-4 gap-4">
                        {socialLinks.map((social) => (
                            <a 
                                key={social.name}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex flex-col items-center gap-2 transition-all duration-300 hover:scale-110 ${social.color}`}
                            >
                                <div className="p-3 bg-muted/30 rounded-2xl border border-border/50 group-hover:border-current transition-colors">
                                    <social.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground">{social.name}</span>
                            </a>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={handleCopy}
                            className="flex-grow flex items-center justify-center gap-2 bg-muted/50 hover:bg-muted text-foreground px-6 py-3 rounded-2xl font-semibold transition-all border border-border/50"
                        >
                            <CopyIcon className="w-5 h-5" />
                            {copied ? t.share.linkCopied : t.share.copyLink}
                        </button>
                        
                        {typeof navigator !== 'undefined' && navigator.share && (
                            <button 
                                onClick={handleNativeShare}
                                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold transition-all hover:opacity-90 shadow-lg shadow-primary/20"
                            >
                                <ShareIcon className="w-5 h-5" />
                                {t.share.shareGeneric}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
