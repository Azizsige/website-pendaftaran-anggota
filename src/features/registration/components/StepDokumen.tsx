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
}

export default function StepDokumen({ formData, errors, updateField, firstInputRef, reqKtm = true, reqFoto = true, isInline = false }: StepDokumenProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));
    }
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

  return (
    <div className="transition-opacity duration-300 animate-fade-in" id="step-2">
      <h2 className="font-sans text-[24px] md:text-[32px] md:leading-[40px] font-semibold text-[#191c1e] dark:text-[#eef2f4] mb-[16px]">
        Unggah Dokumen Pendukung
      </h2>
      <p className="font-sans text-[14px] leading-[20px] text-[#3c4a42] dark:text-[#cbd6d0] mb-[24px]">
        Silakan unggah dokumen identitas Anda untuk proses verifikasi.
      </p>

      <div className="space-y-[24px]">
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
          <div className="space-y-[8px]">
            <FileUploadField
              label="Foto KTM (Kartu Tanda Mahasiswa)"
              file={formData.fotoKTM}
              onChange={handleKtmFileSelect}
              onRemove={() => updateField("fotoKTM", null)}
              error={errors.fotoKTM}
              icon={IdCard}
            />
            {isMobile && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#006c49] bg-[#e6f4ea] hover:bg-[#cce8d5] dark:text-[#6ee7b7] dark:bg-[#0a3326] dark:hover:bg-[#0c3528] px-4 py-2 rounded-md transition-colors cursor-pointer"
                >
                  <Camera size={16} /> Buka Kamera Cerdas
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Camera Capture Modal */}
      {showCamera && (
        <KtmCameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
          isInline={isInline}
        />
      )}

      {/* Image Cropper Modal */}
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
