"use client";

import React, { useState, useRef } from 'react';

export const GeneralSettingsTab = () => {
  // File Upload Logic
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFaviconPreview(url);
    }
  };

  return (
    <div className="bg-surface border border-outline-variant/20 rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm overflow-hidden">
      <div>
        <h2 className="text-[24px] font-semibold text-on-surface tracking-tight">Organization Profile</h2>
        <p className="text-sm text-on-surface-variant mt-1">Update your organization's public-facing information and brand assets.</p>
      </div>
      
      <hr className="border-outline-variant/20" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="flex flex-col gap-2 min-w-0">
          <label className="text-sm font-semibold text-on-surface">Organization Name</label>
          <input 
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" 
            type="text" 
            defaultValue="National Professional Association"
          />
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <label className="text-sm font-semibold text-on-surface">Official Email</label>
          <input 
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" 
            type="email" 
            defaultValue="contact@npa.org"
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2 min-w-0">
          <label className="text-sm font-semibold text-on-surface">Description / About</label>
          <textarea 
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none resize-none" 
            rows={3}
            defaultValue="The premier network for certified professionals nationwide, dedicated to advancing industry standards and continuing education."
          ></textarea>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 w-full">
        {/* Logo Uploader */}
        <div className="flex flex-col gap-3 min-w-0">
          <label className="text-sm font-semibold text-on-surface">Primary Logo</label>
          <div className="flex flex-wrap sm:flex-nowrap items-start gap-4">
            <div className="w-24 h-24 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-center shrink-0 overflow-hidden shadow-inner relative group">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[32px] text-tertiary">domain</span>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="material-symbols-outlined text-white text-[24px]">edit</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <p className="text-xs text-on-surface-variant leading-relaxed max-w-[200px]">Recommended size: 512x512px (PNG, SVG). Max 2MB.</p>
              <input 
                type="file" 
                accept="image/png, image/svg+xml, image/jpeg" 
                className="hidden" 
                ref={logoInputRef}
                onChange={handleLogoUpload}
              />
              <button 
                onClick={() => logoInputRef.current?.click()}
                className="bg-surface hover:bg-surface-variant/50 text-on-surface font-medium text-sm py-2 px-4 rounded-lg border border-outline-variant/30 transition-colors self-start shadow-sm mt-1 cursor-pointer"
              >
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
                <img src={faviconPreview} alt="Favicon Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[24px] text-tertiary">star</span>
              )}
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="material-symbols-outlined text-white text-[16px]">edit</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <p className="text-xs text-on-surface-variant leading-relaxed max-w-[200px]">Must be exactly 32x32px or 64x64px (ICO, PNG).</p>
              <input 
                type="file" 
                accept="image/png, image/x-icon" 
                className="hidden" 
                ref={faviconInputRef}
                onChange={handleFaviconUpload}
              />
              <button 
                onClick={() => faviconInputRef.current?.click()}
                className="bg-surface hover:bg-surface-variant/50 text-on-surface font-medium text-sm py-1.5 px-3 rounded-lg border border-outline-variant/30 transition-colors self-start shadow-sm mt-1 cursor-pointer"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-outline-variant/20">
        <button className="px-6 py-2.5 font-medium text-sm text-on-surface hover:bg-surface-variant/50 rounded-lg transition-colors border border-transparent hover:border-outline-variant/30 w-full sm:w-auto cursor-pointer">
          Cancel
        </button>
        <button className="px-6 py-2.5 font-medium text-sm bg-primary text-on-primary hover:bg-primary-container hover:shadow-md rounded-lg transition-all shadow-sm w-full sm:w-auto cursor-pointer">
          Save Changes
        </button>
      </div>
    </div>
  );
};
