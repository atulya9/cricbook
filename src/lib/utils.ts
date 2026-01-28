import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



/**
 * Format a date to a readable string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date | string, formatStr = "MMM d, yyyy"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format cricket score (e.g., "234/5 (45.2)")
 */
export function formatScore(runs: number, wickets: number, overs?: number): string {
  const score = `${runs}/${wickets}`;
  if (overs !== undefined) {
    return `${score} (${overs})`;
  }
  return score;
}

/**
 * Calculate strike rate
 */
export function calculateStrikeRate(runs: number, balls: number): number {
  if (balls === 0) return 0;
  return Number(((runs / balls) * 100).toFixed(2));
}

/**
 * Calculate economy rate
 */
export function calculateEconomy(runs: number, overs: number): number {
  if (overs === 0) return 0;
  return Number((runs / overs).toFixed(2));
}

/**
 * Extract hashtags from text
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map((tag) => tag.slice(1).toLowerCase()) : [];
}

/**
 * Extract mentions from text
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = text.match(mentionRegex);
  return matches ? matches.map((mention) => mention.slice(1).toLowerCase()) : [];
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Format number with K, M suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate random avatar URL based on username
 */
export function getAvatarUrl(username: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;
}