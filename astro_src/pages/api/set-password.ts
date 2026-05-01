import type { APIRoute } from 'astro';
import { AuthService } from '@/lib/services/auth';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { password } = body;
        
        // Extract Authorization header from frontend request
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ message: 'No autenticado' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const token = authHeader.substring(7);

        const data = await AuthService.setPassword(password, token);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        if (error.status) {
            return new Response(JSON.stringify({ message: error.message || 'Error al establecer contraseña' }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return new Response(JSON.stringify({ message: 'Error interno del servidor', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
