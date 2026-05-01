import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function generateUUIDv7(): string {
    const timestamp = Date.now();
    const timeHex = timestamp.toString(16).padStart(12, '0');
    const randomHex1 = Math.floor(Math.random() * 0x1000).toString(16).padStart(3, '0');
    const randomHex2 = Math.floor(Math.random() * 0x4000000000000000).toString(16).padStart(16, '0');

    return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-7${randomHex1}-8${randomHex2.slice(1, 4)}-${randomHex2.slice(4)}`;
}

export function formatQuantityUnit(quantity: number, rawUnit: string, dict: Record<string, string>): { q: number, u: string } {
    let q = quantity;
    let u = rawUnit;

    if (rawUnit === 'g' && quantity >= 1000) {
        q = quantity / 1000;
        u = 'kg';
    } else if (rawUnit === 'ml' && quantity >= 1000) {
        q = quantity / 1000;
        u = 'L';
    } else if (rawUnit === 'pz') {
        u = 'pza';
    }

    // Check if the resulting unit can be translated using the dictionary, otherwise use the key
    const displayUnit = dict?.[u] || u;

    // Optionally format float if it's not a whole number (e.g., 2.5 kg)
    const formattedQuantity = q % 1 === 0 ? q : parseFloat(q.toFixed(2));

    return { q: formattedQuantity, u: displayUnit };
}

export function formatDateToString(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
