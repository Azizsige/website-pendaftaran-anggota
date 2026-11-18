"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

export default function DaftarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Daftar error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f7f9fb] dark:bg-[#0d1412]">
      <div className="w-full max-w-[480px] p-8 bg-white dark:bg-[#131d1a] rounded-2xl border border-[#006c49]/15 dark:border-[#3c4d46] shadow-sm text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-600 dark:bg-[#3b1214] dark:text-[#fca5a5] rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-[#191c1e] dark:text-[#eef2f4]">
          Terjadi Kendala pada Formulir
        </h2>
        <p className="text-sm text-[#3c4a42] dark:text-[#cbd6d0] leading-relaxed">
          Mohon maaf, terjadi kendala saat memuat atau memproses formulir pendaftaran. Silakan coba lagi atau muat ulang halaman.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button onClick={() => reset()} variant="outline">
            Coba Lagi
          </Button>
          <Button asChild className="bg-[#006c49] dark:bg-[#057a55] text-white hover:bg-[#005236] dark:hover:bg-[#046c4e]">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
