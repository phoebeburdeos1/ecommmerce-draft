/**
 * Use for product/image paths from the API.
 * Relative image paths are served by the Laravel app (API origin).
 * Full URLs (http/https) are returned as-is. Safe to call during SSR (returns relative path).
 */
export function productImageUrl(path) {
  try {
    if (path == null || typeof path !== 'string') return null;
    const normalized = String(path).replace(/\\/g, '/').trim();
    if (!normalized) return null;
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized;
    const withSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
    const frontendBase = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BASE_PATH) || '';
    const pathWithBase = frontendBase ? frontendBase.replace(/\/$/, '') + withSlash : withSlash;

    // Image files are served by the Laravel app (API host), not Next.js host.
    const apiBase = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL)
      || 'http://localhost:8000/api';
    const apiOrigin = apiBase ? apiBase.replace(/\/api\/?$/, '').replace(/\/$/, '') : '';
    if (apiOrigin) {
      return `${apiOrigin}${withSlash}`;
    }

    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return window.location.origin + pathWithBase;
    }
    return pathWithBase;
  } catch (_) {
    return null;
  }
}
