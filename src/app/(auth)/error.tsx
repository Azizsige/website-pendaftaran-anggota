"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Auth error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-on-surface">Terjadi Kendala Autentikasi</h2>
        <p className="text-sm text-on-surface-variant">
          Gagal memproses sesi autentikasi. Silakan muat ulang atau kembali ke halaman masuk.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button onClick={() => reset()} variant="outline">
            Coba Lagi
          </Button>
          <Button asChild>
            <Link href="/login">Masuk Kembali</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
