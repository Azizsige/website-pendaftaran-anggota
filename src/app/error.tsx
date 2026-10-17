"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Root application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Terjadi Kesalahan Sistem</h2>
      <p className="text-on-surface-variant mb-6 max-w-md">
        Mohon maaf, kami mengalami masalah saat memproses permintaan Anda.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="outline">
          Coba Lagi
        </Button>
        <Button asChild>
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
