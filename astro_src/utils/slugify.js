/**
 * Converts a string to a URL-friendly slug.
 * - Converts to lowercase
 * - Removes accents/diacritics
 * - Replaces spaces and special chars with hyphens
 * - Removes multiple casing hyphens
 * 
 * @param {string} text - The text to slugify
 * @returns {string} The slugified string
 */
export function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Decompose combined graphemes (e.g. è -> e + `)
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
        .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars (except spaces, hyphens)
        .trim()
        .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/-+/g, '-'); // Remove duplicate hyphens
}
