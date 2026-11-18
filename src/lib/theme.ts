export type ThemeMode = "dark" | "light";

export const THEME_STORAGE_KEY = "portal-theme";

/**
 * Utilitas identifikasi rute admin untuk kontrol khusus bila diperlukan.
 */
export function isAdminPathname(pathname: string | null | undefined): boolean {
  return pathname === "/admin" || pathname?.startsWith("/admin/") === true;
}

/**
 * Skrip sinkron sebelum hidrasi untuk mencegah FOUC di seluruh portal (termasuk panel admin).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var t=(s==='light'||s==='dark')?s:'dark';document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}})();`;
