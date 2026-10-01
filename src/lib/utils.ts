import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '—';
  if (Math.abs(value) >= 1e12) return (value / 1e12).toFixed(2) + 'T';
  if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(2) + 'B';
  if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  if (Math.abs(value) >= 1e3) return (value / 1e3).toFixed(2) + 'K';
  return value.toFixed(decimals);
}

export function formatPrice(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '—';
  if (value >= 100000) return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (value >= 1000) return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (value >= 1) return '$' + value.toFixed(4);
  if (value >= 0.01) return '$' + value.toFixed(6);
  if (value >= 0.0001) return '$' + value.toFixed(8);
  return '$' + value.toExponential(4);
}

export function formatPercent(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return sign + value.toFixed(2) + '٪';
}

export function formatAddress(address: string, chars = 6): string {
  if (!address || address.length < chars * 2) return address;
  return address.slice(0, chars) + '...' + address.slice(-chars);
}

export function formatDate(date: Date | string): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatRelativeTime(date: Date | string): string {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return 'همین الان';
  if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} روز پیش`;
  return formatDate(d);
}

export function getNetworkColor(network: string): string {
  switch (network) {
    case 'BSC': return '#F3BA2F';
    case 'ETH': return '#627EEA';
    case 'BASE': return '#0052FF';
    default: return '#888';
  }
}

export function getChangeColor(value: number): string {
  if (value > 0) return 'text-green-400';
  if (value < 0) return 'text-red-400';
  return 'text-muted-foreground';
}

export function truncateHash(hash: string): string {
  if (!hash || hash.length < 12) return hash;
  return hash.slice(0, 8) + '...' + hash.slice(-6);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.abs(Date.now() * 31337).toString(36).slice(0, 5);
}
