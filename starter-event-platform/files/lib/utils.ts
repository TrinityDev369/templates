import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return minutes === 0
    ? `${displayHours}:00 ${period}`
    : `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return `$${price}`;
}
