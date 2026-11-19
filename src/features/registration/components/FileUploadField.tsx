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
  actionSlot?: React.ReactNode;
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
  actionSlot,
}: FileUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    (f: File) => {
      if (f.size > 2 * 1024 * 1024) {
        toast.error(
          `Ukuran file terlalu besar! Maksimal 2MB. File Anda: ${(f.size / (1024 * 1024)).toFixed(2)}MB`
        );
        return;
      }
      onChange(f);
    },
    [onChange]
  );

  React.useEffect(() => {
    if (!file) {
      const clearTimer = window.setTimeout(() => setPreview(null), 0);
      return () => window.clearTimeout(clearTimer);
    }
    const objectUrl = URL.createObjectURL(file);
    const setTimer = window.setTimeout(() => setPreview(objectUrl), 0);
    return () => {
      window.clearTimeout(setTimer);
      URL.revokeObjectURL(objectUrl);
    };
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="block font-sans text-[13px] leading-[18px] font-semibold text-[#191c1e] dark:text-[#eef2f4]">
          {label} <span className="text-[#ba1a1a] dark:text-[#fca5a5]">*</span>
        </span>
      </div>

      {file && preview ? (
        <div className="relative rounded-xl overflow-hidden border border-[#5c6b62] dark:border-[#768f84] bg-[#ffffff] dark:bg-[#1a2723]">
          <Image
            src={preview}
            alt={`Pratinjau ${label}`}
            width={400}
            height={176}
            className="w-full h-44 object-cover"
            unoptimized
          />
          <div className="absolute top-2 right-2">
            <button
              type="button"
              aria-label={`Hapus ${label}`}
              onClick={() => {
                onRemove();
              }}
              className="min-w-[44px] min-h-[44px] cursor-pointer rounded-lg bg-[rgba(0,0,0,0.68)] text-white flex items-center justify-center hover:bg-[rgba(186,26,26,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="px-3 py-2.5 flex items-center gap-2 border-t border-[#5c6b62]/20 dark:border-[#3c4d46]">
            <FileImage size={16} className="text-[#006c49] dark:text-[#34d399] shrink-0" aria-hidden="true" />
            <span className="text-[13px] text-[#3c4a42] dark:text-[#eef2f4] truncate font-medium">
              {file.name}
            </span>
            <span className="text-[12px] text-[#4b5850] dark:text-[#a8bab0] ml-auto shrink-0 font-mono">
              {(file.size / 1024).toFixed(0)} KB
            </span>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          role="button"
          tabIndex={0}
          aria-label={`Unggah ${label}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={openFilePicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openFilePicker();
            }
          }}
          className={`border-2 border-dashed rounded-xl min-h-[196px] p-5 flex flex-col items-center justify-center text-center transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] ${dragActive
            ? "border-[#006c49] dark:border-[#34d399] bg-[#e6f4ee] dark:bg-[#22322d]"
            : error
              ? "border-[#ba1a1a] dark:border-[#f87171] bg-[#ffdad6]/20 dark:bg-[#3b1214]/40"
              : "border-[#5c6b62] dark:border-[#768f84] bg-[#f7f9fb] dark:bg-[#1a2723] hover:bg-[#eef2f0] dark:hover:bg-[#22322d]"
            }`}
        >
          <div className="w-11 h-11 rounded-full bg-[#e6f4ee] dark:bg-[#0a3326] flex items-center justify-center mb-2.5">
            <Icon size={22} className="text-[#006c49] dark:text-[#34d399]" aria-hidden="true" />
          </div>
          <span className="font-sans text-[14px] leading-[20px] font-semibold text-[#191c1e] dark:text-[#eef2f4]">
            Klik atau seret file ke sini
          </span>
          <span className="font-sans text-[12px] text-[#4b5850] dark:text-[#a8bab0] mt-1">
            Format: JPG, PNG (Maks. 2MB)
          </span>
        </div>
      )}

      {actionSlot && <div className="mt-2">{actionSlot}</div>}
      {error && (
        <p className="text-[12px] leading-tight text-[#ba1a1a] dark:text-[#fca5a5] mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}
