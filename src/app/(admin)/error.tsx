"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Admin area error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-error-container/30 text-error flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[28px]">warning</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2">
          Terjadi Kesalahan di Panel Admin
        </h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Gagal memuat data administrasi. Anda dapat mencoba memuat ulang komponen atau kembali ke dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()} variant="outline" className="w-full sm:w-auto">
            Coba Lagi
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin">Kembali ke Overview</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
