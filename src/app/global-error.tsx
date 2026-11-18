"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-[#f7f9fb] dark:bg-[#0d1412] text-[#191c1e] dark:text-[#eef2f4] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#131d1a] rounded-2xl shadow-xl border border-slate-200 dark:border-[#3c4d46] p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 dark:bg-[#3b1214] dark:text-[#fca5a5] flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-[#eef2f4]">
            Terjadi Kesalahan Kritis
          </h1>
          <p className="text-slate-600 dark:text-[#cbd6d0] text-sm">
            Aplikasi mengalami kesalahan fatal. Silakan muat ulang halaman untuk mencoba kembali.
          </p>
          {error.digest && (
            <p className="text-xs text-slate-500 dark:text-[#94a89e] font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white font-medium text-sm transition-colors cursor-pointer"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
