'use client';

import React, { useEffect } from 'react';
import { create } from 'zustand';

export const translations = {
    es: {
        about: {
            title: 'Acerca de Culina Smart',
            desc: 'Conoce la misión, los valores y el futuro de Culina Smart, tu asistente de cocina con Inteligencia Artificial.',
            missionTag: 'Nuestra Misión',
            missionTitle: 'Conectando tu despensa con el futuro de la cocina.',
            missionDesc: 'Culina Smart nació de una necesidad simple: comer bien no debería costar tanto tiempo ni dinero. Usamos tecnología de punta para transformar tus ingredientes en la mejor comida de tu día.',
            pillarsTitle: 'Nuestros Pilares',
            pillarsSubtitle: 'Cada línea de código que escribimos está fundamentada en principios creados para mejorar tu vida diaria.',
            pillar1Title: 'Sostenibilidad',
            pillar1Desc: 'Reducimos el desperdicio de alimentos conectando exactamente lo que tienes con lo que puedes cocinar.',
            pillar2Title: 'Innovación Activa',
            pillar2Desc: 'La inteligencia artificial no es un truco, es tu asistente diario en la cocina para armar menús en segundos.',
            pillar3Title: 'Salud y Economía',
            pillar3Desc: 'Empoderamos tus decisiones nutricionales y cuidamos tu bolsillo planificando tu despensa de forma eficiente.',
            blogTag: 'Próximamente',
            blogTitle: 'El Diario de Culina (Blog)',
            blogDesc: 'Creemos en la transparencia y aportación. Pronto lanzaremos un espacio donde nuestro equipo compartirá actualizaciones, recetas curadas, decisiones sobre la Inteligencia Artificial y trucos financieros para el hogar.',
            ctaTitle: '¿Listo para cambiar tu rutina?',
            ctaDesc: 'Únete a la comunidad de hogares inteligentes hoy mismo.',
            ctaBtn: 'Crear mi perfil gratis'
        },
        nav: {
            home: 'Inicio',
            create: 'Crear Receta',
            settings: 'Configuración',
            login: 'Acceder',
            register: 'Registrarse',
            logout: 'Salir',
            greeting: 'Hola,',
            pantry: 'Despensa',
            planner: 'Planificador',
            plan: 'Plan',
            profile: 'Mi Perfil',
            progress: 'Mi Progreso',
            progressDesc: 'Nuestra herramienta de seguimiento de salud y progreso está en desarrollo para ofrecerte las mejores métricas de tu nutrición inteligente.',
            plannerDesc: 'Organiza tus menús semanales con facilidad y genera listas de compras automáticas.',
            comingSoon: 'Próximamente',
            beta: 'Beta',
            menu: 'Menú',
            accountMenu: 'Menú de Cuenta'
        },

        planner: {
            title: 'Plan Semanal',
            generateAI: 'Generar con IA',
            exploreRecipes: 'Explorar Recetas',
            searchPlaceholder: 'Buscar ingredientes...',
            nutritionalSummary: 'Resumen Nutricional',
            proteins: 'Proteínas',
            calories: 'Calorías diarias (promedio)',
            dragHere: 'Arrastrar aquí',
            breakfast: 'Desayuno',
            lunch: 'Almuerzo',
            dinner: 'Cena',
            snack: 'Snack',
            tags: {
                healthy: 'Saludable',
                quick: 'Rápido',
                vegan: 'Vegano'
            },
            days: {
                dom: 'DOM',
                lun: 'LUN',
                mar: 'MAR',
                mie: 'MIÉ',
                jue: 'JUE',
                vie: 'VIE',
                sab: 'SÁB'
            },
            thisWeek: 'Esta semana',
            nextWeek: 'Siguiente',
            lastWeek: 'Semana pasada',
            prevWeek: 'Anterior',
            weeks: 'semanas',
            today: 'Hoy',
            pastWeekNote: 'Esta semana ya pasó. Solo puedes planificar los próximos 7 días desde hoy.',
            futureWeekNote: 'Puedes explorar semanas futuras, pero solo se puede planificar los próximos 7 días.',
            tracking: {
                eaten: 'Me lo comí',
                rating: 'Calificación',
                satiety: '¿Cómo quedaste?',
                reason: '¿Por qué lo saltaste?',
                satietyLevels: {
                    veryHungry: 'Muy hambriento',
                    satisfied: 'Satisfecho',
                    veryFull: 'Muy lleno'
                },
                reasons: {
                    noTime: 'Falta de tiempo',
                    tooExpensive: 'Muy caro',
                    didntLike: 'No me gustó',
                    ateOut: 'Comí fuera',
                    forgot: 'Lo olvidé'
                },
                save: 'Guardar'
            },
            checkin: {
                title: '¿Cómo te sentiste esta semana?',
                stress: 'Nivel de estrés',
                energy: 'Nivel de energía',
                notes: 'Notas adicionales',
                levels: {
                    low: 'Bajo',
                    medium: 'Medio',
                    high: 'Alto'
                },
                save: 'Completar Check-in'
            },
            concierge: {
                loading: 'Nuestros chefs están diseñando tu menú. Te notificaremos cuando esté listo.',
                noteTitle: 'Nota del Chef:'
            }
        },

        landing: {
            heroTitle: 'Planificación de Comidas Inteligente',
            heroSubtitle: 'Descubre una nueva forma de cocinar con recetas generadas por IA, gestiona tu despensa y organiza tus comidas semanales en un solo lugar. Únete a nuestra comunidad de amantes de la cocina y transforma tu alimentación hoy mismo.',
            ctaStart: 'Comenzar Gratis',
            ctaExplore: 'Explorar Recetas',
            featureTitle: 'Todo lo que necesitas para cocinar mejor',
            featureSubtitle: 'Culina Smart no es solo un recetario, es tu asistente personal de cocina.',
            evolution: 'La evolución de tu cocina',
            aiChef: 'IA Chef Integrada',
            noCommitment: 'Tú tienes el control siempre',
            pantryAnalysis: 'Análisis de Despensa',
            ingredientsRecipe: '3 Ingredientes = 12 Recetas*',
            aiCreativity: '*Los resultados varían según la creatividad de IA.'
        },

        announcement: {
            newUpdate: 'Nueva Actualización',
            title: '¡El Planificador Inteligente ya está aquí!',
            desc: 'La funcionalidad más esperada ha llegado. Ahora puedes organizar tu semana, generar menús con IA y llevar un control nutricional de tus platos. Explora la pestaña de Planificador para comenzar.',
            btn: '¡Probar Planificador!',
            ariaClose: 'Cerrar anuncio'
        },

        features: {
            aiTitle: 'Recetas con IA',
            aiDesc: 'Nuestra inteligencia artificial analiza tus ingredientes disponibles para sugerirte recetas deliciosas y evitar el desperdicio de alimentos.',
            pantryTitle: 'Gestión de Despensa',
            pantryDesc: 'Mantén un inventario digital de tu cocina. Recibe alertas de caducidad y sabe siempre qué tienes a mano.',
            communityTitle: 'Comunidad Activa',
            communityDesc: 'Comparte tus propias creaciones culinarias y descubre recetas de chefs caseros de todo el mundo.',
            planningTitle: 'Planificación Semanal',
            planningDesc: 'Organiza tus menús semanales con facilidad y genera listas de compras automáticas.'
        },

        cookie: {
            text: 'Utilizamos cookies propias y de terceros para mejorar su experiencia de navegación, analizar el uso del sitio y personalizar anuncios.',
            accept: 'Al hacer clic en "Aceptar" o continuar navegando, usted acepta nuestra ',
            btn: 'Aceptar y Continuar'
        },

        units: {
            pza: 'Pieza(s)',
            kg: 'Kilogramo(s)',
            g: 'Gramo(s)',
            L: 'Litro(s)',
            ml: 'Mililitro(s)'
        },

        common: {
            rights: 'Todos los derechos reservados.',
            aboutLink: 'Acerca de',
            edit: 'Editar',
            delete: 'Eliminar',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
            expired: 'Caducado',
            expiresToday: 'Vence hoy',
            expiresIn: 'Vence en',
            days: 'días',
            expiredPre: 'Caducó hace',
            expiredPost: 'días',
            saveOffline: 'Guardar Offline',
            back: 'Volver',
            offlineMode: 'Modo Offline: Mostrando recetas guardadas.',
            offlineSaved: 'Receta guardada para uso sin conexión'
        },

        auth: {
            loginTitle: 'Acceder',
            registerTitle: 'Crear Cuenta',
            name: 'Nombre',
            nameReq: 'El nombre es requerido.',
            email: 'Email',
            emailReq: 'El email es requerido.',
            emailInvalid: 'Por favor, ingresa un email válido.',
            password: 'Contraseña',
            passwordReq: 'La contraseña es requerida.',
            passwordWeak: 'Débil: Mínimo 8 caracteres.',
            passwordMedium: 'Media',
            passwordStrong: 'Fuerte',
            passwordRule: 'Débil: Combina mayúsculas, minúsculas y números.',
            confirmPassword: 'Confirmar Contraseña',
            passMismatch: 'Las contraseñas no coinciden.',
            loginBtn: 'Acceder',
            registerBtn: 'Registrarse',
            haveAccount: '¿Ya tienes cuenta?',
            noAccount: '¿No tienes cuenta?',
            loginLink: 'Accede aquí',
            registerLink: 'Regístrate',
            welcome: '¡Bienvenido!',
            registerSuccess: '¡Registro exitoso! Ahora puedes iniciar sesión.',
            termsAccept: 'Acepto ',
            termsLink: 'Términos y Condiciones',
            privacyLink: 'Política de Privacidad',
            and: ' y ',
            termsError: 'Debes aceptar los términos para continuar.'
        },

        createRecipe: {
            newTitle: 'Nueva Receta',
            editTitle: 'Editar Receta',
            newSubtitle: 'Comparte tu creación culinaria con el mundo.',
            editSubtitle: 'Modifica los detalles de tu receta existente.',
            name: 'Nombre de la receta',
            desc: 'Descripción',
            prepTime: 'Tiempo de Prep. (min)',
            imgUrl: 'URL de la Imagen',
            type: 'Tipo de Comida',
            visibility: 'Visibilidad',
            breakfast: 'Desayuno',
            lunch: 'Comida',
            dinner: 'Cena',
            public: 'Pública',
            private: 'Privada',
            cancel: 'Cancelar',
            publish: 'Publicar Receta',
            save: 'Guardar Cambios',
            ingrTitle: 'Ingredientes',
            ingrName: 'Ingrediente (ej: Harina)',
            ingrQty: 'Cant.',
            ingrUnit: 'Unidad',
            addIngr: '+ Añadir ingrediente',
            instrTitle: 'Instrucciones',
            step: 'Paso',
            stepPlaceholder: 'Describe el paso',
            addStep: '+ Añadir siguiente paso',
            magicTitle: 'Generación Mágica',
            magicDesc: 'Describe tu idea (ej: "Desayuno saludable con avena") y la IA completará los campos por ti.',
            magicPlaceholder: 'Ej: Pasta cremosa con champiñones para una cena rápida...',
            magicBtn: 'Generar Borrador',
            magicLoading: 'Generando borrador inteligente...',

            magicError: 'No se pudo generar el borrador.',
            magicDisclaimer: 'La IA puede cometer errores. Verifica la información antes de publicar.',
            sensitiveWarn: 'Protege tu privacidad: No incluyas datos personales (teléfonos, direcciones) en la descripción.',
            imageRights: 'Al usar esta URL, confirmas tener derecho a compartir esta imagen.',
            loadingRecipe: 'Cargando datos de la receta...',
            noPermission: 'Redirigiendo... No tienes permiso.',
            deleteStep: 'Eliminar paso',
            disclaimerRetention: 'Al desactivar/eliminar tu cuenta, conservaremos tus datos temporalmente por 30 días para fines legales y de políticas de la plataforma antes de su eliminación definitiva.',
            disclaimerTransfer: 'Si pones una receta pública, al desactivar/eliminar tu cuenta, las recetas que ya estén guardadas por otros usuarios podrían transferirse a la comunidad de Culina Smart para mantener la integridad de sus recetarios.'
        },

        feed: {
            title: 'Descubre Recetas',
            subtitle: 'Explora las mejores ideas para tu próxima comida.',
            update: 'Actualizar',
            empty: 'No hay recetas disponibles por el momento.',
            createFirst: 'Crear mi primera receta',
            end: 'Has llegado al final de la lista.',
            deleteTitle: 'Eliminar Receta',
            deleteConfirm: '¿Estás seguro de que deseas eliminar',
            cancel: 'Cancelar',
            confirmDelete: 'Sí, eliminar',
            deleted: 'Receta eliminada correctamente',
            retry: 'Intentar de nuevo',
            error: 'Error al cargar más recetas.',
            view: 'Ver Receta Completa',
            deleteConfirmGeneric: '¿Estás seguro de que deseas eliminar este elemento?'
        },

        recipe: {
            desc: 'Descripción',
            instr: 'Instrucciones',
            ingr: 'Ingredientes',
            time: 'min',
            loading: 'Cargando receta...',
            error: 'Error al cargar:',
            checkNet: 'Intenta conectarte a internet.',
            noInstr: 'No hay instrucciones detalladas para esta receta.',
            noIngr: 'No hay ingredientes listados.',
            chef: 'Chef SmartRecipe'
        },

        settings: {
            title: 'Configuración',
            subtitle: 'Personaliza tu experiencia en Culina Smart.',
            appearance: 'Apariencia',
            appearanceDesc: 'El modo oscuro se activará según tu elección.',
            language: 'Idioma y Región',
            languageTitle: 'Idioma de la App',
            languageDesc: 'Los textos de la aplicación cambiarán al idioma seleccionado.',
            translation: 'Traducción Automática (Beta)',
            translationDesc: 'Traducir recetas automáticamente.',
            dataSaver: 'Ahorro de Datos',
            dataSaverDesc: 'Optimiza el uso de datos controlando las imágenes.',
            always: 'Siempre',
            alwaysDesc: 'Descarga todo (Mejor experiencia).',
            wifi: 'Solo WiFi',
            wifiDesc: 'Ahorra datos móviles.',
            storage: 'Almacenamiento Offline',
            usage: 'Uso actual',
            recipes: 'recetas',
            clear: 'Borrar descargas',
            clearing: 'Liberando...',

            storageDesc: 'Culina Smart administra el espacio automáticamente.',
            account: 'Cuenta y Privacidad',
            deleteAccount: 'Eliminar mi cuenta',
            deleteAccountDesc: 'Solicitar la baja permanente de tus datos.',
            loggedInAs: 'Conectado como'
        },

        notFound: {
            title: 'Página no Encontrada',
            message: 'Lo sentimos, no pudimos encontrar la página que buscas.',
            backHome: 'Volver al inicio'
        },

        pantry: {
            title: 'Mi Despensa',
            subtitle: 'Gestiona tus ingredientes para cocinar siempre fresco.',
            registeredProducts: 'productos registrados',
            addProduct: 'Agregar Producto',
            noIngredients: 'No tienes ingredientes en tu despensa. ¡Agrega el primero!',
            total: 'Total:',
            attention: 'Atención',
            addExistencia: 'Agregar Existencia',
            editExistencia: 'Editar Existencia',
            addExistenciaTitle: 'Agregar Nueva Existencia',
            deleteExistencia: '¿Eliminar esta existencia?',
            name: 'Nombre',
            namePlaceholder: 'Ej. Leche, Huevos...',
            quantity: 'Cantidad',
            qtyPlaceholder: 'Ej. 1.5',
            unit: 'Unidad',
            expiration: 'Caducidad',
            optional: 'Opcional',
            cancel: 'Cancelar',
            save: 'Guardar',
            saving: 'Guardando...',
            unknownIngredient: 'Ingrediente desconocido'
        },

        profile: {
            editProfile: 'Editar Perfil',
            editCover: 'Editar Portada',
            editPhoto: 'Editar foto de perfil',
            name: 'Nombre',
            namePlaceholder: 'Tu nombre',
            biography: 'Biografía',
            bioPlaceholder: 'Escribe algo sobre ti...',
            photoUrl: 'URL de Foto de Perfil',
            photoPlaceholder: 'https://ejemplo.com/foto.jpg',
            cancel: 'Cancelar',
            save: 'Guardar cambios',
            saving: 'Guardando...',
            myRecipes: 'Mis Recetas',
            savedRecipes: 'Guardados',
            joined: 'Se unió recientemente',
            errorLoad: 'Error al cargar el perfil',
            noProfile: 'No se pudo cargar el perfil',
            loading: 'Cargando perfil...',
            viewAsMe: 'Ver como yo',
            viewAsPublic: 'Público',
            viewAs: 'Vista:'
        },
        admin: {
            title: 'Panel de Administrador',
            reviewLogs: 'Validar Planes',
            metrics: 'Sistema',
            logs: 'Consola',
            jobs: 'Procesos',
            users: 'Usuarios',
            moderation: 'Moderación',
            backlog: 'Backlog',
            runBtn: 'Ejecutar Ahora',
            stopBtn: 'Detener',
            banBtn: 'Suspender',
            unbanBtn: 'Reactivar',
            noPermission: 'Se requiere token de elevación de privilegios...',
            enterPin: 'Ingresa tu PIN de Administrador',
            authBtn: 'Autorizar Elevación',
            cpuUsage: 'Uso de CPU',
            ramUsage: 'Uso de RAM',
            serverLogs: 'Logs del Servidor'
        }
    },
    en: {
        about: {
            title: 'About Culina Smart',
            desc: 'Learn about the mission, values, and future of Culina Smart, your AI-powered kitchen assistant.',
            missionTag: 'Our Mission',
            missionTitle: 'Connecting your pantry with the future of cooking.',
            missionDesc: 'Culina Smart was born from a simple need: eating well shouldn\'t cost so much time and money. We use cutting-edge tech to turn your ingredients into the best meal of your day.',
            pillarsTitle: 'Our Pillars',
            pillarsSubtitle: 'Every line of code we write is grounded in principles designed to improve your daily life.',
            pillar1Title: 'Sustainability',
            pillar1Desc: 'We reduce food waste by connecting exactly what you have with what you can cook.',
            pillar2Title: 'Active Innovation',
            pillar2Desc: 'AI is not a gimmick; it is your daily kitchen assistant building menus in seconds.',
            pillar3Title: 'Health & Economy',
            pillar3Desc: 'We empower your nutritional decisions and take care of your wallet by efficiently planning your pantry.',
            blogTag: 'Coming Soon',
            blogTitle: 'The Culina Journal (Blog)',
            blogDesc: 'We believe in transparency and contribution. Soon we will launch a space where our team will share updates, curated recipes, AI decisions, and financial household tips.',
            ctaTitle: 'Ready to change your routine?',
            ctaDesc: 'Join the smart household community today.',
            ctaBtn: 'Create my free profile'
        },
        nav: {
            home: 'Home',
            create: 'New Recipe',
            settings: 'Settings',
            login: 'Log In',
            register: 'Sign Up',
            logout: 'Log Out',
            greeting: 'Hi,',
            pantry: 'Pantry',
            planner: 'Planner',
            plan: 'Plan',
            profile: 'My Profile',
            progress: 'My Progress',
            progressDesc: 'Our health and progress tracking tool is under development to offer you the best metrics for your smart nutrition.',
            plannerDesc: 'Organize your weekly menus with ease and generate automatic shopping lists.',
            comingSoon: 'Coming Soon',
            beta: 'Beta',
            menu: 'Menu',
            accountMenu: 'Account Menu'
        },

        planner: {
            title: 'Weekly Plan',
            generateAI: 'Generate with AI',
            exploreRecipes: 'Explore Recipes',
            searchPlaceholder: 'Search ingredients...',
            nutritionalSummary: 'Nutritional Summary',
            proteins: 'Proteins',
            calories: 'Daily calories (avg)',
            dragHere: 'Drag here',
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            snack: 'Snack',
            tags: {
                healthy: 'Healthy',
                quick: 'Quick',
                vegan: 'Vegan'
            },
            days: {
                dom: 'SUN',
                lun: 'MON',
                mar: 'TUE',
                mie: 'WED',
                jue: 'THU',
                vie: 'FRI',
                sab: 'SAT'
            },
            thisWeek: 'This week',
            nextWeek: 'Next',
            lastWeek: 'Last week',
            prevWeek: 'Previous',
            weeks: 'weeks',
            today: 'Today',
            pastWeekNote: 'This week has passed. You can only plan the next 7 days from today.',
            futureWeekNote: 'You can browse future weeks, but only the next 7 days can be planned.',
            tracking: {
                eaten: 'I ate it',
                rating: 'Rating',
                satiety: 'How did you feel?',
                reason: 'Why did you skip it?',
                satietyLevels: {
                    veryHungry: 'Very hungry',
                    satisfied: 'Satisfied',
                    veryFull: 'Very full'
                },
                reasons: {
                    noTime: 'No time',
                    tooExpensive: 'Too expensive',
                    didntLike: 'Didn\'t like it',
                    ateOut: 'Ate out',
                    forgot: 'Forgot'
                },
                save: 'Save'
            },
            checkin: {
                title: 'How did you feel this week?',
                stress: 'Stress level',
                energy: 'Energy level',
                notes: 'Additional notes',
                levels: {
                    low: 'Low',
                    medium: 'Medium',
                    high: 'High'
                },
                save: 'Complete Check-in'
            },
            concierge: {
                loading: 'Our chefs are designing your menu. We will notify you when it\'s ready.',
                noteTitle: 'Chef\'s Note:'
            }
        },

        landing: {
            heroTitle: 'Smart Meal Planning',
            heroSubtitle: 'Transform your kitchen with AI-powered recipes, effortless pantry management, and personalized meal planning. Join our community and elevate your cooking experience today.',
            ctaStart: 'Start for Free',
            ctaExplore: 'Explore Recipes',
            featureTitle: 'Everything you need to cook better',
            featureSubtitle: 'Culina Smart is not just a recipe book, it\'s your personal kitchen assistant.',
            evolution: 'The evolution of your kitchen',
            aiChef: 'Integrated AI Chef',
            noCommitment: 'You are always in control',
            pantryAnalysis: 'Pantry Analysis',
            ingredientsRecipe: '3 Ingredients = 12 Recipes*',
            aiCreativity: '*Results vary based on AI creativity.'
        },

        announcement: {
            newUpdate: 'New Update',
            title: 'The Smart Planner is finally here!',
            desc: 'Our most anticipated feature has arrived. Now you can organize your week, generate menus with AI, and track your nutritional intake. Explore the Planner tab to get started.',
            btn: 'Try Planner!',
            ariaClose: 'Close announcement'
        },

        features: {
            aiTitle: 'AI Recipes',
            aiDesc: 'Our artificial intelligence analyzes your available ingredients to suggest delicious recipes and prevent food waste.',
            pantryTitle: 'Pantry Management',
            pantryDesc: 'Keep a digital inventory of your kitchen. Get expiration alerts and always know what you have on hand.',
            communityTitle: 'Active Community',
            communityDesc: 'Share your own culinary creations and discover recipes from home chefs around the world.',
            planningTitle: 'Weekly Planning',
            planningDesc: 'Organize your weekly menus easily and generate automatic shopping lists.'
        },

        cookie: {
            text: 'We use our own and third-party cookies to improve your browsing experience, analyze site usage, and personalize ads.',
            accept: 'By clicking "Accept" or continuing to browse, you agree to our ',
            btn: 'Accept and Continue'
        },

        units: {
            pza: 'Piece(s)',
            kg: 'Kilogram(s)',
            g: 'Gram(s)',
            L: 'Liter(s)',
            ml: 'Milliliter(s)'
        },

        common: {
            rights: 'All rights reserved.',
            aboutLink: 'About Us',
            edit: 'Edit',
            delete: 'Delete',
            cancel: 'Cancel',
            confirm: 'Confirm',
            expired: 'Expired',
            expiresToday: 'Expires today',
            expiresIn: 'Expires in',
            days: 'days',
            expiredPre: 'Expired',
            expiredPost: 'days ago',
            saveOffline: 'Save Offline',
            back: 'Back',
            offlineMode: 'Offline Mode: Showing saved recipes.',
            offlineSaved: 'Recipe saved for offline use'
        },

        auth: {
            loginTitle: 'Log In',
            registerTitle: 'Create Account',
            name: 'Name',
            nameReq: 'Name is required.',
            email: 'Email',
            emailReq: 'Email is required.',
            emailInvalid: 'Please enter a valid email.',
            password: 'Password',
            passwordReq: 'Password is required.',
            passwordWeak: 'Weak: Min 8 chars.',
            passwordMedium: 'Medium',
            passwordStrong: 'Strong',
            passwordRule: 'Weak: Mix uppercase, lowercase, numbers.',
            confirmPassword: 'Confirm Password',
            passMismatch: 'Passwords do not match.',
            loginBtn: 'Log In',
            registerBtn: 'Sign Up',
            haveAccount: 'Already have an account?',
            noAccount: 'Don\'t have an account?',
            loginLink: 'Log In Here',
            registerLink: 'Sign Up',
            welcome: 'Welcome!',
            registerSuccess: 'Registration successful! You can now log in.',
            termsAccept: 'I accept ',
            termsLink: 'Terms and Conditions',
            privacyLink: 'Privacy Policy',
            and: ' and ',
            termsError: 'You must accept the terms to continue.'
        },

        createRecipe: {
            newTitle: 'New Recipe',
            editTitle: 'Edit Recipe',
            newSubtitle: 'Share your culinary creation with the world.',
            editSubtitle: 'Modify the details of your existing recipe.',
            name: 'Recipe Name',
            desc: 'Description',
            prepTime: 'Prep Time (min)',
            imgUrl: 'Image URL',
            type: 'Meal Type',
            visibility: 'Visibility',
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            public: 'Public',
            private: 'Private',
            cancel: 'Cancel',
            publish: 'Publish Recipe',
            save: 'Save Changes',
            ingrTitle: 'Ingredients',
            ingrName: 'Ingredient (e.g. Flour)',
            ingrQty: 'Qty',
            ingrUnit: 'Unit',
            addIngr: '+ Add ingredient',
            instrTitle: 'Instructions',
            step: 'Step',
            stepPlaceholder: 'Describe step',
            addStep: '+ Add next step',
            magicTitle: 'Magic Generation',
            magicDesc: 'Describe your idea (e.g. "Healthy oatmeal breakfast") and AI will fill the fields for you.',
            magicPlaceholder: 'E.g. Creamy mushroom pasta for a quick dinner...',
            magicBtn: 'Generate Draft',
            magicLoading: 'Generating smart draft...',

            magicError: 'Could not generate draft.',
            magicDisclaimer: 'AI can make mistakes. Verify info before publishing.',
            sensitiveWarn: 'Protect your privacy: Do not include personal data (phones, addresses) in the description.',
            imageRights: 'By using this URL, you confirm you have the right to share this image.',
            loadingRecipe: 'Loading recipe data...',
            noPermission: 'Redirecting... You do not have permission.',
            deleteStep: 'Delete step',
            disclaimerRetention: 'Upon account deactivation/deletion, we will temporarily retain your data for 30 days for legal and platform policy purposes before permanent deletion.',
            disclaimerTransfer: 'If you set a recipe to public, upon account deactivation/deletion, recipes already saved by other users may be transferred to the Culina Smart community to maintain their cookbooks\' integrity.'
        },

        feed: {
            title: 'Discover Recipes',
            subtitle: 'Explore the best ideas for your next meal.',
            update: 'Update',
            empty: 'No recipes available at the moment.',
            createFirst: 'Create my first recipe',
            end: 'You have reached the end of the list.',
            deleteTitle: 'Delete Recipe',
            deleteConfirm: 'Are you sure you want to delete',
            cancel: 'Cancel',
            confirmDelete: 'Yes, delete',
            deleted: 'Recipe deleted successfully',
            retry: 'Try again',
            error: 'Error loading more recipes.',
            view: 'View Full Recipe',
            deleteConfirmGeneric: 'Are you sure you want to delete this item?'
        },

        recipe: {
            desc: 'Description',
            instr: 'Instructions',
            ingr: 'Ingredients',
            time: 'min',
            loading: 'Loading recipe...',
            error: 'Error loading:',
            checkNet: 'Try connecting to the internet.',
            noInstr: 'No detailed instructions for this recipe.',
            noIngr: 'No ingredients listed.',
            chef: 'Chef SmartRecipe'
        },

        settings: {
            title: 'Settings',
            subtitle: 'Customize your Culina Smart experience.',
            appearance: 'Appearance',
            appearanceDesc: 'Dark mode will activate based on your choice.',
            language: 'Language & Region',
            languageTitle: 'App Language',
            languageDesc: 'App texts will change to the selected language.',
            translation: 'Auto Translation (Beta)',
            translationDesc: 'Automatically translate recipes.',
            dataSaver: 'Data Saver',
            dataSaverDesc: 'Optimize data usage by controlling images.',
            always: 'Always',
            alwaysDesc: 'Download everything (Best experience).',
            wifi: 'WiFi Only',
            wifiDesc: 'Save mobile data.',
            storage: 'Offline Storage',
            usage: 'Current usage',
            recipes: 'recipes',
            clear: 'Clear downloads',
            clearing: 'Clearing...',

            storageDesc: 'Culina Smart manages space automatically.',
            account: 'Account & Privacy',
            deleteAccount: 'Delete my account',
            deleteAccountDesc: 'Request permanent deletion of your data.',
            loggedInAs: 'Logged in as'
        },

        notFound: {
            title: 'Page Not Found',
            message: 'Sorry, we could not find the page you are looking for.',
            backHome: 'Back to Home'
        },

        pantry: {
            title: 'My Pantry',
            subtitle: 'Manage your ingredients to cook always fresh.',
            registeredProducts: 'registered products',
            addProduct: 'Add Product',
            noIngredients: 'You have no ingredients in your pantry. Add the first one!',
            total: 'Total:',
            attention: 'Attention',
            addExistencia: 'Add Stock',
            editExistencia: 'Edit Stock',
            addExistenciaTitle: 'Add New Stock',
            deleteExistencia: 'Delete this stock?',
            name: 'Name',
            namePlaceholder: 'E.g. Milk, Eggs...',
            quantity: 'Quantity',
            qtyPlaceholder: 'E.g. 1.5',
            unit: 'Unit',
            expiration: 'Expiration',
            optional: 'Optional',
            cancel: 'Cancel',
            save: 'Save',
            saving: 'Saving...',
            unknownIngredient: 'Unknown ingredient'
        },

        profile: {
            editProfile: 'Edit Profile',
            editCover: 'Edit Cover',
            editPhoto: 'Edit profile photo',
            name: 'Name',
            namePlaceholder: 'Your name',
            biography: 'Biography',
            bioPlaceholder: 'Write something about yourself...',
            photoUrl: 'Profile Photo URL',
            photoPlaceholder: 'https://example.com/photo.jpg',
            cancel: 'Cancel',
            save: 'Save changes',
            saving: 'Saving...',
            myRecipes: 'My Recipes',
            savedRecipes: 'Saved',
            joined: 'Joined recently',
            errorLoad: 'Error loading profile',
            noProfile: 'Could not load profile',
            loading: 'Loading profile...',
            viewAsMe: 'View as me',
            viewAsPublic: 'Public',
            viewAs: 'View:'
        },
        admin: {
            title: 'Admin Panel',
            reviewLogs: 'Review Logs',
            metrics: 'System',
            logs: 'Console',
            jobs: 'Jobs',
            users: 'Users',
            moderation: 'Moderation',
            backlog: 'Backlog',
            runBtn: 'Run Now',
            stopBtn: 'Stop',
            banBtn: 'Ban',
            unbanBtn: 'Unban',
            noPermission: 'Privilege elevation token required...',
            enterPin: 'Enter your Admin PIN',
            authBtn: 'Authorize Elevation',
            cpuUsage: 'CPU Usage',
            ramUsage: 'RAM Usage',
            serverLogs: 'Server Logs'
        }
    },
    fr: {
        about: {
            title: 'À propos de Culina Smart',
            desc: 'Découvrez la mission, les valeurs et l\'avenir de Culina Smart, votre assistant de cuisine IA.',
            missionTag: 'Notre Mission',
            missionTitle: 'Connecter votre garde-manger à l\'avenir de la cuisine.',
            missionDesc: 'Culina Smart est né d\'un besoin simple : bien manger ne devrait pas coûter tant de temps ni d\'argent. Nous utilisons des technologies de pointe pour transformer vos ingrédients.',
            pillarsTitle: 'Nos Piliers',
            pillarsSubtitle: 'Chaque ligne de code que nous écrivons est fondée sur des principes conçus pour améliorer votre quotidien.',
            pillar1Title: 'Durabilité',
            pillar1Desc: 'Nous réduisons le gaspillage alimentaire en connectant exactement ce que vous avez avec ce que vous pouvez cuisiner.',
            pillar2Title: 'Innovation Active',
            pillar2Desc: 'L\'IA n\'est pas un gadget, c\'est votre assistant quotidien pour créer des menus en quelques secondes.',
            pillar3Title: 'Santé et Économie',
            pillar3Desc: 'Nous renforçons vos décisions nutritionnelles et prenons soin de votre portefeuille en planifiant efficacement.',
            blogTag: 'Bientôt Disponible',
            blogTitle: 'Le Journal de Culina (Blog)',
            blogDesc: 'Nous croyons en la transparence. Bientôt, nous lancerons un espace où notre équipe partagera des mises à jour, des recettes, et des conseils.',
            ctaTitle: 'Prêt à changer de routine ?',
            ctaDesc: 'Rejoignez la communauté des foyers intelligents dès aujourd\'hui.',
            ctaBtn: 'Créer mon profil gratuit'
        },
        nav: {
            home: 'Accueil',
            create: 'Créer Recette',
            settings: 'Paramètres',
            login: 'Connexion',
            register: 'S\'inscrire',
            logout: 'Déconnexion',
            greeting: 'Bonjour,',
            pantry: 'Garde-manger',
            planner: 'Planificateur',
            plan: 'Plan',
            profile: 'Mon Profil',
            progress: 'Mes Progrès',
            progressDesc: 'Notre outil de suivi de santé et de progrès est en cours de développement pour vous offrir les meilleures mesures de votre nutrition intelligente.',
            plannerDesc: 'Organisez facilement vos menus hebdomadaires et générez des listes de courses automatiques.',
            comingSoon: 'Bientôt',
            beta: 'Bêta',
            menu: 'Menu',
            accountMenu: 'Menu du Compte'
        },

        planner: {
            title: 'Plan Hebdomadaire',
            generateAI: 'Générer avec IA',
            exploreRecipes: 'Explorer des Recettes',
            searchPlaceholder: 'Rechercher des ingrédients...',
            nutritionalSummary: 'Résumé Nutritionnel',
            proteins: 'Protéines',
            calories: 'Calories quotidiennes (moyenne)',
            dragHere: 'Faire glisser ici',
            breakfast: 'Petit-déjeuner',
            lunch: 'Déjeuner',
            dinner: 'Dîner',
            snack: 'Collation',
            tags: {
                healthy: 'Sain',
                quick: 'Rapide',
                vegan: 'Végétalien'
            },
            days: {
                dom: 'DIM',
                lun: 'LUN',
                mar: 'MAR',
                mie: 'MER',
                jue: 'JEU',
                vie: 'VEN',
                sab: 'SAM'
            },
            thisWeek: 'Cette semaine',
            nextWeek: 'Suivant',
            lastWeek: 'Semaine dernière',
            prevWeek: 'Précédent',
            weeks: 'semaines',
            today: "Aujourd'hui",
            pastWeekNote: 'Cette semaine est passée. Vous ne pouvez planifier que les 7 prochains jours.',
            futureWeekNote: 'Vous pouvez parcourir les semaines futures, mais seuls les 7 prochains jours peuvent être planifiés.',
            tracking: {
                eaten: 'Je l\'ai mangé',
                rating: 'Évaluation',
                satiety: 'Comment vous sentez-vous ?',
                reason: 'Pourquoi l\'avez-vous sauté ?',
                satietyLevels: {
                    veryHungry: 'Très faim',
                    satisfied: 'Satisfait',
                    veryFull: 'Très plein'
                },
                reasons: {
                    noTime: 'Pas de temps',
                    tooExpensive: 'Trop cher',
                    didntLike: 'Je n\'ai pas aimé',
                    ateOut: 'Mangé au restaurant',
                    forgot: 'Oublié'
                },
                save: 'Enregistrer'
            },
            checkin: {
                title: 'Comment vous êtes-vous senti cette semaine ?',
                stress: 'Niveau de stress',
                energy: 'Niveau d\'énergie',
                notes: 'Notes supplémentaires',
                levels: {
                    low: 'Faible',
                    medium: 'Moyen',
                    high: 'Élevé'
                },
                save: 'Terminer le Check-in'
            },
            concierge: {
                loading: 'Nos chefs conçoivent votre menu. Nous vous informerons quand il sera prêt.',
                noteTitle: 'Note du Chef :'
            }
        },

        landing: {
            heroTitle: 'Planification de Repas Intelligente',
            heroSubtitle: 'Transformez votre cuisine avec des recettes assistées par IA, une gestion simplifiée de votre garde-manger et une planification personnalisée. Rejoignez notre communauté et améliorez votre expérience culinaire dès aujourd\'hui.',
            ctaStart: 'Commencer Gratuitement',
            ctaExplore: 'Explorer Recettes',
            featureTitle: 'Tout ce dont vous avez besoin pour mieux cuisiner',
            featureSubtitle: 'Culina Smart n\'est pas seulement un livre de recettes, c\'est votre assistant de cuisine personnel.',
            evolution: 'L\'évolution de votre cuisine',
            aiChef: 'Chef IA Intégré',
            noCommitment: 'Vous avez toujours le contrôle',
            pantryAnalysis: 'Analyse du Garde-manger',
            ingredientsRecipe: '3 Ingrédients = 12 Recettes*',
            aiCreativity: '*Les résultats varient selon la créativité de l\'IA.'
        },

        announcement: {
            newUpdate: 'Nouvelle Mise à Jour',
            title: 'Le Planificateur Intelligent est enfin là !',
            desc: 'Notre fonctionnalité la plus attendue est arrivée. Vous pouvez désormais organiser votre semaine, générer des menus avec l\'IA et suivre votre apport nutritionnel. Explorez l\'onglet Planificateur pour commencer.',
            btn: 'Essayer le Planificateur !',
            ariaClose: 'Fermer l\'annonce'
        },

        features: {
            aiTitle: 'Recettes IA',
            aiDesc: 'Notre intelligence artificielle analyse vos ingrédients disponibles pour vous suggérer de délicieuses recettes et éviter le gaspillage alimentaire.',
            pantryTitle: 'Gestion du Garde-manger',
            pantryDesc: 'Gardez un inventaire numérique de votre cuisine. Recevez des alertes d\'expiration et sachez toujours ce que vous avez sous la main.',
            communityTitle: 'Communauté Active',
            communityDesc: 'Partagez vos propres créations culinaires et découvrez des recettes de chefs amateurs du monde entier.',
            planningTitle: 'Planification Hebdomadaire',
            planningDesc: 'Organisez vos menus hebdomadaires facilement et générez des listes de courses automatiques.'
        },

        cookie: {
            text: 'Nous utilisons des cookies propres et tiers pour améliorer votre expérience de navigation, analyser l\'utilisation du site et personnaliser les publicités.',
            accept: 'En cliquant sur "Accepter" ou en continuant à naviguer, vous acceptez notre ',
            btn: 'Accepter et Continuer'
        },

        units: {
            pza: 'Pièce(s)',
            kg: 'Kilogramme(s)',
            g: 'Gramme(s)',
            L: 'Litre(s)',
            ml: 'Millilitre(s)'
        },

        common: {
            rights: 'Tous droits réservés.',
            aboutLink: 'À propos',
            edit: 'Modifier',
            delete: 'Supprimer',
            cancel: 'Annuler',
            confirm: 'Confirmer',
            expired: 'Expiré',
            expiresToday: 'Expire aujourd\'hui',
            expiresIn: 'Expire dans',
            days: 'jours',
            expiredPre: 'Expiré il y a',
            expiredPost: 'jours',
            saveOffline: 'Enregistrer Hors Ligne',
            back: 'Retour',
            offlineMode: 'Mode Hors Ligne : Affichage des recettes enregistrées.',
            offlineSaved: 'Recette enregistrée pour une utilisation hors ligne'
        },

        auth: {
            loginTitle: 'Connexion',
            registerTitle: 'Créer un Compte',
            name: 'Nom',
            nameReq: 'Le nom est requis.',
            email: 'Email',
            emailReq: 'L\'email est requis.',
            emailInvalid: 'Veuillez entrer un email valide.',
            password: 'Mot de passe',
            passwordReq: 'Mot de passe requis.',
            passwordWeak: 'Faible: Min 8 car.',
            passwordMedium: 'Moyen',
            passwordStrong: 'Fort',
            passwordRule: 'Faible: Mélangez majuscules, minuscules, chiffres.',
            confirmPassword: 'Confirmer Mot de passe',
            passMismatch: 'Les mots de passe ne correspondent pas.',
            loginBtn: 'Connexion',
            registerBtn: 'S\'inscrire',
            haveAccount: 'Déjà un compte ?',
            noAccount: 'Pas de compte ?',
            loginLink: 'Connectez-vous ici',
            registerLink: 'Inscrivez-vous',
            welcome: 'Bienvenue !',
            registerSuccess: 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
            termsAccept: 'J\'accepte ',
            termsLink: 'Termes et Conditions',
            privacyLink: 'Politique de Confidentialité',
            and: ' et ',
            termsError: 'Vous devez accepter les termes pour continuer.'
        },

        createRecipe: {
            newTitle: 'Nouvelle Recette',
            editTitle: 'Modifier Recette',
            newSubtitle: 'Partagez votre création culinaire avec le monde.',
            editSubtitle: 'Modifiez les détails de votre recette existante.',
            name: 'Nom de la recette',
            desc: 'Description',
            prepTime: 'Temps de Prép. (min)',
            imgUrl: 'URL de l\'image',
            type: 'Type de Repas',
            visibility: 'Visibilité',
            breakfast: 'Petit-déjeuner',
            lunch: 'Déjeuner',
            dinner: 'Dîner',
            public: 'Publique',
            private: 'Privée',
            cancel: 'Annuler',
            publish: 'Publier Recette',
            save: 'Enregistrer',
            ingrTitle: 'Ingrédients',
            ingrName: 'Ingrédient (ex: Farine)',
            ingrQty: 'Qté',
            ingrUnit: 'Unité',
            addIngr: '+ Ajouter ingrédient',
            instrTitle: 'Instructions',
            step: 'Étape',
            stepPlaceholder: 'Décrivez l\'étape',
            addStep: '+ Ajouter étape suivante',
            magicTitle: 'Génération Magique',
            magicDesc: 'Décrivez votre idée (ex: "Petit-déj sain à l\'avoine") et l\'IA remplira les champs.',
            magicPlaceholder: 'Ex: Pâtes crémeuses aux champignons pour un dîner rapide...',
            magicBtn: 'Générer Brouillon',
            magicLoading: 'Génération du brouillon intelligent...',

            magicError: 'Impossible de générer le brouillon.',
            magicDisclaimer: 'L\'IA peut faire des erreurs. Vérifiez les infos avant de publier.',
            sensitiveWarn: 'Protégez votre vie privée : N\'incluez pas de données personnelles.',
            imageRights: 'En utilisant cette URL, vous confirmez avoir le droit de partager cette image.',
            loadingRecipe: 'Chargement des données de la recette...',
            noPermission: 'Redirection... Vous n\'avez pas la permission.',
            deleteStep: 'Supprimer l\'étape',
            disclaimerRetention: 'Dès la désactivation/suppression du compte, nous conserverons temporairement vos données pendant 30 jours à des fins légales et de politique de la plateforme avant suppression définitive.',
            disclaimerTransfer: 'Si vous rendez une recette publique, lors de la désactivation/suppression du compte, les recettes déjà enregistrées par d\'autres utilisateurs peuvent être transférées à la communauté Culina Smart.'
        },

        feed: {
            title: 'Découvrez des Recettes',
            subtitle: 'Explorez les meilleures idées pour votre prochain repas.',
            update: 'Mettre à jour',
            empty: 'Aucune recette disponible pour le moment.',
            createFirst: 'Créer ma première recette',
            end: 'Vous avez atteint la fin de la liste.',
            deleteTitle: 'Supprimer la Recette',
            deleteConfirm: 'Êtes-vous sûr de vouloir supprimer',
            cancel: 'Annuler',
            confirmDelete: 'Oui, supprimer',
            deleted: 'Recette supprimée avec succès',
            retry: 'Réessayer',
            error: 'Erreur lors du chargement des recettes.',
            view: 'Voir Recette Complète',
            deleteConfirmGeneric: 'Êtes-vous sûr de vouloir supprimer cet élément ?'
        },

        recipe: {
            desc: 'Description',
            instr: 'Instructions',
            ingr: 'Ingrédients',
            time: 'min',
            loading: 'Chargement de la recette...',
            error: 'Erreur de chargement :',
            checkNet: 'Essayez de vous connecter à internet.',
            noInstr: 'Aucune instruction détaillée pour cette recette.',
            noIngr: 'Aucun ingrédient listé.',
            chef: 'Chef SmartRecipe'
        },

        settings: {
            title: 'Paramètres',
            subtitle: 'Personnalisez votre expérience Culina Smart.',
            appearance: 'Apparence',
            appearanceDesc: 'Le mode sombre s\'activera selon votre choix.',
            language: 'Langue et Région',
            languageTitle: 'Langue de l\'application',
            languageDesc: 'Les textes de l\'application changeront dans la langue sélectionnée.',
            translation: 'Traduction Auto (Bêta)',
            translationDesc: 'Traduire automatiquement les recettes.',
            dataSaver: 'Économiseur de Données',
            dataSaverDesc: 'Optimisez l\'utilisation des données en contrôlant les images.',
            always: 'Toujours',
            alwaysDesc: 'Tout télécharger (Meilleure expérience).',
            wifi: 'WiFi Uniquement',
            wifiDesc: 'Économiser les données mobiles.',
            storage: 'Stockage Hors Ligne',
            usage: 'Utilisation actuelle',
            recipes: 'recettes',
            clear: 'Effacer les téléchargements',
            clearing: 'Nettoyage...',

            storageDesc: 'Culina Smart gère l\'espace automatiquement.',
            account: 'Compte et Confidentialité',
            deleteAccount: 'Supprimer mon compte',
            deleteAccountDesc: 'Demander la suppression définitive de vos données.',
            loggedInAs: 'Connecté en tant que'
        },

        notFound: {
            title: 'Page Non Trouvée',
            message: 'Désolé, nous n\'avons pas pu trouver la page que vous recherchez.',
            backHome: 'Retour à l\'accueil'
        },

        pantry: {
            title: 'Mon Garde-manger',
            subtitle: 'Gérez vos ingrédients pour cuisiner toujours frais.',
            registeredProducts: 'produits enregistrés',
            addProduct: 'Ajouter Produit',
            noIngredients: 'Vous n\'avez pas d\'ingrédients dans votre garde-manger. Ajoutez le premier !',
            total: 'Total :',
            attention: 'Attention',
            addExistencia: 'Ajouter Stock',
            editExistencia: 'Modifier Stock',
            addExistenciaTitle: 'Ajouter Nouveau Stock',
            deleteExistencia: 'Supprimer ce stock ?',
            name: 'Nom',
            namePlaceholder: 'Ex. Lait, Œufs...',
            quantity: 'Quantité',
            qtyPlaceholder: 'Ex. 1.5',
            unit: 'Unité',
            expiration: 'Expiration',
            optional: 'Optionnel',
            cancel: 'Annuler',
            save: 'Enregistrer',
            saving: 'Enregistrement...',
            unknownIngredient: 'Ingrédient inconnu'
        },

        profile: {
            editProfile: 'Modifier le Profil',
            editCover: 'Modifier la Couverture',
            editPhoto: 'Modifier la photo de profil',
            name: 'Nom',
            namePlaceholder: 'Votre nom',
            biography: 'Biographie',
            bioPlaceholder: 'Écrivez quelque chose sur vous...',
            photoUrl: 'URL de la Photo de Profil',
            photoPlaceholder: 'https://exemple.com/photo.jpg',
            cancel: 'Annuler',
            save: 'Enregistrer les modifications',
            saving: 'Enregistrement...',
            myRecipes: 'Mes Recettes',
            savedRecipes: 'Enregistrés',
            joined: 'A rejoint récemment',
            errorLoad: 'Erreur lors du chargement du profil',
            noProfile: 'Impossible de charger le profil',
            loading: 'Chargement du profil...',
            viewAsMe: 'Voir comme moi',
            viewAsPublic: 'Public',
            viewAs: 'Vue :'
        },
        admin: {
            title: 'Panneau d\'Administration',
            reviewLogs: 'Valider les Plans',
            metrics: 'Système',
            logs: 'Console',
            jobs: 'Processus',
            users: 'Utilisateurs',
            moderation: 'Modération',
            backlog: 'Backlog',
            runBtn: 'Exécuter',
            stopBtn: 'Arrêter',
            banBtn: 'Bannir',
            unbanBtn: 'Débannir',
            noPermission: 'Jeton d\'élévation de privilèges requis...',
            enterPin: 'Saisissez votre code PIN Admin',
            authBtn: 'Autoriser l\'élévation',
            cpuUsage: 'Utilisation du processeur',
            ramUsage: 'Utilisation de la RAM',
            serverLogs: 'Journaux du serveur'
        }
    }
};

const applyTheme = (t) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.remove('light', 'dark');
    if (isDark) {
        root.classList.add('dark');
    } else {
        root.classList.add('light');
    }
};

export const useSettings = create((set, get) => ({
    imageStrategy: 'always',
    isWifi: true,
    theme: 'system',
    language: 'es',
    autoTranslate: false,
    t: translations.es,

    setStrategy: (strategy) => {
        set({ imageStrategy: strategy });
        if (typeof window !== 'undefined') localStorage.setItem('culina_image_strategy', strategy);
    },

    setTheme: (newTheme) => {
        set({ theme: newTheme });
        if (typeof window !== 'undefined') {
            localStorage.setItem('culina_theme', newTheme);
            document.cookie = `culina_theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
            applyTheme(newTheme);
        }
    },

    setLanguage: (lang) => {
        set({ language: lang, t: translations[lang] || translations.es });
        if (typeof window !== 'undefined') {
            localStorage.setItem('culina_language', lang);
            document.cookie = `culina_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
            document.documentElement.lang = lang;
        }
    },

    setAutoTranslate: (enabled) => {
        set({ autoTranslate: enabled });
        if (typeof window !== 'undefined') localStorage.setItem('culina_auto_translate', JSON.stringify(enabled));
    },

    shouldLoadImage: () => {
        const { imageStrategy, isWifi } = get();
        if (imageStrategy === 'always') return true;
        if (imageStrategy === 'wifi-only') return isWifi;
        return true;
    },

    clearCache: async () => {
        if (typeof window !== 'undefined' && 'caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
            return true;
        }
        return false;
    },

    checkNetwork: () => {
        if (typeof navigator !== 'undefined') {
            let wifiStatus = true;

            // Si está explícitamente offline en el navegador, no hay WiFi/Red
            if ('onLine' in navigator && !navigator.onLine) {
                wifiStatus = false;
            } else if (navigator.connection) {
                // Heurística de Network Information API
                const type = navigator.connection.type;
                const saveData = navigator.connection.saveData;
                const unlikelyWifi = type === 'cellular' || saveData === true;
                wifiStatus = !unlikelyWifi;
            }

            set({ isWifi: wifiStatus });
        }
    },

    initialize: () => {
        if (typeof window === 'undefined') return;

        const savedStrategy = localStorage.getItem('culina_image_strategy');
        if (savedStrategy) set({ imageStrategy: savedStrategy });

        const savedTheme = localStorage.getItem('culina_theme') || 'system';
        set({ theme: savedTheme });
        applyTheme(savedTheme);

        const savedLang = localStorage.getItem('culina_language') || 'es';
        set({ language: savedLang, t: translations[savedLang] || translations.es });

        const savedAutoTranslate = localStorage.getItem('culina_auto_translate');
        if (savedAutoTranslate) set({ autoTranslate: JSON.parse(savedAutoTranslate) });

        get().checkNetwork();

        window.addEventListener('online', get().checkNetwork);
        window.addEventListener('offline', get().checkNetwork);

        if (navigator.connection) {
            navigator.connection.addEventListener('change', () => get().checkNetwork());
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            if (localStorage.getItem('culina_theme') === 'system') {
                applyTheme('system');
            }
        };
        mediaQuery.addEventListener('change', handleSystemChange);

        // Return cleanup function
        return () => {
            if (navigator.connection) navigator.connection.removeEventListener('change', () => get().checkNetwork());
            mediaQuery.removeEventListener('change', handleSystemChange);
        };
    }
}));

export function SettingsProvider({ children }) {
    useEffect(() => {
        const cleanup = useSettings.getState().initialize();
        return cleanup;
    }, []);

    return <>{children}</>;
}
