"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { UploadCloud, IdCard, Camera } from "lucide-react";
import FileUploadField from "./FileUploadField";
import { FormData, Errors } from "../types";

const ImageCropper = dynamic(() => import("./ImageCropper"), { ssr: false });
const KtmCameraCapture = dynamic(() => import("./KtmCameraCapture"), {
  ssr: false,
});

interface StepDokumenProps {
  formData: FormData;
  errors: Errors;
  updateField: (field: keyof FormData, value: string | File | null | boolean) => void;
  firstInputRef: React.RefObject<HTMLInputElement | null>;
  reqKtm?: boolean;
  reqFoto?: boolean;
  isInline?: boolean;
  hideHeader?: boolean;
}

export default function StepDokumen({
  formData,
  errors,
  updateField,
  firstInputRef,
  reqKtm = true,
  reqFoto = true,
  isInline = false,
  hideHeader = false,
}: StepDokumenProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkTimer = window.setTimeout(() => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));
      }
    }, 0);
    return () => window.clearTimeout(checkTimer);
  }, []);

  const handleKtmFileSelect = (file: File | null) => {
    if (!file) {
      updateField("fotoKTM", null);
      return;
    }
    const url = URL.createObjectURL(file);
    setCropImageSrc(url);
  };

  const handleCameraCapture = (blob: Blob) => {
    setShowCamera(false);
    const url = URL.createObjectURL(blob);
    setCropImageSrc(url);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "ktm_cropped.jpg", { type: "image/jpeg" });
    updateField("fotoKTM", file);
    setCropImageSrc(null);
  };

  const useSideBySide = !isInline && reqFoto && reqKtm;

  return (
    <div className="transition-opacity duration-300 animate-fade-in" id="step-2">
      {!hideHeader && (
        <>
          <h2 className="font-sans text-xl md:text-2xl font-semibold text-[#191c1e] dark:text-[#eef2f4] mb-1.5">
            Unggah Dokumen Pendukung
          </h2>
          <p className="font-sans text-[13px] leading-[19px] text-[#3c4a42] dark:text-[#cbd6d0] mb-4">
            Silakan unggah dokumen identitas Anda untuk proses verifikasi.
          </p>
        </>
      )}

      <div
        className={
          useSideBySide
            ? "grid grid-cols-1 md:grid-cols-2 gap-4 items-start"
            : "space-y-4"
        }
      >
        {reqFoto && (
          <FileUploadField
            containerRef={firstInputRef}
            label="Pas Foto (JPG/PNG, maks 2MB)"
            file={formData.pasFoto}
            onChange={(f) => updateField("pasFoto", f)}
            onRemove={() => updateField("pasFoto", null)}
            error={errors.pasFoto}
            icon={UploadCloud}
          />
        )}
        {reqKtm && (
          <FileUploadField
            label="Foto KTM (Kartu Tanda Mahasiswa)"
            file={formData.fotoKTM}
            onChange={handleKtmFileSelect}
            onRemove={() => updateField("fotoKTM", null)}
            error={errors.fotoKTM}
            icon={IdCard}
            actionSlot={
              isMobile ? (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="flex min-h-[44px] items-center gap-2 text-xs sm:text-sm font-semibold text-[#005236] bg-[#e6f4ee] hover:bg-[#cce8d5] dark:text-[#6ee7b7] dark:bg-[#0a3326] dark:hover:bg-[#0c3528] border border-[#006c49]/30 dark:border-[#34d399]/35 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Camera size={16} aria-hidden="true" /> Buka Kamera Cerdas
                  </button>
                </div>
              ) : undefined
            }
          />
        )}
      </div>

      {showCamera && (
        <KtmCameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
          isInline={isInline}
        />
      )}

      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImageSrc(null)}
          isInline={isInline}
        />
      )}
    </div>
  );
}
