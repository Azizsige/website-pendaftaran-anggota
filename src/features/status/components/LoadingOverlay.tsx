"use client";

import { useCekStatusStore } from "@/store/useCekStatusStore";

export const LoadingOverlay = () => {
  const { isDownloading } = useCekStatusStore();

  if (!isDownloading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/65 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-[#131d1a] border border-transparent dark:border-[#3c4d46] p-6 rounded-2xl shadow-xl flex flex-col items-center animate-fade-in">
        <div className="w-10 h-10 border-4 border-[#006c49]/30 border-t-[#006c49] dark:border-[#34d399]/30 dark:border-t-[#34d399] rounded-full spinner-essential mb-4"></div>
        <p className="font-semibold text-[#191c1e] dark:text-[#eef2f4]">Menyiapkan ID Card...</p>
        <p className="text-sm text-[#3c4a42] dark:text-[#cbd6d0] mt-1 text-center max-w-[200px]">Mohon tunggu sebentar, sedang memproses gambar tingkat tinggi.</p>
      </div>
    </div>
  );
};
