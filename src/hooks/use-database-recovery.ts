"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 5_000;
const FOCUS_COOLDOWN_MS = 2_000;
const HARD_RELOAD_FALLBACK_MS = 2_500;

/**
 * Memantau endpoint `/api/health` secara senyap saat aplikasi berada pada mode
 * pemeliharaan. Begitu layanan kembali aktif, halaman langsung diperbarui
 * otomatis tanpa perlu refresh manual.
 */
export function useDatabaseRecovery() {
  const router = useRouter();
  const [isRecovered, setIsRecovered] = useState(false);
  const recoveredRef = useRef(false);
  const inFlightRef = useRef(false);
  const lastCheckAtRef = useRef(0);

  useEffect(() => {
    let active = true;

    const probeHealth = async (bypassCache: boolean) => {
      if (!active || recoveredRef.current || inFlightRef.current) return;
      if (document.visibilityState === "hidden") return;

      const now = Date.now();
      if (bypassCache && now - lastCheckAtRef.current < FOCUS_COOLDOWN_MS) {
        return;
      }

      inFlightRef.current = true;
      lastCheckAtRef.current = now;

      try {
        const url = bypassCache ? "/api/health?refresh=1" : "/api/health";
        const res = await fetch(url, { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as
          | { ok?: boolean }
          | null;

        if (active && res.ok && data?.ok) {
          recoveredRef.current = true;
          setIsRecovered(true);
          router.refresh();
        }
      } catch {
        // Diam saat gagal jaringan sementara; interval berikutnya akan mencoba ulang.
      } finally {
        inFlightRef.current = false;
      }
    };

    const intervalId = setInterval(() => {
      void probeHealth(false);
    }, POLL_INTERVAL_MS);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void probeHealth(true);
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      active = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [router]);

  // Cadangan pengaman: bila `router.refresh()` tidak meng-unmount layar pemeliharaan dalam 2,5 detik, muat ulang penuh.
  useEffect(() => {
    if (!isRecovered) return;
    const timer = setTimeout(() => {
      window.location.reload();
    }, HARD_RELOAD_FALLBACK_MS);

    return () => clearTimeout(timer);
  }, [isRecovered]);

  return { isRecovered };
}
