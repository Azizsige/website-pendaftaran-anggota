import { Loader2, QrCode } from "lucide-react";

export default function VerifikasiKtaLoading() {
  return (
    <div className="min-h-[calc(100dvh-68px)] bg-[#f7f9fb] dark:bg-[#0d1412] px-4 py-10 sm:py-14 flex items-start justify-center">
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="w-full max-w-lg rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-xs dark:border-[#3c4d46] dark:bg-[#131d1a]"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-[#f1f5f9] dark:border-[#24332d]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e6f4ee] text-[#005236] border border-[#006c49]/20 dark:bg-[#0a3326] dark:text-[#6ee7b7] dark:border-[#34d399]/35">
            <QrCode className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-[#0f172a] dark:text-[#eef2f4] leading-tight">
              Verifikasi Keaslian KTA
            </h1>
            <p className="text-xs text-[#475569] dark:text-[#cbd6d0]">
              Menyiapkan layanan verifikasi...
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[#006c49]/20 bg-[#f8fafc] p-6 flex flex-col items-center text-center gap-3 dark:border-[#3c4d46] dark:bg-[#1a2723]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f4ee] border border-[#006c49]/20 dark:bg-[#0a3326] dark:border-[#34d399]/30">
            <Loader2
              className="h-6 w-6 text-[#006c49] dark:text-[#34d399] spinner-essential"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0f172a] dark:text-[#eef2f4]">
              Memuat Halaman Verifikasi KTA...
            </p>
            <p className="text-xs text-[#475569] dark:text-[#cbd6d0] mt-1">
              Sedang menghubungkan ke basis data resmi keanggotaan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
