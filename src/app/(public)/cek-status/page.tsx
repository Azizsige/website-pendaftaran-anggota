"use client";

import Link from "next/link";
import { useCekStatusStore } from "@/store/useCekStatusStore";
import { PublicIdCard } from "./PublicIdCard";
import { SearchForm } from "./_components/SearchForm";
import { StatusResult } from "./_components/StatusResult";
import { LoadingOverlay } from "./_components/LoadingOverlay";

export default function CekStatusPage() {
  const { statusData, setStatusData } = useCekStatusStore();

  const handleCekDataLain = () => {
    const { reset } = useCekStatusStore.getState();
    reset();
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#f2f4f6] flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 pt-12 md:pt-20">
        <div className="w-full min-w-[320px] sm:min-w-[400px] max-w-[600px] bg-white rounded-2xl shadow-sm border border-[#bbcabf]/50 p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#191c1e] mb-2 tracking-tight">Cek Status Pendaftaran</h1>
            <p className="text-[#74777f] text-sm">Lihat perkembangan status pendaftaran dan unduh Kartu Tanda Anggota Anda.</p>
          </div>

          {!statusData ? (
            <SearchForm />
          ) : (
            <>
              <StatusResult />
              <button
                onClick={handleCekDataLain}
                className="w-full mt-8 py-3 text-[14px] font-semibold text-[#3c4a42] bg-white border border-[#bbcabf] rounded-lg hover:bg-[#f2f4f6] transition-colors"
              >
                Cek Data Lain
              </button>
            </>
          )}
        </div>
      </main>

      {/* Hidden container for ID Card rendering */}
      {statusData && (statusData.status === "APPROVED" || statusData.status === "ACTIVE") && (
        <div style={{ position: "absolute", left: "-9999px", top: 0, pointerEvents: "none" }}>
          <PublicIdCard userData={statusData} />
        </div>
      )}

      <LoadingOverlay />
    </div>
  );
}
