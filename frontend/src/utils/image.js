/**
 * Use for product/image paths from the API.
 * Paths like "images/photo.jpg" are served from frontend public folder → need "/images/photo.jpg".
 * Full URLs (http/https) are returned as-is. Safe to call during SSR (returns relative path).
 */
export function productImageUrl(path) {
  try {
    if (path == null || typeof path !== 'string') return null;
    const normalized = String(path).replace(/\\/g, '/').trim();
    if (!normalized) return null;
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized;
    const withSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
    const base = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BASE_PATH) || '';
    const pathWithBase = base ? base.replace(/\/$/, '') + withSlash : withSlash;
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return window.location.origin + pathWithBase;
    }
    return pathWithBase;
  } catch (_) {
    return null;
  }
}
