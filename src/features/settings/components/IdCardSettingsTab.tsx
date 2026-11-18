"use client";

import React, { useEffect } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";

import { useIdCardSettingStore } from "@/store/useIdCardSettingStore";
import { useGeneralSettingStore } from "@/store/useGeneralSettingStore";
import { IdCardIdentitySection } from "./IdCardIdentitySection";
import { IdCardFieldsSection } from "./IdCardFieldsSection";
import { IdCardTermsSection } from "./IdCardTermsSection";
import { IdCardSignatureSection } from "./IdCardSignatureSection";
import { IdCardPreview } from "./IdCardPreview";

export const IdCardSettingsTab = () => {
  const { isLoading, isSaving, loadSettings, handleSave } = useIdCardSettingStore();
  const { loadSettings: loadGeneralSettings } = useGeneralSettingStore();

  useEffect(() => {
    loadSettings();
    loadGeneralSettings();
  }, [loadSettings, loadGeneralSettings]);

  if (isLoading) {
    return (
      <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-[#e2e8f0] bg-white p-6 sm:p-8 dark:border-[#3c4d46] dark:bg-[#131d1a]">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-7 w-7 animate-spin text-[#006c49] dark:text-[#34d399]" aria-hidden />
          <p className="text-sm font-medium text-[#475569] dark:text-[#cbd6d0]">
            Memuat pengaturan Kartu Anggota (KTA)...
          </p>
        </div>
      </div>
    );
  }

  const handleReset = () => {
    void loadSettings();
    void loadGeneralSettings();
  };

  return (
    <div
      className={`relative flex flex-col gap-6 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white p-6 sm:p-8 dark:border-[#3c4d46] dark:bg-[#131d1a] ${
        isSaving ? "pointer-events-none" : ""
      }`}
    >
      {isSaving && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-40 rounded-xl bg-white/55 backdrop-blur-[1px] dark:bg-[#0d1412]/65"
        />
      )}

      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[#0f172a] sm:text-xl dark:text-[#eef2f4]">
          Pengaturan Kartu Anggota (KTA)
        </h2>
        <p className="mt-1 text-sm text-[#475569] dark:text-[#cbd6d0]">
          Atur identitas penerbit, komponen informasi di kartu, ketentuan anggota, serta tanda tangan pengesah KTA digital.
        </p>
      </div>

      <hr className="border-[#f1f5f9] dark:border-[#24332d]" />

      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="flex flex-1 flex-col gap-7">
          <IdCardIdentitySection />
          <hr className="border-[#f1f5f9] dark:border-[#24332d]" />

          <IdCardFieldsSection />
          <hr className="border-[#f1f5f9] dark:border-[#24332d]" />

          <IdCardTermsSection />
          <hr className="border-[#f1f5f9] dark:border-[#24332d]" />

          <IdCardSignatureSection />
        </div>

        <div className="shrink-0 xl:w-[340px] 2xl:w-[400px]">
          <div className="sticky top-6">
            <IdCardPreview />
          </div>
        </div>
      </div>

      <div className="relative z-50 mt-2 flex flex-col justify-end gap-3 border-t border-[#f1f5f9] pt-6 sm:flex-row dark:border-[#24332d]">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSaving}
          className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#85929f] bg-white px-5 py-2.5 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          <span>Reset</span>
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#006c49] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#005236] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:bg-[#057a55] dark:hover:bg-[#046c4e] dark:focus-visible:ring-[#34d399] dark:focus-visible:ring-offset-[#131d1a]"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden />
              <span>Simpan Perubahan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
