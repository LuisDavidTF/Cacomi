import type { APIRoute } from 'astro';

// Estructura de un score
interface ScoreEntry {
    name: string;
    score: number; // Intentos (menor es mejor)
    date: string;
}

// Mock inicial vacío
let mockLeaderboard: ScoreEntry[] = [];

export const GET: APIRoute = async ({ locals }) => {
    try {
        let leaderboard = [...mockLeaderboard];
        
        // Si estamos en Cloudflare y existe el KV, intentamos leer de ahí
        // @ts-ignore - locals.runtime solo existe en Cloudflare
        const kv = locals.runtime?.env?.SESSION;
        if (kv) {
            const stored = await kv.get('cacomi_game_leaderboard');
            if (stored) {
                leaderboard = JSON.parse(stored);
            }
        }

        const today = new Date().toISOString().split('T')[0];
        
        // Filtrar estrictamente por fecha (solo hoy) y asegurar estructura válida
        const dailyLeaderboard = leaderboard.filter(entry => 
            entry && 
            entry.date === today && 
            typeof entry.score === 'number'
        );

        // Ordenar por score (ascendente, menos intentos es mejor)
        dailyLeaderboard.sort((a, b) => a.score - b.score);
        
        return new Response(JSON.stringify(dailyLeaderboard.slice(0, 10)), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Error al obtener leaderboard' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const body = await request.json();
        const { name, score } = body;

        if (!name || !score) {
            return new Response(JSON.stringify({ error: 'Datos incompletos' }), { status: 400 });
        }

        // @ts-ignore
        const kv = locals.runtime?.env?.SESSION;
        let leaderboard = [...mockLeaderboard];

        if (kv) {
            const stored = await kv.get('cacomi_game_leaderboard');
            if (stored) {
                const parsed = JSON.parse(stored);
                const today = new Date().toISOString().split('T')[0];
                // Mantener solo datos de hoy al cargar
                leaderboard = Array.isArray(parsed) ? parsed.filter(e => e.date === today) : [];
            }
        }

        // Añadir el nuevo score
        leaderboard.push({
            name,
            score,
            date: new Date().toISOString().split('T')[0]
        });

        // Ordenar y limitar a top 50 (para no llenar el KV)
        leaderboard.sort((a, b) => a.score - b.score);
        const topScores = leaderboard.slice(0, 50);

        if (kv) {
            await kv.put('cacomi_game_leaderboard', JSON.stringify(topScores));
        } else {
            // En desarrollo local (sin KV), actualizamos el mock en memoria
            mockLeaderboard = topScores;
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Error al guardar score' }), { status: 500 });
    }
};
