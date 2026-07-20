'use client';

import React, { useState, useEffect, useRef } from 'react';
// Context
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
    Gamepad2
} from 'lucide-react';

export function Navbar() {
    const { isAuthenticated, logout, user } = useAuth();
    const { t } = useSettings();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
            {/* Desktop Top Navbar (Header) */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 dark:bg-card/95 backdrop-blur-md shadow-xs transition-colors duration-300 border-b border-border/50 hidden md:block">
                <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main Navigation">
                    <div className="flex justify-between items-center h-18 w-full transition-all duration-300">
                        {/* Left: Logo */}
                        <div className="flex-none flex items-center justify-start mr-4 lg:mr-8">
                            <a href="/" onClick={handleLogoClick} className="shrink-0 flex items-center gap-2 group">
                                {/* Light Mode Logo */}
                                <img 
                                    src="/images/brand/logo_navbar_light.png" 
                                    alt="Cacomi" 
                                    className="h-10 w-auto object-contain hidden md:block dark:md:hidden group-hover:scale-105 transition-transform"
                                />
                                {/* Dark Mode Logo */}
                                <img 
                                    src="/images/brand/logo_navbar_dark.png" 
                                    alt="Cacomi" 
                                    className="h-10 w-auto object-contain hidden dark:md:block group-hover:scale-105 transition-transform [mask-image:radial-gradient(ellipse_at_center,black_75%,transparent_100%)]"
                                />
                            </a>
                        </div>

                        {/* Center: Main Navigation (Desktop) - Luxury Concept */}
                        <div className="hidden md:flex flex-1 items-center justify-center space-x-2 lg:space-x-3">
                            {/* Vida */}
                            <a 
                                href="/" 
                                onClick={handleLogoClick} 
                                className={`flex items-center gap-1.5 px-4 py-2 text-sm lg:text-base font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${isVidaActive() ? 'bg-[#f4e6d9] text-[#2c2b2a] border border-[#e8d5c4]/50 shadow-xs' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                            >
                                <Home className="w-4 h-4" />
                                <span>{t?.nav?.vida || 'Vida'}</span>
                            </a>
                            
                            {/* Origen */}
                            <a 
                                href="/origen" 
                                className={`flex items-center gap-1.5 px-4 py-2 text-sm lg:text-base font-semibold rounded-full transition-all duration-200 whitespace-nowrap border ${isOrigenActive() ? 'border-dashed border-[#e07e53]/60 bg-[#fdfaf7] text-[#e07e53]' : 'border-dashed border-transparent hover:border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                            >
                                <ShoppingBasket className="w-4 h-4" />
                                <span>{t?.nav?.origen || 'Origen'}</span>
                            </a>

                        </div>
                        
                        {/* Center: Search Bar */}
                        <div className="hidden xl:flex flex-1 items-center justify-center px-2">
                            <NavbarSearch />
                        </div>

                        {/* Right: Actions (Desktop) */}
                        <div className="hidden md:flex flex-none lg:flex-1 items-center justify-end space-x-2 lg:space-x-3">
                            {isAuthenticated ? (
                                <>
                                    <a
                                        href="/create-recipe"
                                        className={`group relative flex items-center text-sm lg:text-base font-medium px-4 lg:px-6 py-2 lg:py-2.5 rounded-full transition-all duration-200 overflow-hidden shadow-sm whitespace-nowrap flex-shrink-0 ${getIsActive('/create-recipe') ? 'text-primary-foreground bg-primary pointer-events-none' : 'text-primary-foreground bg-primary hover:scale-[1.02] hover:shadow-md'}`}
                                        aria-label={t?.nav?.create || 'Crear'}
                                        onClick={(e) => currentPath === '/create-recipe' && e.preventDefault()}
                                    >
                                        <Plus className="w-5 h-5 mr-1 lg:mr-2 transition-transform group-hover:rotate-90" />
                                        {t?.nav?.create || 'Crear Receta'}
                                    </a>

                                    {/* Profile Dropdown Container */}
                                    <div className="relative ml-1" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                            className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-transparent hover:border-border/50 hover:bg-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 relative z-50"
                                            aria-haspopup="true"
                                            aria-expanded={isProfileDropdownOpen}
                                        >
                                            {user?.profile_photo ? (
                                                <img src={user.profile_photo} alt="Perfil" className="w-8 h-8 rounded-full border border-border/80 object-cover shadow-sm" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary border border-primary/10">
                                                    <User className="w-4 h-4" />
                                                </div>
                                            )}
                                            <div className="flex flex-col text-left">
                                                <span className="text-sm font-semibold leading-none text-foreground">
                                                    {getDisplayName()}
                                                </span>
                                            </div>
                                        </button>

                                        {/* Dropdown Menu */}
                                        <div
                                            className={`absolute right-0 mt-2 w-56 transform origin-top-right rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl ring-1 ring-black/5 transition-all duration-200 ease-out z-50 ${isProfileDropdownOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                                        >
                                            <div className="p-2 space-y-1">
                                                {/* Profile Info Header in Dropdown */}
                                                <div className="px-3 pb-3 pt-2 mb-1 border-b border-border/50">
                                                    <p className="text-sm font-semibold text-foreground">{user?.name || getDisplayName()}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                                </div>

                                                <a
                                                    href="/profile"
                                                    className={`flex items-center px-3 py-2 text-sm lg:text-base rounded-xl transition-colors ${currentPath === '/profile' ? 'bg-primary/10 text-primary font-medium pointer-events-none' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}`}
                                                    onClick={(e) => {
                                                        setIsProfileDropdownOpen(false);
                                                        if (currentPath === '/profile') e.preventDefault();
                                                    }}
                                                >
                                                    <User className="w-5 h-5 mr-3 opacity-70" />
                                                    {t?.nav?.profile || 'Mi Perfil'}
                                                </a>

                                                <a
                                                    href="/saved-recipes"
                                                    className={`flex items-center px-3 py-2 text-sm lg:text-base rounded-xl transition-colors ${currentPath === '/saved-recipes' ? 'bg-primary/10 text-primary font-medium pointer-events-none' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}`}
                                                    onClick={(e) => {
                                                        setIsProfileDropdownOpen(false);
                                                        if (currentPath === '/saved-recipes') e.preventDefault();
                                                    }}
                                                >
                                                    <Download className="w-5 h-5 mr-3 opacity-70" />
                                                    {t?.profile?.savedRecipes || 'Recetas Guardadas'}
                                                </a>

                                                <a
                                                    href="/profile/health-progress"
                                                    className="relative flex items-center px-3 py-2 text-sm lg:text-base rounded-xl transition-colors pointer-events-none cursor-not-allowed group"
                                                    onClick={(e) => {
                                                        setIsProfileDropdownOpen(false);
                                                        e.preventDefault();
                                                    }}
                                                >
                                                    <div className="flex items-center flex-1 opacity-60">
                                                        <Activity className="w-5 h-5 mr-3" />
                                                        <span className="flex-1">{t?.nav?.progress || 'Mi Progreso'}</span>
                                                    </div>
                                                    <span className="bg-primary/10 text-primary text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-primary/20 backdrop-blur-md shadow-sm ml-2 tracking-widest z-[60]">
                                                        {t?.nav?.comingSoon || 'Soon'}
                                                    </span>
                                                </a>

                                                <a
                                                    href="/settings"
                                                    className={`flex items-center px-3 py-2 text-sm lg:text-base rounded-xl transition-colors ${currentPath === '/settings' ? 'bg-primary/10 text-primary font-medium pointer-events-none' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}`}
                                                    onClick={(e) => {
                                                        setIsProfileDropdownOpen(false);
                                                        if (currentPath === '/settings') e.preventDefault();
                                                    }}
                                                >
                                                    <Settings className="w-5 h-5 mr-3 opacity-70" />
                                                    {t?.nav?.settings || 'Ajustes'}
                                                </a>

                                                {(user?.role === 'ADMIN') && (
                                                    <a
                                                        data-astro-reload
                                                        href={adminPath}
                                                        className="flex items-center px-3 py-2 text-sm lg:text-base rounded-xl transition-colors text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-medium"
                                                        onClick={() => setIsProfileDropdownOpen(false)}
                                                    >
                                                        <Settings className="w-5 h-5 mr-3 opacity-80" />
                                                        Admin Panel
                                                    </a>
                                                )}

                                                <div className="h-px bg-border/50 my-1 mx-2" />

                                                <button
                                                    onClick={() => {
                                                        setIsProfileDropdownOpen(false);
                                                        logout();
                                                    }}
                                                    className="w-full flex items-center px-3 py-2 text-sm lg:text-base font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                                                >
                                                    <LogOut className="w-5 h-5 mr-3 opacity-80" />
                                                    {t?.nav?.logout || 'Cerrar Sesión'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // Guest Users Actions
                                <>
                                    <a
                                        href="/settings"
                                        className="flex items-center text-muted-foreground hover:bg-muted p-2 mr-1 rounded-full transition-colors"
                                        title={t?.nav?.settings || 'Ajustes'}
                                    >
                                        <Settings className="w-5 h-5" />
                                    </a>
                                    <div className="w-px h-5 bg-border/50 mx-1 hidden lg:block"></div>
                                    <a
                                        href="/login"
                                        className="flex items-center text-sm lg:text-base font-bold px-6 py-2 rounded-full text-white bg-[#e07e53] hover:bg-[#d06e43] hover:opacity-95 shadow-md shadow-[#e07e53]/15 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                                    >
                                        <LogIn className="w-4 h-4 mr-2" />
                                        {t?.nav?.login || 'Entrar'}
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Top Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 dark:bg-card/95 backdrop-blur-md shadow-xs border-b border-border/50 md:hidden h-14 flex items-center justify-between px-4">
                <div className="w-8"></div> {/* Spacer to center the logo */}
                <a href="/" onClick={handleLogoClick} className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 h-12">
                    {/* Light Mode Logo */}
                    <img 
                        src="/images/brand/logo_navbar_light.png" 
                        alt="Cacomi" 
                        className="h-full w-auto object-contain dark:hidden"
                    />
                    {/* Dark Mode Logo */}
                    <img 
                        src="/images/brand/logo_navbar_dark.png" 
                        alt="Cacomi" 
                        className="h-full w-auto object-contain hidden dark:block [mask-image:radial-gradient(ellipse_at_center,black_75%,transparent_100%)]"
                    />
                </a>
                
                <div className="flex items-center justify-end w-auto min-w-[80px] gap-1">
                    {!isAuthenticated && (
                        <a href="/settings" className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors" aria-label="Ajustes">
                            <Settings className="w-5 h-5" />
                        </a>
                    )}
                    <NavbarSearch isMobile={true} />
                </div>
            </header>


            {/* Mobile Bottom Navigation Bar - Grouped */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border/50 md:hidden pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <div className="flex w-full h-16">
                    {/* Vida */}
                    <a 
                        href="/" 
                        onClick={handleLogoClick} 
                        className={`flex flex-1 flex-col items-center justify-center gap-1 ${isVidaActive() ? 'text-[#e07e53] font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Home className="w-5 h-5" />
                        <span className="text-[11px] font-medium leading-none whitespace-nowrap">{t?.nav?.vida || 'Vida'}</span>
                    </a>

                    {/* Origen */}
                    <a 
                        href="/origen" 
                        className={`flex flex-1 flex-col items-center justify-center gap-1 ${isOrigenActive() ? 'text-[#e07e53] font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <ShoppingBasket className="w-5 h-5" />
                        <span className="text-[11px] font-medium leading-none whitespace-nowrap">{t?.nav?.origen || 'Origen'}</span>
                    </a>

                    {/* Menu / Profile / Login */}
                    {isAuthenticated ? (
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)} 
                            className={`flex flex-1 flex-col items-center justify-center gap-1 ${isMobileMenuOpen ? 'text-[#e07e53]' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {user?.profile_photo ? (
                                <img src={user.profile_photo} alt="Perfil" className="w-6 h-6 rounded-full border-2 border-transparent object-cover" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                            <span className="text-[11px] font-medium leading-none whitespace-nowrap">{t?.nav?.menu || 'Menú'}</span>
                        </button>
                    ) : (
                        <a href="/login" className="flex flex-1 flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground">
                            <LogIn className="w-5 h-5" />
                            <span className="text-[11px] font-medium leading-none whitespace-nowrap">{t?.nav?.login || 'Entrar'}</span>
                        </a>
                    )}
                </div>
            </nav>

            {/* Mobile Drawer (Menu) */}
            {isMobileMenuOpen && isAuthenticated && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="absolute top-auto bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl p-4 flex flex-col slide-up-animation transition-transform">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">{t?.nav?.accountMenu || 'Menú de Cuenta'}</h2>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-muted">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-muted/50 border border-border/50">
                            {user?.profile_photo ? (
                                <img src={user.profile_photo} alt="Perfil" className="w-12 h-12 rounded-full border border-border object-cover" />
                            ) : (
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                                    <User className="w-6 h-6" />
                                </div>
                            )}
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-base font-semibold text-foreground truncate">{user?.name || getDisplayName()}</span>
                                <span className="text-sm text-muted-foreground truncate">{user?.email}</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6 overflow-y-auto max-h-[50vh]">
                            {/* Vida Section in Menu */}
                            <div>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">Vida</h3>
                                <div className="space-y-1">
                                    <a href="/blog" className={`flex items-center px-3 py-2.5 rounded-xl border border-border/40 transition-colors text-sm ${getIsActive('/blog') ? 'bg-primary/10 text-primary pointer-events-none' : 'hover:bg-muted text-foreground/80 hover:text-foreground'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                        <BookOpen className="w-5 h-5 mr-3 opacity-70" />
                                        Blog & Guías
                                    </a>
                                    <a href="/juego" data-astro-reload className={`flex items-center px-3 py-2.5 rounded-xl border border-border/40 transition-colors text-sm relative ${getIsActive('/juego') ? 'bg-primary/10 text-primary pointer-events-none' : 'hover:bg-muted text-foreground/80 hover:text-foreground'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                        <Gamepad2 className="w-5 h-5 mr-3 opacity-70" />
                                        El Reto Diario
                                        <span className="absolute top-2.5 right-3 bg-green-500 text-[8px] font-black text-white uppercase px-1.5 py-0.5 rounded-full scale-90">
                                            NEW
                                        </span>
                                    </a>
                                </div>
                            </div>

                            {/* Origen Section in Menu */}
                            <div>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">Origen</h3>
                                <div className="space-y-1">
                                    <a href="/planner" className={`flex items-center px-3 py-2.5 rounded-xl border border-border/40 transition-colors text-sm ${getIsActive('/planner') ? 'bg-primary/10 text-primary pointer-events-none' : 'hover:bg-muted text-foreground/80 hover:text-foreground'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                        <CalendarDays className="w-5 h-5 mr-3 opacity-70" />
                                        {t?.nav?.planner || 'Planificador'}
                                    </a>
                                    <a href="/pantry" className={`flex items-center px-3 py-2.5 rounded-xl border border-border/40 transition-colors text-sm ${getIsActive('/pantry') ? 'bg-primary/10 text-primary pointer-events-none' : 'hover:bg-muted text-foreground/80 hover:text-foreground'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                        <ShoppingBasket className="w-5 h-5 mr-3 opacity-70" />
                                        {t?.nav?.pantry || 'Despensa'}
                                    </a>
                                    <a href="/preorder" className={`flex items-center px-3 py-2.5 rounded-xl border border-border/40 transition-colors text-sm relative ${getIsActive('/preorder') ? 'bg-primary/10 text-primary pointer-events-none' : 'hover:bg-muted text-foreground/80 hover:text-foreground'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                        <ShoppingBasket className="w-5 h-5 mr-3 opacity-70" />
                                        <span className="flex-1">{t?.nav?.preorder || 'Comprar Comida'}</span>
                                        <span className="bg-amber-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-md ml-2 scale-90">
                                            PREVENTA
                                        </span>
                                    </a>
                                </div>
                            </div>

                            {/* Mi Cuenta Section */}
                            <div>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">Mi Cuenta</h3>
                                <div className="space-y-1">
                                    <a href="/profile" className={`flex items-center px-3 py-2.5 rounded-xl border border-border/40 transition-colors text-sm ${getIsActive('/profile') ? 'bg-primary/10 text-primary pointer-events-none' : 'hover:bg-muted text-foreground/80 hover:text-foreground'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                        <User className="w-5 h-5 mr-3 opacity-70" />
                                        {t?.nav?.profile || 'Mi Perfil'}
                                    </a>
                                    <a href="/saved-recipes" className={`flex items-center px-3 py-2.5 rounded-xl border border-border/40 transition-colors text-sm ${getIsActive('/saved-recipes') ? 'bg-primary/10 text-primary pointer-events-none' : 'hover:bg-muted text-foreground/80 hover:text-foreground'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                        <Download className="w-5 h-5 mr-3 opacity-70" />
                                        {t?.profile?.savedRecipes || 'Recetas Guardadas'}
                                    </a>
                                    <a href="/settings" className={`flex items-center px-3 py-2.5 rounded-xl border border-border/40 transition-colors text-sm ${getIsActive('/settings') ? 'bg-primary/10 text-primary pointer-events-none' : 'hover:bg-muted text-foreground/80 hover:text-foreground'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                        <Settings className="w-5 h-5 mr-3 opacity-70" />
                                        {t?.nav?.settings || 'Ajustes'}
                                    </a>

                                    {(user?.role === 'ADMIN') && (
                                        <a
                                            data-astro-reload
                                            href={adminPath}
                                            className="flex items-center px-3 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/30 transition-colors text-sm text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-bold"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Settings className="w-5 h-5 mr-3 opacity-80" />
                                            Admin Panel
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <button onClick={logout} className="w-full flex items-center justify-center px-4 py-3 mt-auto text-base font-bold text-destructive bg-destructive/5 hover:bg-destructive/10 border border-destructive/20 rounded-xl transition-colors">
                            <LogOut className="w-6 h-6 mr-2 opacity-70" />
                            {t?.nav?.logout || 'Cerrar Sesión'}
                        </button>
                    </div>
                </div>
            )}
            
            {/* Global style to animate bottom sheet */}
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .slide-up-animation {
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .pb-safe {
                    padding-bottom: env(safe-area-inset-bottom, 20px);
                }
                /* Add padding to body to prevent content from hiding behind bottom nav on mobile */
                @media (max-width: 768px) {
                    body {
                        padding-bottom: calc(4rem + env(safe-area-inset-bottom, 20px));
                    }
                }
            `}</style>
        </>
    );
}
