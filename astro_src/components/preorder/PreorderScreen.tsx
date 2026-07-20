"use client";

import React, { useState, useEffect } from 'react';
import { useSettings } from '@context/SettingsContext';
import { useAuth } from '@context/AuthContext';
import { 
    Sparkles, 
    CheckCircle2, 
    MapPin, 
    Calendar, 
    AlertCircle, 
    CreditCard, 
    Lock, 
    Truck, 
    Info, 
    ArrowRight, 
    Flame, 
    Beef,
    RefreshCw,
    X,
    Trash2,
    CalendarDays,
    Settings,
    User,
    Plus,
    Minus,
    Check,
    LockIcon,
    HelpCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { RECOMMENDED_WEEKLY_MENU } from '@/constants/recommendedMenu';
import { cn, generateUUIDv7 } from '@/lib/utils';
import { db } from '../../lib/db';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';

const stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51MockKeyForPreviewPurposes1234567890');

// Central kitchen coordinates (Monterrey Centro)
const KITCHEN_LAT = 25.6866;
const KITCHEN_LON = -100.3161;

interface ComboExtra {
    id: string;
    name: string;
    price: number;
}

interface ComboRecipe {
    id: string;
    name: string;
    mealType: string;
}

interface PreorderCombo {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    minPortion: number;
    maxPortion: number;
    recipes: ComboRecipe[];
    extras: ComboExtra[];
}

interface SelectedComboConfig {
    selected: boolean;
    portions: { [recipeMealType: string]: number };
    selectedExtras: { [extraId: string]: boolean };
}

// Map day codes to full names
const DAY_NAMES_ES: Record<string, string> = {
    lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado', dom: 'Domingo'
};

const INITIAL_COMBOS: PreorderCombo[] = [
    {
        id: 'combo_breakfast',
        name: 'Combo Desayuno & Fit (Desayuno + Colación 1)',
        description: 'Combina el desayuno recomendado del día con el primer snack energético para arrancar tu mañana al máximo.',
        basePrice: 150,
        minPortion: 0.5,
        maxPortion: 2.0,
        recipes: [
            { id: 'recipe_breakfast', name: 'Desayuno del Día', mealType: 'BREAKFAST' },
            { id: 'recipe_snack_1', name: 'Colación 1', mealType: 'SNACK_1' }
        ],
        extras: [
            { id: 'extra_sauce_1', name: 'Salsa Casera Molcajeteada', price: 15 },
            { id: 'extra_drink_1', name: 'Agua de Coco Orgánica', price: 35 }
        ]
    },
    {
        id: 'combo_lunch',
        name: 'Combo Almuerzo Completo (Almuerzo + Colación 2)',
        description: 'Tu almuerzo principal junto con una colación saludable para mantener tu energía estable durante la tarde.',
        basePrice: 180,
        minPortion: 0.5,
        maxPortion: 2.0,
        recipes: [
            { id: 'recipe_lunch', name: 'Almuerzo del Día', mealType: 'LUNCH' },
            { id: 'recipe_snack_2', name: 'Colación 2', mealType: 'SNACK_2' }
        ],
        extras: [
            { id: 'extra_sauce_2', name: 'Aderezo Chipotle Cremoso', price: 15 },
            { id: 'extra_side_1', name: 'Guarnición de Arroz integral', price: 25 }
        ]
    }
];

function PreorderScreenForm() {
    const { t, language } = useSettings();
    const { isAuthenticated, user } = useAuth();
    const stripe = useStripe();
    const elements = useElements();
    const { showToast } = useToast();

    // Admin vs Customer View Mode
    const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

    // Admin Prompts State
    const [adminModalConfig, setAdminModalConfig] = useState<{
        isOpen: boolean;
        type: 'recipe' | 'extra';
        comboId: string;
        mealType?: string;
        recipeName: string;
        extraName: string;
        extraPrice: string;
    }>({
        isOpen: false,
        type: 'recipe',
        comboId: '',
        mealType: '',
        recipeName: '',
        extraName: '',
        extraPrice: '15'
    });

    // Simulated settings (Dev panel)
    const [simulatedDayOfWeek, setSimulatedDayOfWeek] = useState<number>(3); // 3 = Wednesday (Open)
    const [simulatedLocationPreset, setSimulatedLocationPreset] = useState<string>('mty');
    const [userLat, setUserLat] = useState<number>(25.6866);
    const [userLon, setUserLon] = useState<number>(-100.3161);
    const [distance, setDistance] = useState<number>(0);
    const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
    const [isLocationValid, setIsLocationValid] = useState<boolean>(true);

    // Combos State (Dynamic Admin Config)
    const [combos, setCombos] = useState<PreorderCombo[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cacomi_preorder_combos');
            if (saved) return JSON.parse(saved);
        }
        return INITIAL_COMBOS;
    });

    // Load combos from server on mount
    useEffect(() => {
        async function loadServerCombos() {
            try {
                const res = await fetch('/api/preorder/combos');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setCombos(data);
                    }
                }
            } catch (err) {
                console.warn("Could not load combos from server, using local fallback:", err);
            }
        }
        loadServerCombos();
    }, []);

    // Save combos on edit (locally & server if Admin)
    useEffect(() => {
        localStorage.setItem('cacomi_preorder_combos', JSON.stringify(combos));

        if (user?.role === 'ADMIN') {
            const saveToServer = async () => {
                try {
                    await fetch('/api/preorder/combos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(combos)
                    });
                } catch (err) {
                    console.error("Error updating server combos:", err);
                }
            };
            saveToServer();
        }
    }, [combos, user]);

    // Customer Selection State (Structured by Day and Combo ID)
    const [orderSelection, setOrderSelection] = useState<{ [day: string]: { [comboId: string]: SelectedComboConfig } }>({});

    // AI Portion Calculator States
    const [isCalculatingAI, setIsCalculatingAI] = useState<{ [dayComboKey: string]: boolean }>({});
    const [aiExplanations, setAiExplanations] = useState<{ [dayComboKey: string]: string }>({});
    const [aiStep, setAiStep] = useState<string>('');

    // Cart calculations
    const [paymentPlan, setPaymentPlan] = useState<'half' | 'full'>('half');

    // Checkout form state
    const [cardName, setCardName] = useState<string>('');
    const [cardNumber, setCardNumber] = useState<string>('');
    const [cardExpiry, setCardExpiry] = useState<string>('');
    const [cardCvc, setCardCvc] = useState<string>('');
    const [cardZip, setCardZip] = useState<string>('');
    const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'amex' | 'unknown'>('unknown');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Navigation & Receipt
    const [activeTab, setActiveTab] = useState<string>('lun');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [ticketData, setTicketData] = useState<any>(null);

    const dayKeys = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

    // Geolocation distance formula (Haversine)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // Distance calculation
    useEffect(() => {
        const dist = calculateDistance(userLat, userLon, KITCHEN_LAT, KITCHEN_LON);
        setDistance(dist);
        setIsLocationValid(dist <= 15);
    }, [userLat, userLon]);

    // Initialize/Reset Selection Config
    useEffect(() => {
        const initialOrder: typeof orderSelection = {};
        dayKeys.forEach(day => {
            initialOrder[day] = {};
            combos.forEach(combo => {
                const portions: { [key: string]: number } = {};
                combo.recipes.forEach(r => {
                    portions[r.mealType] = 1.0; // Default portion multiplier
                });

                const selectedExtras: { [key: string]: boolean } = {};
                combo.extras.forEach(e => {
                    selectedExtras[e.id] = false;
                });

                initialOrder[day][combo.id] = {
                    selected: true, // Selected by default
                    portions,
                    selectedExtras
                };
            });
        });
        setOrderSelection(initialOrder);
    }, [combos]);

    // Handle Preset locations
    const handlePresetChange = (preset: string) => {
        setSimulatedLocationPreset(preset);
        if (preset === 'mty') {
            setUserLat(25.6866);
            setUserLon(-100.3161);
        } else if (preset === 'spgg') {
            setUserLat(25.6613);
            setUserLon(-100.4024);
        } else if (preset === 'santiago') {
            setUserLat(25.4266);
            setUserLon(-100.1506);
        }
    };

    const detectRealLocation = () => {
        if (!navigator.geolocation) {
            showToast(language === 'es' ? 'La geolocalización no es soportada.' : 'Geolocation not supported.', 'error');
            return;
        }

        setIsDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLat(position.coords.latitude);
                setUserLon(position.coords.longitude);
                setSimulatedLocationPreset('real');
                setIsDetectingLocation(false);
            },
            (error) => {
                console.error(error);
                showToast(language === 'es' ? 'No se pudo detectar tu ubicación. Intenta simular una.' : 'Could not detect location.', 'error');
                setIsDetectingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    // Helpers to lookup recipe names/nutrients dynamically from RECOMMENDED_WEEKLY_MENU
    const getMealDetails = (dayCode: string, mealType: string) => {
        const dayMeals = RECOMMENDED_WEEKLY_MENU[dayCode] || [];
        // Map SNACK_1 to the first SNACK, SNACK_2 to the second SNACK in array if necessary
        if (mealType === 'SNACK_1') {
            return dayMeals.filter(m => m.mealType === 'SNACK')[0];
        }
        if (mealType === 'SNACK_2') {
            return dayMeals.filter(m => m.mealType === 'SNACK')[1] || dayMeals.filter(m => m.mealType === 'SNACK')[0];
        }
        return dayMeals.find(m => m.mealType === mealType);
    };

    // Toggle combo selection
    const toggleCombo = (day: string, comboId: string) => {
        setOrderSelection(prev => {
            const daySelection = { ...prev[day] };
            const config = { ...daySelection[comboId] };
            config.selected = !config.selected;
            daySelection[comboId] = config;
            return { ...prev, [day]: daySelection };
        });
    };

    // Update portion multiplier
    const updatePortion = (day: string, comboId: string, mealType: string, val: number) => {
        setOrderSelection(prev => {
            const daySelection = { ...prev[day] };
            const config = { ...daySelection[comboId] };
            const portions = { ...config.portions };
            portions[mealType] = val;
            config.portions = portions;
            daySelection[comboId] = config;
            return { ...prev, [day]: daySelection };
        });
    };

    // Toggle accompaniment extra
    const toggleExtra = (day: string, comboId: string, extraId: string) => {
        setOrderSelection(prev => {
            const daySelection = { ...prev[day] };
            const config = { ...daySelection[comboId] };
            const selectedExtras = { ...config.selectedExtras };
            selectedExtras[extraId] = !selectedExtras[extraId];
            config.selectedExtras = selectedExtras;
            daySelection[comboId] = config;
            return { ...prev, [day]: daySelection };
        });
    };

    // Run AI Portion calculations (reading from Dexie userProfile)
    const runAIPortionCalculation = async (day: string, combo: PreorderCombo) => {
        const key = `${day}_${combo.id}`;
        setIsCalculatingAI(prev => ({ ...prev, [key]: true }));

        const steps = [
            'Buscando perfil metabólico de Cacomi...',
            'Calculando requerimientos diarios con Mifflin-St Jeor...',
            'Ajustando porciones según calorías y macros...',
            '¡Optimización completada por Chef IA!'
        ];

        let currentStepIdx = 0;
        setAiStep(steps[0]);

        // Load profile from Dexie database
        let localProfile: any = null;
        try {
            localProfile = await db.userProfile.get('current');
        } catch (dbErr) {
            console.warn("Dexie profile query error:", dbErr);
        }

        const interval = setInterval(async () => {
            currentStepIdx++;
            if (currentStepIdx < steps.length) {
                setAiStep(steps[currentStepIdx]);
            } else {
                clearInterval(interval);
                
                // Physical metrics calculations
                let weight = 70;
                let height = 170;
                let age = 30;
                let gender = 'MALE';
                let activity = 'SEDENTARY';
                let goal = 'MAINTENANCE';
                
                if (localProfile) {
                    weight = localProfile.currentWeightKg || 70;
                    height = localProfile.heightCm || 170;
                    gender = localProfile.gender || 'MALE';
                    activity = localProfile.activityLevel || 'SEDENTARY';
                    goal = localProfile.goalType || 'MAINTENANCE';
                    
                    if (localProfile.birthDate) {
                        const birth = new Date(localProfile.birthDate);
                        const today = new Date();
                        age = today.getFullYear() - birth.getFullYear();
                        const m = today.getMonth() - birth.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                            age--;
                        }
                    }
                }
                
                // Mifflin-St Jeor Formula
                let bmr = 10 * weight + 6.25 * height - 5 * age;
                if (gender === 'MALE') bmr += 5;
                else bmr -= 161;
                
                // TDEE activity factor
                let actFactor = 1.2;
                if (activity === 'SEDENTARY') actFactor = 1.2;
                else if (activity === 'LIGHTLY_ACTIVE' || activity === 'LIGHT') actFactor = 1.375;
                else if (activity === 'MODERATELY_ACTIVE' || activity === 'MODERATE') actFactor = 1.55;
                else if (activity === 'VERY_ACTIVE' || activity === 'HIGH') actFactor = 1.725;
                else if (activity === 'EXTREMELY_ACTIVE' || activity === 'EXTRA') actFactor = 1.9;
                
                const tdee = bmr * actFactor;
                
                // Adjust for calorie goals
                let targetCalories = tdee;
                if (goal === 'LOSE_WEIGHT' || goal === 'DEFICIT') targetCalories -= 500;
                else if (goal === 'GAIN_WEIGHT' || goal === 'SURPLUS') targetCalories += 400;
                
                targetCalories = Math.max(1200, Math.round(targetCalories));
                
                const calculatedPortions: { [key: string]: number } = {};
                let explanation = '';
                
                if (localProfile) {
                    explanation = `Chef IA (Mifflin-St Jeor): Detectado perfil de ${gender === 'MALE' ? 'Hombre' : 'Mujer'} de ${age} años (${weight} kg, ${height} cm). Tu requerimiento diario estimado es de ${Math.round(tdee)} kcal, ajustado a ${Math.round(targetCalories)} kcal/día para ${goal === 'LOSE_WEIGHT' || goal === 'DEFICIT' ? 'pérdida de peso' : goal === 'GAIN_WEIGHT' || goal === 'SURPLUS' ? 'ganancia muscular' : 'mantenimiento'}.`;
                } else {
                    explanation = `Chef IA (Genérico): No se halló perfil físico en Dexie. Usando promedio (70 kg, Mantenimiento) para calcular. Meta diaria: ~2000 kcal.`;
                }

                setOrderSelection(prev => {
                    const daySelection = { ...prev[day] };
                    const config = { ...daySelection[combo.id] };
                    const portions = { ...config.portions };
                    
                    combo.recipes.forEach((r) => {
                         const mealData = getMealDetails(day, r.mealType);
                         const baseCal = mealData?.calories || 450;
                         
                         // Calories allocation per meal type:
                         // Breakfast = 30%, Snack 1 = 10%, Lunch = 35%, Snack 2 = 10%
                         let mealWeight = 0.30;
                         if (r.mealType === 'BREAKFAST') mealWeight = 0.30;
                         else if (r.mealType === 'SNACK_1' || r.mealType === 'SNACK_2') mealWeight = 0.10;
                         else if (r.mealType === 'LUNCH') mealWeight = 0.35;
                         
                         const targetMealCal = targetCalories * mealWeight;
                         let multiplier = targetMealCal / baseCal;
                         
                         // Clamp and round portions to 0.05 step
                         multiplier = Math.max(combo.minPortion, Math.min(combo.maxPortion, multiplier));
                         multiplier = Math.round(multiplier * 20) / 20;
                         
                         portions[r.mealType] = multiplier;
                         calculatedPortions[r.mealType] = multiplier;
                    });

                    config.portions = portions;
                    daySelection[combo.id] = config;
                    return { ...prev, [day]: daySelection };
                });

                const portionsDetail = Object.entries(calculatedPortions)
                    .map(([mType, mult]) => `${mType === 'BREAKFAST' ? 'Desayuno' : mType === 'LUNCH' ? 'Almuerzo' : 'Colación'}: x${mult.toFixed(2)}`)
                    .join(', ');

                setAiExplanations(prev => ({
                    ...prev,
                    [key]: `${explanation} Porciones sugeridas óptimas: ${portionsDetail}.`
                }));
                setIsCalculatingAI(prev => ({ ...prev, [key]: false }));
            }
        }, 800);
    };

    // Calculate financials
    const getCartTotals = () => {
        let total = 0;
        let selectedCount = 0;

        dayKeys.forEach(day => {
            const dayOrder = orderSelection[day] || {};
            combos.forEach(combo => {
                const config = dayOrder[combo.id];
                if (config && config.selected) {
                    selectedCount++;
                    // base price
                    let comboTotal = combo.basePrice;

                    // portion multiplier modifications (portion scales cost proportionally)
                    combo.recipes.forEach(r => {
                        const mult = config.portions[r.mealType] || 1.0;
                        // portion factor adjustment: base price splits between recipes, say 70% main, 30% snack
                        const recipeWeight = r.mealType === 'BREAKFAST' || r.mealType === 'LUNCH' ? 0.7 : 0.3;
                        const baseRecipePrice = combo.basePrice * recipeWeight;
                        const modifiedRecipePrice = baseRecipePrice * mult;
                        comboTotal += (modifiedRecipePrice - baseRecipePrice);
                    });

                    // optional extras cost
                    combo.extras.forEach(e => {
                        if (config.selectedExtras[e.id]) {
                            comboTotal += e.price;
                        }
                    });

                    total += comboTotal;
                }
            });
        });

        const deposit = paymentPlan === 'half' ? total * 0.5 : total;
        const remaining = total - deposit;

        return {
            selectedCount,
            subtotal: Math.round(total),
            deposit: Math.round(deposit),
            remaining: Math.round(remaining)
        };
    };

    const cart = getCartTotals();

    // Check pre-order window (Wed=3, Thu=4, Fri=5, Sat=6)
    const isPreorderOpen = simulatedDayOfWeek >= 3 && simulatedDayOfWeek <= 6;

    // Card handling
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (val.length > 16) val = val.substring(0, 16);

        let formatted = '';
        for (let i = 0; i < val.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += ' ';
            formatted += val[i];
        }
        setCardNumber(formatted);

        if (val.startsWith('4')) setCardBrand('visa');
        else if (/^(51|52|53|54|55)/.test(val)) setCardBrand('mastercard');
        else if (/^(34|37)/.test(val)) setCardBrand('amex');
        else setCardBrand('unknown');
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (val.length > 4) val = val.substring(0, 4);

        let formatted = val;
        if (val.length > 2) {
            formatted = val.substring(0, 2) + '/' + val.substring(2);
        }
        setCardExpiry(formatted);
    };

    const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/gi, '');
        if (val.length > 4) val = val.substring(0, 4);
        setCardCvc(val);
    };

    // Checkout Flow
    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors: Record<string, string> = {};
        if (!cardName.trim()) errors.cardName = language === 'es' ? 'Nombre requerido' : 'Name required';
        if (!stripe && !cardNumber.trim()) {
            if (cardNumber.replace(/\s/g, '').length < 15) errors.cardNumber = language === 'es' ? 'Número inválido' : 'Invalid number';
            if (cardExpiry.length < 5) errors.cardExpiry = language === 'es' ? 'MM/YY inválido' : 'Invalid MM/YY';
            if (cardCvc.length < 3) errors.cardCvc = language === 'es' ? 'CVC inválido' : 'Invalid CVC';
        }
        if (!cardZip.trim()) errors.cardZip = language === 'es' ? 'CP requerido' : 'ZIP required';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setIsProcessing(true);

        const checkoutData: any[] = [];
        dayKeys.forEach(day => {
            const dayOrder = orderSelection[day] || {};
            combos.forEach(combo => {
                const config = dayOrder[combo.id];
                if (config && config.selected) {
                    checkoutData.push({
                        day,
                        comboId: combo.id,
                        comboName: combo.name,
                        portions: config.portions,
                        extras: Object.keys(config.selectedExtras).filter(k => config.selectedExtras[k])
                    });
                }
            });
        });

        try {
            const response = await fetch('/api/preorder/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meals: checkoutData,
                    userCoordinates: { lat: userLat, lon: userLon },
                    paymentPlan,
                    totalCost: cart.subtotal,
                    amountPaid: cart.deposit,
                    remaining: cart.remaining,
                    simulatedDay: simulatedDayOfWeek,
                    userId: user?.id
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Stripe payment confirmation if clientSecret and Stripe SDK are ready
                if (data.clientSecret && stripe && elements) {
                    const cardElement = elements.getElement(CardElement);
                    if (cardElement) {
                        const stripeResult = await stripe.confirmCardPayment(data.clientSecret, {
                            payment_method: {
                                card: cardElement,
                                billing_details: {
                                    name: cardName,
                                    address: {
                                        postal_code: cardZip
                                    }
                                }
                            }
                        });

                        if (stripeResult.error) {
                            showToast(stripeResult.error.message || 'Error al procesar pago en Stripe.', 'error');
                            setIsProcessing(false);
                            return;
                        }
                    }
                }

                // Save preorder ticket locally to Dexie
                const orderId = data.orderId || generateUUIDv7().slice(0, 8).toUpperCase();
                const preorderItem = {
                    id: orderId,
                    orderNumber: orderId,
                    date: new Date().toISOString(),
                    meals: checkoutData,
                    amountPaid: cart.deposit,
                    remaining: cart.remaining,
                    status: 'CONFIRMED',
                    paymentPlan,
                    deliveryDateRange: language === 'es' ? 'Próxima Semana (Lunes a Domingo)' : 'Next Week (Mon to Sun)',
                    userEmail: user?.email || ''
                };
                await db.preorders.add(preorderItem as any);

                setTicketData({
                    orderNumber: orderId,
                    totalPaid: cart.deposit,
                    remaining: cart.remaining,
                    itemsCount: cart.selectedCount,
                    deliveryDateRange: preorderItem.deliveryDateRange
                });
                setIsSuccess(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                showToast(data.message || 'Error procesando preventa.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast(language === 'es' ? 'Error de red.' : 'Network error.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // Admin state modifiers
    const updateComboField = (comboId: string, field: keyof PreorderCombo, value: any) => {
        setCombos(prev => prev.map(c => c.id === comboId ? { ...c, [field]: value } : c));
    };

    const addRecipeToCombo = (comboId: string, mealType: string) => {
        setAdminModalConfig({
            isOpen: true,
            type: 'recipe',
            comboId,
            mealType,
            recipeName: '',
            extraName: '',
            extraPrice: '15'
        });
    };

    const removeRecipeFromCombo = (comboId: string, mealType: string) => {
        setCombos(prev => prev.map(c => {
            if (c.id !== comboId) return c;
            return {
                ...c,
                recipes: c.recipes.filter(r => r.mealType !== mealType)
            };
        }));
    };

    const addExtraToCombo = (comboId: string) => {
        setAdminModalConfig({
            isOpen: true,
            type: 'extra',
            comboId,
            mealType: '',
            recipeName: '',
            extraName: '',
            extraPrice: '15'
        });
    };

    const removeExtraFromCombo = (comboId: string, extraId: string) => {
        setCombos(prev => prev.map(c => {
            if (c.id !== comboId) return c;
            return {
                ...c,
                extras: c.extras.filter(e => e.id !== extraId)
            };
        }));
    };

    const handleAdminModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { type, comboId, mealType, recipeName, extraName, extraPrice } = adminModalConfig;

        if (type === 'recipe') {
            if (!recipeName.trim()) {
                showToast(language === 'es' ? 'El nombre es requerido.' : 'Name is required.', 'error');
                return;
            }

            let wasAdded = false;
            setCombos(prev => prev.map(c => {
                if (c.id !== comboId) return c;
                if (c.recipes.some(r => r.mealType === mealType)) {
                    showToast(language === 'es' ? 'Ya existe una receta de este tipo en el combo.' : 'Meal type already exists.', 'error');
                    return c;
                }
                wasAdded = true;
                return {
                    ...c,
                    recipes: [...c.recipes, { id: generateUUIDv7(), name: recipeName.trim(), mealType: mealType || 'BREAKFAST' }]
                };
            }));

            if (wasAdded) {
                showToast(language === 'es' ? 'Receta agregada exitosamente.' : 'Recipe added successfully.', 'success');
            }
        } else {
            if (!extraName.trim()) {
                showToast(language === 'es' ? 'El nombre es requerido.' : 'Name is required.', 'error');
                return;
            }

            const price = parseInt(extraPrice) || 0;
            setCombos(prev => prev.map(c => {
                if (c.id !== comboId) return c;
                return {
                    ...c,
                    extras: [...c.extras, { id: 'extra_' + Math.random().toString(36).substring(2, 6), name: extraName.trim(), price }]
                };
            }));

            showToast(language === 'es' ? 'Acompañamiento agregado exitosamente.' : 'Accompaniment added successfully.', 'success');
        }

        setAdminModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    if (isSuccess && ticketData) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 animate-in zoom-in-95 duration-500">
                <div className="bg-white dark:bg-gray-900 border border-primary/10 rounded-[32px] p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                    
                    <div className="mx-auto w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-8 shadow-xl shadow-primary/30">
                        <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4 text-foreground">
                        {t.preorder?.successTitle || '¡Pedido Confirmado!'}
                    </h2>
                    
                    <p className="text-muted-foreground text-sm sm:text-base font-medium mb-10 leading-relaxed max-w-md mx-auto">
                        {t.preorder?.successMessage || 'Tu pago ha sido procesado de forma segura a través de Stripe. Hemos registrado tu preventa para la próxima semana.'}
                    </p>

                    <div className="bg-muted/30 border border-border/60 rounded-2xl p-6 text-left mb-10 max-w-sm mx-auto shadow-inner relative">
                        <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-950 border-r border-border/50" />
                        <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-950 border-l border-border/50" />

                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-3 mb-4 flex items-center justify-between">
                            <span>{t.preorder?.ticketDetails || 'Detalles del Ticket'}</span>
                            <span className="text-primary font-black">Cacomi Chef</span>
                        </h4>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between font-medium">
                                <span className="text-muted-foreground">{t.preorder?.ticketOrderNumber || 'Número de Orden'}:</span>
                                <span className="font-bold text-foreground tracking-widest">#{ticketData.orderNumber}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                                <span className="text-muted-foreground">{language === 'es' ? 'Combos Pedidos' : 'Combos Ordered'}:</span>
                                <span className="font-bold text-foreground">{ticketData.itemsCount} combos semanales</span>
                            </div>
                            <div className="flex justify-between font-medium border-t border-border/30 pt-3">
                                <span className="text-muted-foreground">{t.preorder?.ticketTotalPaid || 'Monto Pagado Hoy'}:</span>
                                <span className="font-bold text-primary">${ticketData.totalPaid} MXN</span>
                            </div>
                            <div className="flex justify-between font-medium">
                                <span className="text-muted-foreground">{t.preorder?.ticketRemaining || 'Pendiente al Recibir'}:</span>
                                <span className="font-bold text-amber-500">${ticketData.remaining} MXN</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => window.location.href = '/'}
                        className="w-full py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {t.preorder?.backToHome || 'Volver al Inicio'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
            
            {/* Developer Test Simulator Panel */}
            <div className="mb-8 p-6 bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-800 pb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Settings className="w-4 h-4 text-primary" />
                            {t.preorder?.developerControls || 'Consola de Desarrollo (Simulación)'}
                        </h3>

                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => setIsAdminMode(!isAdminMode)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    isAdminMode ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                )}
                            >
                                {isAdminMode ? '🔧 Modo Administrador' : '👤 Modo Cliente (Vista Previa)'}
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Day of Week Sim */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                {t.preorder?.simulatedDay || 'Día de la semana a simular'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSimulatedDayOfWeek(1)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                        simulatedDayOfWeek === 1 ? "bg-red-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    )}
                                >
                                    {language === 'es' ? 'Lunes (Cerrado)' : 'Monday (Closed)'}
                                </button>
                                <button
                                    onClick={() => setSimulatedDayOfWeek(3)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                        simulatedDayOfWeek === 3 ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    )}
                                >
                                    {language === 'es' ? 'Miércoles (Abierto)' : 'Wednesday (Open)'}
                                </button>
                                <button
                                    onClick={() => setSimulatedDayOfWeek(6)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                        simulatedDayOfWeek === 6 ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    )}
                                >
                                    {language === 'es' ? 'Sábado (Abierto)' : 'Saturday (Open)'}
                                </button>
                            </div>
                        </div>

                        {/* Location Sim */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                {t.preorder?.simulatedLocationTitle || 'Dirección de Entrega'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handlePresetChange('mty')}
                                    className={cn(
                                        "px-3 py-2 rounded-xl text-xs font-bold transition-all",
                                        simulatedLocationPreset === 'mty' ? "bg-primary text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    )}
                                >
                                    Monterrey Centro
                                </button>
                                <button
                                    onClick={() => handlePresetChange('spgg')}
                                    className={cn(
                                        "px-3 py-2 rounded-xl text-xs font-bold transition-all",
                                        simulatedLocationPreset === 'spgg' ? "bg-primary text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    )}
                                >
                                    San Pedro
                                </button>
                                <button
                                    onClick={() => handlePresetChange('santiago')}
                                    className={cn(
                                        "px-3 py-2 rounded-xl text-xs font-bold transition-all",
                                        simulatedLocationPreset === 'santiago' ? "bg-red-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    )}
                                >
                                    Santiago, NL
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Title / Intro */}
            <div className="text-center md:text-left mb-12">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                    {t.preorder?.title || 'Combos de Comida Preparada'}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base font-medium max-w-2xl leading-relaxed">
                    {language === 'es' 
                        ? 'Empaquetamos y porcionamos nuestras recetas recomendadas de la semana para que no tengas que cocinar.'
                        : 'We package and portion our weekly recommended recipes so you don\'t have to cook.'}
                </p>
            </div>

            {/* Main Screen Layout */}
            {isAdminMode ? (
                /* Admin Dashboard View */
                <div className="bg-white dark:bg-gray-900 border-2 border-dashed border-amber-500 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-8 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                        <div>
                            <h2 className="text-2xl font-black text-amber-500 uppercase tracking-tight">Panel Administrador Preorders</h2>
                            <p className="text-xs text-muted-foreground">Configura los paquetes, porciones y extras de comida preparada.</p>
                        </div>
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-md border border-amber-500/20">
                            ADMIN CONFIG
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {combos.map((combo) => (
                            <div key={combo.id} className="p-6 bg-muted/20 border border-border rounded-3xl space-y-4">
                                <div>
                                    <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Nombre del Combo</label>
                                    <input 
                                        type="text" 
                                        value={combo.name} 
                                        onChange={(e) => updateComboField(combo.id, 'name', e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Descripción</label>
                                    <textarea 
                                        value={combo.description} 
                                        onChange={(e) => updateComboField(combo.id, 'description', e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none resize-none"
                                        rows={2}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Precio Base (MXN)</label>
                                        <input 
                                            type="number" 
                                            value={combo.basePrice} 
                                            onChange={(e) => updateComboField(combo.id, 'basePrice', parseInt(e.target.value) || 0)}
                                            className="w-full bg-white dark:bg-gray-800 border border-border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Porción Mínima</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            value={combo.minPortion} 
                                            onChange={(e) => updateComboField(combo.id, 'minPortion', parseFloat(e.target.value) || 0.1)}
                                            className="w-full bg-white dark:bg-gray-800 border border-border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Porción Máxima</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            value={combo.maxPortion} 
                                            onChange={(e) => updateComboField(combo.id, 'maxPortion', parseFloat(e.target.value) || 2.0)}
                                            className="w-full bg-white dark:bg-gray-800 border border-border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Recipes in Combo */}
                                <div className="space-y-2 border-t border-border pt-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Recetas Incluidas</h4>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => addRecipeToCombo(combo.id, 'BREAKFAST')}
                                                className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[8px] font-black rounded"
                                            >
                                                + Desayuno
                                            </button>
                                            <button
                                                onClick={() => addRecipeToCombo(combo.id, 'LUNCH')}
                                                className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[8px] font-black rounded"
                                            >
                                                + Almuerzo
                                            </button>
                                            <button
                                                onClick={() => addRecipeToCombo(combo.id, 'SNACK_1')}
                                                className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[8px] font-black rounded"
                                            >
                                                + Snack 1
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        {combo.recipes.map((recipe) => (
                                            <div key={recipe.mealType} className="flex justify-between items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-xl text-xs border border-border">
                                                <div className="min-w-0">
                                                    <span className="font-bold text-foreground block truncate">{recipe.name}</span>
                                                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{recipe.mealType}</span>
                                                </div>
                                                <button
                                                    onClick={() => removeRecipeFromCombo(combo.id, recipe.mealType)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Extras in Combo */}
                                <div className="space-y-2 border-t border-border pt-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Acompañamientos Opcionales</h4>
                                        <button
                                            onClick={() => addExtraToCombo(combo.id)}
                                            className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-[8px] font-black rounded"
                                        >
                                            + Acompañamiento
                                        </button>
                                    </div>

                                    <div className="space-y-1.5">
                                        {combo.extras.map((extra) => (
                                            <div key={extra.id} className="flex justify-between items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-xl text-xs border border-border">
                                                <span>{extra.name} (<span className="text-primary font-bold">+${extra.price}</span>)</span>
                                                <button
                                                    onClick={() => removeExtraFromCombo(combo.id, extra.id)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Customer View */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left Column: Config / coverage / selector */}
                    <div className="lg:col-span-2 space-y-8 animate-in fade-in duration-300">
                        
                        {/* Period Status Card */}
                        <div className={cn(
                            "p-6 rounded-[2.5rem] border transition-all shadow-xl shadow-primary/5 flex items-start gap-4 relative overflow-hidden",
                            isPreorderOpen 
                                ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20" 
                                : "bg-red-500/5 dark:bg-red-500/10 border-red-500/20"
                        )}>
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md",
                                isPreorderOpen ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                            )}>
                                {isPreorderOpen ? <CalendarDays className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-lg tracking-tight mb-1">
                                    {isPreorderOpen 
                                        ? (t.preorder?.statusOpen || 'Preventa Abierta') 
                                        : (t.preorder?.statusClosed || 'Preventa Cerrada')}
                                </h3>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                    {isPreorderOpen 
                                        ? 'Los pedidos están abiertos para la próxima semana. Tienes hasta el sábado a las 11:59 PM para ordenar.'
                                        : 'Los pedidos de comida preparada se abren de miércoles a sábado para entregarse la siguiente semana.'}
                                </p>
                            </div>
                        </div>

                        {/* Geolocation Coverage Check */}
                        <div className="bg-white dark:bg-gray-900 border border-primary/10 rounded-[32px] p-6 sm:p-8 shadow-2xl relative">
                            <h3 className="font-black text-xl tracking-tight mb-4 flex items-center gap-2 text-foreground">
                                <MapPin className="w-5 h-5 text-primary" />
                                Verificación de Cobertura
                            </h3>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                                <button
                                    onClick={detectRealLocation}
                                    disabled={isDetectingLocation}
                                    className="w-full sm:w-auto px-6 py-4 bg-muted hover:bg-muted/80 text-foreground font-black text-[9px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shrink-0"
                                >
                                    {isDetectingLocation ? (
                                        <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                                    ) : (
                                        <MapPin className="w-4 h-4 text-primary" />
                                    )}
                                    Detectar mi Ubicación
                                </button>

                                <div className="text-xs space-y-1 text-center sm:text-left">
                                    <p className="text-muted-foreground font-medium">
                                        Coordenadas del usuario: <span className="font-bold text-foreground">{userLat.toFixed(4)}, {userLon.toFixed(4)}</span>
                                    </p>
                                    <p className="text-muted-foreground font-medium">
                                        Distancia a la cocina central: <span className="font-bold text-foreground">{distance.toFixed(1)} km</span>
                                    </p>
                                </div>
                            </div>

                            <div className={cn(
                                "p-4 rounded-2xl border flex items-center gap-3",
                                isLocationValid 
                                    ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                                    : "bg-red-500/5 dark:bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                            )}>
                                {isLocationValid ? (
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                )}
                                <p className="text-xs font-black uppercase tracking-wider">
                                    {isLocationValid 
                                        ? 'Dentro del área de cobertura (cobertura válida)' 
                                        : 'Fuera del área de cobertura (máx. 15 km)'}
                                </p>
                            </div>
                        </div>

                        {/* Combos Selection Area */}
                        <div className="bg-white dark:bg-gray-900 border border-primary/10 rounded-[32px] p-6 sm:p-8 shadow-2xl relative">
                            
                            {/* Tabs for days */}
                            <div className="flex flex-wrap gap-1 bg-muted/30 p-1.5 rounded-2xl border border-border/30 mb-8">
                                {dayKeys.map((day) => {
                                    const dayOrder = orderSelection[day] || {};
                                    const selectedCount = combos.filter(c => dayOrder[c.id]?.selected).length;
                                    const isActive = activeTab === day;

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setActiveTab(day)}
                                            className={cn(
                                                "flex-1 min-w-[65px] py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all relative",
                                                isActive
                                                    ? "bg-primary text-white shadow-md"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            {t.planner?.days?.[day as keyof typeof t.planner.days] || day.toUpperCase()}
                                            {selectedCount > 0 && (
                                                <span className={cn(
                                                    "absolute -top-1.5 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black border",
                                                    isActive ? "bg-amber-500 text-white border-primary" : "bg-primary text-white border-background"
                                                )}>
                                                    {selectedCount}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="border-b border-border pb-6 mb-6">
                                <h3 className="font-black text-xl tracking-tight text-foreground">
                                    Combos del Día {DAY_NAMES_ES[activeTab] || activeTab.toUpperCase()}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                    Selecciona los combos que deseas recibir para este día. Las recetas incluidas cambiarán automáticamente según el menú recomendado oficial del día de entrega.
                                </p>
                            </div>

                            <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 mb-6">
                                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold leading-relaxed">
                                    Nota: Los alimentos se cocinarán y entregarán estrictamente en la fecha del combo. Ej: El combo de lunes se entrega en la dirección especificada el día lunes por la mañana.
                                </p>
                            </div>

                            {/* Combos list for active day */}
                            <div className="space-y-8">
                                {combos.map((combo) => {
                                    const key = `${activeTab}_${combo.id}`;
                                    const dayConfig = orderSelection[activeTab]?.[combo.id] || { selected: false, portions: {}, selectedExtras: {} };
                                    const isComboSelected = dayConfig.selected;
                                    const isCalculating = isCalculatingAI[key];
                                    const aiExplanation = aiExplanations[key];

                                    return (
                                        <div 
                                            key={combo.id}
                                            className={cn(
                                                "p-6 rounded-[2rem] border transition-all relative overflow-hidden",
                                                isComboSelected 
                                                    ? "bg-white dark:bg-gray-800/40 border-primary/40 shadow-xl" 
                                                    : "bg-muted/10 border-border/60 opacity-60"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-4 mb-4">
                                                <div className="flex items-start gap-3">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isComboSelected}
                                                        onChange={() => toggleCombo(activeTab, combo.id)}
                                                        className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary/20 shrink-0 mt-1 cursor-pointer"
                                                    />
                                                    <div>
                                                        <h4 className="font-black text-base text-foreground leading-tight">{combo.name}</h4>
                                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{combo.description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-xs text-muted-foreground uppercase font-black tracking-widest block">Base</span>
                                                    <span className="text-xl font-black text-primary">${combo.basePrice} MXN</span>
                                                </div>
                                            </div>

                                            {/* Combo contents details */}
                                            {isComboSelected && (
                                                <div className="space-y-6">
                                                    <div className="space-y-3">
                                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex justify-between items-center">
                                                            <span>Platillos Incluidos & Porciones</span>
                                                            {!isAuthenticated && (
                                                                <span className="text-amber-500 flex items-center gap-1">
                                                                    <LockIcon className="w-3 h-3" /> Regístrate para ajustar porciones
                                                                </span>
                                                            )}
                                                        </h5>

                                                        <div className="space-y-4 bg-muted/20 border border-border/50 rounded-2xl p-4">
                                                            {combo.recipes.map((recipe) => {
                                                                const mealData = getMealDetails(activeTab, recipe.mealType);
                                                                const currentPortion = dayConfig.portions[recipe.mealType] || 1.0;
                                                                
                                                                return (
                                                                    <div key={recipe.mealType} className="space-y-3 border-b border-border/30 pb-3 last:border-b-0 last:pb-0">
                                                                        <div className="flex items-center gap-3">
                                                                            <img 
                                                                                src={mealData?.imageUrl || 'https://placehold.co/120?text=Plato'} 
                                                                                alt={recipe.name} 
                                                                                className="w-10 h-10 rounded-xl object-cover border shadow-xs shrink-0"
                                                                            />
                                                                            <div className="min-w-0 flex-1">
                                                                                <h6 className="text-xs font-bold text-foreground truncate">
                                                                                    {mealData?.recipeName || recipe.name}
                                                                                </h6>
                                                                                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider block">
                                                                                    {recipe.mealType === 'BREAKFAST' ? 'Desayuno' : 
                                                                                     recipe.mealType === 'LUNCH' ? 'Almuerzo' : 'Colación'}
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20 shrink-0">
                                                                                x{currentPortion.toFixed(2)} porción
                                                                            </span>
                                                                        </div>

                                                                        {/* Portion adjustment slider (unlocked if authenticated) */}
                                                                        <div className="px-1 pt-1 flex items-center gap-4">
                                                                            <span className="text-[9px] font-bold text-muted-foreground">{combo.minPortion}x</span>
                                                                            <input 
                                                                                type="range"
                                                                                min={combo.minPortion}
                                                                                max={combo.maxPortion}
                                                                                step="0.05"
                                                                                value={currentPortion}
                                                                                disabled={!isAuthenticated}
                                                                                onChange={(e) => updatePortion(activeTab, combo.id, recipe.mealType, parseFloat(e.target.value))}
                                                                                className={cn(
                                                                                    "flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-primary",
                                                                                    !isAuthenticated && "opacity-40 cursor-not-allowed"
                                                                                )}
                                                                            />
                                                                            <span className="text-[9px] font-bold text-muted-foreground">{combo.maxPortion}x</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Portion AI Button */}
                                                    {isComboSelected && isAuthenticated && (
                                                        <div className="space-y-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => runAIPortionCalculation(activeTab, combo)}
                                                                disabled={isCalculating}
                                                                className={cn(
                                                                    "w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all",
                                                                    isCalculating && "opacity-50 cursor-not-allowed"
                                                                )}
                                                            >
                                                                {isCalculating ? (
                                                                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                                                ) : (
                                                                    <Sparkles className="w-4 h-4 text-white" />
                                                                )}
                                                                {isCalculating ? aiStep : 'Calcular Porción con Chef IA'}
                                                            </button>

                                                            {aiExplanation && (
                                                                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs text-primary font-medium leading-relaxed flex gap-2">
                                                                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                                                                    <p>{aiExplanation}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Accompaniment Extras Selection */}
                                                    {combo.extras.length > 0 && (
                                                        <div className="space-y-3">
                                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acompañamientos & Extras</h5>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {combo.extras.map((extra) => {
                                                                    const isExtraSelected = !!dayConfig.selectedExtras[extra.id];
                                                                    return (
                                                                        <div 
                                                                            key={extra.id}
                                                                            onClick={() => toggleExtra(activeTab, combo.id, extra.id)}
                                                                            className={cn(
                                                                                "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs font-bold",
                                                                                isExtraSelected 
                                                                                    ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" 
                                                                                    : "bg-white dark:bg-gray-800/40 border-border hover:border-emerald-500/20"
                                                                            )}
                                                                        >
                                                                            <span className="truncate">{extra.name}</span>
                                                                            <span className="shrink-0 font-black font-mono">+${extra.price}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>

                    {/* Right Column: Checkout Summary & Payment Form */}
                    <div className="space-y-8 animate-in fade-in duration-300">
                        
                        {/* Cost breakdown */}
                        <div className="bg-white dark:bg-gray-900 border border-primary/10 rounded-[32px] p-6 sm:p-8 shadow-2xl relative">
                            <h3 className="font-black text-xl tracking-tight mb-4 flex items-center gap-2 text-foreground">
                                <Info className="w-5 h-5 text-primary" />
                                Plan de Pago
                            </h3>

                            {/* Payment choice buttons */}
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setPaymentPlan('half')}
                                    className={cn(
                                        "p-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all",
                                        paymentPlan === 'half' 
                                            ? "bg-primary/10 border-primary text-primary" 
                                            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    Anticipo 50%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentPlan('full')}
                                    className={cn(
                                        "p-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all",
                                        paymentPlan === 'full' 
                                            ? "bg-primary/10 border-primary text-primary" 
                                            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    Pagar 100%
                                </button>
                            </div>

                            {/* Financial figures */}
                            <div className="space-y-3 text-xs border-b border-border/50 pb-5 mb-5 font-medium">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Combos a pedir (semana):</span>
                                    <span className="text-foreground font-bold">{cart.selectedCount}</span>
                                </div>
                                <div className="flex justify-between border-t border-border/30 pt-3">
                                    <span className="text-muted-foreground">Monto total (con porciones/extras):</span>
                                    <span className="text-foreground font-black">${cart.subtotal} MXN</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase text-foreground">
                                    Monto a pagar hoy
                                </span>
                                <span className="text-2xl font-black text-primary animate-pulse">
                                    ${cart.deposit} MXN
                                </span>
                            </div>
                        </div>

                        {/* Stripe card form */}
                        <div className="bg-white dark:bg-gray-900 border border-primary/10 rounded-[32px] p-6 sm:p-8 shadow-2xl relative">
                            <h3 className="font-black text-xl tracking-tight mb-4 flex items-center gap-2 text-foreground">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Detalles de la Tarjeta
                            </h3>

                            <form onSubmit={handleCheckout} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                        Nombre en la tarjeta
                                    </label>
                                    <input
                                        type="text"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        placeholder="Javier Hernández"
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                                    />
                                    {formErrors.cardName && <p className="text-[9px] font-black text-red-500 uppercase">{formErrors.cardName}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                        Información de la tarjeta (Stripe)
                                    </label>
                                    <div className="w-full px-4 py-3.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-xs focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                        <CardElement options={{
                                            style: {
                                                base: {
                                                    fontSize: '13px',
                                                    color: '#0f172a',
                                                    '::placeholder': {
                                                        color: '#94a3b8',
                                                    },
                                                    fontFamily: 'Outfit, Inter, sans-serif'
                                                },
                                                invalid: {
                                                    color: '#ef4444',
                                                },
                                            },
                                        }} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                        Código Postal
                                    </label>
                                    <input
                                        type="text"
                                        value={cardZip}
                                        onChange={(e) => setCardZip(e.target.value)}
                                        placeholder="64000"
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none font-mono"
                                    />
                                    {formErrors.cardZip && <p className="text-[9px] font-black text-red-500 uppercase">{formErrors.cardZip}</p>}
                                </div>

                                <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-medium pt-2">
                                    <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span>Conexión SSL encriptada de 256 bits segura.</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing || !isLocationValid || !isPreorderOpen || cart.selectedCount === 0}
                                    className={cn(
                                        "w-full mt-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3",
                                        (isProcessing || !isLocationValid || !isPreorderOpen || cart.selectedCount === 0)
                                            ? "bg-slate-300 dark:bg-slate-800 text-muted-foreground cursor-not-allowed shadow-none"
                                            : "bg-primary text-white hover:scale-[1.02] active:scale-95 hover:shadow-primary/30"
                                    )}
                                >
                                    {isProcessing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            {t.preorder?.processing || 'Procesando...'}
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            {t.preorder?.payButton || 'Pagar'} (${cart.deposit} MXN)
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                    </div>

                </div>
            )}

            {/* Admin Modification Prompt Modal */}
            <Modal 
                isOpen={adminModalConfig.isOpen} 
                onClose={() => setAdminModalConfig(prev => ({ ...prev, isOpen: false }))} 
                title={adminModalConfig.type === 'recipe' 
                    ? (language === 'es' ? 'Agregar Platillo' : 'Add Meal') 
                    : (language === 'es' ? 'Agregar Acompañamiento' : 'Add Side/Accompaniment')}
            >
                <form onSubmit={handleAdminModalSubmit} className="space-y-4">
                    {adminModalConfig.type === 'recipe' ? (
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                {language === 'es' ? 'Nombre del Platillo' : 'Meal Name'}
                            </label>
                            <input
                                type="text"
                                value={adminModalConfig.recipeName}
                                onChange={(e) => setAdminModalConfig(prev => ({ ...prev, recipeName: e.target.value }))}
                                placeholder={language === 'es' ? 'Ej: Enchiladas Verdes con Huevo' : 'e.g. Green Enchiladas with Egg'}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none font-bold text-foreground"
                                autoFocus
                            />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                    {language === 'es' ? 'Nombre del Acompañamiento' : 'Accompaniment Name'}
                                </label>
                                <input
                                    type="text"
                                    value={adminModalConfig.extraName}
                                    onChange={(e) => setAdminModalConfig(prev => ({ ...prev, extraName: e.target.value }))}
                                    placeholder={language === 'es' ? 'Ej: Salsa Casera Molcajeteada' : 'e.g. Handmade Spicy Sauce'}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none font-bold text-foreground"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                    {language === 'es' ? 'Precio Extra (MXN)' : 'Extra Price (MXN)'}
                                </label>
                                <input
                                    type="number"
                                    value={adminModalConfig.extraPrice}
                                    onChange={(e) => setAdminModalConfig(prev => ({ ...prev, extraPrice: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none font-bold text-foreground"
                                />
                            </div>
                        </>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setAdminModalConfig(prev => ({ ...prev, isOpen: false }))}
                            className="flex-1 py-3 border border-border hover:bg-muted text-foreground text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                            {language === 'es' ? 'Cancelar' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-primary hover:bg-primary/95 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-primary/20"
                        >
                            {language === 'es' ? 'Guardar' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>

        </div>
    );
}

export function PreorderScreen() {
    return (
        <Elements stripe={stripePromise}>
            <PreorderScreenForm />
        </Elements>
    );
}
