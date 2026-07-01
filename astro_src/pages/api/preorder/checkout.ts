import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { meals, userCoordinates, paymentPlan, totalCost, amountPaid, remaining } = body;

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

        // Stripe API integration preparation (BFF proxy pattern)
        const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;
        let transactionId = 'ch_' + Math.random().toString(36).substring(2, 10).toUpperCase();

        if (stripeSecretKey) {
            try {
                // If the user configures Stripe credentials in .env.local, they would install stripe: npm i stripe
                // We load it dynamically to prevent bundle compile errors if the package is not installed yet.
                const stripePkg = 'stripe';
                const { default: Stripe } = await import(/* @vite-ignore */ stripePkg);
                const stripe = new (Stripe as any)(stripeSecretKey, {
                    apiVersion: '2025-01-27'
                });

                // Create a Stripe PaymentIntent for the deposit amount
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(amountPaid * 100), // in cents
                    currency: 'mxn',
                    metadata: {
                        meals_count: meals.length.toString(),
                        payment_plan: paymentPlan,
                        total_cost: totalCost.toString(),
                        remaining: remaining.toString()
                    }
                });
                
                transactionId = paymentIntent.id;
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
            orderId: 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
            transactionId,
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
