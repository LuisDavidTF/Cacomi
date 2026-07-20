import type { APIRoute } from 'astro';
import { getBackendUrl } from '../../../lib/services/config';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;
    const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;
    const signature = request.headers.get('stripe-signature');

    let event: any;
    const rawBody = await request.text();

    if (stripeSecretKey && webhookSecret && signature) {
        try {
            const stripePkg = 'stripe';
            const { default: Stripe } = await import(/* @vite-ignore */ stripePkg);
            const stripe = new (Stripe as any)(stripeSecretKey, {
                apiVersion: '2025-01-27'
            });
            event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        } catch (err: any) {
            console.error("[Webhook signature verification failed]:", err.message);
            return new Response(JSON.stringify({ error: `Signature verification failed: ${err.message}` }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } else {
        // In local preview/test environment where webhooks are not signed or keys are missing,
        // parse raw body as JSON directly to facilitate manual testing.
        console.warn("[Webhook Warning]: Signature verification skipped. Missing STRIPE_WEBHOOK_SECRET or signature header.");
        try {
            event = JSON.parse(rawBody);
        } catch (err) {
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // Handle the event
    const eventType = event.type || (event.event ? event.event : 'payment_intent.succeeded');
    const eventData = event.data?.object || event;

    if (eventType === 'payment_intent.succeeded') {
        const paymentIntent = eventData;
        const metadata = paymentIntent.metadata || {};
        const orderId = metadata.orderId;
        const userIdStr = metadata.userId;
        
        if (!orderId) {
            console.warn("[Webhook Error]: Missing orderId in Stripe PaymentIntent metadata");
            return new Response(JSON.stringify({ success: false, message: 'Missing orderId in metadata.' }), {
                status: 200, // Still return 200 to Stripe to avoid infinite retries on malformed data
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const userId = Number(userIdStr) || 1;
        const amount = paymentIntent.amount / 100; // Stripe amount is in cents, convert to decimal
        const currency = (paymentIntent.currency || 'MXN').toUpperCase();
        const stripePaymentIntentId = paymentIntent.id;

        // Call Koyeb Backend API `/api/internal/orders/confirm-payment`
        const backendUrl = getBackendUrl().replace(/\/$/, '');
        const sharedSecret = import.meta.env.INTERNAL_API_KEY || import.meta.env.BACKEND_API_KEY || 'test_shared_secret';

        try {
            console.log(`[BFF Webhook]: Forwarding payment confirmation to Koyeb backend: ${backendUrl}/api/internal/orders/confirm-payment`);
            const backendResponse = await fetch(`${backendUrl}/api/internal/orders/confirm-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Internal-BFF-Token': sharedSecret
                },
                body: JSON.stringify({
                    orderId,
                    userId,
                    stripePaymentIntentId,
                    amount,
                    currency,
                    status: 'SUCCESS'
                })
            });

            if (!backendResponse.ok) {
                const errBody = await backendResponse.text();
                console.error(`[BFF Webhook Error]: Koyeb backend returned status ${backendResponse.status}:`, errBody);
                // Return 500 so Stripe knows to retry later
                return new Response(JSON.stringify({ error: `Backend sync failed: ${errBody}` }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const responseData = await backendResponse.json();
            console.log(`[BFF Webhook Success]: Koyeb backend confirmed order. Pickup code: ${responseData.pickupCode}`);
            return new Response(JSON.stringify({
                success: true,
                pickupCode: responseData.pickupCode,
                message: 'Payment confirmed and synchronized with backend API.'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });

        } catch (backendErr: any) {
            console.error("[BFF Webhook Error]: Could not reach Koyeb backend:", backendErr);
            return new Response(JSON.stringify({ error: `Backend connection error: ${backendErr.message}` }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // Return 200 for other unhandled event types
    return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
