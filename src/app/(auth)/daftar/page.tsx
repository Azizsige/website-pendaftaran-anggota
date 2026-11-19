"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Ban, CalendarClock, CheckCircle2, Loader2, Send, Users } from "lucide-react";
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
    currentStep, formData, errors, isSubmitting, submissionPhase, isValidating, isImageValid,
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
    return () => {
      const latest = useRegistrationStore.getState();
      if (latest.submissionPhase === "redirecting") {
        latest.setSubmissionPhase("idle");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentStep === 3) {
      router.prefetch("/daftar/sukses");
    }
  }, [currentStep, router]);

  useEffect(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const rafId = window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });

    let focusTimer: ReturnType<typeof setTimeout> | undefined;
    if (currentStep === 1) {
      focusTimer = setTimeout(() => {
        firstInputRef.current?.focus({ preventScroll: true });
      }, 150);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      if (focusTimer) clearTimeout(focusTimer);
    };
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
  const isStep3SubmitReady = formData.persetujuan && isImageValid && !isSubmitting;
  const hasStep2 = reqKtm || reqFoto;

  const handleValidationStatusChange = React.useCallback(
    (status: string) => {
      setIsValidating(status === "VALIDATING");
    },
    [setIsValidating]
  );

  const stepHeaderMeta: Record<number, { title: string; subtitle: string }> = {
    1: {
      title: "Informasi Data Diri & Akademik",
      subtitle: "Lengkapi identitas mahasiswa sesuai Kartu Tanda Mahasiswa (KTM) yang aktif.",
    },
    2: {
      title: "Unggah Dokumen Pendukung",
      subtitle: "Unggah pas foto formal dan foto KTM yang terbaca jelas untuk verifikasi.",
    },
    3: {
      title: "Konfirmasi Pendaftaran",
      subtitle: "Periksa kembali kesesuaian data dan selesaikan verifikasi sebelum mengirim.",
    },
  };

  const activeHeader = stepHeaderMeta[currentStep] ?? stepHeaderMeta[1];
  const totalSteps = hasStep2 ? 3 : 2;
  const displayStepNum = currentStep === 3 && !hasStep2 ? 2 : currentStep;

  return (
    <div className="bg-[#f7f9fb] dark:bg-[#0d1412] text-[#191c1e] dark:text-[#eef2f4] font-sans min-h-[calc(100dvh-68px)] flex flex-col relative overflow-x-clip">
      <main className="flex-grow flex items-center justify-center py-3 sm:py-5 px-3 sm:px-6 relative z-10 w-full">
        <div
          ref={topRef}
          className="scroll-mt-20 w-full max-w-[960px] bg-white dark:bg-[#131d1a] border border-[#5c6b62]/25 dark:border-[#3c4d46] rounded-xl shadow-sm overflow-hidden flex flex-col relative"
        >
          {isLoadingSettings ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-9 h-9 text-[#006c49] dark:text-[#34d399] spinner-essential" aria-hidden="true" />
              <p className="font-sans text-[14px] text-[#3c4a42] dark:text-[#cbd6d0]">
                Memuat formulir pendaftaran...
              </p>
            </div>
          ) : regStatus !== "OPEN" ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center w-full min-h-[360px]">
              <div className="w-14 h-14 bg-[#fef2f2] dark:bg-[#3b1214] rounded-full flex items-center justify-center mb-5">
                {regStatus === "CLOSED_BEFORE" ? (
                  <CalendarClock className="h-7 w-7 text-[#ba1a1a] dark:text-[#fca5a5]" aria-hidden="true" />
                ) : regStatus === "CLOSED_QUOTA" ? (
                  <Users className="h-7 w-7 text-[#ba1a1a] dark:text-[#fca5a5]" aria-hidden="true" />
                ) : (
                  <Ban className="h-7 w-7 text-[#ba1a1a] dark:text-[#fca5a5]" aria-hidden="true" />
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#191c1e] dark:text-[#eef2f4] mb-3">
                {closedTitle}
              </h1>
              <p className="text-[#3c4a42] dark:text-[#cbd6d0] text-sm md:text-base w-full max-w-[460px] mx-auto leading-relaxed">
                {closedMessage}
              </p>
              <Link
                href="/"
                className="mt-8 min-h-[44px] inline-flex items-center px-7 py-2.5 bg-[#006c49] dark:bg-[#057a55] text-white rounded-lg font-semibold text-sm hover:bg-[#005236] dark:hover:bg-[#046c4e] transition-colors shadow-sm"
              >
                Kembali ke Beranda
              </Link>
            </div>
          ) : (
            <>
              <div className="px-5 sm:px-7 py-3.5 border-b border-[#5c6b62]/20 dark:border-[#3c4d46] bg-white dark:bg-[#131d1a] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="font-display text-lg sm:text-xl font-bold text-[#191c1e] dark:text-[#eef2f4] leading-tight">
                    {activeHeader.title}
                  </h1>
                  <p className="font-sans text-xs sm:text-[13px] text-[#3c4a42] dark:text-[#cbd6d0] mt-0.5">
                    {activeHeader.subtitle}
                  </p>
                </div>
                <div className="w-full md:w-[320px] lg:w-[360px] shrink-0">
                  <StepIndicator currentStep={currentStep} hasStep2={hasStep2} />
                </div>
              </div>

              <div className="px-5 sm:px-7 py-4 sm:py-5 flex flex-col bg-white dark:bg-[#131d1a] relative">
                {currentStep === 1 && (
                  <StepDataDiri
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                    firstInputRef={firstInputRef}
                    hideHeader={true}
                  />
                )}
                {currentStep === 2 && hasStep2 && (
                  <StepDokumen
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                    firstInputRef={firstInputRef}
                    reqKtm={reqKtm}
                    reqFoto={reqFoto}
                    hideHeader={true}
                  />
                )}
                {currentStep === 3 && (
                  <StepKonfirmasi
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                    onValidationChange={setIsImageValid}
                    onValidationStatusChange={handleValidationStatusChange}
                    reqKtm={reqKtm}
                    reqFoto={reqFoto}
                    hideHeader={true}
                  />
                )}
              </div>

              {(isSubmitting || submissionPhase !== "idle") && (
                <div
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                  className="fixed inset-0 z-[60] bg-white/80 dark:bg-[#0d1412]/85 backdrop-blur-[2px] flex items-center justify-center px-4"
                >
                  <div className="w-full max-w-xs flex flex-col items-center text-center gap-3.5 p-6 bg-white dark:bg-[#131d1a] rounded-2xl shadow-lg border border-[#5c6b62]/30 dark:border-[#3c4d46]">
                    <div className="w-14 h-14 rounded-full bg-[#006c49]/10 dark:bg-[#34d399]/15 flex items-center justify-center">
                      {submissionPhase === "redirecting" ? (
                        <CheckCircle2 className="w-8 h-8 text-[#006c49] dark:text-[#34d399]" aria-hidden="true" />
                      ) : (
                        <Loader2 className="w-8 h-8 text-[#006c49] dark:text-[#34d399] spinner-essential" aria-hidden="true" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-bold text-[#191c1e] dark:text-[#eef2f4]">
                        {submissionPhase === "redirecting"
                          ? "Pendaftaran Berhasil!"
                          : submissionPhase === "checking"
                          ? "Memeriksa Data Pendaftar..."
                          : "Mengirim Pendaftaran..."}
                      </p>
                      <p className="text-xs sm:text-sm text-[#3c4a42] dark:text-[#cbd6d0] leading-relaxed">
                        {submissionPhase === "redirecting"
                          ? "Data Anda telah tersimpan. Menyiapkan halaman konfirmasi..."
                          : submissionPhase === "checking"
                          ? "Memastikan NIM dan email Anda belum terdaftar sebelumnya."
                          : "Sedang memproses dokumen dan menyimpan data Anda. Mohon tunggu sebentar."}
                      </p>
                    </div>
                    {submissionPhase === "redirecting" && (
                      <div className="inline-flex items-center gap-2 pt-1 text-xs font-medium text-[#005236] dark:text-[#6ee7b7]">
                        <Loader2 className="w-3.5 h-3.5 spinner-essential" aria-hidden="true" />
                        <span>Mengalihkan ke ringkasan...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="px-5 sm:px-7 py-3 border-t border-[#5c6b62]/20 dark:border-[#3c4d46] bg-[#f7f9fb]/70 dark:bg-[#131d1a] flex justify-between items-center gap-3">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={isSubmitting}
                    className="min-h-[44px] cursor-pointer font-sans text-[14px] font-semibold text-[#005236] dark:text-[#6ee7b7] py-2 px-4 rounded-lg border border-[#5c6b62]/40 dark:border-[#5f736b] bg-white dark:bg-[#1a2723] hover:bg-[#e6f4ee] dark:hover:bg-[#22322d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Kembali
                  </button>
                ) : (
                  <span className="font-sans text-xs font-medium text-[#4b5850] dark:text-[#a8bab0]">
                    Tahap {displayStepNum} dari {totalSteps} &middot; Kolom bertanda{" "}
                    <span className="text-[#ba1a1a] dark:text-[#fca5a5] font-semibold">*</span> wajib diisi
                  </span>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={onNextClick}
                    disabled={(currentStep === 2 && !isStep2Complete) || isSubmitting}
                    className="min-h-[44px] cursor-pointer font-sans text-[14px] font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Selanjutnya <ArrowRight size={17} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSubmitClick}
                    disabled={!isStep3SubmitReady || isValidating}
                    className="min-h-[44px] cursor-pointer font-sans text-[14px] font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-sm bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submissionPhase === "redirecting" ? (
                      <>
                        <Loader2 className="w-4 h-4 spinner-essential" aria-hidden="true" /> Mengalihkan...
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 spinner-essential" aria-hidden="true" /> Memproses...
                      </>
                    ) : isValidating ? (
                      <>
                        <Loader2 className="w-4 h-4 spinner-essential" aria-hidden="true" /> Mengecek KTM...
                      </>
                    ) : (
                      <>
                        Kirim Pendaftaran <Send size={17} aria-hidden="true" />
                      </>
                    )}
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
