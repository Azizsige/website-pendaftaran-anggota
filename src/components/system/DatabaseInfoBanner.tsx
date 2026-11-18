"use client";

import { Info } from "lucide-react";
import { LoadingWaveDots } from "@/components/ui/loading-wave-dots";
import { useDatabaseRecovery } from "@/hooks/use-database-recovery";

export function DatabaseInfoBanner() {
  const { isRecovered } = useDatabaseRecovery();

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-[#fffbeb] dark:bg-[#2b1d07] border-b border-[#f59e0b]/40 text-[#78350f] dark:text-[#fde68a]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <Info
            className="w-4 h-4 mt-0.5 shrink-0 text-[#b45309] dark:text-[#fbbf24]"
            aria-hidden="true"
          />
          <p className="text-xs sm:text-sm leading-relaxed min-w-0">
            <span className="font-bold">Mode Informasi: </span>
            {isRecovered ? (
              <span>Layanan portal kembali aktif. Memuat ulang tampilan...</span>
            ) : (
              <span>
                Layanan pendaftaran dan pemeriksaan data sedang dalam pemeliharaan
                berkala. Halaman profil serta panduan keanggotaan tetap dapat
                ditelusuri seperti biasa.
              </span>
            )}
          </p>
        </div>

        {isRecovered && (
          <LoadingWaveDots
            size="sm"
            label="Memperbarui tampilan portal"
            className="shrink-0 text-[#b45309] dark:text-[#fbbf24]"
          />
        )}
      </div>
    </div>
  );
}
