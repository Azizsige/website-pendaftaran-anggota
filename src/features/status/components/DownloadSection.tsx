"use client";

import { useRef } from "react";
import Image from "next/image";
import { Download, ImagePlus, Pencil, Upload } from "lucide-react";
import { useCekStatusStore } from "@/store/useCekStatusStore";
import { updateMemberPhoto } from "@/actions/status-actions";
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
    setIsDownloading 
  } = useCekStatusStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    
    // Resize and crop to 3:4 aspect ratio using canvas
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
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
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight, 0, 0, 300, 400);
          const base64Photo = canvas.toDataURL("image/jpeg", 0.9);
          
          try {
            const res = await updateMemberPhoto(nim, email, base64Photo);
            if (res.success && statusData) {
              setStatusData({ ...statusData, photoUrl: base64Photo });
            } else {
              alert(res.message);
            }
          } catch (err) {
            alert("Gagal mengunggah foto.");
          }
        }
        setIsUploadingPhoto(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!statusData) return;
    const element = document.getElementById("id-card-element");
    if (!element) {
      alert("ID Card masih dalam proses pemuatan, silakan tunggu sebentar.");
      return;
    }
    
    setIsDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(element, { 
        pixelRatio: 2,
        cacheBust: true,
        fontEmbedCSS: '', 
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `KTA-${statusData.nim}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      logger.error("Failed to generate ID card:", error);
      alert("Gagal mengunduh ID Card. Pastikan koneksi internet stabil.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!statusData || (statusData.status !== "APPROVED" && statusData.status !== "ACTIVE")) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-[#bbcabf]/30 dark:border-[#3c4d46]">
      <h4 className="font-semibold text-[#191c1e] dark:text-[#eef2f4] mb-3">Kartu Tanda Anggota Anda</h4>
      
      {(!statusData.photoUrl || statusData.photoUrl === "null" || statusData.photoUrl === "") ? (
        <div className="bg-amber-50 border border-amber-200 dark:bg-[#3b2506]/70 dark:border-[#f59e0b]/40 w-full p-5 rounded-xl flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-[#3b2506] flex items-center justify-center text-amber-600 dark:text-[#fcd34d]">
            <ImagePlus className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[14px] text-amber-900 dark:text-[#fcd34d] font-semibold">Foto Profil Belum Tersedia</p>
            <p className="text-[13px] text-amber-800 dark:text-[#fde68a] mt-1 max-w-[320px]">
              Anda <strong>wajib</strong> mengunggah foto profil terlebih dahulu sebelum dapat mengunduh ID Card. Foto akan disesuaikan otomatis ke rasio 3:4.
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
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="mt-2 min-h-[44px] cursor-pointer bg-amber-600 text-white hover:bg-amber-700 transition-colors font-semibold py-2 px-5 rounded-lg flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
          >
            {isUploadingPhoto ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="h-4 w-4" aria-hidden="true" />
            )}
            {isUploadingPhoto ? "Mengunggah..." : "Unggah Foto Profil"}
          </button>
        </div>
      ) : (
        <div className="bg-[#d0e1fb]/30 border border-[#b7c8e1] dark:bg-[#132544]/70 dark:border-[#60a5fa]/35 w-full p-5 rounded-xl flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1a2723] flex items-center justify-center text-[#006c49] dark:text-[#34d399] shadow-sm shrink-0 overflow-hidden border border-slate-200 dark:border-[#3c4d46]">
            <Image src={statusData.photoUrl} alt="Foto Profil" width={48} height={48} className="w-full h-full object-cover" unoptimized />
          </div>
          <div className="flex-grow">
            <p className="text-[14px] text-[#191c1e] dark:text-[#eef2f4] font-semibold">ID Card Siap Diunduh</p>
            <p className="text-[13px] text-[#3c4a42] dark:text-[#cbd6d0]">Pastikan foto Anda sudah sesuai sebelum mengunduh.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto || isDownloading}
              className="min-h-[44px] bg-white border border-[#bbcabf] text-[#3c4a42] hover:bg-slate-50 dark:bg-[#1a2723] dark:border-[#5f736b] dark:text-[#eef2f4] dark:hover:bg-[#22322d] transition-colors font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs disabled:opacity-50 cursor-pointer"
              title="Ganti Foto"
            >
              {isUploadingPhoto ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Pencil className="h-4 w-4" aria-hidden="true" />
              )}
              Ganti
            </button>
            <button 
              onClick={handleDownload}
              disabled={isDownloading || isUploadingPhoto}
              className="min-h-[44px] bg-white border border-[#006c49] text-[#006c49] hover:bg-[#006c49] hover:text-white dark:bg-[#057a55] dark:border-[#057a55] dark:text-white dark:hover:bg-[#046c4e] transition-colors font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" />
              )}
              {isDownloading ? "Memproses..." : "Unduh ID Card"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
