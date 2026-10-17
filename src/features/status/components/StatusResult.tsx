"use client";

import { useState } from "react";
import { useCekStatusStore } from "@/store/useCekStatusStore";
import { DownloadSection } from "./DownloadSection";
import { useRegistrationStore } from "@/store/useRegistrationStore";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/format";
import { checkRegistrationStatus } from "@/actions/status-actions";
import { Turnstile } from "@marsidev/react-turnstile";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export const StatusResult = () => {
  const { statusData, setStatusData, nim, email } = useCekStatusStore();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPreparingReapply, setIsPreparingReapply] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { 
          title: "Sedang Direview", 
          desc: "Data Anda sedang diperiksa oleh panitia. Mohon tunggu informasi selanjutnya.",
        };
      case 'APPROVED':
        return { 
          title: "Pendaftaran Diterima!", 
          desc: "Selamat! Pendaftaran Anda telah disetujui. Anda resmi menjadi anggota.",
        };
      case 'ACTIVE':
        return { 
          title: "Anggota Aktif", 
          desc: "Status keanggotaan Anda saat ini aktif. Anda dapat mengunduh ID Card.",
        };
      case 'REJECTED':
        return { 
          title: "Pendaftaran Ditolak", 
          desc: "Mohon maaf, pendaftaran Anda belum dapat kami terima saat ini.",
        };
      case 'SUSPENDED':
        return { 
          title: "Keanggotaan Ditangguhkan", 
          desc: "Keanggotaan Anda sedang ditangguhkan. Silakan hubungi admin untuk informasi lebih lanjut.",
        };
      default:
        return { 
          title: "Status Tidak Diketahui", 
          desc: "Status Anda tidak dapat dipastikan. Silakan hubungi administrator.",
        };
    }
  };

  const handleReapply = async () => {
    if (!statusData) return;
    setIsPreparingReapply(true);
    const { updateField } = useRegistrationStore.getState();
    
    updateField("namaLengkap", statusData.name || "");
    updateField("nim", statusData.nim || "");
    updateField("email", statusData.email || "");
    updateField("noTelepon", statusData.phoneNumber || "");
    updateField("tempatLahir", statusData.placeOfBirth || "");
    if (statusData.dateOfBirth) {
      updateField("tanggalLahir", new Date(statusData.dateOfBirth).toISOString().split('T')[0]);
    }
    updateField("jenisKelamin", statusData.gender || "");
    updateField("alamat", statusData.address || "");
    updateField("fakultas", statusData.faculty || "");
    updateField("jurusan", statusData.major || "");
    updateField("angkatan", statusData.batchYear || "");
    
    const base64ToFile = (dataUrl: string, filename: string) => {
      try {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      } catch (e) {
        return null;
      }
    };
    
    try {
      if (statusData.photoUrl && statusData.photoUrl !== "null" && statusData.photoUrl.startsWith("data:")) {
        const file = base64ToFile(statusData.photoUrl, "pasfoto.jpg");
        if (file) updateField("pasFoto", file);
      }
      if (statusData.ktmImageUrl && statusData.ktmImageUrl !== "null" && statusData.ktmImageUrl.startsWith("data:")) {
        const file = base64ToFile(statusData.ktmImageUrl, "ktm.jpg");
        if (file) updateField("fotoKTM", file);
      }
    } catch (e) {
      logger.error("Gagal memuat ulang foto:", e);
    }
    
    useRegistrationStore.setState({ currentStep: 1, isReapplying: true });
    router.push("/daftar");
  };

  const handleRefresh = async () => {
    if (!turnstileToken) {
      toast.error("Validasi keamanan belum siap. Tunggu sebentar.");
      return;
    }
    setIsRefreshing(true);
    try {
      const result = await checkRegistrationStatus(nim, email, turnstileToken);
      if (result.success && result.data) {
        setStatusData(result.data);
        toast.success("Status berhasil diperbarui");
      } else {
        toast.error(result.message || "Gagal memperbarui status.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem saat memperbarui.");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!statusData) return null;

  const isPending = statusData.status === 'PENDING';
  const isFinalized = statusData.status !== 'PENDING';

  return (
    <div className="flex flex-col animate-fade-in relative">
      {/* Hidden Turnstile for refresh */}
      <div className="hidden">
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
          onSuccess={(token) => setTurnstileToken(token)}
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#191c1e]">Hasil Pencarian</h2>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing || !turnstileToken}
          className="p-2 text-[#006c49] hover:bg-[#006c49]/10 rounded-full transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
          title="Perbarui Status"
        >
          <span className={`material-symbols-outlined ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
        </button>
      </div>

      <div className="bg-[#e0e3e5]/50 border border-[#bbcabf] rounded-xl p-4 flex gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-white border border-[#bbcabf] flex items-center justify-center shrink-0">
           <span className="material-symbols-outlined text-[#006c49]">person</span>
        </div>
        <div>
          <h3 className="font-bold text-[#191c1e] leading-tight">{statusData.name}</h3>
          <p className="text-sm text-[#3c4a42] mt-0.5">{statusData.nim} • {statusData.faculty}</p>
        </div>
      </div>

      <h4 className="font-semibold text-[#191c1e] mb-4 pb-2 border-b border-[#bbcabf]/30">Timeline Proses</h4>
      
      <div className="flex flex-col gap-6 ml-2 mb-6">
        {/* Step 1: Pendaftaran Diterima */}
        <div className="flex gap-4 relative">
          <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-[#006c49]"></div>
          <div className="w-6 h-6 rounded-full bg-[#006c49] flex items-center justify-center text-white shrink-0 z-10 ring-4 ring-white">
            <span className="material-symbols-outlined text-[14px]">check</span>
          </div>
          <div>
            <h5 className="font-semibold text-[#191c1e] text-[15px]">Pendaftaran Diterima</h5>
            <p className="text-[#3c4a42] text-[13px] mt-0.5">Data pendaftaran berhasil masuk ke sistem.</p>
            {statusData.joinDate && (
              <p className="text-[#74777f] text-[12px] mt-1">{formatDateTime(statusData.joinDate)} WIB</p>
            )}
          </div>
        </div>

        {/* Step 2: Sedang Direview */}
        <div className="flex gap-4 relative">
          {isFinalized && <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-[#006c49]"></div>}
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-white ${isFinalized ? 'bg-[#006c49] text-white' : 'bg-[#e0e3e5] border-2 border-[#bbcabf] text-[#006c49]'}`}>
            <span className="material-symbols-outlined text-[14px]">
              {isFinalized ? 'check' : 'hourglass_empty'}
            </span>
          </div>
          <div>
            <h5 className={`font-semibold text-[15px] ${isFinalized ? 'text-[#191c1e]' : 'text-[#006c49]'}`}>Sedang Direview</h5>
            <p className="text-[#3c4a42] text-[13px] mt-0.5">Data Anda sedang diperiksa oleh panitia.</p>
          </div>
        </div>

        {/* Step 3: Keputusan (Hanya jika Finalized) */}
        {isFinalized && (
          <div className="flex gap-4 relative mt-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-white ${statusData.status === 'APPROVED' || statusData.status === 'ACTIVE' ? 'bg-[#006c49] text-white' : statusData.status === 'REJECTED' || statusData.status === 'SUSPENDED' ? 'bg-red-500 text-white' : 'bg-[#e0e3e5] border-2 border-[#bbcabf] text-[#3c4a42]'}`}>
              <span className="material-symbols-outlined text-[14px]">
                {statusData.status === 'APPROVED' || statusData.status === 'ACTIVE' ? 'check' : statusData.status === 'REJECTED' || statusData.status === 'SUSPENDED' ? 'close' : 'info'}
              </span>
            </div>
            <div>
              <h5 className={`font-semibold text-[15px] ${statusData.status === 'REJECTED' || statusData.status === 'SUSPENDED' ? 'text-red-600' : 'text-[#191c1e]'}`}>
                {getStatusInfo(statusData.status).title}
              </h5>
              <p className="text-[#3c4a42] text-[13px] mt-0.5">{getStatusInfo(statusData.status).desc}</p>
              {statusData.updatedAt && (
                <p className="text-[#74777f] text-[12px] mt-1">{formatDateTime(statusData.updatedAt)} WIB</p>
              )}
              
              {(statusData.status === "REJECTED" || statusData.status === "SUSPENDED") && statusData.adminNotes && (
                <div className="mt-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  <strong className="block mb-1">Catatan Admin:</strong> 
                  {statusData.adminNotes}
                </div>
              )}

              {statusData.status === "REJECTED" && (
                <button
                  onClick={handleReapply}
                  disabled={isPreparingReapply}
                  className="mt-4 w-full py-2.5 px-4 bg-[#006c49] hover:bg-[#005236] disabled:bg-gray-400 text-white text-[14px] font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  {isPreparingReapply ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                  )}
                  {isPreparingReapply ? "Menyiapkan Data..." : "Daftar Ulang"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <DownloadSection />
    </div>
  );
};
