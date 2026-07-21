'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { NavbarSearch } from './NavbarSearch';

// Icons (Lucide React)
import {
    LogOut,
    LogIn,
    User,
    Settings,
    Menu,
    X,
    Plus,
    Home,
    ShoppingBasket,
    CalendarDays,
    Activity,
    Download,
    BookOpen,
    Gamepad2,
    ChevronRight
} from 'lucide-react';

export function Navbar() {
    const { isAuthenticated, logout, user } = useAuth();
    const { t, language } = useSettings();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };

        if (isProfileDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileDropdownOpen]);

    // Block background scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const [currentPath, setCurrentPath] = useState('');
    // Secret admin path — injected server-side into body[data-admin-path], never in JS bundle
    const [adminPath, setAdminPath] = useState('/admin/dashboard');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentPath(window.location.pathname);
            const prefix = document.body.dataset.adminPath ?? '/admin';
            setAdminPath(`${prefix}/dashboard`);
        }
    }, []);

    // Format user name for display
    const getDisplayName = () => {
        if (!user || !user.name) return '';
        const nameParts = user.name.split(' ');
        if (nameParts.length > 1) {
            return `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`;
        }
        return nameParts[0];
    };

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const activePath = window.location.pathname;
        if (activePath === '/' || activePath === '') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Garantizar el scroll al elemento más alto si window no responde
            setTimeout(() => {
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            }, 10);
        } else {
            window.location.href = '/';
        }
        setIsMobileMenuOpen(false);
    };

    const getIsActive = (path: string) => currentPath === path;

    const isVidaActive = () => {
        return currentPath === '/' || currentPath === '' || currentPath.startsWith('/blog') || currentPath.startsWith('/revista') || currentPath === '/juego';
    };

    const isOrigenActive = () => {
        return currentPath === '/origen' || currentPath === '/planner' || currentPath === '/pantry' || currentPath === '/preorder' || currentPath.startsWith('/recipes');
    };

    return (
        <>
            {/* Desktop Top Navbar (Header) — iOS 18 Glass style */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl transition-colors duration-300 border-b border-black/[0.05] dark:border-white/[0.05] hidden md:block h-14 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full" aria-label="Main Navigation">
                    <div className="flex justify-between items-center h-full w-full">
                        {/* Left: Logo */}
                        <div className="flex-none flex items-center justify-start mr-4 lg:mr-8">
                            <a href="/" onClick={handleLogoClick} className="shrink-0 flex items-center gap-2 group">
                                <img 
                                    src="/images/brand/logo_navbar_light.png" 
                                    alt="Cacomi" 
                                    className="h-8 w-auto object-contain hidden md:block dark:md:hidden group-hover:scale-102 transition-transform"
                                />
                                <img 
                                    src="/images/brand/logo_navbar_dark.png" 
                                    alt="Cacomi" 
                                    className="h-8 w-auto object-contain hidden dark:md:block group-hover:scale-102 transition-transform [mask-image:radial-gradient(ellipse_at_center,black_75%,transparent_100%)]"
                                />
                            </a>
                        </div>

                        {/* Center: Apple Segmented Pill Navigation */}
                        <div className="hidden md:flex flex-1 items-center justify-center space-x-1 bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-full max-w-[280px]">
                            {/* Vida */}
                            <a 
                                href="/" 
                                onClick={handleLogoClick} 
                                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${isVidaActive() ? 'bg-white dark:bg-neutral-800 text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <Home className="w-3.5 h-3.5" />
                                <span>{t?.nav?.vida || 'Vida'}</span>
                            </a>
                            
                            {/* Origen */}
                            <a 
                                href="/origen" 
                                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${isOrigenActive() ? 'bg-white dark:bg-neutral-800 text-[#e07e53] shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <ShoppingBasket className="w-3.5 h-3.5" />
                                <span>{t?.nav?.origen || 'Origen'}</span>
                            </a>
                        </div>
                        
                        {/* Center-Right: Apple Pill Search Bar */}
                        <div className="hidden md:flex flex-1 items-center justify-center px-4 max-w-sm">
                            <NavbarSearch />
                        </div>

                        {/* Right: Actions (Desktop) */}
                        <div className="hidden md:flex flex-none items-center justify-end space-x-3">
                            {isAuthenticated ? (
                                <>
                                    <a
                                        href="/create-recipe"
                                        className={`group relative flex items-center text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-200 shadow-2xs whitespace-nowrap flex-shrink-0 ${getIsActive('/create-recipe') ? 'text-white bg-[#e07e53] pointer-events-none' : 'text-white bg-[#e07e53] hover:scale-[1.02] hover:shadow-xs'}`}
                                        aria-label={t?.nav?.create || 'Crear'}
                                        onClick={(e) => currentPath === '/create-recipe' && e.preventDefault()}
                                    >
                                        <Plus className="w-4 h-4 mr-1 transition-transform group-hover:rotate-90" />
                                        {t?.nav?.create || 'Crear Receta'}
                                    </a>

                                    {/* Profile Dropdown Container */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                            className="flex items-center gap-2 p-0.5 rounded-full border border-transparent hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all focus:outline-none relative z-50"
                                            aria-haspopup="true"
                                            aria-expanded={isProfileDropdownOpen}
                                        >
                                            {user?.profile_photo ? (
                                                <img src={user.profile_photo} alt="Perfil" className="w-8 h-8 rounded-full border border-black/10 object-cover shadow-2xs" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary border border-primary/10">
                                                    <User className="w-4 h-4" />
                                                </div>
                                            )}
                                        </button>

                                        {/* Apple Popover Style Dropdown Menu */}
                                        <div
                                            className={`absolute right-0 mt-2 w-56 transform origin-top-right rounded-[20px] border border-black/[0.08] dark:border-white/[0.08] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl shadow-xl ring-1 ring-black/5 transition-all duration-200 ease-out z-50 ${isProfileDropdownOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                                        >
                                            <div className="p-1.5 space-y-0.5">
                                                {/* Profile Info Header in Dropdown */}
                                                <div className="px-3 pb-3 pt-2.5 mb-1 border-b border-black/[0.05] dark:border-white/[0.05]">
                                                    <p className="text-sm font-semibold text-foreground truncate">{user?.name || getDisplayName()}</p>
                                                    <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                                                </div>

                                                <a
                                                    href="/profile"
                                                    className={`flex items-center px-3 py-2 text-xs rounded-xl transition-colors ${currentPath === '/profile' ? 'bg-primary/10 text-primary font-semibold pointer-events-none' : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
                                                    onClick={(e) => {
                                                        setIsProfileDropdownOpen(false);
                                                        if (currentPath === '/profile') e.preventDefault();
                                                    }}
                                                >
                                                    <User className="w-4 h-4 mr-2.5 opacity-70" />
                                                    {t?.nav?.profile || 'Mi Perfil'}
                                                </a>

                                                <a
                                                    href="/saved-recipes"
                                                    className={`flex items-center px-3 py-2 text-xs rounded-xl transition-colors ${currentPath === '/saved-recipes' ? 'bg-primary/10 text-primary font-semibold pointer-events-none' : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
                                                    onClick={(e) => {
                                                        setIsProfileDropdownOpen(false);
                                                        if (currentPath === '/saved-recipes') e.preventDefault();
                                                    }}
                                                >
                                                    <Download className="w-4 h-4 mr-2.5 opacity-70" />
                                                    {t?.profile?.savedRecipes || 'Recetas Guardadas'}
                                                </a>

                                                <a
                                                    href="/profile/health-progress"
                                                    className="relative flex items-center px-3 py-2 text-xs rounded-xl transition-colors pointer-events-none cursor-not-allowed group opacity-55"
                                                >
                                                    <Activity className="w-4 h-4 mr-2.5" />
                                                    <span className="flex-1">{t?.nav?.progress || 'Mi Progreso'}</span>
                                                    <span className="bg-primary/10 text-primary text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full scale-90">
                                                        {t?.nav?.comingSoon || 'Soon'}
                                                    </span>
                                                </a>

                                                <a
                                                    href="/settings"
                                                    className={`flex items-center px-3 py-2 text-xs rounded-xl transition-colors ${currentPath === '/settings' ? 'bg-primary/10 text-primary font-semibold pointer-events-none' : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
                                                    onClick={(e) => {
                                                        setIsProfileDropdownOpen(false);
                                                        if (currentPath === '/settings') e.preventDefault();
                                                    }}
                                                >
                                                    <Settings className="w-4 h-4 mr-2.5 opacity-70" />
                                                    {t?.nav?.settings || 'Ajustes'}
                                                </a>

                                                {(user?.role === 'ADMIN') && (
                                                    <a
                                                        data-astro-reload
                                                        href={adminPath}
                                                        className="flex items-center px-3 py-2 text-xs rounded-xl transition-colors text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 font-semibold"
                                                        onClick={() => setIsProfileDropdownOpen(false)}
                                                    >
                                                        <Settings className="w-4 h-4 mr-2.5 opacity-80" />
                                                        Admin Panel
                                                    </a>
                                                )}

                                                <div className="h-px bg-black/[0.05] dark:bg-white/[0.05] my-1" />

                                                <button
                                                    onClick={() => {
                                                        setIsProfileDropdownOpen(false);
                                                        logout();
                                                    }}
                                                    className="w-full flex items-center px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-xl transition-colors text-left"
                                                >
                                                    <LogOut className="w-4 h-4 mr-2.5 opacity-80" />
                                                    {t?.nav?.logout || 'Cerrar Sesión'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <a
                                        href="/settings"
                                        className="flex items-center text-muted-foreground hover:bg-black/[0.04] dark:hover:bg-white/10 p-2 rounded-full transition-colors"
                                        title={t?.nav?.settings || 'Ajustes'}
                                    >
                                        <Settings className="w-4 h-4" />
                                    </a>
                                    <div className="w-px h-4 bg-black/[0.1] dark:bg-white/[0.1] mx-1"></div>
                                    <a
                                        href="/login"
                                        className="flex items-center text-xs font-bold px-5 py-2 rounded-full text-white bg-[#e07e53] hover:bg-[#d06e43] hover:opacity-95 shadow-2xs transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                                    >
                                        <LogIn className="w-3.5 h-3.5 mr-1.5" />
                                        {t?.nav?.login || 'Entrar'}
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Top Header — Translucent Apple style */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-black/[0.05] dark:border-white/[0.05] md:hidden h-12 flex items-center justify-between px-4">
                <div className="w-8"></div>
                <a href="/" onClick={handleLogoClick} className="flex items-center absolute left-1/2 -translate-x-1/2 h-8">
                    <img 
                        src="/images/brand/logo_navbar_light.png" 
                        alt="Cacomi" 
                        className="h-full w-auto object-contain dark:hidden"
                    />
                    <img 
                        src="/images/brand/logo_navbar_dark.png" 
                        alt="Cacomi" 
                        className="h-full w-auto object-contain hidden dark:block [mask-image:radial-gradient(ellipse_at_center,black_75%,transparent_100%)]"
                    />
                </a>
                
                <div className="flex items-center justify-end gap-1">
                    {!isAuthenticated && (
                        <a href="/settings" className="p-2 text-muted-foreground hover:bg-black/[0.04] dark:hover:bg-white/10 rounded-full transition-colors" aria-label="Ajustes">
                            <Settings className="w-4 h-4" />
                        </a>
                    )}
                    <NavbarSearch isMobile={true} />
                </div>
            </header>


            {/* Mobile Bottom Navigation Bar (Floating Dock) — Translucent iOS Style */}
            {mounted && createPortal(
                <nav className="fixed bottom-5 left-4 right-4 max-w-md mx-auto z-40 bg-white/80 dark:bg-neutral-900/85 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] rounded-full shadow-lg shadow-black/10 md:hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="flex w-full h-14 items-center justify-around px-2">
                        {/* Vida */}
                        <a 
                            href="/" 
                            onClick={handleLogoClick} 
                            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${isVidaActive() ? 'text-[#e07e53] bg-[#e07e53]/10 font-bold scale-[1.02]' : 'text-[#8e8e93] hover:text-foreground'}`}
                        >
                            <Home className="w-5 h-5" />
                            <span className="text-[8px] font-semibold mt-0.5 whitespace-nowrap">{t?.nav?.vida || 'Vida'}</span>
                        </a>

                        {/* Origen */}
                        <a 
                            href="/origen" 
                            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${isOrigenActive() ? 'text-[#e07e53] bg-[#e07e53]/10 font-bold scale-[1.02]' : 'text-[#8e8e93] hover:text-[#e07e53]'}`}
                        >
                            <ShoppingBasket className="w-5 h-5" />
                            <span className="text-[8px] font-semibold mt-0.5 whitespace-nowrap">{t?.nav?.origen || 'Origen'}</span>
                        </a>

                        {/* Menu / Profile / Login */}
                        {isAuthenticated ? (
                            <button 
                                onClick={() => setIsMobileMenuOpen(true)} 
                                className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${isMobileMenuOpen ? 'text-[#e07e53] bg-[#e07e53]/10 font-bold scale-[1.02]' : 'text-[#8e8e93] hover:text-foreground'}`}
                            >
                                {user?.profile_photo ? (
                                    <img src={user.profile_photo} alt="Perfil" className="w-5 h-5 rounded-full border border-black/10 object-cover" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                                <span className="text-[8px] font-semibold mt-0.5 whitespace-nowrap">{t?.nav?.menu || 'Menú'}</span>
                            </button>
                        ) : (
                            <a 
                                href="/login" 
                                className="flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 text-[#8e8e93] hover:text-foreground"
                            >
                                <LogIn className="w-5 h-5" />
                                <span className="text-[8px] font-semibold mt-0.5 whitespace-nowrap">{t?.nav?.login || 'Entrar'}</span>
                            </a>
                        )}
                    </div>
                </nav>,
                document.body
            )}

            {/* Mobile Apple-style Bottom Sheet Menu */}
            {mounted && isMobileMenuOpen && isAuthenticated && createPortal(
                <div className="fixed inset-0 z-[60] md:hidden flex flex-col justify-end">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300" onClick={() => setIsMobileMenuOpen(false)} />
                    
                    {/* iOS Bottom Sheet */}
                    <div className="relative z-50 bg-[#f2f2f7] dark:bg-[#000000] rounded-t-[32px] w-full max-h-[85vh] flex flex-col slide-up-animation shadow-2xl border-t border-black/5 dark:border-white/5 pb-safe overflow-hidden">
                        {/* Drag Handle Indicator */}
                        <div className="w-9 h-1 bg-black/10 dark:bg-white/20 rounded-full mx-auto mt-3 mb-2 shrink-0" />
                        
                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-2.5 bg-[#f2f2f7] dark:bg-[#000000] border-b border-black/[0.03] dark:border-white/[0.03] shrink-0">
                            <h2 className="text-base font-bold text-foreground">{t?.nav?.accountMenu || 'Menú de Cuenta'}</h2>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)} 
                                className="text-xs font-semibold text-[#e07e53] hover:bg-black/5 dark:hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors"
                            >
                                {language === 'es' ? 'Listo' : 'Done'}
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                            {/* User Profile Card iOS Style */}
                            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] shadow-2xs border border-black/[0.04] dark:border-white/[0.04]">
                                {user?.profile_photo ? (
                                    <img src={user.profile_photo} alt="Perfil" className="w-12 h-12 rounded-full border border-black/10 object-cover shadow-2xs" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary border border-primary/10">
                                        <User className="w-6 h-6" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-foreground truncate">{user?.name || getDisplayName()}</h3>
                                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                </div>
                            </div>

                            {/* iOS Settings Group 1: Vida */}
                            <div>
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">Vida</h3>
                                <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-2xs border border-black/[0.04] dark:border-white/[0.04] divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                                    <a href="/blog" className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                        <div className="flex items-center text-foreground">
                                            <BookOpen className="w-5 h-5 mr-3 text-amber-500" />
                                            <span>Blog & Guías</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#c7c7cc]" />
                                    </a>
                                    <a href="/juego" data-astro-reload className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                        <div className="flex items-center text-foreground">
                                            <Gamepad2 className="w-5 h-5 mr-3 text-emerald-500" />
                                            <span>El Reto Diario</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full scale-90">
                                                NEW
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-[#c7c7cc]" />
                                        </div>
                                    </a>
                                </div>
                            </div>

                            {/* iOS Settings Group 2: Origen */}
                            <div>
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">Origen</h3>
                                <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-2xs border border-black/[0.04] dark:border-white/[0.04] divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                                    <a href="/planner" className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                        <div className="flex items-center text-foreground">
                                            <CalendarDays className="w-5 h-5 mr-3 text-[#e07e53]" />
                                            <span>{t?.nav?.planner || 'Planificador'}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#c7c7cc]" />
                                    </a>
                                    <a href="/pantry" className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                        <div className="flex items-center text-foreground">
                                            <ShoppingBasket className="w-5 h-5 mr-3 text-[#e07e53]" />
                                            <span>{t?.nav?.pantry || 'Despensa'}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#c7c7cc]" />
                                    </a>
                                    <a href="/preorder" className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                        <div className="flex items-center text-foreground">
                                            <ShoppingBasket className="w-5 h-5 mr-3 text-[#e07e53]" />
                                            <span>{t?.nav?.preorder || 'Comprar Comida'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-[#e07e53] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full scale-90">
                                                PREVENTA
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-[#c7c7cc]" />
                                        </div>
                                    </a>
                                </div>
                            </div>

                            {/* iOS Settings Group 3: Mi Cuenta */}
                            <div>
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">Mi Cuenta</h3>
                                <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-2xs border border-black/[0.04] dark:border-white/[0.04] divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                                    <a href="/profile" className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                        <div className="flex items-center text-foreground">
                                            <User className="w-5 h-5 mr-3 text-indigo-500" />
                                            <span>{t?.nav?.profile || 'Mi Perfil'}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#c7c7cc]" />
                                    </a>
                                    <a href="/saved-recipes" className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                        <div className="flex items-center text-foreground">
                                            <Download className="w-5 h-5 mr-3 text-blue-500" />
                                            <span>{t?.profile?.savedRecipes || 'Recetas Guardadas'}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#c7c7cc]" />
                                    </a>
                                    <a href="/settings" className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                        <div className="flex items-center text-foreground">
                                            <Settings className="w-5 h-5 mr-3 text-gray-500" />
                                            <span>{t?.nav?.settings || 'Ajustes'}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#c7c7cc]" />
                                    </a>

                                    {(user?.role === 'ADMIN') && (
                                        <a href={adminPath} data-astro-reload className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-indigo-600 dark:text-indigo-400 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
                                            <div className="flex items-center">
                                                <Settings className="w-5 h-5 mr-3 text-indigo-500 opacity-80" />
                                                <span>Admin Panel</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-[#c7c7cc]" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            
                            {/* Sign Out Button (iOS styled list cell) */}
                            <div className="pt-2">
                                <button 
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        logout();
                                    }} 
                                    className="w-full flex items-center justify-center p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] text-destructive font-semibold text-sm shadow-2xs border border-black/[0.04] dark:border-white/[0.04] hover:bg-destructive/5 active:bg-destructive/10 transition-colors"
                                >
                                    <LogOut className="w-5 h-5 mr-2" />
                                    {t?.nav?.logout || 'Cerrar Sesión'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            
            {/* Global style to animate bottom sheet */}
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .slide-up-animation {
                    animation: slideUp 0.28s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }
                .pb-safe {
                    padding-bottom: env(safe-area-inset-bottom, 20px);
                }
                /* Add padding to body to prevent content from hiding behind bottom nav on mobile */
                @media (max-width: 768px) {
                    body {
                        padding-bottom: calc(3.5rem + env(safe-area-inset-bottom, 20px)) !important;
                    }
                }
            `}</style>
        </>
    );
}
