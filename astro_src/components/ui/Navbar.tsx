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
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    // Check if we are running in the browser to get the path
    const [currentPath, setCurrentPath] = useState('');

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentPath(window.location.pathname);
        }
    }, []);

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
        if (currentPath === '/' || currentPath === '') {
            // If already on home and at the top, reload. Otherwise, scroll to top.
            if (window.scrollY === 0) {
                window.location.reload();
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            // If on another page, go to home
            window.location.href = '/';
        }
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
                    <div className="hidden md:flex items-center space-x-3">
                        {isAuthenticated ? (
                            <>
                                {/* Primary Action: Create Recipe */}
                                <a
                                    href="/create-recipe"
                                    className={`flex items-center text-sm font-medium px-4 py-2 rounded-full transition-colors shadow-sm ${currentPath === '/create-recipe' ? 'text-primary-foreground bg-primary pointer-events-none' : 'text-primary-foreground bg-primary hover:bg-primary/90'}`}
                                    aria-label={t?.nav?.create || 'Crear'}
                                    onClick={(e) => currentPath === '/create-recipe' && e.preventDefault()}
                                >
                                    <Plus className="w-4 h-4 mr-1.5" />
                                    {t?.nav?.create || 'Crear'}
                                </a>

                                {/* Profile Dropdown Container */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ml-2 relative z-50"
                                        aria-haspopup="true"
                                        aria-expanded={isProfileDropdownOpen}
                                    >
                                        {user?.profile_photo ? (
                                            <img src={user.profile_photo} alt="Perfil" className="w-8 h-8 rounded-full border border-border object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                                                <User className="w-4 h-4" />
                                            </div>
                                        )}
                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-medium leading-none text-foreground">
                                                {getDisplayName()}
                                            </span>
                                        </div>
                                    </button>

                                    {/* Invisible Overlay for closing dropdown */}
                                    {isProfileDropdownOpen && (
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        />
                                    )}

                                    {/* Dropdown Menu */}
                                    <div
                                        className={`absolute right-0 mt-2 w-56 transform origin-top-right rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg ring-1 ring-black/5 transition-all duration-200 ease-out z-50 ${isProfileDropdownOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                                    >
                                        <div className="p-2 space-y-1">
                                            {/* Profile Info Header in Dropdown */}
                                            <div className="px-3 pb-3 pt-2 mb-1 border-b border-border/50">
                                                <p className="text-sm font-medium text-foreground">{user?.name || getDisplayName()}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                            </div>

                                            <a
                                                href="/profile"
                                                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${currentPath === '/profile' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}`}
                                                onClick={(e) => {
                                                    setIsProfileDropdownOpen(false);
                                                    if (currentPath === '/profile') e.preventDefault();
                                                }}
                                            >
                                                <User className="w-4 h-4 mr-3 opacity-70" />
                                                Mi Perfil
                                            </a>

                                            <a
                                                href="/pantry"
                                                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${currentPath === '/pantry' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}`}
                                                onClick={(e) => {
                                                    setIsProfileDropdownOpen(false);
                                                    if (currentPath === '/pantry') e.preventDefault();
                                                }}
                                            >
                                                <ShoppingBasket className="w-4 h-4 mr-3 opacity-70" />
                                                {t?.nav?.pantry || 'Despensa'}
                                            </a>

                                            <a
                                                href="/settings"
                                                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${currentPath === '/settings' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}`}
                                                onClick={(e) => {
                                                    setIsProfileDropdownOpen(false);
                                                    if (currentPath === '/settings') e.preventDefault();
                                                }}
                                            >
                                                <Settings className="w-4 h-4 mr-3 opacity-70" />
                                                {t?.nav?.settings || 'Ajustes'}
                                            </a>

                                            <div className="h-px bg-border/50 my-1 mx-2" />

                                            <button
                                                onClick={() => {
                                                    setIsProfileDropdownOpen(false);
                                                    logout();
                                                }}
                                                className="w-full flex items-center px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                            >
                                                <LogOut className="w-4 h-4 mr-3 opacity-70" />
                                                {t?.nav?.logout || 'Cerrar Sesión'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen border-t border-border/50 opacity-100 shadow-xl bg-background/95 backdrop-blur-xl' : 'max-h-0 opacity-0 pointer-events-none'}`}
                >
                    <div className="px-4 py-4 space-y-2">
                        {isAuthenticated ? (
                            <>
                                {/* Mobile Profile Header */}
                                <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-muted/50 border border-border/50">
                                    {user?.profile_photo ? (
                                        <img src={user.profile_photo} alt="Perfil" className="w-10 h-10 rounded-full border border-border object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                                            <User className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-semibold text-foreground truncate">{user?.name || getDisplayName()}</span>
                                        <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                                    </div>
                                </div>

                                <a
                                    href="/create-recipe"
                                    className={`flex items-center text-sm font-medium px-4 py-3 rounded-xl transition-colors ${currentPath === '/create-recipe' ? 'text-primary-foreground bg-primary pointer-events-none' : 'text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm'}`}
                                    onClick={(e) => {
                                        if (currentPath === '/create-recipe') e.preventDefault();
                                        else setIsMobileMenuOpen(false);
                                    }}
                                >
                                    <Plus className="w-5 h-5 mr-3" />
                                    {t?.nav?.create || 'Crear Receta'}
                                </a>

                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <a
                                        href="/profile"
                                        className={`flex flex-col items-center justify-center gap-2 p-3 text-sm rounded-xl transition-colors border ${currentPath === '/profile' ? 'bg-primary/10 text-primary border-primary/20 pointer-events-none' : 'text-foreground/80 hover:bg-muted border-border/50'}`}
                                        onClick={(e) => {
                                            setIsMobileMenuOpen(false);
                                            if (currentPath === '/profile') e.preventDefault();
                                        }}
                                    >
                                        <User className="w-5 h-5 opacity-70" />
                                        <span className="font-medium">Mi Perfil</span>
                                    </a>

                                    <a
                                        href="/pantry"
                                        className={`flex flex-col items-center justify-center gap-2 p-3 text-sm rounded-xl transition-colors border ${currentPath === '/pantry' ? 'bg-primary/10 text-primary border-primary/20 pointer-events-none' : 'text-foreground/80 hover:bg-muted border-border/50'}`}
                                        onClick={(e) => {
                                            setIsMobileMenuOpen(false);
                                            if (currentPath === '/pantry') e.preventDefault();
                                        }}
                                    >
                                        <ShoppingBasket className="w-5 h-5 opacity-70" />
                                        <span className="font-medium">{t?.nav?.pantry || 'Despensa'}</span>
                                    </a>
                                </div>

                                <a
                                    href="/settings"
                                    className={`flex items-center px-4 py-3 rounded-xl text-sm transition-colors mt-2 border ${currentPath === '/settings' ? 'bg-primary/10 text-primary border-primary/20 pointer-events-none' : 'text-foreground/80 hover:bg-muted border-transparent'}`}
                                    onClick={(e) => {
                                        setIsMobileMenuOpen(false);
                                        if (currentPath === '/settings') e.preventDefault();
                                    }}
                                >
                                    <Settings className="w-5 h-5 mr-3 opacity-70" />
                                    <span className="font-medium">{t?.nav?.settings || 'Ajustes'}</span>
                                </a>

                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        logout();
                                    }}
                                    className="w-full flex items-center px-4 py-3 mt-4 text-sm font-medium text-destructive bg-destructive/5 hover:bg-destructive/10 border border-destructive/20 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-5 h-5 mr-3 opacity-70" />
                                    {t?.nav?.logout || 'Cerrar Sesión'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <a
                                        href="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex flex-col items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl text-secondary-foreground bg-secondary hover:opacity-90 transition-colors"
                                    >
                                        <LogIn className="w-5 h-5" />
                                        {t?.nav?.login || 'Entrar'}
                                    </a>

                                    <a
                                        href="/register"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex flex-col items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl text-primary-foreground bg-primary hover:opacity-90 transition-colors"
                                    >
                                        <User className="w-5 h-5" />
                                        {t?.nav?.register || 'Registro'}
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
