"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Upload, X, FileImage } from "lucide-react";
import { toast } from "sonner";

interface FileUploadFieldProps {
  label: string;
  file: File | null;
  onChange: (file: File) => void;
  onRemove: () => void;
  error?: string;
  accept?: string;
  icon?: React.ElementType;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function FileUploadField({
  label,
  file,
  onChange,
  onRemove,
  error,
  accept = "image/jpeg,image/png",
  icon: Icon = Upload,
  containerRef,
}: FileUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    (f: File) => {
      if (f.size > 2 * 1024 * 1024) {
        toast.error(`Ukuran file terlalu besar! Maksimal 2MB. File Anda: ${(f.size / (1024 * 1024)).toFixed(2)}MB`);
        return;
      }
      onChange(f);
    },
    [onChange]
  );

  React.useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [file]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const openFilePicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) handleFile(f);
    };
    input.click();
  };

  return (
    <div>
      <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] dark:text-[#eef2f4] mb-[4px]">
        {label} <span className="text-[#ba1a1a] dark:text-[#fca5a5]">*</span>
      </label>
      {file && preview ? (
        <div className="relative rounded-xl overflow-hidden border border-[#bbcabf] dark:border-[#5f736b] bg-[#ffffff] dark:bg-[#1a2723]">
          <Image src={preview} alt="Preview" width={400} height={192} className="w-full h-48 object-cover" unoptimized />
          <div className="absolute top-2 right-2">
            <button
              type="button"
              onClick={() => {
                onRemove();
              }}
              className="w-8 h-8 rounded-lg bg-[rgba(0,0,0,0.6)] text-white flex items-center justify-center hover:bg-[rgba(186,26,26,0.8)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-3 flex items-center gap-2">
            <FileImage size={16} className="text-[#006c49] dark:text-[#34d399]" />
            <span className="text-[14px] text-[#3c4a42] dark:text-[#eef2f4] truncate">{file.name}</span>
            <span className="text-[12px] text-[#54647a] dark:text-[#94a89e] ml-auto">
              {(file.size / 1024).toFixed(0)} KB
            </span>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-[24px] flex flex-col items-center justify-center transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-[#006c49] dark:focus:ring-[#34d399] ${dragActive
              ? "border-[#006c49] dark:border-[#34d399] bg-[#eceef0] dark:bg-[#22322d]"
              : error
                ? "border-[#ba1a1a] dark:border-[#f87171] bg-[#ffdad6]/20 dark:bg-[#3b1214]/40"
                : "border-[#bbcabf] dark:border-[#5f736b] bg-[#ffffff] dark:bg-[#1a2723] hover:bg-[#eceef0] dark:hover:bg-[#22322d]"
            }`}
          onClick={openFilePicker}
        >
          <Icon size={32} className="mb-[8px] text-[#006c49] dark:text-[#34d399]" />
          <span className="font-sans text-[14px] leading-[20px] text-[#3c4a42] dark:text-[#cbd6d0]">Klik atau seret file ke sini</span>
          <span className="font-sans text-[12px] text-[#6c7a71] dark:text-[#94a89e] mt-[4px]">Format: JPG, PNG (Maks. 2MB)</span>
        </div>
      )}
      {error && <p className="text-[14px] text-[#ba1a1a] dark:text-[#fca5a5] mt-[4px]">{error}</p>}
    </div>
  );
}
