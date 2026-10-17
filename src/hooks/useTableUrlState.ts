"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * State tabel yang disimpan di URL (`?search=&status=&page=`).
 * Server Component membaca `searchParams`, client hanya mengubah URL,
 * sehingga hasil filter bisa di-share dan di-bookmark.
 */
export function useTableUrlState(search: string, debounceMs = 500) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(search);

  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      const query = params.toString();
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const [prevSearch, setPrevSearch] = useState(search);
  if (prevSearch !== search) {
    setPrevSearch(search);
    setSearchTerm(search);
  }

  // Debounce pencarian -> URL.
  useEffect(() => {
    if (searchTerm === search) return;
    const timer = setTimeout(() => {
      updateUrl({ search: searchTerm || null, page: "1" });
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchTerm, search, debounceMs, updateUrl]);

  const setStatus = useCallback(
    (value: string) => updateUrl({ status: value === "all" ? null : value, page: "1" }),
    [updateUrl]
  );

  const setPage = useCallback(
    (page: number) => {
      updateUrl({ page: String(page) });
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateUrl]
  );

  return {
    searchParams,
    searchTerm,
    setSearchTerm,
    setStatus,
    setPage,
    updateUrl,
    isPending,
    startTransition,
    refresh: () => router.refresh(),
  };
}
