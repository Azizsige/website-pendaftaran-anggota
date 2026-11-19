"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Download, Eye, EyeOff, FileText, ImagePlus, Loader2, Pencil, Upload } from "lucide-react";
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
  const [previewSide, setPreviewSide] = useState<"front" | "back">("front");

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
    <div className="mt-8 pt-6 border-t border-[#bbcabf]/30 dark:border-[#3c4d46]">
      <h4 className="font-semibold text-[#191c1e] dark:text-[#eef2f4] mb-3">
        Kartu Tanda Anggota (KTA) Siap Lanyard
      </h4>

      {!hasPhoto ? (
        <div className="bg-amber-50 border border-amber-200 dark:bg-[#3b2506]/70 dark:border-[#f59e0b]/40 w-full p-5 rounded-xl flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-[#3b2506] flex items-center justify-center text-amber-700 dark:text-[#fcd34d]">
            <ImagePlus className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[14px] text-amber-900 dark:text-[#fcd34d] font-semibold">
              Foto Profil Belum Tersedia
            </p>
            <p className="text-[13px] text-amber-800 dark:text-[#fde68a] mt-1 max-w-[340px]">
              Anda <strong>wajib</strong> mengunggah foto profil terlebih dahulu sebelum mengunduh KTA. Foto akan disesuaikan otomatis ke rasio 3:4.
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="mt-2 min-h-[44px] cursor-pointer bg-amber-700 text-white hover:bg-amber-800 transition-colors font-semibold py-2 px-5 rounded-lg flex items-center gap-2 text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploadingPhoto ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{isUploadingPhoto ? "Mengunggah..." : "Unggah Foto Profil"}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#f2f4f6] border border-[#bbcabf]/60 dark:bg-[#1a2723] dark:border-[#3c4d46] w-full p-5 rounded-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-16 rounded-lg bg-white dark:bg-[#131d1a] shrink-0 overflow-hidden border border-[#bbcabf] dark:border-[#5f736b]">
                <Image
                  src={statusData.photoUrl || ""}
                  alt="Foto Profil KTA"
                  width={56}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-[#191c1e] dark:text-[#eef2f4] font-semibold">
                  KTA Siap Diunduh &amp; Dicetak
                </p>
                <p className="text-[13px] text-[#3c4a42] dark:text-[#cbd6d0] mt-0.5">
                  Format cetak CR80 (54 x 85,6 mm) resolusi tinggi dengan zona aman lanyard dan QR verifikasi resmi.
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto || isDownloading}
                className="min-h-[44px] shrink-0 bg-white border border-[#85929f] text-[#191c1e] hover:bg-[#f8fafc] dark:bg-[#131d1a] dark:border-[#5f736b] dark:text-[#eef2f4] dark:hover:bg-[#22322d] transition-colors font-semibold py-2 px-3.5 rounded-lg flex items-center justify-center gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Ganti Foto Profil"
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{isUploadingPhoto ? "Mengunggah..." : "Ganti Foto"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#bbcabf]/40 dark:border-[#3c4d46]">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading || isUploadingPhoto}
                className="min-h-[44px] bg-[#006c49] text-white hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] transition-colors font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                {isDownloading && downloadFormat === "pdf" ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FileText className="h-4 w-4" aria-hidden="true" />
                )}
                <span>
                  {isDownloading && downloadFormat === "pdf"
                    ? "Menyiapkan PDF..."
                    : "Unduh PDF Cetak (Depan & Belakang)"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isDownloading || isUploadingPhoto}
                className="min-h-[44px] bg-white border border-[#006c49] text-[#005236] hover:bg-[#e6f4ee] dark:bg-[#131d1a] dark:border-[#34d399] dark:text-[#6ee7b7] dark:hover:bg-[#0c3528] transition-colors font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDownloading && downloadFormat === "png" ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                <span>
                  {isDownloading && downloadFormat === "png"
                    ? "Menyiapkan PNG..."
                    : "Unduh PNG HD (Depan)"}
                </span>
              </button>
            </div>

            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => setShowPreview((prev) => !prev)}
                aria-expanded={showPreview}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#005236] hover:bg-[#e6f4ee] dark:text-[#6ee7b7] dark:hover:bg-[#0c3528] transition-colors"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                    <span>Sembunyikan Pratinjau Kartu</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    <span>Lihat Pratinjau KTA (Depan &amp; Belakang)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {showPreview && (
            <div className="rounded-xl border border-[#bbcabf]/60 bg-[#f8fafc] p-4 dark:border-[#3c4d46] dark:bg-[#1a2723] flex flex-col items-center gap-4">
              <div
                role="group"
                aria-label="Pilih sisi kartu pratinjau"
                className="inline-flex rounded-lg border border-[#cbd5e1] bg-white p-1 dark:border-[#3c4d46] dark:bg-[#131d1a]"
              >
                <button
                  type="button"
                  onClick={() => setPreviewSide("front")}
                  aria-pressed={previewSide === "front"}
                  className={`min-h-[36px] cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    previewSide === "front"
                      ? "bg-[#006c49] text-white dark:bg-[#057a55]"
                      : "text-[#3c4a42] hover:bg-[#f2f4f6] dark:text-[#cbd6d0] dark:hover:bg-[#1a2723]"
                  }`}
                >
                  Sisi Depan
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSide("back")}
                  aria-pressed={previewSide === "back"}
                  className={`min-h-[36px] cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    previewSide === "back"
                      ? "bg-[#006c49] text-white dark:bg-[#057a55]"
                      : "text-[#3c4a42] hover:bg-[#f2f4f6] dark:text-[#cbd6d0] dark:hover:bg-[#1a2723]"
                  }`}
                >
                  Sisi Belakang
                </button>
              </div>

              <PublicIdCard
                userData={statusData}
                scaled
                viewSide={previewSide}
                frontId="id-card-preview-front"
                backId="id-card-preview-back"
                className="justify-center"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
