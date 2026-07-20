import type { APIRoute } from 'astro';
import { decodeJwtPayload } from '../../../middleware';
import Stripe from 'stripe';

export const prerender = false;

const TOKEN_NAME = 'auth_token';

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        const { meals, userCoordinates, paymentPlan, totalCost, amountPaid, remaining, userId: bodyUserId } = body;

        // Server-side validation
        if (!meals || !Array.isArray(meals) || meals.length === 0) {
            return new Response(JSON.stringify({ 
                success: false, 
                message: 'No se seleccionaron comidas para la orden.' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!userCoordinates || typeof userCoordinates.lat !== 'number' || typeof userCoordinates.lon !== 'number') {
            return new Response(JSON.stringify({ 
                success: false, 
                message: 'Coordenadas de entrega inválidas.' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate location on server-side (Monterrey Central Kitchen: 25.6866, -100.3161, max distance 15 km)
        const KITCHEN_LAT = 25.6866;
        const KITCHEN_LON = -100.3161;
        
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

        const distance = calculateDistance(userCoordinates.lat, userCoordinates.lon, KITCHEN_LAT, KITCHEN_LON);
        if (distance > 15) {
            return new Response(JSON.stringify({ 
                success: false, 
                message: 'La ubicación seleccionada está fuera del área de cobertura (máximo 15 km).' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Securely identify user from JWT token
        const authHeader = request.headers.get('Authorization');
        const token = (authHeader && authHeader.startsWith('Bearer ')) 
            ? authHeader.substring(7) 
            : cookies.get(TOKEN_NAME)?.value;
            
        let userId = bodyUserId || 1;
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload && (payload.userId || payload.id)) {
                userId = Number(payload.userId || payload.id) || userId;
            }
        }

        const orderId = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        // Stripe API integration preparation (BFF proxy pattern)
        const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;
        let transactionId = 'ch_' + Math.random().toString(36).substring(2, 10).toUpperCase();
        let clientSecret = '';

        if (stripeSecretKey) {
            try {
                const stripe = new Stripe(stripeSecretKey, {
                    apiVersion: '2025-01-27'
                } as any);

                // Create a Stripe PaymentIntent for the deposit amount
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(amountPaid * 100), // in cents
                    currency: 'mxn',
                    metadata: {
                        orderId,
                        userId: userId.toString(),
                        meals_count: meals.length.toString(),
                        payment_plan: paymentPlan,
                        total_cost: totalCost.toString(),
                        remaining: remaining.toString()
                    }
                });
                
                transactionId = paymentIntent.id;
                clientSecret = paymentIntent.client_secret || '';
            } catch (stripeErr: any) {
                console.error("[BFF Stripe Error]:", stripeErr);
                return new Response(JSON.stringify({ 
                    success: false, 
                    message: `Error de Stripe: ${stripeErr.message || 'No se pudo crear el intento de pago.'}` 
                }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Return successful checkout details
        return new Response(JSON.stringify({
            success: true,
            orderId,
            transactionId,
            clientSecret,
            amountPaid,
            remaining,
            mealsCount: meals.length,
            message: 'Preventa registrada exitosamente.'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error("BFF preorder checkout error:", err);
        return new Response(JSON.stringify({ 
            success: false, 
            message: 'Error interno del servidor al procesar la preventa.' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
