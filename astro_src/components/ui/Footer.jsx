'use client';

import React, { useState } from 'react';
import { useSettings } from '@context/SettingsContext';
import { Globe, Mail, CheckCircle2 } from 'lucide-react';

export function Footer() {
    const { t, language } = useSettings();
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                setIsSubscribed(true);
                setEmail('');
            }, 1500);
        }
    };

    return (
        <footer className="mt-20 border-t border-border/40 bg-[#fbf9f6] dark:bg-card/20 py-16 pb-24 md:pb-16" role="contentinfo">
            <div className="container mx-auto px-4 md:px-8 max-w-6xl space-y-16">
                
                {/* 1. Newsletter Box (Matching Mockup 2) */}
                <div className="w-full max-w-4xl mx-auto bg-[#f4e6d9]/35 dark:bg-card/45 border border-[#e8d5c4]/30 rounded-[2rem] p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="relative z-10 space-y-6">
                        <span className="text-[10px] font-black tracking-widest text-[#e07e53] uppercase block">
                            Newsletter
                        </span>
                        <h3 className="font-serif text-3xl md:text-4xl font-bold text-[#2c2b2a] dark:text-white leading-tight max-w-xl mx-auto">
                            {language === 'es' ? 'Únete al manifiesto de una vida lenta.' : 'Join the slow living manifesto.'}
                        </h3>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed font-light">
                            {language === 'es' 
                                ? 'Recibe mensualmente reflexiones sobre diseño, recetas estacionales y novedades de nuestro Atelier.'
                                : 'Receive monthly thoughts on design, seasonal recipes, and updates from our Atelier.'}
                        </p>

                        {isSubscribed ? (
                            <div className="flex items-center justify-center gap-2 max-w-md mx-auto bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-full text-sm font-bold animate-in fade-in zoom-in duration-300">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                <span>
                                    {language === 'es' 
                                        ? '¡Gracias por unirte a nuestro manifiesto!' 
                                        : 'Thank you for joining our manifesto!'}
                                </span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-2">
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={language === 'es' ? 'Tu correo electrónico' : 'Your email address'}
                                    className="flex-1 bg-white dark:bg-slate-900 border border-border/80 rounded-full px-6 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e07e53]/20 focus:border-[#e07e53]/30 transition-all"
                                    disabled={isLoading}
                                />
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-8 py-3.5 rounded-full bg-[#e07e53] hover:bg-[#d06e43] text-white font-bold text-sm shadow-md shadow-[#e07e53]/10 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed shrink-0"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        language === 'es' ? 'Suscribirse' : 'Subscribe'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* 2. Main Footer Columns (Matching Mockup 1) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-4 text-left border-t border-border/30">
                    
                    {/* Brand Column */}
                    <div className="md:col-span-6 space-y-6">
                        <span className="font-serif text-3xl font-bold tracking-tight text-[#2c2b2a] dark:text-white">
                            Cacomi
                        </span>
                        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed font-light">
                            {language === 'es' 
                                ? 'Curando cada sombra, cada textura y cada momento de silencio.' 
                                : 'Curating every shadow, every texture, and every moment of silence.'}
                        </p>
                        <div className="flex gap-3">
                            <a 
                                href="https://cacomi.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-muted/40 hover:bg-muted text-foreground/80 hover:text-foreground flex items-center justify-center transition-all duration-300"
                                aria-label="Website"
                            >
                                <Globe className="w-4 h-4" />
                            </a>
                            <a 
                                href="/contacto" 
                                className="w-10 h-10 rounded-full bg-muted/40 hover:bg-muted text-foreground/80 hover:text-foreground flex items-center justify-center transition-all duration-300"
                                aria-label="Contact"
                            >
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="md:col-span-6 grid grid-cols-3 gap-6">
                        
                        {/* Explorar */}
                        <div className="space-y-4">
                            <h4 className="text-[#2c2b2a] dark:text-white font-bold text-xs uppercase tracking-widest">
                                {language === 'es' ? 'Explorar' : 'Explore'}
                            </h4>
                            <ul className="space-y-2.5 text-xs text-muted-foreground font-light">
                                <li><a href="/" className="hover:text-[#e07e53] transition-colors">{t?.nav?.vida || 'Vida'}</a></li>
                                <li><a href="/origen" className="hover:text-[#e07e53] transition-colors">{t?.nav?.origen || 'Origen'}</a></li>
                                <li><a href="#" className="hover:text-[#e07e53] transition-colors">{t?.nav?.atelier || 'Atelier'}</a></li>
                            </ul>
                        </div>

                        {/* Nosotros */}
                        <div className="space-y-4">
                            <h4 className="text-[#2c2b2a] dark:text-white font-bold text-xs uppercase tracking-widest">
                                {language === 'es' ? 'Nosotros' : 'About'}
                            </h4>
                            <ul className="space-y-2.5 text-xs text-muted-foreground font-light">
                                <li><a href="/about" className="hover:text-[#e07e53] transition-colors">{language === 'es' ? 'Filosofía' : 'Philosophy'}</a></li>
                                <li><a href="/blog" className="hover:text-[#e07e53] transition-colors">{language === 'es' ? 'Historias' : 'Stories'}</a></li>
                                <li><a href="/contacto" className="hover:text-[#e07e53] transition-colors">{t?.common?.contactLink || 'Contacto'}</a></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div className="space-y-4">
                            <h4 className="text-[#2c2b2a] dark:text-white font-bold text-xs uppercase tracking-widest">
                                {language === 'es' ? 'Legal' : 'Legal'}
                            </h4>
                            <ul className="space-y-2.5 text-xs text-muted-foreground font-light">
                                <li><a href="/privacy" className="hover:text-[#e07e53] transition-colors">{t?.auth?.privacyLink || 'Privacidad'}</a></li>
                                <li><a href="/terms" className="hover:text-[#e07e53] transition-colors">{t?.auth?.termsLink || 'Términos'}</a></li>
                            </ul>
                        </div>

                    </div>
                </div>

                {/* 3. Bottom Bar */}
                <div className="border-t border-border/20 pt-8 flex justify-center text-xs text-muted-foreground/80 font-light">
                    <span>
                        &copy; {new Date().getFullYear()} CACOMI. {t?.common?.rights || 'Todos los derechos reservados.'}
                    </span>
                </div>

            </div>
        </footer>
    );
}
