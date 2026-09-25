import React, { useRef } from 'react';
import { useGeneralSettingStore } from '@/store/useGeneralSettingStore';

export const GeneralBrandSection = () => {
  const { logoPreview, faviconPreview, handleLogoUpload, handleFaviconUpload } = useGeneralSettingStore();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]);
  };
  
  const onFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFaviconUpload(e.target.files[0]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 w-full">
      {/* Logo Uploader */}
      <div className="flex flex-col gap-3 min-w-0">
        <label className="text-sm font-semibold text-on-surface">Primary Logo</label>
        <div className="flex flex-wrap sm:flex-nowrap items-start gap-4">
          <div className="w-24 h-24 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-center shrink-0 overflow-hidden shadow-inner relative group">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[32px] text-tertiary">domain</span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="material-symbols-outlined text-white text-[24px]">edit</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <p className="text-xs text-on-surface-variant leading-relaxed max-w-[200px]">Format: PNG, JPG, SVG. Rekomendasi: 512x512px. Maksimal 1MB.</p>
            <input type="file" accept="image/png, image/svg+xml, image/jpeg" className="hidden" ref={logoInputRef} onChange={onLogoChange} />
            <button onClick={() => logoInputRef.current?.click()} className="bg-surface hover:bg-surface-variant/50 text-on-surface font-medium text-sm py-2 px-4 rounded-lg border border-outline-variant/30 transition-colors self-start shadow-sm mt-1 cursor-pointer">
              Change Logo
            </button>
          </div>
        </div>
      </div>
      
      {/* Favicon Uploader */}
      <div className="flex flex-col gap-3 min-w-0">
        <label className="text-sm font-semibold text-on-surface">Favicon</label>
        <div className="flex flex-wrap sm:flex-nowrap items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-center shrink-0 overflow-hidden shadow-inner relative group">
            {faviconPreview ? (
              <img src={faviconPreview} alt="Favicon" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[24px] text-tertiary">star</span>
            )}
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="material-symbols-outlined text-white text-[16px]">edit</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <p className="text-xs text-on-surface-variant leading-relaxed max-w-[200px]">Format: ICO, PNG. Ukuran 32x32px / 64x64px. Maksimal 100KB.</p>
            <input type="file" accept="image/png, image/x-icon" className="hidden" ref={faviconInputRef} onChange={onFaviconChange} />
            <button onClick={() => faviconInputRef.current?.click()} className="bg-surface hover:bg-surface-variant/50 text-on-surface font-medium text-sm py-1.5 px-3 rounded-lg border border-outline-variant/30 transition-colors self-start shadow-sm mt-1 cursor-pointer">
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
