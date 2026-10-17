"use client";

import { useEffect } from "react";
import Link from "next/link";
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f7f9fb]">
      <div className="w-full max-w-[480px] p-8 bg-white rounded-2xl border border-[#006c49]/15 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[32px]">error</span>
        </div>
        <h2 className="text-xl font-bold text-[#191c1e]">
          Terjadi Kendala pada Formulir
        </h2>
        <p className="text-sm text-[#3c4a42] leading-relaxed">
          Mohon maaf, terjadi kendala saat memuat atau memproses formulir pendaftaran. Silakan coba lagi atau muat ulang halaman.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button onClick={() => reset()} variant="outline">
            Coba Lagi
          </Button>
          <Button asChild className="bg-[#006c49] text-white hover:bg-[#006c49]/90">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
