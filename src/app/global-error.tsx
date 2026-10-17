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
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Terjadi Kesalahan Kritis
          </h1>
          <p className="text-slate-600 text-sm">
            Aplikasi mengalami kesalahan fatal. Silakan muat ulang halaman untuk mencoba kembali.
          </p>
          {error.digest && (
            <p className="text-xs text-slate-400 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors cursor-pointer"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
