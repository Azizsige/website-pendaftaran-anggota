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
      <header className="bg-white border-b border-[#bbcabf] sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#006c49] rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">school</span>
            </div>
            <span className="font-bold text-[#191c1e] text-lg tracking-tight hidden sm:block">BEM FT UNSRI</span>
          </Link>
          <Link href="/" className="text-[14px] font-semibold text-[#006c49] hover:bg-[#006c49]/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#bbcabf]/50 p-6 md:p-8">
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
