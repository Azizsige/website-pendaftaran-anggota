import { useCekStatusStore } from "@/store/useCekStatusStore";

export const LoadingOverlay = () => {
  const { isDownloading } = useCekStatusStore();

  if (!isDownloading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center animate-fade-in">
        <div className="w-10 h-10 border-4 border-[#006c49]/30 border-t-[#006c49] rounded-full animate-spin mb-4"></div>
        <p className="font-semibold text-[#191c1e]">Menyiapkan ID Card...</p>
        <p className="text-sm text-[#3c4a42] mt-1 text-center max-w-[200px]">Mohon tunggu sebentar, sedang memproses gambar tingkat tinggi.</p>
      </div>
    </div>
  );
};
