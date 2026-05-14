'use client';

import React, { useEffect } from 'react';
import { create } from 'zustand';

export const translations = {
    es: {
        recipeTypes: {
            BREAKFAST: 'Desayuno',
            MAIN_COURSE: 'Plato Fuerte',
            SNACK: 'Snack / Colación',
            SIDE_VEGETABLE: 'Guarnición de Verduras',
            SIDE_CARB: 'Cereales y Tubérculos',
            LEGUME: 'Leguminosas',
            SAUCE: 'Salsas y Aderezos',
            SOUP: 'Sopas y Caldos',
            LUNCH: 'Almuerzo',
            DINNER: 'Cena'
        },
        about: {
            title: 'Acerca de Cacomi',
            desc: 'Conoce la misión, los valores y el futuro de Cacomi, tu asistente de cocina con Inteligencia Artificial.',
            missionTag: 'Nuestra Misión',
            missionTitle: 'Conectando tu despensa con el futuro de la cocina.',
            missionDesc: 'Cacomi nació de una necesidad simple: comer bien no debería costar tanto tiempo ni dinero. Usamos tecnología de punta para transformar tus ingredientes en la mejor comida de tu día.',
            pillarsTitle: 'Nuestros Pilares',
            pillarsSubtitle: 'Cada línea de código que escribimos está fundamentada en principios creados para mejorar tu vida diaria.',
            pillar1Title: 'Sostenibilidad',
            pillar1Desc: 'Reducimos el desperdicio de alimentos conectando exactamente lo que tienes con lo que puedes cocinar.',
            pillar2Title: 'Innovación Activa',
            pillar2Desc: 'La inteligencia artificial no es un truco, es tu asistente diario en la cocina para armar menús en segundos.',
            pillar3Title: 'Salud y Economía',
            pillar3Desc: 'Empoderamos tus decisiones nutricionales y cuidamos tu bolsillo planificando tu despensa de forma eficiente.',
            blogTag: 'Nuevo',
            blogTitle: 'El Blog de Cacomi',
            blogDesc: 'Descubre guías paso a paso, consejos de planificación y trucos financieros para tu hogar. Nuestro blog está lleno de recursos diseñados para ayudarte a mejorar tu alimentación y ahorrar dinero.',
            ctaTitle: '¿Listo para cambiar tu rutina?',
            ctaDesc: 'Únete a la comunidad de hogares inteligentes hoy mismo.',
            ctaBtn: 'Crear mi perfil gratis',
            howItWorksTitle: 'Tu Cocina, Reinventada',
            howItWorksSubtitle: 'Descubre cómo Cacomi utiliza tecnología avanzada para simplificar tu alimentación diaria.',
            step1Title: 'Explora y Descubre',
            step1Desc: 'Navega por un catálogo infinito de recetas reales. Nuestra interfaz intuitiva te permite filtrar por categorías y acceder a tus recetas guardadas incluso sin conexión a internet.',
            step2Title: 'Planificación Inteligente',
            step2Desc: 'Organiza tu semana con nuestro planificador interactivo. Arrastra y suelta recetas, genera listas de compras inteligentes consolidadas automáticamente y deja que nuestra tecnología te guíe hacia una alimentación balanceada.',
            step3Title: 'Control Total de tu Despensa',
            step3Desc: 'Gestiona tus ingredientes y evita el desperdicio. Recibe alertas de caducidad en tiempo real y mantén un inventario digital sincronizado con tus planes de comida.',
            step4Title: 'Ajuste de Porciones y Nutrición',
            step4Desc: 'Personaliza cada comida según tus necesidades. Ajusta las porciones dinámicamente y observa cómo se recalcula la información nutricional de forma instantánea.'
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
            byDay: 'Por Día',
            byWeek: 'Por Semana',
            profileOverview: 'Perfil',
            aiDisclaimer: 'Aviso: Las recetas y planes son generados por Inteligencia Artificial (basados en tecnología de Google Gemini) y se ofrecen únicamente como sugerencias. No constituyen consejo médico, nutricional ni dietético profesional. Siempre debes verificar los ingredientes para evitar riesgos de alergias o intolerancias. Úsalas bajo tu propia y estricta responsabilidad.',
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
                    hungry: 'Con hambre',
                    satisfied: 'Satisfecho',
                    stuffed: 'Demasiado lleno'
                },
                reasons: {
                    noTime: 'Falta de tiempo',
                    tooExpensive: 'Muy caro',
                    didntLike: 'No me gustó',
                    ateOut: 'Comí fuera',
                    forgot: 'Lo olvidé',
                    other: 'Otro'
                },
                specifyReason: 'Especificar razón...',
                save: 'Guardar',
                viewRecipe: 'Ver receta completa',
                stats: {
                    energy: 'Energía',
                    protein: 'Proteína',
                    cost: 'Costo'
                },
                scaledViewer: {
                    title: 'Visor de Receta Ajustada',
                    note: 'Nota de Ajuste',
                    ingredients: 'Ingredientes Escala',
                    instructions: 'Preparación'
                }
            },
            budget: 'Presupuesto Semanal',
            spent: 'Gasto Estimado',
            undefined: 'No definido',
            priceDisclaimer: 'Los precios son estimaciones basadas en datos promediados. Pueden existir discrepancias significativas con los precios reales en tienda o errores en el cálculo. Por favor, usa estos valores solo como referencia orientativa.',
            
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
            consent: {
                title: 'Entrenamiento de IA',
                desc: 'Para ofrecerte mejores planes cada semana, analizamos y entrenamos nuestros modelos con los resultados generados.',
                checkbox: 'Acepto que mis datos anonimizados de este plan sean usados y supervisados por un humano para mejorar el modelo de IA de Cacomi.',
                acceptBtn: 'Aceptar y Generar',
                cancelBtn: 'Cancelar',
                acceptedStatus: 'Aceptaste compartir los datos anonimizados de este plan para ayudarnos a mejorar nuestros modelos. Puedes cambiar tus preferencias en '
            },
            concierge: {
                loading: 'Nuestros chefs están diseñando tu menú. Te notificaremos cuando esté listo.',
                noteTitle: 'Nota del Chef:'
            },
            pinnedLabel: 'comidas fijadas',
            generationNotice: 'Respetaremos',
            pinTooltip: 'Fijar receta para que la IA no la cambie',
            unpinTooltip: 'Desfijar receta',
            generateConfirm: '¿Quieres generar un nuevo plan? Se usarán 50 Cacomi Coins.',
            offlineNotice: 'Tu comodidad es nuestra prioridad. Tu plan semanal se guarda automáticamente en este dispositivo para que nunca pierdas el ritmo, con o sin conexión. Todas las recetas (IA y manuales) están disponibles para consulta offline.'
        },

        landing: {
            heroTitle: 'Domina tu Estilo de Vida',
            heroSubtitle: 'No te conformes con lo ordinario. Toma el control total de tu tiempo y bienestar con la ingeniería gastronómica de Cacomi. Planes inteligentes, comunidad de élite y el futuro de la alimentación personalizada a tu alcance.',
            ctaStart: 'Acceso Exclusivo',
            ctaExplore: 'Explorar el Futuro',
            featureTitle: 'La excelencia en cada detalle',
            featureSubtitle: 'Cacomi no es una herramienta, es tu ventaja competitiva en la cocina.',
            evolution: 'El estándar de la cocina moderna',
            aiChef: 'Ingeniería con IA',
            noCommitment: 'Tu libertad es nuestra prioridad',
            pantryAnalysis: 'Optimización de Recursos',
            ingredientsRecipe: 'Máxima Eficiencia Gastronómica',
            aiCreativity: '*Sistemas inteligentes diseñando tu éxito diario.'
        },

        announcement: {
            newUpdate: 'Nueva Actualización',
            title: '¡Planificador Universal Interactivo!',
            desc: 'La planificación definitiva ha llegado. Gestiona tu semana con el nuevo sistema de arrastrar y soltar (DND) optimizado para móviles y tablets. Sustituye recetas, añade snacks y guarda todo localmente para usarlo sin conexión.',
            btn: '¡Probar Planificador!',
            ariaClose: 'Cerrar anuncio'
        },

        floatingWelcome: {
            title: '¡Bienvenido a Cacomi!',
            subtitle: 'Tu asistente de cocina con IA. Planifica, cocina y ahorra.',
            cta: 'Empezar ahora',
            learnMore: '¿Cómo funciona?',
        },

        features: {
            aiTitle: 'Ingeniería con IA',
            aiDesc: 'Nuestra inteligencia artificial no sugiere comidas; diseña el combustible perfecto para tu día a día, adaptado milimétricamente a tus metas y gustos.',
            pantryTitle: 'Optimización de Despensa',
            pantryDesc: 'Control absoluto sobre tus recursos. Un inventario digital inteligente que elimina el desperdicio y garantiza que siempre tengas lo mejor a mano.',
            communityTitle: 'Círculo de Creadores',
            communityDesc: 'Únete a una comunidad exclusiva de chefs caseros que han dejado atrás lo común para compartir experiencias gastronómicas de autor.',
            planningTitle: 'Estrategia Semanal',
            planningDesc: 'La máxima expresión de organización. Gestiona tu semana con un sistema intuitivo que trabaja para ti, incluso sin conexión.',
            marketplaceTitle: 'Cacomi Private Chef (Próximamente)',
            marketplaceDesc: 'La libertad definitiva: tus planes personalizados, preparados por chefs certificados y entregados con precisión donde el éxito te encuentre.'
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

        share: {
            title: 'Compartir Receta',
            preview: 'Vista previa',
            copyLink: 'Copiar enlace',
            linkCopied: '¡Enlace copiado!',
            shareWhatsApp: 'WhatsApp',
            shareTelegram: 'Telegram',
            shareFacebook: 'Facebook',
            shareTwitter: 'Twitter (X)',
            shareGeneric: 'Compartir'
        },
        common: {
            appName: 'Cacomi',
            rights: 'Todos los derechos reservados.',
            aboutLink: 'Acerca de',
            instagramUrl: 'https://www.instagram.com/cacomi_oficial',
            facebookUrl: 'https://www.facebook.com/people/Cacomi-Planificador-de-Comidas-con-IA/61589350700287',
            followUs: 'Síguenos en redes sociales',
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
            unifiedTitle: 'Tu Cocina Inteligente',
            unifiedSubtitle: 'Entra o crea tu cuenta para empezar a cocinar mejor.',
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
            termsError: 'Debes aceptar los términos para continuar.',
            googleLogin: 'Continuar con Google',
            setPassword: 'Establecer Contraseña',
            setPasswordDesc: 'Añade una contraseña a tu cuenta para iniciar sesión con email en el futuro.',
            setPasswordSuccess: 'Contraseña establecida correctamente.',
            changePassword: 'Cambiar Contraseña',
            changePasswordDesc: 'Tu cuenta ya está vinculada a una contraseña, pero puedes cambiarla aquí.',
            currentPassword: 'Contraseña Actual',
            newPassword: 'Nueva Contraseña',
            changePasswordSuccess: 'Contraseña actualizada correctamente.',
            passwordSafeError: 'La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, un número y un símbolo.',
            reqLength: 'Mínimo 8 caracteres',
            reqUpper: 'Una mayúscula',
            reqLower: 'Una minúscula',
            reqNumber: 'Un número',
            reqSymbol: 'Un símbolo (!@#$%^&*)'
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
            aiLegalDisclaimer: 'Aviso Legal: Esta receta será marcada públicamente como "Generada por IA". Cacomi no asume responsabilidad por reacciones alérgicas, intolerancias o fallas culinarias derivadas de este contenido. Al generar, cocinar o publicar esta receta, lo haces bajo tu propia y estricta responsabilidad.',
            poweredByGemini: 'Powered by Google Gemini',
            sensitiveWarn: 'Protege tu privacidad: No incluyas datos personales (teléfonos, direcciones) en la descripción.',
            imageRights: 'Al usar esta URL, confirmas tener derecho a compartir esta imagen.',
            loadingRecipe: 'Cargando datos de la receta...',
            noPermission: 'Redirigiendo... No tienes permiso.',
            deleteStep: 'Eliminar paso',
            disclaimerRetention: 'Al desactivar/eliminar tu cuenta, conservaremos tus datos temporalmente por 30 días para fines legales y de políticas de la plataforma antes de su eliminación definitiva.',
            disclaimerTransfer: 'Al desactivar/eliminar tu cuenta, las recetas que ya estén guardadas por otros usuarios podrían transferirse a la comunidad de Cacomi para mantener la integridad de sus recetarios.'
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
            pendingNutrition: 'Esta comida aún no ha sido calculada por Cacomi, espera al día de mañana para saber su información nutricional.',
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
            chef: 'Chef Cacomi',
            similarRecipes: 'Recetas Similares',
            relatedTitle: 'También te puede gustar',
            adTitle: 'Recomendado para ti',
            adSponsor: 'Patrocinado',
            keepExploring: 'No te detengas, ¡sigue explorando nuevos sabores!',
            nutrition: 'Información Nutricional',
            calories: 'Calorías',
            protein: 'Proteína',
            carbs: 'Carbohidratos',
            fat: 'Grasas'
        },

        settings: {
            title: 'Configuración',
            subtitle: 'Personaliza tu experiencia en Cacomi.',
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
            recipes: 'Recetas',
            pantry: 'Despensa',
            planner: 'Planificador',
            app: 'Aplicación / Caché',
            clear: 'Borrar descargas',
            clearing: 'Liberando...',
            storageDesc: 'Espacio ocupado por datos descargados para uso offline.',
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
            unknownIngredient: 'Ingrediente desconocido',
            offlineNotice: 'Cacomi es superior porque piensa en ti: guardamos tu despensa localmente para que puedas consultarla sin internet. Cuando recuperes la conexión, sincronizaremos tus cambios automáticamente.'
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
            viewAs: 'Vista:',
            biometric: 'Metas Nutricionales'
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
            serverLogs: 'Logs del Servidor',
            audit: {
                userGoals: 'Objetivos del Usuario',
                recipeCatalog: 'Catálogo de Recetas',
                pantry: 'Contexto de Despensa',
                pinnedMeals: 'Comidas Forzadas',
                viewFullCatalog: 'Ver Catálogo Completo',
                viewCatalogDesc: 'Explora todas las recetas disponibles para esta generación',
                noData: 'No hay datos de auditoría estructurados',
                budget: 'Presupuesto Semanal',
                calories: 'Calorías Objetivo',
                protein: 'Proteína Objetivo',
                weight: 'Peso Objetivo',
                activity: 'Nivel de Actividad'
            }
        },
        legal: {
            googleAiDisclaimer: 'Google LLC (Gemini API): Procesamiento temporal de preferencias dietéticas e ingredientes para generar recetas mediante IA. El procesamiento se rige por los términos de servicio de Google AI Studio, los cuales pueden incluir el uso de datos anonimizados para la mejora del modelo en su versión gratuita.',
            internalTrainingClause: 'Cacomi podrá utilizar datos de interacción anonimizados para el entrenamiento y optimización de sus algoritmos internos de recomendación y mejora del servicio.'
        },
        shoppingList: {
            title: 'Lista de Compras',
            fullList: 'Lista Completa',
            toBuy: 'Por Comprar',
            inPantry: 'En alacena',
            partial: 'Incompleto',
            needToBuy: 'Falta comprar',
            quantity: 'Cantidad',
            unit: 'Unidad',
            empty: 'No hay ingredientes en tu plan para esta semana.',
            pantryNote: 'Basado en tu alacena local.',
            copySuccess: 'Lista copiada al portapapeles',
            buyAction: 'Compré esto',
            addToPantry: 'Añadir a alacena',
            boughtQuantity: 'Cantidad comprada',
            expirationDate: 'Fecha de caducidad',
            saveToPantry: 'Guardar en Alacena',
            buySuccess: '¡Añadido a tu alacena!'
        }
    },
    en: {
        recipeTypes: {
            BREAKFAST: 'Breakfast',
            MAIN_COURSE: 'Main Course',
            SNACK: 'Snack',
            SIDE_VEGETABLE: 'Vegetable Side',
            SIDE_CARB: 'Carbs / Grains',
            LEGUME: 'Legumes',
            SAUCE: 'Sauces & Dressings',
            SOUP: 'Soups & Broths',
            LUNCH: 'Lunch',
            DINNER: 'Dinner'
        },
        about: {
            title: 'About Cacomi',
            desc: 'Learn about the mission, values, and future of Cacomi, your AI-powered kitchen assistant.',
            missionTag: 'Our Mission',
            missionTitle: 'Connecting your pantry with the future of cooking.',
            missionDesc: 'Cacomi was born from a simple need: eating well shouldn\'t cost so much time and money. We use cutting-edge tech to turn your ingredients into the best meal of your day.',
            pillarsTitle: 'Our Pillars',
            pillarsSubtitle: 'Every line of code we write is grounded in principles designed to improve your daily life.',
            pillar1Title: 'Sustainability',
            pillar1Desc: 'We reduce food waste by connecting exactly what you have with what you can cook.',
            pillar2Title: 'Active Innovation',
            pillar2Desc: 'AI is not a gimmick; it is your daily kitchen assistant building menus in seconds.',
            pillar3Title: 'Health & Economy',
            pillar3Desc: 'We empower your nutritional decisions and take care of your wallet by efficiently planning your pantry.',
            blogTag: 'New',
            blogTitle: 'The Cacomi Blog',
            blogDesc: 'Discover step-by-step guides, meal planning tips, and household financial tricks. Our blog is filled with resources designed to help you improve your eating habits and save money.',
            ctaTitle: 'Ready to change your routine?',
            ctaDesc: 'Join the smart household community today.',
            ctaBtn: 'Create my free profile',
            howItWorksTitle: 'Your Kitchen, Reinvented',
            howItWorksSubtitle: 'Discover how Cacomi uses advanced technology to simplify your daily nutrition.',
            step1Title: 'Explore & Discover',
            step1Desc: 'Browse through an infinite catalog of real recipes. Our intuitive interface lets you filter by categories and access your saved recipes even without an internet connection.',
            step2Title: 'Smart Planning',
            step2Desc: 'Organize your week with our interactive planner. Drag and drop recipes, generate automatically consolidated smart shopping lists, and let our technology guide you toward balanced eating.',
            step3Title: 'Full Pantry Control',
            step3Desc: 'Manage your ingredients and avoid waste. Get real-time expiration alerts and keep a digital inventory synced with your meal plans.',
            step4Title: 'Portion & Nutrition Adjustment',
            step4Desc: 'Customize each meal according to your needs. Dynamically adjust portions and watch nutritional information recalculate instantly.'
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
            progressDesc: 'Our health and progress tracking tool is under development to offer you the best metrics for your Nutrición Inteligente.',
            plannerDesc: 'Organize your weekly menus with ease and generate automatic shopping lists.',
            comingSoon: 'Coming Soon',
            beta: 'Beta',
            menu: 'Menu',
            accountMenu: 'Account Menu'
        },
        landing: {
            heroTitle: 'Master Your Lifestyle',
            heroSubtitle: 'Don\'t settle for the ordinary. Take full control of your time and well-being with Cacomi\'s gastronomic engineering. Smart plans, elite community, and the future of personalized nutrition at your fingertips.',
            ctaStart: 'Exclusive Access',
            ctaExplore: 'Explore the Future',
            featureTitle: 'Excellence in every detail',
            featureSubtitle: 'Cacomi is not a tool; it\'s your competitive advantage in the kitchen.',
            evolution: 'The modern kitchen standard',
            aiChef: 'AI Engineering',
            noCommitment: 'Your freedom is our priority',
            pantryAnalysis: 'Resource Optimization',
            ingredientsRecipe: 'Maximum Gastronomic Efficiency',
            aiCreativity: '*Intelligent systems designing your daily success.'
        },
        features: {
            aiTitle: 'Precision Engineering',
            aiDesc: 'Our artificial intelligence doesn\'t just suggest meals; it designs the perfect fuel for your life, precision-tuned to your goals and lifestyle standards.',
            pantryTitle: 'Asset Optimization',
            pantryDesc: 'Absolute control over your resources. A high-end digital inventory that eliminates waste and ensures constant excellence.',
            communityTitle: 'Creators Circle',
            communityDesc: 'Join an exclusive ecosystem of home chefs who transcend the common to share signature gastronomic experiences.',
            planningTitle: 'Weekly Strategy',
            planningDesc: 'The ultimate expression of organization. Master your week with an intuitive system designed to perform at its peak, even offline.',
            marketplaceTitle: 'Cacomi Private Chef (Coming Soon)',
            marketplaceDesc: 'Absolute freedom: your personalized plans, designed by certified chefs and executed with the precision your success demands.'
        },

        announcement: {
            newUpdate: 'New Update',
            title: 'Universal Interactive Planner!',
            desc: 'The ultimate planning experience is here. Manage your week with the new drag-and-drop (DND) system optimized for mobile and tablet. Replace recipes, add snacks, and save everything locally for offline use.',
            btn: 'Try Planner!',
            ariaClose: 'Close announcement'
        },

        floatingWelcome: {
            title: 'Welcome to Cacomi!',
            subtitle: 'Your AI kitchen assistant. Plan, cook, and save.',
            cta: 'Get Started',
            learnMore: 'How it works?',
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

        share: {
            title: 'Share Recipe',
            preview: 'Preview',
            copyLink: 'Copy Link',
            linkCopied: 'Link copied!',
            shareWhatsApp: 'WhatsApp',
            shareTelegram: 'Telegram',
            shareFacebook: 'Facebook',
            shareTwitter: 'Twitter (X)',
            shareGeneric: 'Share'
        },
        common: {
            appName: 'Cacomi',
            rights: 'All rights reserved.',
            aboutLink: 'About Us',
            instagramUrl: 'https://www.instagram.com/cacomi_oficial',
            facebookUrl: 'https://www.facebook.com/people/Cacomi-Planificador-de-Comidas-con-IA/61589350700287',
            followUs: 'Follow us',
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

        planner: {
            title: 'Weekly Plan',
            generateAI: 'Generate with AI',
            aiDisclaimer: 'Notice: Recipes and meal plans are generated by Artificial Intelligence (powered by Google Gemini) and are provided purely as suggestions. They do not constitute professional medical, nutritional, or dietary advice. You must always verify ingredients to avoid allergy or intolerance risks. Use them strictly at your own risk.',
            byDay: 'By Day',
            byWeek: 'By Week',
            profileOverview: 'Profile',
            exploreRecipes: 'Explore Recipes',
            searchPlaceholder: 'Search ingredients...',
            nutritionalSummary: 'Nutritional Summary',
            proteins: 'Proteins',
            calories: 'Avg Daily Calories',
            dragHere: 'Drag here',
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            snack: 'Snack',
            tags: { healthy: 'Healthy', quick: 'Quick', vegan: 'Vegan' },
            days: { dom: 'SUN', lun: 'MON', mar: 'TUE', mie: 'WED', jue: 'THU', vie: 'FRI', sab: 'SAT' },
            thisWeek: 'This week',
            nextWeek: 'Next week',
            lastWeek: 'Last week',
            prevWeek: 'Previous',
            weeks: 'weeks',
            today: 'Today',
            pastWeekNote: 'This week is in the past. You can only plan for the next 7 days from today.',
            futureWeekNote: 'You can explore future weeks, but you can only plan for the next 7 days.',
            tracking: {
                eaten: 'I ate it',
                rating: 'Rating',
                satiety: 'How full are you?',
                reason: 'Why did you skip it?',
                satietyLevels: { hungry: 'Hungry', satisfied: 'Satisfied', stuffed: 'Stuffed' },
                reasons: { noTime: 'No time', tooExpensive: 'Too expensive', didntLike: 'Did not like', ateOut: 'Ate out', forgot: 'Forgot', other: 'Other' },
                specifyReason: 'Specify reason...',
                save: 'Save',
                viewRecipe: 'View Full Recipe',
                stats: {
                    energy: 'Energy',
                    protein: 'Protein',
                    cost: 'Cost'
                },
                scaledViewer: {
                    title: 'Adjusted Recipe Viewer',
                    note: 'Adjustment Note',
                    ingredients: 'Scaled Ingredients',
                    instructions: 'Preparation'
                }
            },
            budget: 'Weekly Budget',
            spent: 'Estimated Spent',
            undefined: 'Undefined',
            priceDisclaimer: 'Prices are estimates based on averaged data. Significant discrepancies with real store prices or calculation errors may exist. Please use these values as a general reference only.',
            
            checkin: {
                title: 'How did you feel this week?',
                stress: 'Stress Level',
                energy: 'Energy Level',
                notes: 'Additional Notes',
                levels: { low: 'Low', medium: 'Medium', high: 'High' },
                save: 'Complete Check-in'
            },
            consent: {
                title: 'AI Training',
                desc: 'To offer you better plans each week, we analyze and train our models with the generated results.',
                checkbox: 'I agree that my anonymized data from this plan may be used and supervised by a human to improve Cacomi\'s AI model.',
                acceptBtn: 'Accept & Generate',
                cancelBtn: 'Cancel',
                acceptedStatus: 'You agreed to share the anonymized data of this plan to help us improve our AI models. You can change your preferences in '
            },
            concierge: { loading: 'Our chefs are designing your menu...', noteTitle: 'Chef Note:' },
            pinnedLabel: 'pinned meals',
            generationNotice: 'We will respect',
            pinTooltip: 'Pin recipe so AI does not change it',
            unpinTooltip: 'Unpin recipe',
            generateConfirm: 'Do you want to generate a new plan? 50 Cacomi Coins will be used.',
            offlineNotice: 'Your convenience is our priority. Your weekly plan is automatically saved on this device so you never miss a beat, with or without a connection. All recipes (AI & manual) are available for offline reference.'
        },

        auth: {
            loginTitle: 'Log In',
            registerTitle: 'Create Account',
            unifiedTitle: 'Your Smart Kitchen',
            unifiedSubtitle: 'Log in or create an account to start cooking better.',
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
            termsError: 'You must accept the terms to continue.',
            googleLogin: 'Continue with Google',
            setPassword: 'Set Password',
            setPasswordDesc: 'Add a password to your account to log in with email in the future.',
            setPasswordSuccess: 'Password set successfully.',
            changePassword: 'Change Password',
            changePasswordDesc: 'Your account is already linked to a password, but you can change it here.',
            currentPassword: 'Current Password',
            newPassword: 'New Password',
            changePasswordSuccess: 'Password updated successfully.',
            passwordSafeError: 'Password must have at least 8 characters, including uppercase, lowercase, a number, and a symbol.',
            reqLength: 'At least 8 characters',
            reqUpper: 'One uppercase letter',
            reqLower: 'One lowercase letter',
            reqNumber: 'One number',
            reqSymbol: 'One symbol (!@#$%^&*)'
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
            aiLegalDisclaimer: 'Legal Notice: This recipe will be publicly marked as "AI Generated". Cacomi is not responsible for allergies, culinary failures, or generated content. By generating, cooking, or publishing this recipe, you do so strictly at your own risk.',
            poweredByGemini: 'Powered by Google Gemini',
            sensitiveWarn: 'Protect your privacy: Do not include personal data (phones, addresses) in the description.',
            imageRights: 'By using this URL, you confirm you have the right to share this image.',
            loadingRecipe: 'Loading recipe data...',
            noPermission: 'Redirecting... You do not have permission.',
            deleteStep: 'Delete step',
            disclaimerRetention: 'Upon account deactivation/deletion, we will temporarily retain your data for 30 days for legal and platform policy purposes before permanent deletion.',
            disclaimerTransfer: 'Upon account deactivation/deletion, recipes already saved by other users may be transferred to the Cacomi community to maintain their cookbooks\' integrity.'
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
            pendingNutrition: 'This meal has not yet been calculated by Cacomi, please check back tomorrow for its nutritional information.',
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
            chef: 'Chef Cacomi',
            similarRecipes: 'Similar Recipes',
            relatedTitle: 'You might also love',
            adTitle: 'Recommended for you',
            adSponsor: 'Sponsored',
            keepExploring: "Don't stop now, keep exploring new flavors!",
            nutrition: 'Nutritional Information',
            calories: 'Calories',
            protein: 'Protein',
            carbs: 'Carbs',
            fat: 'Fat'
        },

        settings: {
            title: 'Settings',
            subtitle: 'Customize your Cacomi experience.',
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
            recipes: 'Recipes',
            pantry: 'Pantry',
            planner: 'Planner',
            app: 'App / Cache',
            clear: 'Clear downloads',
            clearing: 'Clearing...',
            storageDesc: 'Space occupied by data downloaded for offline use.',
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
            unknownIngredient: 'Unknown ingredient',
            offlineNotice: 'Cacomi is superior because it thinks of you: we save your pantry locally so you can consult it without internet. Once connection is restored, we will sync your changes automatically.'
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
            viewAs: 'View:',
            biometric: 'Nutritional Goals'
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
            serverLogs: 'Server Logs',
            audit: {
                userGoals: 'User Goals',
                recipeCatalog: 'Recipe Catalog',
                pantry: 'Pantry Context',
                pinnedMeals: 'Pinned Meals',
                viewFullCatalog: 'View Full Catalog',
                viewCatalogDesc: 'Explore all available recipes for this generation',
                noData: 'No structured audit data available',
                budget: 'Weekly Budget',
                calories: 'Target Calories',
                protein: 'Target Protein',
                weight: 'Target Weight',
                activity: 'Activity Level'
            }
        },
        legal: {
            googleAiDisclaimer: 'Google LLC (Gemini API): Temporary processing of dietary preferences and ingredients to generate recipes via AI. Processing is governed by the Google AI Studio terms of service, which may include the use of anonymized data for model improvement in its free version.',
            internalTrainingClause: 'Cacomi may use anonymized interaction data for the training and optimization of its internal recommendation algorithms and service improvement.'
        },
        shoppingList: {
            title: 'Shopping List',
            fullList: 'Full List',
            toBuy: 'To Buy',
            inPantry: 'In pantry',
            partial: 'Partial',
            needToBuy: 'Need to buy',
            quantity: 'Quantity',
            unit: 'Unit',
            empty: 'No ingredients in your plan for this week.',
            pantryNote: 'Based on your local pantry.',
            copySuccess: 'List copied to clipboard',
            buyAction: 'I bought this',
            addToPantry: 'Add to pantry',
            boughtQuantity: 'Quantity bought',
            expirationDate: 'Expiration date',
            saveToPantry: 'Save to Pantry',
            buySuccess: 'Added to your pantry!'
        }
    },
    fr: {
        recipeTypes: {
            BREAKFAST: 'Petit-déjeuner',
            MAIN_COURSE: 'Plat Principal',
            SNACK: 'Collation / Snack',
            SIDE_VEGETABLE: 'Accompagnement de Légumes',
            SIDE_CARB: 'Céréales et Tubercules',
            LEGUME: 'Légumineuses',
            SAUCE: 'Sauces et Assaisonnements',
            SOUP: 'Soupes et Bouillons',
            LUNCH: 'Déjeuner',
            DINNER: 'Dîner'
        },
        about: {
            title: 'À propos de Cacomi',
            desc: 'Découvrez la mission, les valeurs et l\'avenir de Cacomi, votre assistant de cuisine IA.',
            missionTag: 'Notre Mission',
            missionTitle: 'Connecter votre garde-manger à l\'avenir de la cuisine.',
            missionDesc: 'Cacomi est né d\'un besoin simple : bien manger ne devrait pas coûter tant de temps ni d\'argent. Nous utilisons des technologies de pointe pour transformer vos ingrédients.',
            pillarsTitle: 'Nos Piliers',
            pillarsSubtitle: 'Chaque ligne de code que nous écrivons est fondée sur des principes conçus pour améliorer votre quotidien.',
            pillar1Title: 'Durabilité',
            pillar1Desc: 'Nous réduisons le gaspillage alimentaire en connectant exactement ce que vous avez avec ce que vous pouvez cuisiner.',
            pillar2Title: 'Innovation Active',
            pillar2Desc: 'L\'IA n\'est pas un gadget, c\'est votre assistant quotidien pour créer des menus en quelques secondes.',
            pillar3Title: 'Santé et Économie',
            pillar3Desc: 'Nous renforçons vos décisions nutritionnelles et prenons soin de votre portefeuille en planifiant efficacement.',
            blogTag: 'Bientôt Disponible',
            blogTitle: 'Le Journal de Cacomi (Blog)',
            blogDesc: 'Nous croyons en la transparence. Bientôt, nous lancerons un espace où notre équipe partagera des mises à jour, des recettes, et des conseils.',
            ctaTitle: 'Prêt à changer de routine ?',
            ctaDesc: 'Rejoignez la communauté des foyers intelligents dès aujourd\'hui.',
            ctaBtn: 'Créer mon profil gratuit',
            howItWorksTitle: 'Votre Cuisine, Réinventée',
            howItWorksSubtitle: 'Découvrez comment Cacomi utilise une technologie de pointe pour simplifier votre alimentation quotidienne.',
            step1Title: 'Explorez et Découvrez',
            step1Desc: 'Naviguez dans un catalogue infini de recettes réelles. Filtrez par catégories ou recherchez des ingrédients spécifiques que vous avez déjà à la maison.',
            step2Title: 'Planification par IA',
            step2Desc: 'Générez des plans hebdomadaires intelligents. Notre IA équilibre vos macros, génère des listes de courses intelligentes consolidées et s\'assure que vous mangez sainement chaque jour.',
            step3Title: 'Garde-manger Intelligent',
            step3Desc: 'Gérez votre stock et recevez des alertes d\'expiration. Votre garde-manger se synchronise avec vos plans pour éviter les achats inutiles.',
            step4Title: 'Évolution Continue',
            step4Desc: 'Utilisez le "Meal Check" pour noter vos repas. Cacomi apprend de vos commentaires pour que chaque plan soit meilleur que le précédent.'
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
            heroTitle: 'Maîtrisez votre Style de Vie',
            heroSubtitle: 'Ne vous contentez pas de l\'ordinaire. Prenez le contrôle total de votre temps et de votre bien-être avec l\'ingénierie gastronomique de Cacomi. Des plans inteligentes, une communauté d\'élite et le futur de l\'alimentation personnalisée à votre portée.',
            ctaStart: 'Accès Exclusif',
            ctaExplore: 'Explorer le Futur',
            featureTitle: 'L\'excellence dans chaque détail',
            featureSubtitle: 'Cacomi n\'est pas un outil, c\'est votre avantage compétitif en cuisine.',
            evolution: 'Le standard de la cuisine moderne',
            aiChef: 'Ingénierie par IA',
            noCommitment: 'Votre liberté est notre priorité',
            pantryAnalysis: 'Optimisation des Ressources',
            ingredientsRecipe: 'Efficacité Gastronomique Maximale',
            aiCreativity: '*Des systèmes inteligentes conçoivent votre succès quotidien.'
        },

        announcement: {
            newUpdate: 'Nouvelle Mise à Jour',
            title: 'Le Planificateur Intelligent est enfin là !',
            desc: 'Notre fonctionnalité la plus attendue est arrivée. Vous pouvez désormais organiser votre semaine, générer des menus avec l\'IA et suivre votre apport nutritionnel. Explorez l\'onglet Planificateur pour commencer.',
            btn: 'Essayer le Planificateur !',
            ariaClose: 'Fermer l\'annonce'
        },

        features: {
            aiTitle: 'Ingénierie par IA',
            aiDesc: 'Notre intelligence artificielle ne suggère pas de repas ; elle conçoit le carburant parfait pour votre quotidien, adapté millimétriquement à vos objectifs et à vos goûts.',
            pantryTitle: 'Optimisation du Garde-manger',
            pantryDesc: 'Contrôle absolu sur vos ressources. Un inventaire numérique intelligent qui élimine le gaspillage et garantit que vous avez toujours le meilleur sous la main.',
            communityTitle: 'Cercle de Créateurs',
            communityDesc: 'Rejoignez une communauté exclusive de chefs amateurs qui ont laissé derrière eux le commun pour partager des expériences gastronomiques d\'auteur.',
            planningTitle: 'Stratégie Hebdomadaire',
            planningDesc: 'L\'expression ultime de l\'organisation. Gérez votre semaine avec un système intuitif qui travaille pour vous, même hors ligne.',
            marketplaceTitle: 'Cacomi Private Chef (Bientôt)',
            marketplaceDesc: 'La liberté ultime : vos plans personnalisés, préparés par des chefs certifiés et livrés avec précision là où le succès vous trouve.'
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

        share: {
            title: 'Partager la Recette',
            preview: 'Aperçu',
            copyLink: 'Copier le lien',
            linkCopied: 'Lien copié !',
            shareWhatsApp: 'WhatsApp',
            shareTelegram: 'Telegram',
            shareFacebook: 'Facebook',
            shareTwitter: 'Twitter (X)',
            shareGeneric: 'Partager'
        },
        common: {
            appName: 'Cacomi',
            rights: 'Tous droits réservés.',
            aboutLink: 'À propos',
            instagramUrl: 'https://www.instagram.com/cacomi_oficial',
            facebookUrl: 'https://www.facebook.com/people/Cacomi-Planificador-de-Comidas-con-IA/61589350700287',
            followUs: 'Suivez-nous',
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
            termsError: 'Vous devez accepter les termes pour continuer.',
            googleLogin: 'Continuer avec Google',
            setPassword: 'Définir le mot de passe',
            setPasswordDesc: 'Ajoutez un mot de passe à votre compte pour vous connecter par e-mail à l\'avenir.',
            setPasswordSuccess: 'Mot de passe défini avec succès.'
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
            disclaimerTransfer: 'Lors de la désactivation/suppression du compte, les recettes déjà enregistrées par d\'autres utilisateurs peuvent être transférées à la communauté Cacomi.'
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
            chef: 'Chef Cacomi',
            similarRecipes: 'Recettes Similaires',
            relatedTitle: 'Vous pourriez aussi aimer',
            adTitle: 'Recommandé pour vous',
            adSponsor: 'Sponsorisé',
            keepExploring: 'Ne vous arrêtez pas, continuez à explorer de nouvelles saveurs !',
            nutrition: 'Informations Nutritionnelles',
            calories: 'Calories',
            protein: 'Protéines',
            carbs: 'Glucides',
            fat: 'Lipides'
        },

        settings: {
            title: 'Paramètres',
            subtitle: 'Personnalisez votre expérience Cacomi.',
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

            storageDesc: 'Cacomi gère l\'espace automatiquement.',
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
        },
        legal: {
            googleAiDisclaimer: 'Google LLC (Gemini API) : Traitement temporaire des préférences diététiques et des ingrédients pour générer des recettes via l\'IA. Le traitement est régi par les conditions d\'utilisation de Google AI Studio, qui peuvent inclure l\'utilisation de données anonymisées pour l\'amélioration du modèle dans sa version gratuite.',
            internalTrainingClause: 'Cacomi peut utilizar des données d\'interaction anonymisées pour l\'entraînement et l\'optimisation de ses propres algorithmes de recommandation internes et l\'amélioration du service.'
        },
        shoppingList: {
            title: 'Liste de Courses',
            fullList: 'Liste Complète',
            toBuy: 'À Acheter',
            inPantry: 'En réserve',
            partial: 'Incomplet',
            needToBuy: 'À acheter',
            quantity: 'Quantité',
            unit: 'Unité',
            empty: 'Aucun ingrédient dans votre plan pour cette semaine.',
            pantryNote: 'Basé sur votre garde-manger local.',
            copySuccess: 'Liste copiée dans le presse-papiers',
            buyAction: 'J\'ai acheté ça',
            addToPantry: 'Ajouter au garde-manger',
            boughtQuantity: 'Quantité achetée',
            expirationDate: 'Date d\'expiration',
            saveToPantry: 'Enregistrer au Garde-manger',
            buySuccess: 'Ajouté à votre réserve !'
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
        if (typeof window !== 'undefined') localStorage.setItem('Cacomi_image_strategy', strategy);
    },

    setTheme: (newTheme) => {
        set({ theme: newTheme });
        if (typeof window !== 'undefined') {
            localStorage.setItem('Cacomi_theme', newTheme);
            document.cookie = `Cacomi_theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
            applyTheme(newTheme);
        }
    },

    setLanguage: (lang) => {
        set({ language: lang, t: translations[lang] || translations.es });
        if (typeof window !== 'undefined') {
            localStorage.setItem('cacomi_language', lang);
            document.cookie = `cacomi_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
            document.documentElement.lang = lang;
        }
    },

    setAutoTranslate: (enabled) => {
        set({ autoTranslate: enabled });
        if (typeof window !== 'undefined') localStorage.setItem('Cacomi_auto_translate', JSON.stringify(enabled));
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

        const savedStrategy = localStorage.getItem('Cacomi_image_strategy');
        if (savedStrategy) set({ imageStrategy: savedStrategy });

        const savedTheme = localStorage.getItem('Cacomi_theme') || 'system';
        set({ theme: savedTheme });
        applyTheme(savedTheme);

        const savedLang = localStorage.getItem('cacomi_language') || 'es';
        set({ language: savedLang, t: translations[savedLang] || translations.es });

        const savedAutoTranslate = localStorage.getItem('Cacomi_auto_translate');
        if (savedAutoTranslate) set({ autoTranslate: JSON.parse(savedAutoTranslate) });

        get().checkNetwork();

        window.addEventListener('online', get().checkNetwork);
        window.addEventListener('offline', get().checkNetwork);

        if (navigator.connection) {
            navigator.connection.addEventListener('change', () => get().checkNetwork());
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            if (localStorage.getItem('Cacomi_theme') === 'system') {
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


