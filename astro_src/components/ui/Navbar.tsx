'use client';

import React, { useState } from 'react';
// Context
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

// Icons (Lucide React)
import {
    LogOut,
    LogIn,
    User,
    Settings,
    Menu,
    X,
    Plus,
    ChefHat,
    ShoppingBasket
} from 'lucide-react';
import { Button } from '@/components/shadcn/button';

export function Navbar() {
    const { isAuthenticated, logout, user } = useAuth();
    const { t } = useSettings();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Format user name for display (First Name + Last Initial)
    const getDisplayName = () => {
        if (!user || !user.name) return '';
        const nameParts = user.name.split(' ');
        // If we have more than one name, take the first and the initial of the last
        if (nameParts.length > 1) {
            return `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`;
        }
        return nameParts[0];
    };

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        window.location.href = '/';
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 dark:bg-card/95 backdrop-blur-md shadow-xs transition-colors duration-300 border-b border-border/50">
            <nav
                className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
                aria-label="Main Navigation"
            >
                <div className="flex justify-between items-center h-16">

                    {/* Logo / Home Link */}
                    <a href="/" onClick={handleLogoClick} className="shrink-0 flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary tracking-tight md:flex items-center gap-2 hidden">
                            Culina Smart
                        </span>
                        <span className="md:hidden text-2xl font-bold text-primary tracking-tight flex items-center gap-2">
                            {/* App Icon for Mobile */}
                            <img src="/icon.png" alt="App Icon" className="w-8 h-8 rounded-md" />
                        </span>
                    </a>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm font-medium text-foreground/80">
                                    {t?.nav?.greeting || 'Hola'} {getDisplayName()}
                                </span>

                                <a
                                    href="/pantry"
                                    className="flex items-center text-sm font-medium px-4 py-2 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                                    aria-label={t?.nav?.pantry || 'Despensa'}
                                >
                                    <ShoppingBasket className="w-4 h-4 mr-2" />
                                    {t?.nav?.pantry || 'Despensa'}
                                </a>

                                <a
                                    href="/create-recipe"
                                    className="flex items-center text-sm font-medium px-4 py-2 rounded-lg text-primary-foreground bg-primary hover:opacity-90 transition-colors shadow-sm"
                                    aria-label={t?.nav?.create || 'Crear'}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t?.nav?.create || 'Crear'}
                                </a>

                                <a
                                    href="/settings"
                                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                    aria-label={t?.nav?.settings || 'Ajustes'}
                                >
                                    <Settings className="w-5 h-5" />
                                </a>

                                <button
                                    onClick={logout}
                                    className="flex items-center text-sm font-medium px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted border border-border transition-colors hover:text-foreground"
                                    aria-label={t?.nav?.logout || 'Salir'}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    {t?.nav?.logout || 'Salir'}
                                </button>
                            </>
                        ) : (
                            // Guest Users
                            <>
                                <a
                                    href="/login"
                                    className="flex items-center text-sm font-medium px-4 py-2 rounded-lg text-secondary bg-secondary/10 hover:bg-secondary/20 transition-colors"
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    {t?.nav?.login || 'Entrar'}
                                </a>

                                <a
                                    href="/register"
                                    className="flex items-center text-sm font-medium px-4 py-2 rounded-lg text-primary-foreground bg-primary hover:opacity-90 shadow-sm transition-colors"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    {t?.nav?.register || 'Registro'}
                                </a>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted focus:outline-none"
                            aria-label="Abrir menú"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-200 bg-background dark:bg-card">
                        <div className="flex flex-col space-y-3">
                            {isAuthenticated ? (
                                <>
                                    <div className="px-2 py-2 text-sm font-bold text-foreground border-b border-border/50 mb-2">
                                        {t?.nav?.greeting || 'Hola'} {getDisplayName()}
                                    </div>

                                    <a
                                        href="/pantry"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center text-base font-medium px-3 py-2 rounded-md text-foreground hover:bg-muted"
                                    >
                                        <ShoppingBasket className="w-5 h-5 mr-3" />
                                        {t?.nav?.pantry || 'Despensa'}
                                    </a>

                                    <a
                                        href="/create-recipe"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center text-base font-medium px-3 py-2 rounded-md text-primary bg-primary/10"
                                    >
                                        <Plus className="w-5 h-5 mr-3" />
                                        {t?.nav?.create || 'Crear'}
                                    </a>

                                    <a
                                        href="/settings"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center text-base font-medium px-3 py-2 rounded-md text-muted-foreground hover:bg-muted"
                                    >
                                        <Settings className="w-5 h-5 mr-3" />
                                        {t?.nav?.settings || 'Ajustes'}
                                    </a>

                                    <button
                                        onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                        className="flex items-center w-full text-base font-medium px-3 py-2 rounded-md text-muted-foreground hover:bg-muted"
                                    >
                                        <LogOut className="w-5 h-5 mr-3" />
                                        {t?.nav?.logout || 'Salir'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <a
                                        href="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center text-base font-medium px-3 py-2 rounded-md text-secondary-foreground bg-secondary hover:opacity-90 shadow-sm transition-colors"
                                    >
                                        <LogIn className="w-5 h-5 mr-3" />
                                        {t?.nav?.login || 'Entrar'}
                                    </a>

                                    <a
                                        href="/register"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center text-base font-medium px-3 py-2 rounded-md text-primary-foreground bg-primary hover:opacity-90 transition-colors"
                                    >
                                        <User className="w-5 h-5 mr-3" />
                                        {t?.nav?.register || 'Registro'}
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
