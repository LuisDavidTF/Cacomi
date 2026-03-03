'use client';

import React, { useEffect } from 'react';
import { create } from 'zustand';

const translations = {
    es: {
        nav: { home: 'Inicio', create: 'Crear Receta', settings: 'Configuración', login: 'Acceder', register: 'Registrarse', logout: 'Salir', greeting: 'Hola,', pantry: 'Despensa' },

        landing: {
            heroTitle: 'Planificación de Comidas Inteligente',
            heroSubtitle: 'Descubre una nueva forma de cocinar con recetas generadas por IA, gestiona tu despensa y organiza tus comidas semanales en un solo lugar. Únete a nuestra comunidad de amantes de la cocina y transforma tu alimentación hoy mismo.',
            ctaStart: 'Comenzar Gratis',
            ctaExplore: 'Explorar Recetas',
            featureTitle: 'Todo lo que necesitas para cocinar mejor',
            featureSubtitle: 'Culina Smart no es solo un recetario, es tu asistente personal de cocina.'
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
            imageRights: 'Al usar esta URL, confirmas tener derecho a compartir esta imagen.'
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
        }
    },
    en: {
        nav: { home: 'Home', create: 'New Recipe', settings: 'Settings', login: 'Log In', register: 'Sign Up', logout: 'Log Out', greeting: 'Hi,', pantry: 'Pantry' },

        landing: {
            heroTitle: 'Smart Meal Planning',
            heroSubtitle: 'Discover a new way to cook with AI-generated recipes, manage your pantry, and organize your weekly meals all in one place. Join our community of food lovers and transform your eating habits today.',
            ctaStart: 'Start for Free',
            ctaExplore: 'Explore Recipes',
            featureTitle: 'Everything you need to cook better',
            featureSubtitle: 'Culina Smart is not just a recipe book, it\'s your personal kitchen assistant.'
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
            imageRights: 'By using this URL, you confirm you have the right to share this image.'
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
        }
    },
    fr: {
        nav: { home: 'Accueil', create: 'Créer Recette', settings: 'Paramètres', login: 'Connexion', register: 'S\'inscrire', logout: 'Déconnexion', greeting: 'Bonjour,', pantry: 'Garde-manger' },

        landing: {
            heroTitle: 'Planification de Repas Intelligente',
            heroSubtitle: 'Découvrez une nouvelle façon de cuisiner avec des recettes générées par IA, gérez votre garde-manger et organisez vos repas hebdomadaires au même endroit. Rejoignez notre communauté et transformez votre alimentation aujourd\'hui.',
            ctaStart: 'Commencer Gratuitement',
            ctaExplore: 'Explorer Recettes',
            featureTitle: 'Tout ce dont vous avez besoin pour mieux cuisiner',
            featureSubtitle: 'Culina Smart n\'est pas seulement un livre de recettes, c\'est votre assistant de cuisine personnel.'
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
            imageRights: 'En utilisant cette URL, vous confirmez avoir le droit de partager cette image.'
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
