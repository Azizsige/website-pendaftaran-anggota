"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Ban, CalendarClock, Send, Users } from "lucide-react";
import { toast } from "sonner";
import {
  useRegistrationStore,
  StepIndicator,
  StepDataDiri,
  StepDokumen,
  StepKonfirmasi,
} from "@/features/registration";

export default function DaftarPage() {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const isFirstMount = useRef(true);

  const {
    currentStep, formData, errors, isSubmitting, isValidating,
    reqKtm, reqFoto, isLoadingSettings, regStatus, closedMessage, closedTitle,
    updateField, setIsImageValid, setIsValidating, fetchSettings, handleNext, handlePrev, handleSubmit
  } = useRegistrationStore();

  useEffect(() => {
    fetchSettings();
    const store = useRegistrationStore.getState();
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (store.isReapplying) {
        store.setIsReapplying(false);
      } else {
        store.resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    if (currentStep === 1) setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [currentStep]);

  const onNextClick = async () => {
    const res = await handleNext(() => {
      setTimeout(() => {
        const firstError = document.querySelector('.border-\\[\\#ba1a1a\\]') as HTMLElement;
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
      }, 100);
    });
    if (res && !res.success && res.error) {
      toast.error(res.error);
    }
  };

  const onSubmitClick = async () => {
    const res = await handleSubmit(() => router.push("/daftar/sukses"));
    if (res && !res.success) {
      if (res.error) toast.error(res.error);
      if (res.reloadRequired) {
        setTimeout(() => window.location.reload(), 2000);
      }
    }
  };

  const isStep2Complete = (!reqFoto || !!formData.pasFoto) && (!reqKtm || !!formData.fotoKTM);
  const isStep3SubmitReady = formData.persetujuan && useRegistrationStore.getState().isImageValid && !isSubmitting;
  const hasStep2 = reqKtm || reqFoto;

  const handleValidationStatusChange = React.useCallback(
    (status: string) => {
      setIsValidating(status === "VALIDATING");
    },
    [setIsValidating]
  );

  return (
    <div className="bg-[#f7f9fb] dark:bg-[#0d1412] text-[#191c1e] dark:text-[#eef2f4] font-sans min-h-screen flex flex-col relative overflow-x-hidden">
      <main className="flex-grow flex items-start sm:items-center justify-center py-[40px] sm:py-[48px] px-4 relative z-10 w-full">
        <div ref={topRef} className="w-full max-w-[640px] bg-white dark:bg-[#131d1a] border border-[#006c49]/15 dark:border-[#3c4d46] rounded-xl shadow-sm overflow-hidden flex flex-col relative">
          {isLoadingSettings ? (
            <div className="flex flex-col items-center justify-center py-[100px] gap-[16px]">
              <div className="w-10 h-10 border-4 border-[#006c49] dark:border-[#34d399] border-t-transparent rounded-full animate-spin" />
              <p className="font-sans text-[14px] text-[#3c4a42] dark:text-[#cbd6d0]">Memuat formulir pendaftaran...</p>
            </div>
          ) : regStatus !== "OPEN" ? (
            <div className="flex flex-col items-center justify-center py-[100px] px-8 text-center w-full min-h-[400px]">
              <div className="w-16 h-16 bg-red-50 dark:bg-[#3b1214] rounded-full flex items-center justify-center mb-6">
                {regStatus === "CLOSED_BEFORE" ? (
                  <CalendarClock className="h-8 w-8 text-red-500 dark:text-[#fca5a5]" aria-hidden="true" />
                ) : regStatus === "CLOSED_QUOTA" ? (
                  <Users className="h-8 w-8 text-red-500 dark:text-[#fca5a5]" aria-hidden="true" />
                ) : (
                  <Ban className="h-8 w-8 text-red-500 dark:text-[#fca5a5]" aria-hidden="true" />
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#191c1e] dark:text-[#eef2f4] mb-4">{closedTitle}</h2>
              <p className="text-[#3c4a42] dark:text-[#cbd6d0] text-base md:text-lg w-full max-w-[450px] mx-auto leading-relaxed">{closedMessage}</p>
              <Link href="/" className="mt-10 min-h-[44px] inline-flex items-center px-8 py-3 bg-[#006c49] dark:bg-[#057a55] text-white rounded-full font-medium hover:bg-[#005236] dark:hover:bg-[#046c4e] transition-all shadow-sm hover:shadow-md">Kembali ke Beranda</Link>
            </div>
          ) : (
            <>
              <div className="px-[24px] md:px-[48px] pt-[24px] pb-[16px] border-b border-[#bbcabf]/25 dark:border-[#3c4d46] bg-white dark:bg-[#131d1a]">
                <StepIndicator currentStep={currentStep} hasStep2={hasStep2} />
              </div>

              <div className="p-[24px] md:p-[48px] flex flex-col bg-white dark:bg-[#131d1a] relative">
                {currentStep === 1 && <StepDataDiri formData={formData} errors={errors} updateField={updateField} firstInputRef={firstInputRef} />}
                {currentStep === 2 && hasStep2 && <StepDokumen formData={formData} errors={errors} updateField={updateField} firstInputRef={firstInputRef} reqKtm={reqKtm} reqFoto={reqFoto} />}
                {currentStep === 3 && <StepKonfirmasi formData={formData} errors={errors} updateField={updateField} onValidationChange={setIsImageValid} onValidationStatusChange={handleValidationStatusChange} reqKtm={reqKtm} reqFoto={reqFoto} />}
              </div>
              
              {isSubmitting && (
                <div className="absolute inset-0 z-[60] bg-white/75 dark:bg-[#0d1412]/80 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                  <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-[#131d1a] rounded-xl shadow-lg border border-[#bbcabf]/30 dark:border-[#3c4d46]">
                    <div className="w-10 h-10 border-4 border-[#006c49] dark:border-[#34d399] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#006c49] dark:text-[#6ee7b7] font-medium">Memproses pendaftaran...</p>
                  </div>
                </div>
              )}

              <div className="px-[24px] md:px-[48px] py-[16px] border-t border-[#bbcabf]/25 dark:border-[#3c4d46] bg-white dark:bg-[#131d1a] flex justify-between items-center">
                {currentStep > 1 ? (
                  <button type="button" onClick={handlePrev} disabled={isSubmitting} className="min-h-[44px] cursor-pointer font-sans text-[14px] font-semibold text-[#006c49] dark:text-[#34d399] py-[8px] px-[16px] rounded-lg hover:bg-[#006c49]/10 dark:hover:bg-[#34d399]/15 transition-colors">
                    Kembali
                  </button>
                ) : <div />}
                
                {currentStep < 3 ? (
                  <button type="button" onClick={onNextClick} disabled={(currentStep === 2 && !isStep2Complete) || isSubmitting} className="min-h-[44px] cursor-pointer font-sans text-[14px] font-semibold py-[8px] px-[24px] rounded-lg transition-colors flex items-center gap-[4px] shadow-sm bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    Selanjutnya <ArrowRight size={18} />
                  </button>
                ) : (
                  <button type="button" onClick={onSubmitClick} disabled={!isStep3SubmitReady || isValidating} className="min-h-[44px] cursor-pointer font-sans text-[14px] font-semibold py-[8px] px-[24px] rounded-lg transition-colors flex items-center gap-[4px] shadow-sm bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white disabled:opacity-50 disabled:cursor-not-allowed">
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
