"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Info, Mail } from "lucide-react";
import { LoadingWaveDots } from "@/components/ui/loading-wave-dots";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useDatabaseRecovery } from "@/hooks/use-database-recovery";

export type PausedRouteContext =
  | "registration"
  | "status"
  | "login"
  | "admin";

interface DatabasePausedScreenProps {
  context: PausedRouteContext;
  showThemeToggle?: boolean;
  orgEmail?: string;
}

const CONTEXT_COPY: Record<
  PausedRouteContext,
  {
    tag: string;
    heading: string;
    description: string;
  }
> = {
  registration: {
    tag: "Formulir Pendaftaran",
    heading: "Formulir pendaftaran sedang dalam pemeliharaan",
    description:
      "Saat ini pengajuan anggota baru dan pengunggahan dokumen sementara belum dapat diproses karena layanan sedang dalam pemeliharaan berkala.",
  },
  status: {
    tag: "Cek Status & KTA",
    heading: "Layanan cek status sedang dalam pemeliharaan",
    description:
      "Pemeriksaan status pendaftaran dan pengunduhan KTA digital untuk sementara belum dapat diakses selama masa pemeliharaan berlangsung.",
  },
  login: {
    tag: "Portal Sekretariat",
    heading: "Akses masuk pengurus sedang dalam pemeliharaan",
    description:
      "Halaman masuk pengurus sementara tidak tersedia selama proses pemeliharaan berlangsung. Halaman profil organisasi tetap dapat ditinjau.",
  },
  admin: {
    tag: "Panel Admin",
    heading: "Panel pengelolaan sedang dalam pemeliharaan",
    description:
      "Layanan dashboard, verifikasi pendaftar, dan data keanggotaan untuk sementara belum dapat dibuka hingga pemeliharaan selesai.",
  },
};

export function DatabasePausedScreen({
  context,
  showThemeToggle = false,
  orgEmail,
}: DatabasePausedScreenProps) {
  const { isRecovered } = useDatabaseRecovery();
  const copy = CONTEXT_COPY[context];

  return (
    <section
      aria-labelledby="service-maintenance-heading"
      className="min-h-[calc(100dvh-72px)] bg-[#f7f9fb] dark:bg-[#0d1412] text-[#191c1e] dark:text-[#eef2f4] flex items-center justify-center px-4 py-12 sm:py-16"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#131d1a] border border-[#5c6b62]/25 dark:border-[#3c4d46] shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-[#f59e0b]" aria-hidden="true" />

        <div className="p-6 sm:p-8 lg:p-10 space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fffbeb] dark:bg-[#2b1d07] border border-[#f59e0b]/40 text-xs font-semibold text-[#92400e] dark:text-[#fcd34d]">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pemeliharaan Sistem</span>
              </span>
              <span className="text-xs font-medium text-[#4b5850] dark:text-[#94a89e] px-2.5 py-1 rounded-full bg-[#f7f9fb] dark:bg-[#1a2723] border border-[#5c6b62]/20 dark:border-[#3c4d46]">
                {copy.tag}
              </span>
            </div>

            {showThemeToggle && <ThemeToggle />}
          </div>

          <div className="space-y-3">
            <h1
              id="service-maintenance-heading"
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#191c1e] dark:text-[#eef2f4] leading-snug"
            >
              {copy.heading}
            </h1>
            <p className="text-sm sm:text-base text-[#3c4a42] dark:text-[#cbd6d0] leading-relaxed">
              {copy.description}
            </p>
          </div>

          {isRecovered && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-xl border border-[#006c49]/35 dark:border-[#34d399]/35 bg-[#ecfdf5] dark:bg-[#064e3b] px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium text-[#005236] dark:text-[#6ee7b7]"
            >
              <span>Layanan kembali aktif. Memuat tampilan...</span>
              <LoadingWaveDots size="sm" label="Memperbarui halaman" />
            </div>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-1">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Lihat Beranda</span>
            </Link>

            <Link
              href="/tentang"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#f7f9fb] dark:bg-[#1a2723] hover:bg-[#eef2f0] dark:hover:bg-[#22322d] border border-[#5c6b62]/30 dark:border-[#3c4d46] text-[#191c1e] dark:text-[#eef2f4] font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
            >
              <Info className="w-4 h-4" aria-hidden="true" />
              <span>Tentang Organisasi</span>
            </Link>
          </div>

          <div className="pt-5 border-t border-[#5c6b62]/20 dark:border-[#3c4d46] space-y-2 text-xs text-[#4b5850] dark:text-[#94a89e] leading-relaxed">
            {orgEmail && (
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>
                  Butuh bantuan cepat? Hubungi{" "}
                  <a
                    href={`mailto:${orgEmail}`}
                    className="font-semibold text-[#005236] dark:text-[#34d399] underline"
                  >
                    {orgEmail}
                  </a>
                </span>
              </p>
            )}
            <p>
              Halaman ini memantau ketersediaan sistem dan akan beralih otomatis
              begitu layanan kembali aktif tanpa perlu memuat ulang secara manual.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
