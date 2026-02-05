import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = "UZS", locale = "uz-UZ") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount)
  } catch (e) {
    // fallback
    return `${amount.toFixed(2)} ${currency}`
  }
}
