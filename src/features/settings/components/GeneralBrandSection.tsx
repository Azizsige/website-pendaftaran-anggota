import React, { useRef } from "react";
import Image from "next/image";
import { Building2, Sparkles, Upload } from "lucide-react";

import { useGeneralSettingStore } from "@/store/useGeneralSettingStore";

export const GeneralBrandSection = () => {
  const { logoPreview, faviconPreview, handleLogoUpload, handleFaviconUpload } =
    useGeneralSettingStore();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]);
  };

  const onFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFaviconUpload(e.target.files[0]);
  };

  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-3">
        <label
          htmlFor="general-brand-logo"
          className="text-[13px] font-semibold text-[#0f172a] dark:text-[#eef2f4]"
        >
          Logo Utama Organisasi
        </label>
        <div className="flex flex-wrap items-start gap-4 sm:flex-nowrap">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e2e8f0] bg-[#f8fafc] dark:border-[#3c4d46] dark:bg-[#1a2723]">
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Pratinjau logo organisasi"
                width={96}
                height={96}
                className="h-full w-full object-contain p-1.5"
                unoptimized
              />
            ) : (
              <Building2 className="h-8 w-8 text-[#64748b] dark:text-[#94a89e]" aria-hidden />
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <p className="max-w-[240px] text-xs leading-relaxed text-[#475569] dark:text-[#cbd6d0]">
              Format PNG, JPG, atau SVG. Rekomendasi rasio 1:1 (512x512px), maksimal 1 MB.
            </p>
            <input
              id="general-brand-logo"
              type="file"
              accept="image/png, image/svg+xml, image/jpeg"
              className="hidden"
              ref={logoInputRef}
              onChange={onLogoChange}
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="flex min-h-[44px] cursor-pointer items-center gap-2 self-start rounded-lg border border-[#85929f] bg-white px-4 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
            >
              <Upload className="h-4 w-4" aria-hidden />
              <span>Ubah Logo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <label
          htmlFor="general-brand-favicon"
          className="text-[13px] font-semibold text-[#0f172a] dark:text-[#eef2f4]"
        >
          Ikon Browser (Favicon)
        </label>
        <div className="flex flex-wrap items-start gap-4 sm:flex-nowrap">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e2e8f0] bg-[#f8fafc] dark:border-[#3c4d46] dark:bg-[#1a2723]">
            {faviconPreview ? (
              <Image
                src={faviconPreview}
                alt="Pratinjau favicon"
                width={64}
                height={64}
                className="h-full w-full object-contain p-2"
                unoptimized
              />
            ) : (
              <Sparkles className="h-6 w-6 text-[#64748b] dark:text-[#94a89e]" aria-hidden />
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <p className="max-w-[240px] text-xs leading-relaxed text-[#475569] dark:text-[#cbd6d0]">
              Format ICO atau PNG ukuran 32x32px / 64x64px. Maksimal 100 KB.
            </p>
            <input
              id="general-brand-favicon"
              type="file"
              accept="image/png, image/x-icon"
              className="hidden"
              ref={faviconInputRef}
              onChange={onFaviconChange}
            />
            <button
              type="button"
              onClick={() => faviconInputRef.current?.click()}
              className="flex min-h-[44px] cursor-pointer items-center gap-2 self-start rounded-lg border border-[#85929f] bg-white px-4 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
            >
              <Upload className="h-4 w-4" aria-hidden />
              <span>Unggah Favicon</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
