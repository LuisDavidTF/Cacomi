// Diccionario de palabras permitidas (cualquier palabra de 5 letras que el usuario pueda intentar)
export const ALLOWED_WORDS = [
    "POLLO", "PASTA", "MANGO", "CARNE", "LIMON", "ARROZ", "HORNO", "SALSA", "FRESA", "QUESO",
    "SUSHI", "PIZZA", "TACOS", "PERAS", "UVAS", "CREMA", "SOPAS", "PURES", "MELON", "CHILE",
    "HUEVO", "TAPAS", "PANES", "FUEGO", "PLATO", "TAZON", "ASADO", "CALDO", "DULCE", "SALAR",
    "PISCO", "CAVAS", "VINOS", "TARTA", "CACAO", "PIÑAS", "KIWIS", "VERDE", "ROJOS", "TRIGO",
    "AVENA", "PAPAS", "PERAS", "MANIS", "MIELS", "COCER", "ASAR", "FREIR", "PELAR", "BATIR",
    "PICAR", "LAVAR", "COMER", "CENAR", "BEBER", "COPAS", "MESAS", "SILLA", "COCHE", "CASA",
    "PERRO", "GATO", "LIBRO", "PAPEL", "CLAVE", "MUNDO", "TIEMPO", "RADIO", "CABLE", "MOTOR",
    "CALOR", "FRITO", "GUISO", "ÑAMAS", "ÑAMAM", "ÑAMAS", "FRUTA", "VERDU", "HIELO", "JUGO",
    "LECHE", "NUECE", "PASTE", "PERIL", "PIMIE", "PISTA", "PUERRO", "QUESO", "RABAN", "RAMOS",
    "SETA", "SIDRA", "SOJA", "SOPAS", "TALLA", "TAPER", "TARTA", "TAZON", "TECHO", "TENER",
    "TETRA", "TINTO", "TOQUE", "TORRE", "TORTA", "TORTI", "TRUCO", "TRUFA", "TURRO", "VAINA",
    "VASOS", "VELAS", "VERDE", "VIAJE", "VINOS", "VOTAR", "YOGUR", "ZUMO", "ACEIT", "ADOBE",
    "AGRIO", "AGUAS", "AHOMA", "AJERO", "AJITO", "ALBAR", "ALGAS", "ALIÑO", "ALMAZ", "AMASA",
    "ANCHO", "ANEJO", "ANICE", "APIO", "AREPA", "AROMA", "ARROZ", "ASADO", "AVENA", "BACAN",
    "BAGEL", "BANDA", "BANAN", "BARRA", "BASIL", "BERZA", "BIZCO", "BLAND", "BOCAD", "BODAS",
    "BOLAS", "BOLLO", "BOLSA", "BOTIN", "BRAVA", "BREVA", "BUÑUE", "BURRI", "CABRA", "CACAU",
    "CAFES", "CAJAS", "CALDO", "CALOR", "CANAL", "CAÑAS", "CAPAS", "CARNE", "CARTA", "CASCO",
    "CAVAS", "CEBADA", "CEBON", "CENAS", "CEPAS", "CERDO", "CERVE", "CESTA", "CHAPA", "CHICA",
    "CHINO", "CHIPS", "CHULE", "CHUPA", "SIDRA", "SILLA", "SIRVE", "SOBRA", "SOLAR", "SOPAS",
    "TABLA", "TACOS", "TALLA", "TAPAS", "TARRO", "TARTA", "TASCA", "TAZAS", "TAZON", "TELON",
    "TENER", "TINTO", "TIRAR", "TIRAS", "TOCAR", "TOMAR", "TONEL", "TOQUE", "TORTA", "TRAGO",
    "TRIGO", "TRIPA", "TRUFA", "TUDEL", "TUEZO", "TURCO", "TURRON", "UVITA", "VACAS", "VAINA",
    "VALLE", "VASOS", "VATES", "VEGAN", "VENIA", "VENTA", "VERDE", "VERJA", "VETAS", "VIALE",
    "VIEJO", "VIGIL", "VINOS", "VIVIR", "VOLAR", "VUELO", "YOGUR", "YEMAS", "ZAFRA", "ZANAH",
    "ZORRA", "ZUMOS", "ÑAMES"
];

// Para obtener un id único del día (para guardar en el localStorage si ya jugó hoy)
export function getDailyPuzzleId() {
    const date = new Date();
    // Usamos UTC para que cambie a la misma hora para todos
    return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
}

// Valida si la palabra introducida por el usuario existe en el diccionario permitido
export function isValidWord(word: string) {
    return ALLOWED_WORDS.includes(word.toUpperCase());
}

