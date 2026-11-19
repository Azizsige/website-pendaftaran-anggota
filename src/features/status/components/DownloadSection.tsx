"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Download, Eye, ImagePlus, Loader2, Pencil, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useCekStatusStore } from "@/store/useCekStatusStore";
import { updateMemberPhoto } from "@/actions/status-actions";
import { PublicIdCard } from "./PublicIdCard";
import { logger } from "@/lib/logger";

export const DownloadSection = () => {
  const {
    statusData,
    setStatusData,
    nim,
    email,
    isUploadingPhoto,
    setIsUploadingPhoto,
    isDownloading,
    setIsDownloading,
  } = useCekStatusStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloadFormat, setDownloadFormat] = useState<"png" | "pdf" | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSide, setPreviewSide] = useState<"both" | "front" | "back">("both");

  useEffect(() => {
    if (!showPreview) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowPreview(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPreview]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const targetRatio = 3 / 4;
        const imgRatio = img.width / img.height;

        let drawWidth = img.width;
        let drawHeight = img.height;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > targetRatio) {
          drawWidth = img.height * targetRatio;
          offsetX = (img.width - drawWidth) / 2;
        } else {
          drawHeight = img.width / targetRatio;
          offsetY = (img.height - drawHeight) / 2;
        }

        canvas.width = 300;
        canvas.height = 400;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight, 0, 0, 300, 400);
          const base64Photo = canvas.toDataURL("image/jpeg", 0.9);

          try {
            const res = await updateMemberPhoto(nim, email, base64Photo);
            if (res.success && statusData) {
              setStatusData({ ...statusData, photoUrl: base64Photo });
              toast.success("Foto profil KTA berhasil diperbarui.");
            } else {
              toast.error(res.message || "Gagal memperbarui foto profil.");
            }
          } catch {
            toast.error("Gagal mengunggah foto. Silakan coba lagi.");
          }
        }
        setIsUploadingPhoto(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const capturePrintCard = async (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return null;

    const { toPng } = await import("html-to-image");
    return toPng(element, {
      pixelRatio: 4,
      cacheBust: true,
      fontEmbedCSS: "",
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      },
    });
  };

  const handleDownloadPng = async () => {
    if (!statusData) return;
    setDownloadFormat("png");
    setIsDownloading(true);
    try {
      const dataUrl = await capturePrintCard("id-card-print-front");
      if (!dataUrl) {
        toast.error("ID Card masih dalam proses pemuatan, silakan tunggu sebentar.");
        return;
      }
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `KTA-${statusData.nim}-Depan.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Gambar PNG HD sisi depan berhasil diunduh.");
    } catch (error) {
      logger.error("Failed to generate PNG ID card:", error);
      toast.error("Gagal mengunduh PNG ID Card. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
      setDownloadFormat(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (!statusData) return;
    setDownloadFormat("pdf");
    setIsDownloading(true);
    try {
      const [frontDataUrl, backDataUrl] = await Promise.all([
        capturePrintCard("id-card-print-front"),
        capturePrintCard("id-card-print-back"),
      ]);

      if (!frontDataUrl || !backDataUrl) {
        toast.error("ID Card masih dalam proses pemuatan, silakan tunggu sebentar.");
        return;
      }

      const { jsPDF } = await import("jspdf");
      // CR80 standard portrait physical card size: 54 x 85.6 mm
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [54, 85.6],
        compress: true,
      });

      pdf.addImage(frontDataUrl, "PNG", 0, 0, 54, 85.6, undefined, "FAST");
      pdf.addPage([54, 85.6], "portrait");
      pdf.addImage(backDataUrl, "PNG", 0, 0, 54, 85.6, undefined, "FAST");
      pdf.save(`KTA-${statusData.nim}-Siap-Cetak.pdf`);
      toast.success("PDF siap cetak CR80 (depan & belakang) berhasil diunduh.");
    } catch (error) {
      logger.error("Failed to generate PDF ID card:", error);
      toast.error("Gagal membuat PDF siap cetak. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
      setDownloadFormat(null);
    }
  };

  if (!statusData || (statusData.status !== "APPROVED" && statusData.status !== "ACTIVE")) {
    return null;
  }

  const hasPhoto = Boolean(
    statusData.photoUrl && statusData.photoUrl !== "null" && statusData.photoUrl !== ""
  );

  return (
    <div className="flex flex-col gap-3.5 min-w-0">
      <h2 className="font-sans text-[13px] font-bold text-[#006c49] dark:text-[#34d399]">
        Kartu Tanda Anggota (KTA)
      </h2>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {!hasPhoto ? (
        <div className="bg-[#fef3c7]/80 border border-[#f59e0b]/45 dark:bg-[#3b2506]/70 dark:border-[#f59e0b]/40 w-full p-5 rounded-[12px] flex flex-col items-center gap-3 text-center">
          <div className="w-11 h-11 rounded-full bg-[#fef3c7] border border-[#f59e0b]/35 dark:bg-[#3b2506] flex items-center justify-center text-[#92400e] dark:text-[#fbbf24]">
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[14px] text-[#92400e] dark:text-[#fbbf24] font-bold">
              Foto profil belum tersedia
            </p>
            <p className="text-[12.5px] text-[#78350f] dark:text-[#fde68a] mt-1 max-w-[320px] leading-relaxed">
              Unggah foto profil terlebih dahulu sebelum mengunduh KTA. Foto otomatis disesuaikan ke rasio 3:4.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="mt-1 min-h-[44px] cursor-pointer bg-[#92400e] text-white hover:bg-[#78350f] transition-colors font-bold py-2 px-5 rounded-[10px] inline-flex items-center gap-2 text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploadingPhoto ? (
              <Loader2 className="w-4 h-4 spinner-essential" aria-hidden="true" />
            ) : (
              <Upload className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{isUploadingPhoto ? "Mengunggah..." : "Unggah foto profil"}</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[88px_1fr] sm:grid-cols-[104px_1fr] gap-4 items-start">
            {/* Mini CR80 card visual thumbnail with real member photo */}
            <div
              aria-label="Pratinjau mini KTA"
              className="aspect-[54/85.6] rounded-[10px] border border-[#5c6b62]/40 dark:border-[#3b524b] relative overflow-hidden bg-[#f4f6f8] shadow-xs"
            >
              <div className="h-[32%] w-full bg-[#16324f]" aria-hidden="true" />
              <div className="absolute left-1/2 top-[17%] -translate-x-1/2 w-[42px] h-[42px] rounded-full border-[3px] border-[#f4f6f8] overflow-hidden bg-[#e9f1ee] shadow-xs">
                <Image
                  src={statusData.photoUrl || ""}
                  alt={`Foto profil ${statusData.name || "anggota"}`}
                  width={42}
                  height={42}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="absolute left-[14%] right-[14%] top-[55%] h-[5px] rounded-[3px] bg-[#16324f]" aria-hidden="true" />
              <div className="absolute left-[14%] right-[30%] top-[63%] h-[5px] rounded-[3px] bg-[#c9d1d8]" aria-hidden="true" />
              <div
                aria-hidden="true"
                className="absolute left-1/2 bottom-[8%] -translate-x-1/2 w-[32px] h-[32px] rounded-[3px]"
                style={{
                  background: "repeating-conic-gradient(#16324f 0 25%, #f4f6f8 0 50%) 0 0 / 8px 8px",
                }}
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-[14.5px] font-bold text-[#191c1e] dark:text-[#e9f1ee] leading-snug mb-1">
                KTA siap diunduh &amp; dicetak
              </h3>
              <p className="text-[12.5px] leading-[1.45] text-[#3c4a42] dark:text-[#9fb3ac] mb-3">
                Format cetak CR80 (54 &times; 85,6 mm), resolusi tinggi, dengan zona aman lanyard dan QR verifikasi resmi.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto || isDownloading}
                className="min-h-[40px] px-3 py-1.5 rounded-[10px] border border-[#5c6b62] dark:border-[#3b524b] bg-transparent hover:bg-[#e6f4ee] dark:hover:bg-[#1a2824] text-[#191c1e] dark:text-[#e9f1ee] font-bold text-[12.5px] inline-flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#006c49]/40 dark:focus-visible:ring-[#34d399]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-3.5 h-3.5 spinner-essential" aria-hidden="true" />
                ) : (
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{isUploadingPhoto ? "Mengunggah..." : "Ganti foto"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading || isUploadingPhoto}
              title="PDF cetak, depan & belakang"
              className="min-h-[44px] cursor-pointer rounded-[10px] bg-[#006c49] hover:bg-[#005236] dark:bg-[#0f7a58] dark:hover:bg-[#0c6a4d] border border-[#006c49] dark:border-[#0f7a58] text-white font-bold text-[13px] px-3.5 py-2 inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#006c49]/40 dark:focus-visible:ring-[#34d399]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDownloading && downloadFormat === "pdf" ? (
                <Loader2 className="w-4 h-4 spinner-essential" aria-hidden="true" />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{isDownloading && downloadFormat === "pdf" ? "Menyiapkan..." : "PDF cetak"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isDownloading || isUploadingPhoto}
              title="PNG resolusi tinggi, tampak depan"
              className="min-h-[44px] cursor-pointer rounded-[10px] border border-[#006c49] dark:border-[#34d399] bg-transparent hover:bg-[#e6f4ee] dark:hover:bg-[#34d399]/10 text-[#005236] dark:text-[#34d399] font-bold text-[13px] px-3.5 py-2 inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#006c49]/40 dark:focus-visible:ring-[#34d399]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDownloading && downloadFormat === "png" ? (
                <Loader2 className="w-4 h-4 spinner-essential" aria-hidden="true" />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" />
              )}
              <span>
                {isDownloading && downloadFormat === "png" ? "Menyiapkan..." : "PNG HD (depan)"}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="self-start min-h-[36px] cursor-pointer inline-flex items-center gap-2 px-1 py-1 rounded-md text-[12.5px] font-bold text-[#005236] dark:text-[#34d399] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            <span>Lihat pratinjau KTA (depan &amp; belakang)</span>
          </button>
        </>
      )}

      {/* Accessible Modal Dialog for Full Front & Back KTA Preview */}
      {showPreview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Kartu Tanda Anggota"
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-[16px] border border-[#5c6b62]/30 dark:border-[#2a3b36] bg-white dark:bg-[#121c19] p-5 sm:p-6 shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#5c6b62]/20 dark:border-[#2a3b36] pb-3">
              <div>
                <h3 className="text-[16px] font-bold text-[#191c1e] dark:text-[#e9f1ee]">
                  Pratinjau KTA (Depan &amp; Belakang)
                </h3>
                <p className="text-[12.5px] text-[#3c4a42] dark:text-[#9fb3ac]">
                  Ukuran cetak CR80 (54 &times; 85,6 mm) siap cetak dan lanyard.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                aria-label="Tutup pratinjau KTA"
                className="min-h-[44px] min-w-[44px] cursor-pointer rounded-[10px] border border-[#5c6b62]/35 dark:border-[#2a3b36] flex items-center justify-center text-[#3c4a42] hover:text-[#191c1e] hover:bg-[#f2f4f6] dark:text-[#9fb3ac] dark:hover:text-[#e9f1ee] dark:hover:bg-[#1a2824] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] transition-colors"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex justify-center">
              <div
                role="group"
                aria-label="Pilih sisi kartu pratinjau"
                className="inline-flex rounded-[10px] border border-[#5c6b62]/30 dark:border-[#2a3b36] bg-[#f7f9fb] dark:bg-[#1a2824] p-1 gap-1"
              >
                {(
                  [
                    { id: "both", label: "Keduanya" },
                    { id: "front", label: "Sisi Depan" },
                    { id: "back", label: "Sisi Belakang" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPreviewSide(tab.id)}
                    aria-pressed={previewSide === tab.id}
                    className={`min-h-[36px] cursor-pointer rounded-[8px] px-3 py-1 text-xs font-bold transition-colors ${
                      previewSide === tab.id
                        ? "bg-[#006c49] text-white dark:bg-[#0f7a58]"
                        : "text-[#3c4a42] hover:bg-white dark:text-[#9fb3ac] dark:hover:bg-[#121c19]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <PublicIdCard
              userData={statusData}
              scaled
              viewSide={previewSide}
              frontId="id-card-preview-front"
              backId="id-card-preview-back"
              className="justify-center lg:justify-center"
            />
          </div>
        </div>
      )}
    </div>
  );
};
