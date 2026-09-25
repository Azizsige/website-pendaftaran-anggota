"use client";

import React, { useEffect } from 'react';
import { useGeneralSettingStore } from '@/store/useGeneralSettingStore';
import { GeneralInfoSection } from './GeneralInfoSection';
import { GeneralBrandSection } from './GeneralBrandSection';

export const GeneralSettingsTab = () => {
  const { isLoading, isSaving, loadSettings, handleSave } = useGeneralSettingStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (isLoading) {
    return (
      <div className="bg-surface border border-outline-variant/20 rounded-xl p-6 sm:p-8 flex items-center justify-center min-h-[400px] shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-primary animate-spin">progress_activity</span>
          <p className="text-sm text-on-surface-variant">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface border border-outline-variant/20 rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm overflow-hidden relative ${isSaving ? 'pointer-events-none' : ''}`}>
      {/* Skeleton Overlay saat Saving */}
      {isSaving && (
        <div className="absolute inset-0 z-50 bg-surface/40 backdrop-blur-[1px] animate-pulse rounded-xl"></div>
      )}

      <div>
        <h2 className="text-[24px] font-semibold text-on-surface tracking-tight">Organization Profile</h2>
        <p className="text-sm text-on-surface-variant mt-1">Update your organization's public-facing information and brand assets.</p>
      </div>
      
      <hr className="border-outline-variant/20" />
      
      <GeneralInfoSection />
      <GeneralBrandSection />
      
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
