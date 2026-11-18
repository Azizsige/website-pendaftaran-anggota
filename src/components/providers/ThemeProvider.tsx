"use client";

import React, { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { isAdminPathname, THEME_STORAGE_KEY, type ThemeMode } from "@/lib/theme";

interface ThemeContextValue {
  /** Preferensi tema pengguna ("dark" default di seluruh portal). */
  theme: ThemeMode;
  /** Tema efektif yang sedang aktif pada dokumen. */
  resolvedTheme: ThemeMode;
  mounted: boolean;
  isAdminRoute: boolean;
  setTheme: (next: ThemeMode) => void;
  toggleTheme: () => void;
}

const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "dark";
  } catch {
    return "dark";
  }
}

function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getServerThemeSnapshot(): ThemeMode {
  return "dark";
}

function subscribeMounted(): () => void {
  return () => {};
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = isAdminPathname(pathname);

  const theme = useSyncExternalStore(subscribeTheme, readStoredTheme, getServerThemeSnapshot);
  const mounted = useSyncExternalStore(subscribeMounted, () => true, () => false);
  const resolvedTheme: ThemeMode = theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Abaikan jika penyimpanan dibatasi browser
    }
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    notifyListeners();
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = readStoredTheme() === "dark" ? "light" : "dark";
    setTheme(next);
  }, [setTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, mounted, isAdminRoute, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "dark",
      resolvedTheme: "dark",
      mounted: false,
      isAdminRoute: false,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
