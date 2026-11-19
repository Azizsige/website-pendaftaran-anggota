"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Hourglass, Info, RefreshCw, X } from "lucide-react";
import { useCekStatusStore } from "@/store/useCekStatusStore";
import { DownloadSection } from "./DownloadSection";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { RejectionHistorySection } from "@/components/shared/RejectionHistorySection";
import { useRegistrationStore } from "@/store/useRegistrationStore";
import { useRouter } from "next/navigation";
import { formatDateTime, formatIndonesianPhoneInput } from "@/lib/format";
import { checkRegistrationStatus } from "@/actions/status-actions";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Turnstile } from "@marsidev/react-turnstile";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export const StatusResult = () => {
  const { statusData, setStatusData, nim, email } = useCekStatusStore();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPreparingReapply, setIsPreparingReapply] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const reviewRef = useRef<HTMLDivElement>(null);
  const decisionRef = useRef<HTMLDivElement>(null);
  const isFinalized = Boolean(statusData && statusData.status !== "PENDING");

  useEffect(() => {
    if (!statusData) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const targetEl = isFinalized ? decisionRef.current : reviewRef.current;
    if (!targetEl) return;

    const scrollTimer = window.setTimeout(() => {
      targetEl.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }, 120);

    return () => window.clearTimeout(scrollTimer);
  }, [statusData, isFinalized]);

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
    updateField(
      "noTelepon",
      formatIndonesianPhoneInput(statusData.phoneNumber || "", { ensureLeadingZero: true })
    );
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
      } catch {
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
    } catch {
      toast.error("Terjadi kesalahan sistem saat memperbarui.");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!statusData) return null;

  return (
    <div className="flex flex-col animate-fade-in relative">
      {/* Hidden Turnstile for refresh */}
      <div className="hidden">
        <Turnstile
          key={resolvedTheme}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
          options={{ theme: resolvedTheme }}
          onSuccess={(token) => setTurnstileToken(token)}
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#191c1e] dark:text-[#eef2f4]">Hasil Pencarian</h2>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing || !turnstileToken}
          className="p-2 min-h-[44px] min-w-[44px] text-[#006c49] dark:text-[#34d399] hover:bg-[#006c49]/10 dark:hover:bg-[#34d399]/15 rounded-full transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
          title="Perbarui Status"
          aria-label="Perbarui Status"
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
        </button>
      </div>

      <div className="bg-[#e0e3e5]/50 dark:bg-[#1a2723] border border-[#bbcabf] dark:border-[#3c4d46] rounded-xl p-4 flex gap-3 mb-6">
        <MemberAvatar
          src={statusData.photoUrl}
          name={statusData.name}
          fallbackInitials="CA"
          sizeClass="h-10 w-10"
        />
        <div>
          <h3 className="font-bold text-[#191c1e] dark:text-[#eef2f4] leading-tight">{statusData.name}</h3>
          <p className="text-sm text-[#3c4a42] dark:text-[#cbd6d0] mt-0.5">{statusData.nim} • {statusData.faculty}</p>
        </div>
      </div>

      <h4 className="font-semibold text-[#191c1e] dark:text-[#eef2f4] mb-4 pb-2 border-b border-[#bbcabf]/30 dark:border-[#3c4d46]">Timeline Proses</h4>
      
      <div className="flex flex-col gap-6 ml-2 mb-6">
        {/* Step 1: Pendaftaran Diterima */}
        <div className="flex gap-4 relative">
          <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-[#006c49] dark:bg-[#10b981]"></div>
          <div className="w-6 h-6 rounded-full bg-[#006c49] dark:bg-[#057a55] flex items-center justify-center text-white shrink-0 z-10 ring-4 ring-white dark:ring-[#131d1a]">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
          <div>
            <h5 className="font-semibold text-[#191c1e] dark:text-[#eef2f4] text-[15px]">Pendaftaran Diterima</h5>
            <p className="text-[#3c4a42] dark:text-[#cbd6d0] text-[13px] mt-0.5">Data pendaftaran berhasil masuk ke sistem.</p>
            {statusData.joinDate && (
              <p className="text-[#6c7a71] dark:text-[#94a89e] text-[12px] mt-1">{formatDateTime(statusData.joinDate)} WIB</p>
            )}
          </div>
        </div>

        {/* Step 2: Sedang Direview */}
        <div
          id="status-review-section"
          ref={reviewRef}
          className="flex gap-4 relative scroll-mt-24"
        >
          {isFinalized && <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-[#006c49] dark:bg-[#10b981]"></div>}
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-[#131d1a] ${isFinalized ? 'bg-[#006c49] dark:bg-[#057a55] text-white' : 'bg-[#e0e3e5] dark:bg-[#1a2723] border-2 border-[#bbcabf] dark:border-[#5f736b] text-[#006c49] dark:text-[#34d399]'}`}>
            {isFinalized ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Hourglass className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </div>
          <div>
            <h5 className={`font-semibold text-[15px] ${isFinalized ? 'text-[#191c1e] dark:text-[#eef2f4]' : 'text-[#006c49] dark:text-[#34d399]'}`}>Sedang Direview</h5>
            <p className="text-[#3c4a42] dark:text-[#cbd6d0] text-[13px] mt-0.5">Data Anda sedang diperiksa oleh panitia.</p>
          </div>
        </div>

        {/* Step 3: Keputusan (Hanya jika Finalized) */}
        {isFinalized && (
          <div
            id="status-decision-section"
            ref={decisionRef}
            className="flex gap-4 relative mt-2 scroll-mt-24"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-[#131d1a] ${statusData.status === 'APPROVED' || statusData.status === 'ACTIVE' ? 'bg-[#006c49] dark:bg-[#057a55] text-white' : statusData.status === 'SUSPENDED' ? 'bg-[#ea580c] text-white' : statusData.status === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-[#e0e3e5] dark:bg-[#1a2723] border-2 border-[#bbcabf] dark:border-[#5f736b] text-[#3c4a42] dark:text-[#cbd6d0]'}`}>
              {statusData.status === 'APPROVED' || statusData.status === 'ACTIVE' ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : statusData.status === 'REJECTED' || statusData.status === 'SUSPENDED' ? (
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </div>
            <div>
              <h5 className={`font-semibold text-[15px] ${statusData.status === 'SUSPENDED' ? 'text-[#9a3412] dark:text-[#fdba74]' : statusData.status === 'REJECTED' ? 'text-red-700 dark:text-[#fca5a5]' : 'text-[#191c1e] dark:text-[#eef2f4]'}`}>
                {getStatusInfo(statusData.status).title}
              </h5>
              <p className="text-[#3c4a42] dark:text-[#cbd6d0] text-[13px] mt-0.5">{getStatusInfo(statusData.status).desc}</p>
              {statusData.updatedAt && (
                <p className="text-[#6c7a71] dark:text-[#94a89e] text-[12px] mt-1">{formatDateTime(statusData.updatedAt)} WIB</p>
              )}
              
              {statusData.status === "REJECTED" && statusData.adminNotes && (
                <div className="mt-2 p-3 bg-red-50 text-red-700 dark:bg-[#3b1214] dark:text-[#fca5a5] text-sm rounded-lg border border-red-200 dark:border-[#f87171]/35">
                  <strong className="block mb-1">Catatan Admin:</strong> 
                  {statusData.adminNotes}
                </div>
              )}

              {statusData.status === "SUSPENDED" && (
                <div className="mt-2 space-y-1 p-3 bg-[#fff7ed] text-[#9a3412] dark:bg-[#431407] dark:text-[#fdba74] text-sm rounded-lg border border-[#fdba74] dark:border-[#fb923c]/40">
                  {statusData.adminNotes && (
                    <p>
                      <strong>Alasan Pembekuan:</strong> {statusData.adminNotes}
                    </p>
                  )}
                  <p className="text-xs font-medium">
                    {statusData.suspendedUntil
                      ? `Durasi hingga: ${formatDateTime(statusData.suspendedUntil)} WIB`
                      : "Pembekuan berlaku hingga diaktifkan kembali oleh panitia."}
                  </p>
                </div>
              )}

              {statusData.status === "REJECTED" && (
                <button
                  onClick={handleReapply}
                  disabled={isPreparingReapply}
                  className="mt-4 w-full min-h-[44px] cursor-pointer py-2.5 px-4 bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] disabled:bg-gray-400 dark:disabled:bg-slate-700 text-white text-[14px] font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  {isPreparingReapply ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="h-[18px] w-[18px]" aria-hidden="true" />
                  )}
                  {isPreparingReapply ? "Menyiapkan Data..." : "Daftar Ulang"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <RejectionHistorySection
        items={statusData.rejectionHistories ?? []}
        variant="public"
      />

      <DownloadSection />
    </div>
  );
};
