import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

export function isDateInRange(
  date: string,
  fromDate: string,
  toDate: string
): boolean {
  const d = new Date(date);
  const from = new Date(fromDate);
  const to = new Date(toDate);
  // Set to end of day for toDate
  to.setHours(23, 59, 59, 999);
  return d >= from && d <= to;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
