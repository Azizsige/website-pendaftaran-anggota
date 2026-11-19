"use client";

import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useCekStatusStore } from "../store";
import { PublicIdCard } from "./PublicIdCard";
import { SearchForm } from "./SearchForm";
import { StatusResult } from "./StatusResult";
import { LoadingOverlay } from "./LoadingOverlay";

export function StatusClient() {
  const { statusData, setStatusData } = useCekStatusStore();

  useEffect(() => {
    return () => {
      useCekStatusStore.getState().setStatusData(null);
    };
  }, []);

  const handleCekDataLain = () => {
    const { reset } = useCekStatusStore.getState();
    reset();
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#f2f4f6] dark:bg-[#0d1412] flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 pt-12 md:pt-20">
        <div className="w-full max-w-[600px] bg-white dark:bg-[#131d1a] rounded-2xl shadow-sm border border-[#bbcabf]/50 dark:border-[#3c4d46] p-6 md:p-8 relative">
          {statusData && (
            <button
              onClick={() => setStatusData(null)}
              className="absolute top-6 left-6 p-2 min-h-[44px] min-w-[44px] text-[#74777f] hover:text-[#191c1e] hover:bg-[#f2f4f6] dark:text-[#94a89e] dark:hover:text-[#eef2f4] dark:hover:bg-[#1a2723] rounded-full transition-colors hidden md:flex items-center justify-center cursor-pointer"
              title="Kembali ke Form"
              aria-label="Kembali ke Form"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
          <div className="text-center mb-8 relative">
            {statusData && (
              <button
                onClick={() => setStatusData(null)}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 min-h-[44px] min-w-[44px] text-[#74777f] hover:text-[#191c1e] hover:bg-[#f2f4f6] dark:text-[#94a89e] dark:hover:text-[#eef2f4] dark:hover:bg-[#1a2723] rounded-full transition-colors md:hidden flex items-center justify-center cursor-pointer"
                aria-label="Kembali ke Form"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-[#191c1e] dark:text-[#eef2f4] mb-2 tracking-tight">Cek Status Pendaftaran</h1>
            <p className="text-[#4b5850] dark:text-[#cbd6d0] text-sm">
              Lihat perkembangan status pendaftaran dan unduh Kartu Tanda Anggota Anda.
            </p>
          </div>

          {!statusData ? (
            <SearchForm />
          ) : (
            <>
              <StatusResult />
              <button
                onClick={handleCekDataLain}
                className="w-full min-h-[44px] mt-8 py-3 text-[14px] font-semibold text-[#3c4a42] bg-white border border-[#bbcabf] rounded-lg hover:bg-[#f2f4f6] dark:text-[#eef2f4] dark:bg-[#1a2723] dark:border-[#5f736b] dark:hover:bg-[#22322d] transition-colors cursor-pointer"
              >
                Cek Data Lain / Hapus Riwayat
              </button>
            </>
          )}
        </div>
      </main>

      {/* Hidden print-ready full-bleed container for PNG HD & CR80 PDF generation */}
      {statusData && (statusData.status === "APPROVED" || statusData.status === "ACTIVE") && (
        <div className="absolute -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
          <PublicIdCard
            userData={statusData}
            printMode
            frontId="id-card-print-front"
            backId="id-card-print-back"
          />
        </div>
      )}

      <LoadingOverlay />
    </div>
  );
}
