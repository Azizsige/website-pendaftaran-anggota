"use client";

import React, { useState } from "react";
import { UploadCloud, IdCard, Camera } from "lucide-react";
import FileUploadField from "./FileUploadField";
import { FormData, Errors } from "./types";
import ImageCropper from "./ImageCropper";
import KtmCameraCapture from "./KtmCameraCapture";

interface StepDokumenProps {
  formData: FormData;
  errors: Errors;
  updateField: (field: keyof FormData, value: string | File | null | boolean) => void;
  firstInputRef: React.RefObject<any>;
}

export default function StepDokumen({ formData, errors, updateField, firstInputRef }: StepDokumenProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    // Basic mobile detection for showing camera option
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));
    }
  }, []);

  const handleKtmFileSelect = (file: File | null) => {
    if (!file) {
      updateField("fotoKTM", null);
      return;
    }
    // Launch cropper
    const url = URL.createObjectURL(file);
    setCropImageSrc(url);
  };

  const handleCameraCapture = (blob: Blob) => {
    setShowCamera(false);
    // Launch cropper after camera capture to ensure perfect framing
    const url = URL.createObjectURL(blob);
    setCropImageSrc(url);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Convert blob back to File
    const file = new File([croppedBlob], "ktm_cropped.jpg", { type: "image/jpeg" });
    updateField("fotoKTM", file);
    setCropImageSrc(null);
  };
  return (
    <div className="transition-opacity duration-300 animate-fade-in" id="step-2">
      <h2 className="font-sans text-[24px] md:text-[32px] md:leading-[40px] font-semibold text-[#191c1e] mb-[16px]">
        Unggah Dokumen Pendukung
      </h2>
      <p className="font-sans text-[14px] leading-[20px] text-[#3c4a42] mb-[24px]">
        Silakan unggah dokumen identitas Anda untuk proses verifikasi.
      </p>

      <div className="space-y-[24px]">
        <FileUploadField
          containerRef={firstInputRef}
          label="Pas Foto (JPG/PNG, maks 2MB)"
          file={formData.pasFoto}
          onChange={(f) => updateField("pasFoto", f)}
          onRemove={() => updateField("pasFoto", null)}
          error={errors.pasFoto}
          icon={UploadCloud}
        />
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
                className="flex items-center gap-2 text-sm font-medium text-[#006c49] bg-[#e6f4ea] px-4 py-2 rounded-md hover:bg-[#cce8d5] transition-colors"
              >
                <Camera size={16} /> Buka Kamera Cerdas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Camera Capture Modal */}
      {showCamera && (
        <KtmCameraCapture 
          onCapture={handleCameraCapture} 
          onCancel={() => setShowCamera(false)} 
        />
      )}

      {/* Image Cropper Modal */}
      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
    </div>
  );
}
