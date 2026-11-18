/**
 * Lets the app run under a sub-path (Vite `base`, e.g. `/studio/gridfinity/`)
 * while every route check and history write keeps using root-relative paths.
 * At the default base `/` all of this is the identity.
 */

const RAW_BASE: string = import.meta.env.BASE_URL;

/** The base without its trailing slash: `''` at the root, `/studio/gridfinity` under a prefix. */
export const APP_BASE: string = RAW_BASE.replace(/\/+$/, '');

export function stripAppBase(pathname: string): string {
  if (APP_BASE === '') return pathname;
  if (pathname === APP_BASE) return '/';
  if (pathname.startsWith(`${APP_BASE}/`)) return pathname.slice(APP_BASE.length);
  return pathname;
}

export function withAppBase(path: string): string {
  if (APP_BASE === '' || !path.startsWith('/') || path.startsWith('//')) return path;
  if (path === APP_BASE || path.startsWith(`${APP_BASE}/`) || path.startsWith(`${APP_BASE}?`)) {
    return path;
  }
  return `${APP_BASE}${path}`;
}

/** `location.pathname` as the app's routes see it, with the base removed. */
export function appPathname(): string {
  return stripAppBase(window.location.pathname);
}

let installed = false;

/**
 * Prefixes root-relative URLs handed to pushState/replaceState with the base,
 * so the many `history.pushState(…, '/designer')` call sites need no change.
 */
export function installHistoryBaseShim(): void {
  if (installed || APP_BASE === '' || typeof window === 'undefined') return;
  installed = true;
  const { history } = window;
  const push = history.pushState.bind(history);
  const replace = history.replaceState.bind(history);
  const fix = (url: string | URL | null | undefined): string | URL | null | undefined =>
    typeof url === 'string' ? withAppBase(url) : url;
  history.pushState = (data: unknown, unused: string, url?: string | URL | null): void => {
    push(data, unused, fix(url));
  };
  history.replaceState = (data: unknown, unused: string, url?: string | URL | null): void => {
    replace(data, unused, fix(url));
  };
}
