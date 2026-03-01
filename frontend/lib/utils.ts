// lib/utils.ts
// Shared utility functions for the War Room dashboard

/**
 * Returns a military-style relative time string ("2 MIN AGO", "3 HRS AGO")
 */
export function timeAgo(isoString: string): string {
  const now = Date.now();
  const past = new Date(isoString).getTime();
  const diffMs = now - past;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}S AGO`;
  if (minutes < 60) return `${minutes} MIN AGO`;
  if (hours < 24) return `${hours} HR${hours > 1 ? 'S' : ''} AGO`;
  return `${days} DAY${days > 1 ? 'S' : ''} AGO`;
}

/**
 * Returns a UTC timestamp string in the format "HH:MM:SS UTC"
 */
export function formatUTC(date: Date): string {
  const h = String(date.getUTCHours()).padStart(2, '0');
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  return `${h}:${m}:${s} UTC`;
}

/**
 * Returns a UTC date-time string for display
 */
export function formatUTCDateTime(isoString: string): string {
  const d = new Date(isoString);
  const date = d.toISOString().split('T')[0];
  const time = d.toISOString().split('T')[1].substring(0, 8);
  return `${date} ${time}Z`;
}

/**
 * Returns "HH:MM:SS TZ" in the browser's local timezone (e.g., "14:32:45 ART")
 */
export function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  });
}

/**
 * Returns "YYYY-MM-DD HH:MM:SS TZ" in the browser's local timezone
 */
export function formatLocalDateTime(isoString: string): string {
  const d = new Date(isoString);
  const date = d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
  const time = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  });
  return `${date} ${time}`;
}

/**
 * Formats a market price number with appropriate decimal places
 */
export function formatPrice(price: number, currency: string): string {
  if (currency === 'IRR') {
    return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toFixed(2);
}
