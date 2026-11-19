"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Clock, Hourglass, Info, Loader2, RefreshCw, ShieldAlert, X } from "lucide-react";
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

interface StatusResultProps {
  onBack: () => void;
  onReset: () => void;
}

export const StatusResult = ({ onBack, onReset }: StatusResultProps) => {
  const { statusData, setStatusData, nim, email } = useCekStatusStore();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPreparingReapply, setIsPreparingReapply] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!statusData || !cardRef.current) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scrollTimer = window.setTimeout(() => {
      cardRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: window.innerWidth < 768 ? "start" : "center",
      });
    }, 120);

    return () => window.clearTimeout(scrollTimer);
  }, [statusData]);

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
      updateField("tanggalLahir", new Date(statusData.dateOfBirth).toISOString().split("T")[0]);
    }
    updateField("jenisKelamin", statusData.gender || "");
    updateField("alamat", statusData.address || "");
    updateField("fakultas", statusData.faculty || "");
    updateField("jurusan", statusData.major || "");
    updateField("angkatan", statusData.batchYear || "");

    const base64ToFile = (dataUrl: string, filename: string) => {
      try {
        const arr = dataUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      } catch {
        return null;
      }
    };

    try {
      if (
        statusData.photoUrl &&
        statusData.photoUrl !== "null" &&
        statusData.photoUrl.startsWith("data:")
      ) {
        const file = base64ToFile(statusData.photoUrl, "pasfoto.jpg");
        if (file) updateField("pasFoto", file);
      }
      if (
        statusData.ktmImageUrl &&
        statusData.ktmImageUrl !== "null" &&
        statusData.ktmImageUrl.startsWith("data:")
      ) {
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
        toast.success("Status berhasil diperbarui.");
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

  const status = statusData.status;
  const isAccepted = status === "ACTIVE" || status === "APPROVED";
  const isRejected = status === "REJECTED";
  const isSuspended = status === "SUSPENDED";
  const isPending = status === "PENDING";
  const isFinalized = !isPending;
  const rejectionHistories = statusData.rejectionHistories ?? [];

  const badgeMeta = isAccepted
    ? {
        label: status === "APPROVED" ? "Diterima" : "Anggota aktif",
        className:
          "text-[#005236] bg-[#e6f4ee] border-[#006c49]/35 dark:text-[#34d399] dark:bg-[#34d399]/12 dark:border-[#34d399]/35",
      }
    : isRejected
    ? {
        label: "Ditolak",
        className:
          "text-[#991b1b] bg-[#fef2f2] border-[#ba1a1a]/35 dark:text-[#f87171] dark:bg-[#f87171]/10 dark:border-[#f87171]/40",
      }
    : isSuspended
    ? {
        label: "Ditangguhkan",
        className:
          "text-[#9a3412] bg-[#fff7ed] border-[#fdba74] dark:text-[#fdba74] dark:bg-[#431407] dark:border-[#fb923c]/45",
      }
    : {
        label: "Sedang direview",
        className:
          "text-[#92400e] bg-[#fef3c7] border-[#f59e0b]/45 dark:text-[#fbbf24] dark:bg-[#fbbf24]/10 dark:border-[#fbbf24]/40",
      };

  const step3Meta = isAccepted
    ? {
        title: status === "APPROVED" ? "Pendaftaran diterima" : "Anggota aktif",
        sub: "Keanggotaan aktif",
        dotClass: "bg-[#006c49] dark:bg-[#0f7a58] text-white",
        titleClass: "text-[#191c1e] dark:text-[#e9f1ee]",
        icon: <Check className="w-[13px] h-[13px]" strokeWidth={3} aria-hidden="true" />,
      }
    : isRejected
    ? {
        title: "Pendaftaran ditolak",
        sub: "Belum dapat diterima",
        dotClass: "bg-[#b42323] text-white",
        titleClass: "text-[#ba1a1a] dark:text-[#f87171]",
        icon: <X className="w-[13px] h-[13px]" strokeWidth={3} aria-hidden="true" />,
      }
    : isSuspended
    ? {
        title: "Ditangguhkan",
        sub: "Keanggotaan dibekukan",
        dotClass: "bg-[#c2410c] text-white",
        titleClass: "text-[#9a3412] dark:text-[#fdba74]",
        icon: <X className="w-[13px] h-[13px]" strokeWidth={3} aria-hidden="true" />,
      }
    : {
        title: "Menunggu keputusan",
        sub: "Antrean verifikasi",
        dotClass:
          "bg-[#e6e8ea] dark:bg-[#1a2824] border border-[#5c6b62] dark:border-[#3b524b] text-[#4b5850] dark:text-[#9fb3ac]",
        titleClass: "text-[#4b5850] dark:text-[#9fb3ac]",
        icon: <Clock className="w-[13px] h-[13px]" aria-hidden="true" />,
      };

  const joinTimestamp = statusData.joinDate ? `${formatDateTime(statusData.joinDate)} WIB` : "";
  const updatedTimestamp = statusData.updatedAt ? `${formatDateTime(statusData.updatedAt)} WIB` : "";

  return (
    <section
      id="status-result-section"
      ref={cardRef}
      className="scroll-mt-20 w-full max-w-[960px] bg-white dark:bg-[#121c19] border border-[#5c6b62]/25 dark:border-[#2a3b36] rounded-[16px] shadow-sm overflow-hidden flex flex-col animate-fade-in"
    >
      {/* Hidden Turnstile for refresh action */}
      <div className="hidden">
        <Turnstile
          key={resolvedTheme}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
          options={{ theme: resolvedTheme }}
          onSuccess={(token) => setTurnstileToken(token)}
        />
      </div>

      {/* Header */}
      <header className="flex items-center gap-3 px-4 sm:px-6 py-3.5 border-b border-[#5c6b62]/20 dark:border-[#2a3b36]">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali ke form pencarian"
          title="Kembali"
          className="min-w-[44px] min-h-[44px] cursor-pointer rounded-[10px] border border-[#5c6b62]/35 dark:border-[#2a3b36] bg-transparent text-[#3c4a42] hover:text-[#191c1e] hover:border-[#3c4a42] dark:text-[#9fb3ac] dark:hover:text-[#e9f1ee] dark:hover:border-[#3b524b] flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#006c49]/40 dark:focus-visible:ring-[#34d399]/50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[17px] font-bold text-[#191c1e] dark:text-[#e9f1ee] leading-snug">
            Cek status pendaftaran
          </h1>
          <p className="text-[12.5px] text-[#4b5850] dark:text-[#9fb3ac] mt-0.5 truncate">
            {isAccepted
              ? "Lihat perkembangan status dan unduh Kartu Tanda Anggota Anda."
              : "Lihat perkembangan status pendaftaran Anda."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing || !turnstileToken}
          aria-label="Segarkan status"
          title="Segarkan status"
          className="min-w-[44px] min-h-[44px] cursor-pointer rounded-[10px] border border-[#5c6b62]/35 dark:border-[#2a3b36] bg-transparent text-[#3c4a42] hover:text-[#191c1e] hover:border-[#3c4a42] dark:text-[#9fb3ac] dark:hover:text-[#e9f1ee] dark:hover:border-[#3b524b] flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#006c49]/40 dark:focus-visible:ring-[#34d399]/50 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "spinner-essential" : ""}`}
            aria-hidden="true"
          />
        </button>
      </header>

      {/* Body: 2-Column Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 md:gap-y-0 md:gap-x-7 px-4 sm:px-6 py-5">
        {/* Left Panel: Status Pendaftaran */}
        <div className="flex flex-col gap-3.5 min-w-0">
          <h2 className="font-sans text-[13px] font-bold text-[#006c49] dark:text-[#34d399]">
            Status pendaftaran
          </h2>

          {/* Member Card */}
          <div className="flex items-center gap-3 px-3.5 py-3 rounded-[12px] bg-[#f7f9fb] dark:bg-[#1a2824] border border-[#5c6b62]/20 dark:border-[#2a3b36]">
            <MemberAvatar
              src={statusData.photoUrl}
              name={statusData.name}
              fallbackInitials="CA"
              sizeClass="h-11 w-11"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-[#191c1e] dark:text-[#e9f1ee] truncate leading-snug">
                {statusData.name}
              </p>
              <p className="text-[12.5px] text-[#4b5850] dark:text-[#9fb3ac] truncate mt-0.5">
                {statusData.nim}
                {statusData.faculty ? ` • ${statusData.faculty}` : ""}
              </p>
            </div>
            <span
              className={`hidden sm:inline-flex items-center text-[12px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0 ${badgeMeta.className}`}
            >
              {badgeMeta.label}
            </span>
          </div>

          {/* Horizontal 3-Step Timeline */}
          <ol aria-label="Timeline proses" className="flex list-none m-0 p-0">
            {/* Step 1: Pendaftaran diterima */}
            <li className="flex-1 relative min-w-0 pr-2.5">
              <span
                aria-hidden="true"
                className="absolute top-[11px] left-[32px] right-[8px] h-[2px] rounded-full bg-[#006c49]/60 dark:bg-[#34d399]/60"
              />
              <div className="w-6 h-6 rounded-full bg-[#006c49] dark:bg-[#0f7a58] text-white flex items-center justify-center mb-2 relative z-10">
                <Check className="w-[13px] h-[13px]" strokeWidth={3} aria-hidden="true" />
              </div>
              <p className="text-[13px] font-bold text-[#191c1e] dark:text-[#e9f1ee] leading-snug">
                Pendaftaran diterima
              </p>
              <p className="hidden sm:block text-[12px] text-[#4b5850] dark:text-[#9fb3ac] mt-0.5 leading-snug">
                Masuk ke sistem
              </p>
              {joinTimestamp && (
                <p className="text-[11.5px] text-[#4b5850] dark:text-[#9fb3ac] mt-0.5 leading-snug tabular-nums">
                  {joinTimestamp}
                </p>
              )}
            </li>

            {/* Step 2: Sedang direview */}
            <li className="flex-1 relative min-w-0 pr-2.5">
              <span
                aria-hidden="true"
                className={`absolute top-[11px] left-[32px] right-[8px] h-[2px] rounded-full ${
                  isFinalized
                    ? isRejected
                      ? "bg-[#ba1a1a]/60 dark:bg-[#f87171]/60"
                      : "bg-[#006c49]/60 dark:bg-[#34d399]/60"
                    : "bg-[#5c6b62]/30 dark:bg-[#3b524b]"
                }`}
              />
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 relative z-10 ${
                  isFinalized
                    ? "bg-[#006c49] dark:bg-[#0f7a58] text-white"
                    : "bg-[#fef3c7] dark:bg-[#fbbf24]/15 border border-[#f59e0b] dark:border-[#fbbf24] text-[#92400e] dark:text-[#fbbf24]"
                }`}
              >
                {isFinalized ? (
                  <Check className="w-[13px] h-[13px]" strokeWidth={3} aria-hidden="true" />
                ) : (
                  <Hourglass className="w-[13px] h-[13px]" aria-hidden="true" />
                )}
              </div>
              <p
                className={`text-[13px] font-bold leading-snug ${
                  isPending
                    ? "text-[#005236] dark:text-[#34d399]"
                    : "text-[#191c1e] dark:text-[#e9f1ee]"
                }`}
              >
                Sedang direview
              </p>
              <p className="hidden sm:block text-[12px] text-[#4b5850] dark:text-[#9fb3ac] mt-0.5 leading-snug">
                Diperiksa panitia
              </p>
              {joinTimestamp && (
                <p className="text-[11.5px] text-[#4b5850] dark:text-[#9fb3ac] mt-0.5 leading-snug tabular-nums">
                  {joinTimestamp}
                </p>
              )}
            </li>

            {/* Step 3: Decision */}
            <li className="flex-1 relative min-w-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 relative z-10 ${step3Meta.dotClass}`}
              >
                {step3Meta.icon}
              </div>
              <p className={`text-[13px] font-bold leading-snug ${step3Meta.titleClass}`}>
                {step3Meta.title}
              </p>
              <p className="hidden sm:block text-[12px] text-[#4b5850] dark:text-[#9fb3ac] mt-0.5 leading-snug">
                {step3Meta.sub}
              </p>
              {isFinalized && updatedTimestamp && (
                <p className="text-[11.5px] text-[#4b5850] dark:text-[#9fb3ac] mt-0.5 leading-snug tabular-nums">
                  {updatedTimestamp}
                </p>
              )}
            </li>
          </ol>

          {/* Status Note / Alert Box */}
          {isAccepted && (
            <p className="m-0 px-3 py-2.5 rounded-[10px] bg-[#e6f4ee] dark:bg-[#34d399]/10 border border-[#006c49]/25 dark:border-[#34d399]/25 text-[13px] leading-[1.45] text-[#00422b] dark:text-[#e9f1ee]">
              {status === "APPROVED"
                ? "Selamat! Pendaftaran Anda telah disetujui. Anda resmi menjadi anggota dan dapat mengunduh ID Card."
                : "Status keanggotaan Anda saat ini aktif. Anda dapat mengunduh ID Card."}
            </p>
          )}

          {isPending && (
            <p className="m-0 px-3 py-2.5 rounded-[10px] bg-[#fef3c7]/75 dark:bg-[#fbbf24]/10 border border-[#f59e0b]/40 dark:border-[#fbbf24]/30 text-[13px] leading-[1.45] text-[#78350f] dark:text-[#e9f1ee]">
              Data Anda sedang diperiksa oleh panitia. Gunakan tombol segarkan di pojok kanan atas untuk memeriksa pembaruan status.
            </p>
          )}

          {isRejected && (
            <div
              role="alert"
              className="px-3.5 py-3 rounded-[12px] bg-[#fef2f2] dark:bg-[#f87171]/10 border border-[#ba1a1a]/35 dark:border-[#f87171]/40 grid gap-2"
            >
              <p className="text-[13.5px] font-bold text-[#991b1b] dark:text-[#f87171] leading-snug">
                Mohon maaf, pendaftaran Anda belum dapat kami terima saat ini.
              </p>
              {statusData.adminNotes && (
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-2 border-t border-dashed border-[#ba1a1a]/30 dark:border-[#f87171]/40 text-[13px]">
                  <span className="text-[#4b5850] dark:text-[#9fb3ac] shrink-0">
                    Catatan admin:
                  </span>
                  <strong className="text-[#191c1e] dark:text-[#e9f1ee] break-words">
                    {statusData.adminNotes}
                  </strong>
                </div>
              )}
            </div>
          )}

          {isSuspended && (
            <div
              role="alert"
              className="px-3.5 py-3 rounded-[12px] bg-[#fff7ed] dark:bg-[#431407] border border-[#fdba74] dark:border-[#fb923c]/40 grid gap-1.5 text-[13px]"
            >
              <p className="font-bold text-[#9a3412] dark:text-[#fdba74]">
                Keanggotaan Anda sedang ditangguhkan sementara.
              </p>
              {statusData.adminNotes && (
                <p className="text-[#7c2d12] dark:text-[#fed7aa]">
                  <strong>Alasan pembekuan:</strong> {statusData.adminNotes}
                </p>
              )}
              <p className="text-[12px] font-medium text-[#9a3412] dark:text-[#fdba74]">
                {statusData.suspendedUntil
                  ? `Durasi hingga: ${formatDateTime(statusData.suspendedUntil)} WIB`
                  : "Pembekuan berlaku hingga diaktifkan kembali oleh panitia."}
              </p>
            </div>
          )}

          {/* Accepted member who previously had rejections (3-4x rejected then approved): compact collapsed disclosure */}
          {isAccepted && rejectionHistories.length > 0 && (
            <RejectionHistorySection
              items={rejectionHistories}
              variant="public"
              title="Riwayat penolakan sebelumnya"
              compact
            />
          )}
        </div>

        {/* Right Panel: Contextual by Status */}
        <div className="flex flex-col gap-3.5 min-w-0 pt-4 border-t border-[#5c6b62]/20 dark:border-[#2a3b36] md:pt-0 md:border-t-0 md:pl-7 md:border-l">
          {isAccepted && <DownloadSection />}

          {isRejected && (
            <RejectionHistorySection
              items={rejectionHistories}
              variant="public"
              title="Riwayat penolakan"
              defaultOpenDesktop
              emptyMessage={
                statusData.adminNotes
                  ? `Catatan terakhir panitia: ${statusData.adminNotes}`
                  : "Belum ada catatan riwayat penolakan tambahan."
              }
            />
          )}

          {isPending && rejectionHistories.length > 0 && (
            <RejectionHistorySection
              items={rejectionHistories}
              variant="public"
              title="Riwayat penolakan sebelumnya"
              defaultOpenDesktop
            />
          )}

          {isPending && rejectionHistories.length === 0 && (
            <div className="flex flex-col gap-3 min-w-0">
              <h2 className="font-sans text-[13px] font-bold text-[#006c49] dark:text-[#34d399]">
                Informasi tahapan verifikasi
              </h2>
              <div className="rounded-[12px] border border-[#5c6b62]/20 dark:border-[#2a3b36] bg-[#f7f9fb] dark:bg-[#1a2824] p-4 flex items-start gap-3">
                <Info
                  className="h-5 w-5 text-[#006c49] dark:text-[#34d399] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="space-y-1.5 text-[13px] leading-relaxed text-[#3c4a42] dark:text-[#9fb3ac]">
                  <p className="font-bold text-[#191c1e] dark:text-[#e9f1ee]">
                    Berkas masuk antrean panitia
                  </p>
                  <p>
                    Panitia sedang memverifikasi kecocokan data akademik dan dokumen KTM Anda. Setelah disetujui, Kartu Tanda Anggota (KTA) dapat langsung diunduh dari halaman ini.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isSuspended && (
            <div className="flex flex-col gap-3 min-w-0">
              <h2 className="font-sans text-[13px] font-bold text-[#9a3412] dark:text-[#fdba74]">
                Akses KTA dibekukan sementara
              </h2>
              <div className="rounded-[12px] border border-[#fdba74] dark:border-[#fb923c]/35 bg-[#fff7ed] dark:bg-[#1a2824] p-4 flex items-start gap-3">
                <ShieldAlert
                  className="h-5 w-5 text-[#9a3412] dark:text-[#fdba74] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="space-y-1.5 text-[13px] leading-relaxed text-[#7c2d12] dark:text-[#9fb3ac]">
                  <p className="font-bold text-[#9a3412] dark:text-[#e9f1ee]">
                    Pengunduhan KTA tidak tersedia
                  </p>
                  <p>
                    Selama status keanggotaan ditangguhkan, KTA digital tidak berlaku dan tidak dapat diunduh. Silakan hubungi pengurus organisasi untuk klarifikasi lebih lanjut.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`px-4 sm:px-6 py-3 border-t border-[#5c6b62]/20 dark:border-[#2a3b36] bg-[#f7f9fb]/70 dark:bg-[#121c19] flex flex-wrap items-center gap-2.5 ${
          isRejected ? "justify-between" : "justify-end"
        }`}
      >
        {isRejected && (
          <span className="hidden md:inline text-[12.5px] text-[#4b5850] dark:text-[#9fb3ac]">
            Perbaiki data sesuai catatan admin sebelum mendaftar ulang.
          </span>
        )}

        <div
          className={`flex gap-2.5 ${
            isRejected
              ? "w-full md:w-auto flex-col-reverse sm:flex-row"
              : "w-full sm:w-auto"
          }`}
        >
          <button
            type="button"
            onClick={onReset}
            className="min-h-[44px] w-full sm:w-auto cursor-pointer px-4 py-2 rounded-[10px] border border-[#5c6b62]/35 dark:border-[#2a3b36] bg-transparent hover:bg-[#fef2f2] dark:hover:bg-[#f87171]/10 text-[#ba1a1a] dark:text-[#f87171] font-bold text-[13px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#ba1a1a]/35 dark:focus-visible:ring-[#f87171]/40 transition-colors"
          >
            Cek data lain / Hapus riwayat
          </button>

          {isRejected && (
            <button
              type="button"
              onClick={handleReapply}
              disabled={isPreparingReapply}
              className="min-h-[44px] w-full sm:w-auto cursor-pointer px-4 py-2 rounded-[10px] bg-[#006c49] hover:bg-[#005236] dark:bg-[#0f7a58] dark:hover:bg-[#0c6a4d] border border-[#006c49] dark:border-[#0f7a58] text-white font-bold text-[13px] inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#006c49]/40 dark:focus-visible:ring-[#34d399]/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isPreparingReapply ? (
                <Loader2 className="h-4 w-4 spinner-essential" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{isPreparingReapply ? "Menyiapkan data..." : "Daftar ulang"}</span>
            </button>
          )}
        </div>
      </footer>
    </section>
  );
};
