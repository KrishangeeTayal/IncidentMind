// Formatting helpers used by the UI. Kept dependency-free so they can
// be imported from server components without pulling in date-fns or
// similar.

/** Format an ISO-8601 timestamp as "Aug 12, 14:32" in the local TZ. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Format an ISO-8601 timestamp as "14:32:08" in the local TZ. */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** Format an ISO-8601 timestamp as a relative time, e.g. "5m ago". */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const diff = now.getTime() - d.getTime();
  if (diff < 0) return 'just now';
  const seconds = Math.floor(diff / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDateTime(iso);
}

/** Format a duration in seconds as "1h 12m" / "45s" / "2d 4h". */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
    return '—';
  }
  if (seconds < 0) return '—';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const remainder = Math.round(seconds % 60);
    return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remainderMin = minutes % 60;
    return remainderMin > 0 ? `${hours}h ${remainderMin}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainderHr = hours % 24;
  return remainderHr > 0 ? `${days}d ${remainderHr}h` : `${days}d`;
}

/** Clamp a number between min and max (inclusive). */
export function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

/** Format a 0..1 confidence as an integer percent. */
export function formatPercent(n: number | null | undefined, fractionDigits = 0): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return `${(n * 100).toFixed(fractionDigits)}%`;
}
