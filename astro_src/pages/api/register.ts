import type { APIRoute } from 'astro';
import { AuthService } from '@/lib/services/auth';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        const data = await AuthService.register({ name, email, password });

        return new Response(JSON.stringify(data), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        if (error.status) {
            return new Response(JSON.stringify({ message: error.message || 'Error en el registro' }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        console.error("Registration error:", error);
        return new Response(JSON.stringify({ message: 'Error interno del servidor durante el registro', error: error.toString() }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
