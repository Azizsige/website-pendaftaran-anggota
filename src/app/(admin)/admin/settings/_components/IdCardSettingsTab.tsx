"use client";

import React, { useEffect } from 'react';
import { useIdCardSettingStore } from '@/store/useIdCardSettingStore';
import { useGeneralSettingStore } from '@/store/useGeneralSettingStore';
import { IdCardIdentitySection } from './IdCardIdentitySection';
import { IdCardFieldsSection } from './IdCardFieldsSection';
import { IdCardTermsSection } from './IdCardTermsSection';
import { IdCardSignatureSection } from './IdCardSignatureSection';
import { IdCardPreview } from './IdCardPreview';

export const IdCardSettingsTab = () => {
  const { isLoading, isSaving, loadSettings, handleSave } = useIdCardSettingStore();
  const { loadSettings: loadGeneralSettings } = useGeneralSettingStore();

  useEffect(() => {
    loadSettings();
    loadGeneralSettings(); // Needed for logo preview
  }, [loadSettings, loadGeneralSettings]);

  if (isLoading) {
    return (
      <div className="bg-surface border border-outline-variant/20 rounded-xl p-6 sm:p-8 flex items-center justify-center min-h-[400px] shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-primary animate-spin">progress_activity</span>
          <p className="text-sm text-on-surface-variant">Memuat pengaturan ID Card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface border border-outline-variant/20 rounded-xl p-6 sm:p-8 flex flex-col gap-8 shadow-sm overflow-hidden relative ${isSaving ? 'pointer-events-none' : ''}`}>
      {/* Skeleton Overlay saat Saving */}
      {isSaving && (
        <div className="absolute inset-0 z-50 bg-surface/40 backdrop-blur-[1px] animate-pulse rounded-xl"></div>
      )}

      <div>
        <h2 className="text-[24px] font-semibold text-on-surface tracking-tight">ID Card (KTA) Settings</h2>
        <p className="text-sm text-on-surface-variant mt-1">Configure the design and content of member ID cards.</p>
      </div>
      
      <hr className="border-outline-variant/20" />
      
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Kolom Kiri: Form */}
        <div className="flex-1 flex flex-col gap-8">
          <IdCardIdentitySection />
          <hr className="border-outline-variant/20" />
          
          <IdCardFieldsSection />
          <hr className="border-outline-variant/20" />

          <IdCardTermsSection />
          <hr className="border-outline-variant/20" />

          <IdCardSignatureSection />
        </div>

        {/* Kolom Kanan: Preview */}
        <div className="xl:w-[320px] 2xl:w-[400px] shrink-0">
          <div className="sticky top-6">
            <IdCardPreview />
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-outline-variant/20 relative z-50">
        <button disabled={isSaving} className="px-6 py-2.5 font-medium text-sm text-on-surface hover:bg-surface-variant/50 rounded-lg transition-colors border border-transparent hover:border-outline-variant/30 w-full sm:w-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 font-medium text-sm bg-primary text-on-primary hover:bg-primary-container hover:shadow-md rounded-lg transition-all shadow-sm w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Menyimpan...</>
          ) : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
