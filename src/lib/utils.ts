import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const COUNTRIES_LATAM = [
  { code: "AR", name: "Argentina",   currency: "ARS" },
  { code: "BO", name: "Bolivia",     currency: "BOB" },
  { code: "CL", name: "Chile",       currency: "CLP" },
  { code: "CO", name: "Colombia",    currency: "COP" },
  { code: "CR", name: "Costa Rica",  currency: "CRC" },
  { code: "EC", name: "Ecuador",     currency: "USD" },
  { code: "MX", name: "México",      currency: "MXN" },
  { code: "PA", name: "Panamá",      currency: "USD" },
  { code: "PE", name: "Perú",        currency: "PEN" },
  { code: "UY", name: "Uruguay",     currency: "UYU" },
] as const;

export type CountryCode = (typeof COUNTRIES_LATAM)[number]["code"];

export function formatCurrency(
  amount: number,
  currency: string,
  locale = "es-419"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, locale = "es-419"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
