import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price from cents to a displayable currency string
 * @param amountInCents - Price in cents (e.g., 1099 for $10.99)
 * @param currency - Currency code (e.g., "usd")
 * @param locale - User locale (e.g., "en", "zh")
 * @returns Formatted price string
 */
export function formatPrice(
  amountInCents: number,
  currency: string = "usd",
  locale: string = "en",
): string {
  try {
    const amountInDollars = amountInCents / 100;

    return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountInDollars);
  } catch (error) {
    console.error("Error formatting price:", error);
    // Fallback formatting
    const currencySymbol = currency === "usd" ? "$" : "€";
    return `${currencySymbol}${(amountInCents / 100).toFixed(2)}`;
  }
}

/**
 * Truncate text to a specified number of characters
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: "...")
 * @returns Truncated text
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = "...",
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Generate a unique ID
 * @returns Unique string ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Format date to a readable string
 * @param date - Date to format
 * @param locale - User locale (e.g., "en", "zh")
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, locale: string = "en"): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return date.toString();
  }
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param value - Value to check
 * @returns True if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string") {
    return value.trim() === "";
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }
  return false;
}

/**
 * Debounce function to limit the rate at which a function gets called
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Helper function to format amount for display
export function formatAmount(amount: number, currency: string): string {
  if (currency.toLowerCase() === "usd") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  }
  return `${amount} ${currency.toUpperCase()}`;
}
