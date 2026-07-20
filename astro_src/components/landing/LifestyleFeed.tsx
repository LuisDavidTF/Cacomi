'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@context/SettingsContext';
import { Clock, User, Bookmark, BookmarkCheck, RefreshCw, X, ArrowRight, BookOpen } from 'lucide-react';
import { slugify } from '@/utils/slugify';

interface Recipe {
    id: string | number;
    publicId?: string;
    name: string;
    description: string;
    prepTime: number;
    userName?: string;
    imageUrl?: string;
    mealType?: string;
}

interface Article {
    id: string;
    title: string;
    description: string;
    content: string;
    category: 'FILOSOFÍA' | 'RECETAS' | 'INTERIORES' | 'ATELIER' | 'COMUNIDAD';
    author: string;
    readTime: number;
    image: string;
    date: string;
}

interface LifestyleFeedProps {
    initialRecipes: { data: Recipe[] };
}

export function LifestyleFeed({ initialRecipes }: LifestyleFeedProps) {
    const { t, language } = useSettings();
    const [activeTab, setActiveTab] = useState<string>('all');
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [showNewsletterModal, setShowNewsletterModal] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Static Lifestyle Articles
    const staticArticles: Article[] = [
        {
            id: 'art-1',
            title: 'Arquitectura del silencio: espacios que respiran.',
            description: 'Cómo el entorno físico dicta nuestro estado mental y el valor de simplificar los espacios cotidianos.',
            category: 'FILOSOFÍA',
            author: 'Cacomi',
            readTime: 12,
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
            date: '2026-07-20',
            content: `El silencio no es la ausencia de sonido, sino la presencia de claridad. En el diseño de nuestros hogares, cada objeto que agregamos compite por nuestra atención subconsciente. La arquitectura del silencio propone un retorno a lo esencial: líneas limpias, materiales naturales crudos y abundante luz natural.

Al reducir el desorden visual, permitimos que la mente descanse. La cocina, tradicionalmente un espacio de alta estimulación y ruido, se convierte en un templo de contemplación cuando eliminamos los utensilios redundantes y priorizamos herramientas de alta calidad hechas de piedra, madera y hierro. 

Crear un espacio que respira es el primer paso hacia una vida consciente. No se trata de vaciar tus habitaciones, sino de llenarlas con intención.`
        },
        {
            id: 'art-2',
            title: 'Curando el vacío: menos es más en el diseño.',
            description: 'Lecciones de diseño japonés sobre el concepto de "Ma" (el espacio vacío con propósito) y su impacto en el bienestar.',
            category: 'INTERIORES',
            author: 'Diseño',
            readTime: 5,
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
            date: '2026-07-18',
            content: `En la estética tradicional japonesa, el concepto de "Ma" representa la apreciación del vacío. No es un espacio inútil o una simple brecha, sino una pausa activa que define y resalta los elementos a su alrededor.

En un mundo saturado de información y estímulos, curar el vacío en nuestro hogar es un acto de resistencia y autocuidado. Un muro blanco sin cuadros, una esquina libre de muebles o una mesa de comedor de madera maciza limpia de adornos crean áreas de descanso cognitivo.

Al decorar tu hogar, pregúntate: ¿este objeto aporta serenidad o simplemente llena un espacio? Elige la serenidad. Deja espacio para que fluya la energía y tu mente respire.`
        },
        {
            id: 'art-3',
            title: 'Siguiendo el hilo: del campo a la prenda.',
            description: 'Un viaje al origen de los textiles premium, el valor de las fibras 100% naturales y la confección lenta.',
            category: 'ATELIER',
            author: 'Oficio',
            readTime: 8,
            image: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800&q=80',
            date: '2026-07-15',
            content: `La verdadera elegancia no grita, se siente en la textura de un tejido honesto. La filosofía del Atelier Cacomi se basa en el respeto al origen de cada fibra. Desde los campos de algodón crudo hasta el telar artesanal, cada paso en el proceso de confección lenta aporta carácter y durabilidad a la prenda.

Optar por camisas de lino a la medida o pantalones de dril de algodón 100% natural es una declaración de intenciones. Estas fibras respiran con tu cuerpo, envejecen con gracia y reducen el impacto ecológico.

En un mundo obsesionado con la inmediatez, vestir prendas confeccionadas bajo pedido nos reconecta con el ritmo de los artesanos. La espera justifica la calidad.`
        },
        {
            id: 'art-4',
            title: 'El minimalismo como un ritual diario en tu cocina.',
            description: 'Simplificar la preparación de alimentos y la mente para redescubrir los sabores auténticos.',
            category: 'FILOSOFÍA',
            author: 'Editorial',
            readTime: 15,
            image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
            date: '2026-07-12',
            content: `Cocinar de forma minimalista no significa comer aburrido; al contrario, es el camino para redescubrir el verdadero sabor de los ingredientes. Cuando sobrecargamos un plato con condimentos industriales y capas infinitas de salsas pesadas, ocultamos la frescura de los alimentos.

El minimalismo culinario propone:
- Utilizar un máximo de 5 ingredientes de la más alta calidad por platillo.
- Dominar técnicas de cocción sencillas que respeten los nutrientes (vapor, asado al carbón, emulsiones naturales).
- Disfrutar del proceso de preparación como una meditación activa.

Al simplificar tu despensa y tu menú, liberas espacio mental y dejas que los insumos puros de la tierra sean los protagonistas.`
        }
    ];

    // Load saved articles/recipes from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('cacomi_saved_lifestyle');
        if (stored) {
            try {
                setSavedIds(JSON.parse(stored));
            } catch (e) {
                console.error("Error parsing saved items", e);
            }
        }
    }, []);

    // Save items to localStorage when state changes
    const toggleSave = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        let newSavedIds = [];
        if (savedIds.includes(id)) {
            newSavedIds = savedIds.filter(item => item !== id);
        } else {
            newSavedIds = [...savedIds, id];
        }
        
        setSavedIds(newSavedIds);
        localStorage.setItem('cacomi_saved_lifestyle', JSON.stringify(newSavedIds));
    };

    // Combine static articles and dynamic recipes into feed items
    const getCombinedItems = () => {
        const recipeItems: Article[] = (initialRecipes?.data || []).map(recipe => ({
            id: `recipe-${recipe.publicId || recipe.id}`,
            title: recipe.name,
            description: recipe.description || 'Deliciosa receta saludable para disfrutar hoy.',
            content: `/recipes/${slugify(recipe.name)}/${recipe.publicId || recipe.id}`, // points to recipe detail
            category: 'RECETAS',
            author: recipe.userName || 'Chef Cacomi',
            readTime: recipe.prepTime || 15,
            image: recipe.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
            date: '2026-07-20'
        }));

        return [...staticArticles, ...recipeItems];
    };

    const allItems = getCombinedItems();

    // Filter items based on active tab
    const getFilteredItems = () => {
        if (activeTab === 'saved') {
            return allItems.filter(item => savedIds.includes(item.id));
        }
        if (activeTab === 'recipes') {
            return allItems.filter(item => item.category === 'RECETAS');
        }
        if (activeTab === 'philosophy') {
            return allItems.filter(item => item.category === 'FILOSOFÍA');
        }
        if (activeTab === 'interiors') {
            return allItems.filter(item => item.category === 'INTERIORES');
        }
        if (activeTab === 'community') {
            return allItems.filter(item => item.category === 'RECETAS' && item.author !== 'Chef Cacomi');
        }
        return allItems; // Explorar Todo (default)
    };

    const filteredItems = getFilteredItems();

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setIsSubscribed(true);
            setTimeout(() => {
                setIsSubscribed(false);
                setEmail('');
                setShowNewsletterModal(false);
            }, 2500);
        }
    };

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'FILOSOFÍA':
                return 'bg-[#7E5109]/10 text-[#7E5109] dark:bg-[#7E5109]/20 dark:text-[#F39C12]';
            case 'RECETAS':
                return 'bg-[#196F3D]/10 text-[#196F3D] dark:bg-[#196F3D]/20 dark:text-[#2ECC71]';
            case 'INTERIORES':
                return 'bg-[#1A5276]/10 text-[#1A5276] dark:bg-[#1A5276]/20 dark:text-[#3498DB]';
            case 'ATELIER':
                return 'bg-[#5D6D7E]/10 text-[#5D6D7E] dark:bg-[#5D6D7E]/20 dark:text-[#A6ACAF]';
            default:
                return 'bg-[#78281F]/10 text-[#78281F] dark:bg-[#78281F]/20 dark:text-[#E74C3C]';
        }
    };

    return (
        <div className="w-full">
            {/* Elegant Brand Hero (Matching Mockup 2) */}
            <section className="relative bg-[#fcf9f5] dark:bg-card/30 border-b border-[#f3e9dc] dark:border-border/30 overflow-hidden py-16 lg:py-24">
                <div className="container mx-auto px-4 md:px-8 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Hero Text */}
                        <div className="lg:col-span-7 text-left space-y-6">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2c2b2a] dark:text-white leading-tight font-light">
                                Vida. Discover the art of <span className="italic font-normal text-[#e07e53]">curated living.</span>
                            </h1>
                            <p className="text-[#5c5a57] dark:text-gray-300 text-base md:text-lg leading-relaxed max-w-xl font-light">
                                Explore a visual journal dedicated to the textures, rituals, and philosophies that define the Cacomi lifestyle.
                            </p>
                            
                            <div className="flex flex-wrap gap-4 pt-4">
                                <button 
                                    onClick={() => {
                                        const el = document.getElementById('discover-relatos');
                                        el?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-6 py-3 rounded-full bg-[#e07e53] hover:bg-[#d06e43] text-white font-semibold shadow-md shadow-[#e07e53]/10 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {t?.vida?.btnExplore || 'Explorar Vida'}
                                </button>
                                <button 
                                    onClick={() => setShowNewsletterModal(true)}
                                    className="px-6 py-3 rounded-full bg-[#f4e6d9] hover:bg-[#e8d5c4] text-[#2c2b2a] font-semibold transition-all border border-[#e8d5c4]"
                                >
                                    {t?.vida?.btnSubscribe || 'Suscribirse'}
                                </button>
                            </div>
                        </div>

                        {/* Overlapping Featured Card */}
                        <div className="lg:col-span-5 relative flex justify-center">
                            <div 
                                onClick={() => setSelectedArticle(staticArticles[3])} // Capítulo 01 is index 3
                                className="group relative w-full max-w-[360px] bg-white dark:bg-card border border-border/50 rounded-3xl overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                            >
                                <div className="aspect-[4/5] w-full overflow-hidden relative">
                                    <img 
                                        src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80" 
                                        alt="Curated lifestyle" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                                </div>
                                
                                {/* Overlay Floating Info Card */}
                                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 border border-white/20 p-5 rounded-2xl shadow-lg">
                                    <span className="text-[10px] font-bold tracking-widest text-[#e07e53] uppercase block mb-1">
                                        CAPÍTULO 01
                                    </span>
                                    <h3 className="font-serif text-lg font-bold text-[#2c2b2a] dark:text-white leading-snug group-hover:text-[#e07e53] transition-colors">
                                        El minimalismo como un ritual diario.
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Discover Section (Matching Mockup 1) */}
            <section id="discover-relatos" className="container mx-auto px-4 md:px-8 py-16 max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-border/40 pb-6">
                    <div className="text-left">
                        <h2 className="text-3xl font-serif text-[#2c2b2a] dark:text-white font-light">
                            {t?.vida?.discoverTitle || 'Descubre Relatos'}
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            {t?.vida?.discoverSubtitle || 'Explora las mejores ideas para una vida consciente.'}
                        </p>
                    </div>
                    
                    {/* Refresh / Update Button */}
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 rounded-full border border-border text-xs font-semibold text-[#e07e53] bg-white dark:bg-card hover:bg-muted active:scale-95 transition-all flex items-center gap-2 self-start md:self-auto shadow-xs border-[#e8d5c4]/60"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {language === 'es' ? 'Actualizar Feed' : 'Refresh Feed'}
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
                    <button 
                        onClick={() => setActiveTab('saved')}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${activeTab === 'saved' ? 'bg-[#e07e53] text-white border-transparent' : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        <Bookmark className="w-3.5 h-3.5" />
                        {t?.vida?.tabSaved || 'Guardados'}
                        {savedIds.length > 0 && <span className="ml-1 bg-white/20 text-white rounded-full text-[9px] px-1.5 py-0.5 leading-none">{savedIds.length}</span>}
                    </button>

                    <button 
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-[#e07e53] text-white border-transparent' : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        {t?.vida?.tabAll || 'Explorar Todo'}
                    </button>

                    <button 
                        onClick={() => setActiveTab('recipes')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${activeTab === 'recipes' ? 'bg-[#e07e53] text-white border-transparent' : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        {t?.vida?.tabRecipes || 'Recetas'}
                    </button>

                    <button 
                        onClick={() => setActiveTab('philosophy')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${activeTab === 'philosophy' ? 'bg-[#e07e53] text-white border-transparent' : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        {t?.vida?.tabPhilosophy || 'Filosofía'}
                    </button>

                    <button 
                        onClick={() => setActiveTab('interiors')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${activeTab === 'interiors' ? 'bg-[#e07e53] text-white border-transparent' : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        {t?.vida?.tabInteriors || 'Interiores'}
                    </button>

                    <button 
                        onClick={() => setActiveTab('community')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${activeTab === 'community' ? 'bg-[#e07e53] text-white border-transparent' : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        {t?.vida?.tabCommunity || 'Comunidad'}
                    </button>
                </div>

                {/* Articles/Recipes Grid */}
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredItems.map(item => {
                            const isRecipe = item.category === 'RECETAS';
                            const isSaved = savedIds.includes(item.id);

                            return (
                                <div 
                                    key={item.id}
                                    className="group bg-card border border-border/40 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:-translate-y-0.5"
                                >
                                    {/* Image & Bookmark action */}
                                    <div className="aspect-[4/3] w-full overflow-hidden relative bg-muted shrink-0">
                                        <img 
                                            src={item.image} 
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300"></div>

                                        {/* Category Badge */}
                                        <span className={`absolute top-3 right-3 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm backdrop-blur-md ${getCategoryStyles(item.category)}`}>
                                            {item.category}
                                        </span>

                                        {/* Bookmark Button */}
                                        <button 
                                            onClick={(e) => toggleSave(item.id, e)}
                                            className="absolute bottom-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-[#2c2b2a] hover:bg-white active:scale-95 transition-all shadow-md"
                                            aria-label="Guardar relato"
                                        >
                                            {isSaved ? (
                                                <BookmarkCheck className="w-4 h-4 text-[#e07e53]" />
                                            ) : (
                                                <Bookmark className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 flex flex-col flex-grow text-left">
                                        {/* Meta: time and author */}
                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                                                {item.readTime} {t?.vida?.readTime || 'min'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="w-3.5 h-3.5 text-muted-foreground/60" />
                                                {item.author}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-serif text-lg font-bold leading-tight mb-2 text-[#2c2b2a] dark:text-white group-hover:text-[#e07e53] transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-6 flex-grow">
                                            {item.description}
                                        </p>

                                        {/* Footer action link */}
                                        <div className="mt-auto pt-2">
                                            {isRecipe ? (
                                                <a 
                                                    href={item.content}
                                                    className="inline-flex items-center text-xs font-bold text-[#e07e53] hover:translate-x-0.5 transition-transform"
                                                >
                                                    {t?.vida?.viewRecipe || 'Ver receta'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                                </a>
                                            ) : (
                                                <button 
                                                    onClick={() => setSelectedArticle(item)}
                                                    className="inline-flex items-center text-xs font-bold text-[#e07e53] hover:translate-x-0.5 transition-transform"
                                                >
                                                    {t?.vida?.readArticle || 'Leer artículo'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-border rounded-3xl bg-muted/10">
                        <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-muted-foreground">
                            {activeTab === 'saved' 
                                ? (language === 'es' ? 'No tienes relatos guardados todavía.' : 'No saved stories yet.')
                                : (language === 'es' ? 'No hay publicaciones en esta categoría.' : 'No stories in this category.')}
                        </p>
                    </div>
                )}
            </section>

            {/* Newsletter Modal */}
            {showNewsletterModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewsletterModal(false)}></div>
                    <div className="bg-background border border-border/60 rounded-3xl p-6 md:p-8 max-w-md w-full relative z-10 shadow-2xl animate-in zoom-in duration-200">
                        <button 
                            onClick={() => setShowNewsletterModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        
                        <div className="text-left space-y-4">
                            <span className="text-xs font-extrabold uppercase tracking-widest text-[#e07e53] bg-[#e07e53]/15 px-2.5 py-1 rounded-full">
                                Boletín Cacomi
                            </span>
                            <h3 className="text-2xl font-serif font-black text-[#2c2b2a] dark:text-white">
                                {language === 'es' ? 'Únete al Estilo de Vida Consciente' : 'Join the Conscious Lifestyle'}
                            </h3>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                {language === 'es' 
                                    ? 'Recibe relatos semanales sobre filosofía culinaria, diseño de interiores wabi-sabi y recetas minimalistas exclusivas.'
                                    : 'Receive weekly stories on culinary philosophy, wabi-sabi interior design, and exclusive minimalist recipes.'}
                            </p>
                            
                            {isSubscribed ? (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl text-xs font-bold text-center">
                                    {t?.vida?.subscribeSuccess || '¡Gracias por suscribirte al boletín de Cacomi!'}
                                </div>
                            ) : (
                                <form onSubmit={handleSubscribe} className="space-y-3 pt-2">
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t?.vida?.subscribePlaceholder || 'Tu correo electrónico'}
                                        className="w-full px-4 py-3 border border-border rounded-xl bg-muted/30 focus:outline-none focus:ring-2 focus:ring-[#e07e53]/20 focus:border-[#e07e53]/30 text-sm"
                                    />
                                    <button 
                                        type="submit"
                                        className="w-full py-3 rounded-xl bg-[#e07e53] hover:bg-[#d06e43] text-white font-bold shadow-md shadow-[#e07e53]/10 transition-all text-sm"
                                    >
                                        {t?.vida?.btnSubscribe || 'Suscribirse'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Article Detail Modal (Slide-over/Modal Reader) */}
            {selectedArticle && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedArticle(null)}></div>
                    <div className="bg-background w-full max-w-2xl h-full relative z-10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Detail Header */}
                        <div className="border-b border-border/40 p-4 flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider bg-muted text-muted-foreground">
                                {selectedArticle.category}
                            </span>
                            <button 
                                onClick={() => setSelectedArticle(null)}
                                className="p-2 rounded-full hover:bg-muted text-muted-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Detail Content (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-left">
                            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted">
                                <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold">
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedArticle.readTime} min</span>
                                    <span className="flex items-center gap-1"><User className="w-4 h-4" /> {selectedArticle.author}</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2c2b2a] dark:text-white leading-tight">
                                    {selectedArticle.title}
                                </h2>
                            </div>

                            <div className="prose prose-gray dark:prose-invert lg:prose-lg max-w-none text-muted-foreground font-light leading-relaxed whitespace-pre-line text-sm md:text-base">
                                {selectedArticle.content}
                            </div>
                        </div>

                        {/* Detail Footer */}
                        <div className="border-t border-border/40 p-4 bg-muted/10 flex justify-between items-center">
                            <button 
                                onClick={(e) => toggleSave(selectedArticle.id, e)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted"
                            >
                                {savedIds.includes(selectedArticle.id) ? (
                                    <>
                                        <BookmarkCheck className="w-4 h-4 text-[#e07e53]" />
                                        {language === 'es' ? 'Guardado' : 'Saved'}
                                    </>
                                ) : (
                                    <>
                                        <Bookmark className="w-4 h-4 text-muted-foreground" />
                                        {language === 'es' ? 'Guardar Relato' : 'Save Story'}
                                    </>
                                )}
                            </button>
                            <button 
                                onClick={() => setSelectedArticle(null)}
                                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
                            >
                                {language === 'es' ? 'Cerrar Lector' : 'Close Reader'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
