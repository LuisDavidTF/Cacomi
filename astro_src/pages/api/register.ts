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
        console.error("REGISTRATION API ERROR:", error);
        const status = error.status || 500;
        const message = status === 500 ? 'Error interno del servidor durante el registro' : (error.message || 'Error en el registro');
        
        return new Response(JSON.stringify({ message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
