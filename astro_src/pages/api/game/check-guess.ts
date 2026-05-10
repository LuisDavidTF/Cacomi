import type { APIRoute } from 'astro';

// Lista de palabras que pueden ser la solución (Secretas)
const PUZZLE_WORDS = [
    "POLLO", "PASTA", "MANGO", "CARNE", "LIMON", "ARROZ", "HORNO", "SALSA", "FRESA", 
    "QUESO", "SUSHI", "PIZZA", "TACOS", "PERAS", "UVAS", "CREMA", "SOPAS", "PURES", 
    "MELON", "CHILE", "HUEVO", "TAPAS", "PANES", "FUEGO", "PLATO", "TAZON", "ASADO", 
    "CALDO", "DULCE", "SALAR", "PISCO", "CAVAS", "VINOS", "TARTA", "CACAO", "PIÑAS", 
    "KIWIS", "VERDE", "ROJOS", "TRIGO", "AVENA", "ACEITE", "OLIVA", "AJO", "CEBOLLA",
    "PAPA", "SALES", "COCO", "BANANO", "HARINA", "LECHE", "YOGUR", "MANI", "MIEL"
];

// Función para obtener la palabra del día (Lógica de servidor)
async function getDailyWord(locals: any) {
    // 1. Intentar obtener palabra personalizada desde Cloudflare KV (llave: DAILY_OVERRIDE_WORD)
    try {
        const kv = locals?.runtime?.env?.SESSION;
        if (kv) {
            const override = await kv.get('DAILY_OVERRIDE_WORD');
            if (override && override.length === 5) {
                return override.toUpperCase();
            }
        }
    } catch (e) {
        console.error("Error al leer KV para palabra personalizada", e);
    }

    // 2. Fallback: Algoritmo automático basado en la fecha
    const epochMs = new Date('2024-01-01T00:00:00Z').valueOf();
    const now = Date.now();
    const daysPassed = Math.floor((now - epochMs) / (1000 * 60 * 60 * 24));
    const index = daysPassed % PUZZLE_WORDS.length;
    return PUZZLE_WORDS[index];
}

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const { guess } = await request.json();
        const dailyWord = await getDailyWord(locals);

        if (!guess || guess.length !== 5) {
            return new Response(JSON.stringify({ error: 'Palabra inválida' }), { status: 400 });
        }

        const upperGuess = guess.toUpperCase();
        const result = calculateStates(upperGuess, dailyWord);
        const won = upperGuess === dailyWord;

        return new Response(JSON.stringify({
            states: result,
            won: won,
            // Revelamos la palabra si ganaron o si ya no tienen más intentos (manejado por el cliente)
            word: won || guess.length === 5 ? dailyWord : null 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Error en el servidor' }), { status: 500 });
    }
};

function calculateStates(guess: string, target: string) {
    const states = Array(5).fill('absent');
    const targetChars = target.split('');
    const guessChars = guess.split('');

    // Primero marcamos las correctas
    for (let i = 0; i < 5; i++) {
        if (guessChars[i] === targetChars[i]) {
            states[i] = 'correct';
            targetChars[i] = ''; // Marcamos como usada
            guessChars[i] = ''; 
        }
    }

    // Luego las presentes
    for (let i = 0; i < 5; i++) {
        if (guessChars[i] !== '') {
            const index = targetChars.indexOf(guessChars[i]);
            if (index !== -1) {
                states[i] = 'present';
                targetChars[index] = ''; // Marcamos como usada
            }
        }
    }

    return states;
}

// Almacenamiento temporal en memoria para desarrollo local
let mockLeaderboard: any[] = [];
