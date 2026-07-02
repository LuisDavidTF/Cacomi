import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import { decodeJwtPayload } from '../../../middleware';

export const prerender = false;

const filePath = path.resolve(process.cwd(), 'astro_src/constants/preorder_combos.json');
const TOKEN_NAME = 'auth_token';

const getToken = (request: Request, cookies: any) => {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return cookies.get(TOKEN_NAME)?.value;
};

function isAdminPayload(payload: Record<string, any>): boolean {
    const roles = payload.roles || payload.authorities || [];
    if (Array.isArray(roles)) {
        return roles.some(role => {
            if (typeof role === 'string') return role === 'ROLE_ADMIN';
            if (role && typeof role === 'object') return role.authority === 'ROLE_ADMIN';
            return false;
        });
    }
    if (payload.role) return payload.role === 'ADMIN';
    return false;
}

export const GET: APIRoute = async () => {
    try {
        let content = '';
        try {
            content = await fs.readFile(filePath, 'utf-8');
        } catch (readErr) {
            return new Response(JSON.stringify({ error: 'Configuración no encontrada' }), { status: 404 });
        }
        return new Response(content, {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const token = getToken(request, cookies);
        if (!token) {
            return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401 });
        }

        const payload = decodeJwtPayload(token);
        if (!payload || !isAdminPayload(payload)) {
            return new Response(JSON.stringify({ message: 'Prohibido: Se requieren privilegios de administrador' }), { status: 403 });
        }

        const body = await request.json();
        if (!Array.isArray(body)) {
            return new Response(JSON.stringify({ message: 'El cuerpo debe ser una lista de combos' }), { status: 400 });
        }

        await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8');
        return new Response(JSON.stringify({ success: true, message: 'Combos actualizados globalmente.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ message: 'Error al actualizar combos', error: err.message }), { status: 500 });
    }
};
