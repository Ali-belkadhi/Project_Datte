import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price in Tunisian dinars.
 * TND uses 3 decimals (millimes): 9.5 → "9,500 DT", 89 → "89 DT".
 */
export function formatPrice(value: number): string {
  if (Number.isInteger(value)) return `${value.toLocaleString("fr-FR")} DT`;
  return `${value.toFixed(3).replace(".", ",")} DT`;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
