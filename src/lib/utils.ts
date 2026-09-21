import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatCrores(amount: number): string {
  if (amount >= 100) {
    return `₹${(amount).toLocaleString('en-IN')} Cr`;
  }
  return `₹${amount} Cr`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export function getGainPercent(gmp: number, price: number): number {
  if (price === 0) return 0;
  return parseFloat(((gmp / price) * 100).toFixed(1));
}

export function getEstimatedListingPrice(price: number, gmp: number): number {
  return price + gmp;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'upcoming':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'closed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    case 'listed':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
  }
}

export function getTypeColor(type: string): string {
  switch (type) {
    case 'mainboard':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'sme':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
  }
}

export function getEventColor(type: string): string {
  switch (type) {
    case 'ipo_opens':
      return 'bg-green-500';
    case 'ipo_closes':
      return 'bg-red-500';
    case 'allotment':
      return 'bg-blue-500';
    case 'refund':
      return 'bg-amber-500';
    case 'listing':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
}

export function getEventLabel(type: string): string {
  switch (type) {
    case 'ipo_opens':
      return 'IPO Opens';
    case 'ipo_closes':
      return 'IPO Closes';
    case 'allotment':
      return 'Allotment';
    case 'refund':
      return 'Refund';
    case 'listing':
      return 'Listing';
    default:
      return type;
  }
}

export function generateDemoId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}
