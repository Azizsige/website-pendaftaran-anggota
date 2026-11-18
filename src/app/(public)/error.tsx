"use client";

import { useEffect } from "react";
import Link from "next/link";
import { logger } from "@/lib/logger";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Public page error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-[#131d1a] rounded-2xl shadow-sm border border-slate-200 dark:border-[#3c4d46] p-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 dark:bg-[#3b2506] dark:text-[#fcd34d] flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-[#eef2f4]">
          Gagal Memuat Informasi
        </h2>
        <p className="text-sm text-slate-600 dark:text-[#cbd6d0]">
          Terjadi kendala saat memuat konten halaman. Silakan muat ulang atau kembali ke beranda.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 dark:border-[#5f736b] text-slate-700 dark:text-[#eef2f4] dark:bg-[#1a2723] text-sm font-medium hover:bg-slate-50 dark:hover:bg-[#22322d] transition-colors cursor-pointer"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg bg-[#006c49] dark:bg-[#057a55] text-white text-sm font-medium hover:bg-[#005236] dark:hover:bg-[#046c4e] transition-colors"
          >
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
