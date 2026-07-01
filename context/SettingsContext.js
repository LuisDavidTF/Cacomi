'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const translations = {
        es: {
            nav: { home: 'Inicio', create: 'Crear Receta', settings: 'Configuración', login: 'Acceder', register: 'Registrarse', logout: 'Salir', greeting: 'Hola,', pantry: 'Despensa' },

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
                expiredPost: 'días'
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
                view: 'Ver Receta Completa'
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
                chef: 'Chef SmartRecipe',
                aiWarningTitle: 'Advertencia de Contenido',
                aiWarningDesc: 'Las recetas en Cacomi pueden estar total o parcialmente generadas con Inteligencia Artificial (IA) o por otros usuarios. El contenido puede contener errores importantes en ingredientes, cantidades o pasos de preparación. Usa esta información con precaución y bajo tu propia responsabilidad. Verifica siempre que los ingredientes sean comestibles y seguros.',
                chefVerificationNotice: 'Estamos trabajando para que en las próximas semanas contemos con recetas verificadas por nuestros chefs. Dichas recetas serán seguras, comestibles y con los pasos correctos.',
                verifiedBadgeDesc: 'Las recetas verificadas se distinguirán en el visor por una palomita azul como esta:',
                verifiedBadgeTooltip: 'Receta Verificada por Chefs de Cacomi'
            },
            legal: {
                aiWarningTermsTitle: 'Advertencia de Recetas por IA y Verificación de Chefs',
                aiWarningTermsDesc: 'Cacomi permite a los usuarios consultar y generar recetas de cocina que pueden estar total o parcialmente diseñadas por Inteligencia Artificial o compartidas por otros usuarios. Estas recetas se ofrecen "tal cual" y pueden contener errores críticos en ingredientes, pasos o proporciones. No garantizamos que sean comestibles ni seguras, por lo que su uso es bajo tu propio riesgo y responsabilidad.',
                chefVerificationNotice: 'Actualmente estamos trabajando para que en las próximas semanas la plataforma cuente con recetas verificadas. Estas recetas serán revisadas, probadas y avaladas por nuestros chefs profesionales para certificar que son seguras, comestibles y que contienen los pasos correctos.',
                verificationIconExplanation: 'Las recetas verificadas se distinguirán claramente en el visor mediante un icono de palomita azul (verificación) ubicado en el área superior, separado del título de la receta para evitar cualquier falsificación o alteración por parte de otros usuarios. Si una receta no cuenta con esta insignia de verificación, debe considerarse como no verificada y utilizarse con extrema precaución.'
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
                clear: 'Borrar descargas',
                clearing: 'Liberando...',
                storageDesc: 'Culina Smart administra el espacio automáticamente.',
                account: 'Cuenta y Privacidad',
                deleteAccount: 'Eliminar mi cuenta',
                deleteAccountDesc: 'Solicitar la baja permanente de tus datos.'
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
                saving: 'Guardando...'
            }
        },
        en: {
            nav: { home: 'Home', create: 'New Recipe', settings: 'Settings', login: 'Log In', register: 'Sign Up', logout: 'Log Out', greeting: 'Hi,', pantry: 'Pantry' },

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
                expiredPost: 'days ago'
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
                view: 'View Full Recipe'
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
                chef: 'Chef SmartRecipe',
                aiWarningTitle: 'Content Disclaimer',
                aiWarningDesc: 'Recipes on Cacomi may be fully or partially generated by Artificial Intelligence (AI) or shared by other users. Content may contain significant errors in ingredients, quantities, or steps. Use this information with caution and at your own risk. Always verify that ingredients are edible and safe.',
                chefVerificationNotice: 'We are working to bring you verified recipes by our chefs in the coming weeks. These recipes will be safe, edible, and have the correct steps.',
                verifiedBadgeDesc: 'Verified recipes will be identified in the viewer by a blue checkmark like this:',
                verifiedBadgeTooltip: 'Recipe Verified by Cacomi Chefs'
            },
            legal: {
                aiWarningTermsTitle: 'AI Recipe Warning and Chef Verification',
                aiWarningTermsDesc: 'Cacomi allows users to view and generate recipes that may be fully or partially designed by Artificial Intelligence or shared by other users. These recipes are provided "as is" and may contain critical errors in ingredients, steps, or proportions. We do not guarantee that they are edible or safe, so their use is strictly at your own risk and responsibility.',
                chefVerificationNotice: 'We are currently working to introduce verified recipes to the platform in the coming weeks. These recipes will be reviewed, tested, and approved by our professional chefs to certify that they are safe, edible, and feature correct steps.',
                verificationIconExplanation: 'Verified recipes will be clearly identified in the viewer by a blue checkmark (verification) icon in the top section, separate from the recipe title to prevent any spoofing or alteration by other creators. If a recipe does not display this verification badge, it must be considered unverified and used with extreme caution.'
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
                clear: 'Clear downloads',
                clearing: 'Clearing...',
                storageDesc: 'Culina Smart manages space automatically.',
                account: 'Account & Privacy',
                deleteAccount: 'Delete my account',
                deleteAccountDesc: 'Request permanent deletion of your data.'
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
                saving: 'Saving...'
            }
        },
        fr: {
            nav: { home: 'Accueil', create: 'Créer Recette', settings: 'Paramètres', login: 'Connexion', register: 'S\'inscrire', logout: 'Déconnexion', greeting: 'Bonjour,', pantry: 'Garde-manger' },

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
                expiredPost: 'jours'
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
                view: 'Voir Recette Complète'
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
                chef: 'Chef SmartRecipe',
                aiWarningTitle: 'Avertissement de Contenu',
                aiWarningDesc: 'Les recettes sur Cacomi peuvent être entièrement ou partiellement générées par Intelligence Artificielle (IA) ou partagées par d\'autres utilisateurs. Le contenu peut contenir des erreurs importantes dans les ingrédients, les quantités ou les étapes de préparation. Utilisez ces informations avec précaution et à vos propres risques. Vérifiez toujours que les ingrédients sont comestibles et sûrs.',
                chefVerificationNotice: 'Nous travaillons à vous proposer des recettes vérifiées par nos chefs dans les semaines à venir. Ces recettes seront sûres, comestibles et contiendront les étapes correctes.',
                verifiedBadgeDesc: 'Les recettes vérifiées seront identifiées dans le visualiseur par une coche bleue comme celle-ci :',
                verifiedBadgeTooltip: 'Recette Vérifiée par les Chefs de Cacomi'
            },
            legal: {
                aiWarningTermsTitle: 'Avertissement sur les Recettes IA et Vérification des Chefs',
                aiWarningTermsDesc: 'Cacomi permet aux utilisateurs de consulter et de générer des recettes de cuisine qui peuvent être entièrement ou partiellement conçues par l\'Intelligence Artificielle ou partagées par d\'autres utilisateurs. Ces recettes sont fournies "telles quelles" et peuvent contenir des erreurs critiques dans les ingrédients, les étapes ou les proportions. Nous ne garantissons pas qu\'elles soient comestibles ou sûres, leur utilisation est donc à vos propres risques.',
                chefVerificationNotice: 'Nous travaillons actuellement à l\'introduction de recettes vérifiées sur la plateforme dans les semaines à venir. Ces recettes seront examinées, testées et approuvées par nos chefs professionnels pour certifier qu\'elles sont sûres, comestibles et contiennent les étapes correctes.',
                verificationIconExplanation: 'Les recettes vérifiées seront clairement identifiées dans le visualiseur par une icône de coche bleue (vérification) dans la section supérieure, séparée du titre de la recette pour éviter toute falsification ou altération par d\'autres créateurs. Si une recette ne présente pas ce badge de vérification, elle doit être considérée comme non vérifiée et utilisée avec une extrême prudence.'
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
                clear: 'Effacer les téléchargements',
                clearing: 'Nettoyage...',
                storageDesc: 'Culina Smart gère l\'espace automatiquement.',
                account: 'Compte et Confidentialité',
                deleteAccount: 'Supprimer mon compte',
                deleteAccountDesc: 'Demander la suppression définitive de vos données.'
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
                saving: 'Enregistrement...'
            }
        }
    };

export function SettingsProvider({ children }) {
    // 'always' | 'wifi-only'
    const [imageStrategy, setImageStrategy] = useState('always');
    const [isWifi, setIsWifi] = useState(true);
    // 'light' | 'dark' | 'system'
    const [theme, setThemeState] = useState('system');
    // 'es' | 'en' | 'fr'
    const [language, setLanguageState] = useState('es');

    const t = translations[language] || translations.es;

    // Load from LocalStorage & Initialize Theme
    useEffect(() => {
        // Image Strategy
        const savedStrategy = localStorage.getItem('culina_image_strategy');
        if (savedStrategy) setImageStrategy(savedStrategy);

        // Theme Strategy
        const savedTheme = localStorage.getItem('culina_theme') || 'system';
        setThemeState(savedTheme);
        applyTheme(savedTheme);

        // Language Strategy
        const savedLang = localStorage.getItem('culina_language') || 'es';
        setLanguageState(savedLang);

        // Initial Network Check
        checkNetwork();

        // Listen for network changes
        if (navigator.connection) {
            navigator.connection.addEventListener('change', checkNetwork);
        }

        // Listen for system theme changes if mode is system
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            if (localStorage.getItem('culina_theme') === 'system') {
                applyTheme('system');
            }
        };
        mediaQuery.addEventListener('change', handleSystemChange);

        return () => {
            if (navigator.connection) {
                navigator.connection.removeEventListener('change', checkNetwork);
            }
            mediaQuery.removeEventListener('change', handleSystemChange);
        };
    }, []);

    const applyTheme = (t) => {
        const root = document.documentElement;
        const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        root.classList.remove('light', 'dark');
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.add('light');
        }
    };

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        localStorage.setItem('culina_theme', newTheme);
        applyTheme(newTheme);
    };

    const checkNetwork = () => {
        if (typeof navigator !== 'undefined' && navigator.connection) {
            // 'slow-2g', '2g', '3g', or '4g'
            // type: 'bluetooth', 'cellular', 'ethernet', 'none', 'wifi', 'wimax', 'other', 'unknown'
            const type = navigator.connection.type;
            const saveData = navigator.connection.saveData; // User system preference

            // Heuristic: If explicitly 'cellular' OR if saveData is true -> Not Wifi
            // Note: Desktop browsers often don't report 'type', so we assume Wifi (high bandwith) unless saveData is on.
            const unlikelyWifi = type === 'cellular' || saveData === true;
            setIsWifi(!unlikelyWifi);
        }
    };

    const setLanguage = (lang) => {
        setLanguageState(lang);
        localStorage.setItem('culina_language', lang);
        // Optional: Update HTML lang attribute for browser tools
        document.documentElement.lang = lang;
    };

    const setStrategy = (strategy) => {
        setImageStrategy(strategy);
        localStorage.setItem('culina_image_strategy', strategy);
    };

    // Helper to clear caches
    const clearCache = async () => {
        if ('caches' in window) {
            const keys = await caches.keys();
            // Delete all caches enabling a fresh start
            await Promise.all(keys.map(key => caches.delete(key)));
            return true;
        }
        return false;
    };

    const shouldLoadImage = () => {
        if (imageStrategy === 'always') return true;
        if (imageStrategy === 'wifi-only') return isWifi;
        return true;
    };

    return (
        <SettingsContext.Provider value={{
            imageStrategy,
            setStrategy,
            shouldLoadImage,
            clearCache,
            isWifi,
            theme,
            setTheme,
            language,
            setLanguage,
            t
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => useContext(SettingsContext);
