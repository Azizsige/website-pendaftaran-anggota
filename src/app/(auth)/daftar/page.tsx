"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Send } from "lucide-react";
import { useRegistrationStore } from "@/store/useRegistrationStore";

import StepIndicator from "./_components/StepIndicator";
import StepDataDiri from "./_components/StepDataDiri";
import StepDokumen from "./_components/StepDokumen";
import StepKonfirmasi from "./_components/StepKonfirmasi";

export default function DaftarPage() {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<any>(null);

  const {
    currentStep, formData, errors, isSubmitting, isValidating,
    reqKtm, reqFoto, isLoadingSettings, regStatus, closedMessage, closedTitle,
    updateField, setIsImageValid, setIsValidating, fetchSettings, handleNext, handlePrev, handleSubmit
  } = useRegistrationStore();

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    if (currentStep === 1) setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [currentStep]);

  const onNextClick = () => {
    handleNext(() => {
      setTimeout(() => {
        const firstError = document.querySelector('.border-\\[\\#ba1a1a\\]') as HTMLElement;
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
      }, 100);
    });
  };

  const onSubmitClick = () => handleSubmit(() => router.push("/daftar/sukses"));

  const isStep2Complete = (!reqFoto || !!formData.pasFoto) && (!reqKtm || !!formData.fotoKTM);
  const isStep3SubmitReady = formData.persetujuan && useRegistrationStore.getState().isImageValid && !isSubmitting;
  const hasStep2 = reqKtm || reqFoto;

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-sans min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#10b981]/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-[#d0e1fb]/30 rounded-full blur-[120px]" />
      </div>

      <header className="flex justify-between items-center w-full px-[24px] py-[16px] max-w-[1280px] mx-auto bg-[#f7f9fb]/70 backdrop-blur-md border-b border-[#bbcabf]/10 shadow-sm sticky top-0 z-50">
        <Link href="/" className="font-sans text-[24px] font-bold text-[#006c49] hover:opacity-80 transition-opacity">MemberHub</Link>
        <Link href="/" className={`font-sans text-[14px] font-semibold transition-colors ${isSubmitting ? "text-[#3c4a42] opacity-50 pointer-events-none" : "text-[#3c4a42] hover:text-[#006c49]"}`}>Cancel</Link>
      </header>

      <main className="flex-grow flex items-start sm:items-center justify-center py-[48px] px-4 relative z-10 w-full">
        <div ref={topRef} className="w-full max-w-[640px] bg-white/80 backdrop-blur-[20px] border border-[#006c49]/15 rounded-xl shadow-sm overflow-hidden flex flex-col">
          {isLoadingSettings ? (
            <div className="flex flex-col items-center justify-center py-[100px] gap-[16px]">
              <div className="w-10 h-10 border-4 border-[#006c49] border-t-transparent rounded-full animate-spin" />
              <p className="font-sans text-[14px] text-[#3c4a42]">Memuat formulir pendaftaran...</p>
            </div>
          ) : regStatus !== "OPEN" ? (
            <div className="flex flex-col items-center justify-center py-[100px] px-8 text-center w-full min-h-[400px]">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-red-500 text-3xl">{regStatus === "CLOSED_BEFORE" ? "event_upcoming" : regStatus === "CLOSED_QUOTA" ? "group_off" : "block"}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#191c1e] mb-4">{closedTitle}</h2>
              <p className="text-[#3c4a42] text-base md:text-lg w-full max-w-[450px] mx-auto leading-relaxed">{closedMessage}</p>
              <Link href="/" className="mt-10 px-8 py-3 bg-[#006c49] text-white rounded-full font-medium hover:bg-[#006c49]/90 transition-all shadow-sm hover:shadow-md">Kembali ke Beranda</Link>
            </div>
          ) : (
            <>
              <div className="px-[24px] md:px-[48px] pt-[24px] pb-[16px] border-b border-[#bbcabf]/10 bg-white">
                <StepIndicator currentStep={currentStep} hasStep2={hasStep2} />
              </div>

              <div className="p-[24px] md:p-[48px] flex flex-col bg-white/50 relative">
                {currentStep === 1 && <StepDataDiri formData={formData} errors={errors} updateField={updateField} firstInputRef={firstInputRef} />}
                {currentStep === 2 && hasStep2 && <StepDokumen formData={formData} errors={errors} updateField={updateField} firstInputRef={firstInputRef} reqKtm={reqKtm} reqFoto={reqFoto} />}
                {currentStep === 3 && <StepKonfirmasi formData={formData} errors={errors} updateField={updateField} onValidationChange={setIsImageValid} onValidationStatusChange={(s) => setIsValidating(s === "VALIDATING")} reqKtm={reqKtm} reqFoto={reqFoto} />}
              </div>
              
              {isSubmitting && (
                <div className="absolute inset-0 z-[60] bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-[24px]">
                  <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-lg border border-[#bbcabf]/20">
                    <div className="w-10 h-10 border-4 border-[#006c49] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#006c49] font-medium animate-pulse">Memproses pendaftaran...</p>
                  </div>
                </div>
              )}

              <div className="px-[24px] md:px-[48px] py-[16px] border-t border-[#bbcabf]/10 bg-white flex justify-between items-center">
                {currentStep > 1 ? (
                  <button type="button" onClick={handlePrev} disabled={isSubmitting} className="font-sans text-[14px] font-semibold text-[#006c49] py-[8px] px-[16px] rounded-lg hover:bg-[#006c49]/10 transition-colors">
                    Kembali
                  </button>
                ) : <div />}
                
                {currentStep < 3 ? (
                  <button type="button" onClick={onNextClick} disabled={(currentStep === 2 && !isStep2Complete) || isSubmitting} className="font-sans text-[14px] font-semibold py-[8px] px-[24px] rounded-lg transition-colors flex items-center gap-[4px] shadow-sm bg-[#006c49] text-[#ffffff] hover:bg-[#006c49]/90 disabled:opacity-50">
                    Selanjutnya <ArrowRight size={18} />
                  </button>
                ) : (
                  <button type="button" onClick={onSubmitClick} disabled={!isStep3SubmitReady || isValidating} className="font-sans text-[14px] font-semibold py-[8px] px-[24px] rounded-lg transition-colors flex items-center gap-[4px] shadow-sm bg-[#006c49] text-[#ffffff] hover:bg-[#006c49]/90 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</> : isValidating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mengecek KTM...</> : <>Kirim Pendaftaran <Send size={18} /></>}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
