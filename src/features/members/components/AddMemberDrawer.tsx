"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";

import {
  type FormData,
  type Errors,
  initialFormData,
  StepIndicator,
  StepDataDiri,
  StepDokumen,
  StepKonfirmasi,
} from "@/features/registration";
import { createMember } from "../actions";
import { checkDuplicateRegistration } from "@/actions/register";
import { hashFile } from "@/lib/utils";
import { getSystemSettings } from "@/actions/setting-actions";
import { parseRegistrationSettings } from "@/lib/constants/settings";
import { logger } from "@/lib/logger";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CustomScrollArea } from "@/components/ui/custom-scroll-area";

interface AddMemberDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export const AddMemberDrawer = ({
  open,
  onOpenChange,
  children,
  onSuccess,
}: AddMemberDrawerProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isImageValid, setIsImageValid] = useState(false);

  const [reqKtm, setReqKtm] = useState(true);
  const [reqFoto, setReqFoto] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const topRef = useRef<HTMLElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      let active = true;
      const fetchSettings = async () => {
        setIsLoadingSettings(true);
        try {
          const res = await getSystemSettings();
          if (active && res.success && res.data) {
            const parsed = parseRegistrationSettings(res.data);
            setReqKtm(parsed.reqKtm);
            setReqFoto(parsed.reqFoto);
          }
        } catch (e) {
          logger.error("Gagal memuat pengaturan di AddMemberDrawer:", e);
        } finally {
          if (active) setIsLoadingSettings(false);
        }
      };
      void fetchSettings();

      const focusTimer = setTimeout(() => {
        topRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        if (currentStep === 1) firstInputRef.current?.focus();
      }, 100);

      return () => {
        active = false;
        clearTimeout(focusTimer);
      };
    }

    const resetTimer = setTimeout(() => {
      setCurrentStep(1);
      setFormData(initialFormData);
      setErrors({});
    }, 0);
    return () => clearTimeout(resetTimer);
  }, [open, currentStep]);

  const updateField = (field: keyof FormData, value: string | File | null | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const errs: Errors = {};
    if (!formData.namaLengkap.trim()) errs.namaLengkap = "Nama lengkap wajib diisi";
    if (!formData.nim.trim()) errs.nim = "NIM wajib diisi";
    if (!formData.email.trim()) errs.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Format email tidak valid";
    if (!formData.noTelepon.trim()) errs.noTelepon = "Nomor telepon wajib diisi";
    else if (formData.noTelepon.replace(/\D/g, "").length < 9) errs.noTelepon = "Format nomor telepon tidak valid";
    if (!formData.tempatLahir.trim()) errs.tempatLahir = "Tempat lahir wajib diisi";
    if (!formData.tanggalLahir) errs.tanggalLahir = "Tanggal lahir wajib diisi";
    if (!formData.jenisKelamin) errs.jenisKelamin = "Jenis kelamin wajib dipilih";
    if (!formData.alamat.trim()) errs.alamat = "Alamat domisili wajib diisi";
    if (!formData.fakultas) errs.fakultas = "Fakultas wajib dipilih";
    if (!formData.jurusan.trim()) errs.jurusan = "Program studi wajib diisi";
    if (!formData.angkatan) errs.angkatan = "Angkatan wajib dipilih";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    setErrors({});
    return true;
  };

  const hasStep2 = reqKtm || reqFoto;

  const handleNext = async () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setIsSubmitting(true);
        try {
          const duplicateCheck = await checkDuplicateRegistration(formData.nim, formData.email);
          if (duplicateCheck.isDuplicate) {
            setErrors((prev) => ({
              ...prev,
              nim: duplicateCheck.error?.includes("NIM") ? duplicateCheck.error : undefined,
              email:
                duplicateCheck.error?.includes("email") || duplicateCheck.error?.includes("Email")
                  ? duplicateCheck.error
                  : undefined,
            }));
            toast.error(duplicateCheck.error);
            setTimeout(() => {
              const firstError = document.querySelector(".border-\\[\\#ba1a1a\\]") as HTMLElement;
              if (firstError) {
                firstError.scrollIntoView({ behavior: "smooth", block: "center" });
                firstError.focus();
              }
            }, 100);
            return;
          }
          setCurrentStep(hasStep2 ? 2 : 3);
        } catch (error) {
          logger.error("Duplicate check error:", error);
          toast.error("Gagal memverifikasi data ke server.");
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setTimeout(() => {
          const firstError = document.querySelector(".border-\\[\\#ba1a1a\\]") as HTMLElement;
          if (firstError) {
            firstError.scrollIntoView({ behavior: "smooth", block: "center" });
            firstError.focus();
          }
        }, 100);
      }
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrev = () => {
    if (currentStep === 3 && !hasStep2) setCurrentStep(1);
    else if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!formData.persetujuan) return;
    setIsSubmitting(true);
    try {
      const getBase64 = (file: File | null): Promise<string> => {
        return new Promise((resolve, reject) => {
          if (!file) return resolve("");
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      };

      const pasFotoUrl = await getBase64(formData.pasFoto);
      const fotoKTMUrl = await getBase64(formData.fotoKTM);

      const pasFotoHash = formData.pasFoto ? await hashFile(formData.pasFoto) : undefined;
      const fotoKTMHash = formData.fotoKTM ? await hashFile(formData.fotoKTM) : undefined;

      const res = await createMember({
        ...formData,
        pasFotoUrl,
        fotoKTMUrl,
        pasFotoHash,
        fotoKTMHash,
      });

      if (res.success) {
        toast.success("Anggota baru berhasil ditambahkan.");
        onOpenChange(false);
        setCurrentStep(1);
        setFormData(initialFormData);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Gagal menambahkan anggota.");
      }
    } catch (error) {
      logger.error("Gagal submit tambah anggota:", error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep2Complete = true;
  const isStep3SubmitReady = formData.persetujuan && !isSubmitting && isImageValid;

  const handleOutsideInteraction = (e: { target: EventTarget | null; preventDefault: () => void }) => {
    const target = e.target as Element | null;
    if (
      target?.closest("#cropper-portal") ||
      target?.closest("[data-radix-popper-content-wrapper]") ||
      target?.closest("[data-radix-select-viewport]")
    ) {
      e.preventDefault();
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(val) => {
        if (isSubmitting) return;
        onOpenChange(val);
      }}
      direction="right"
    >
      {children}
      <DrawerContent
        id="admin-member-drawer-content"
        onInteractOutside={handleOutsideInteraction}
        onPointerDownOutside={handleOutsideInteraction}
        className="flex w-[92%] flex-col border-l border-[#e2e8f0] bg-white shadow-2xl md:w-[600px] lg:w-[45%] xl:w-[40%] dark:border-[#3c4d46] dark:bg-[#131d1a]"
      >
        <DrawerHeader className="flex shrink-0 flex-row items-start justify-between gap-4 border-b border-[#f1f5f9] px-6 py-5 dark:border-[#24332d]">
          <div>
            <DrawerTitle className="text-left text-lg font-semibold tracking-tight text-[#0f172a] dark:text-[#eef2f4]">
              Tambah Anggota Baru
            </DrawerTitle>
            <DrawerDescription className="mt-1 text-left text-sm text-[#475569] dark:text-[#cbd6d0]">
              Lengkapi data mahasiswa berikut untuk menambahkan anggota secara langsung.
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <button
              type="button"
              aria-label="Tutup"
              disabled={isSubmitting}
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#475569] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] disabled:opacity-50 dark:text-[#cbd6d0] dark:hover:bg-[#1a2723] dark:hover:text-[#eef2f4] dark:focus-visible:ring-[#34d399]"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </DrawerClose>
        </DrawerHeader>

        <CustomScrollArea
          viewportRef={topRef}
          className="relative flex-1 min-h-0 overscroll-contain"
          contentClassName="relative min-h-full"
        >
          {isLoadingSettings ? (
            <div className="mt-10 flex h-40 flex-col items-center justify-center gap-2 text-[#475569] dark:text-[#cbd6d0]">
              <Loader2 className="h-7 w-7 animate-spin text-[#006c49] dark:text-[#34d399]" aria-hidden />
              <span className="text-xs font-medium">Memuat konfigurasi pendaftaran...</span>
            </div>
          ) : (
            <>
              <div className="border-b border-[#f1f5f9] px-6 pb-4 pt-6 dark:border-[#24332d]">
                <StepIndicator currentStep={currentStep} hasStep2={hasStep2} />
              </div>
              <div className="p-6 pb-20 [&_.animate-fade-in>.text-center]:hidden [&_.animate-fade-in>h2]:hidden [&_.animate-fade-in>p]:hidden">
                {currentStep === 1 && (
                  <StepDataDiri
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                    firstInputRef={firstInputRef}
                    isInline={true}
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
                    isInline={true}
                    hideHeader={true}
                  />
                )}
                {currentStep === 3 && (
                  <StepKonfirmasi
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                    onValidationChange={setIsImageValid}
                    onValidationStatusChange={(status) => setIsValidating(status === "VALIDATING")}
                    reqKtm={reqKtm}
                    reqFoto={reqFoto}
                    isInline={true}
                    hideHeader={true}
                  />
                )}
              </div>

              {isSubmitting && (
                <div
                  role="status"
                  aria-live="polite"
                  className="absolute inset-0 z-[60] flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-[2px] dark:bg-[#0d1412]/80"
                >
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-lg dark:border-[#3c4d46] dark:bg-[#131d1a]">
                    <Loader2 className="h-9 w-9 animate-spin text-[#006c49] dark:text-[#34d399]" aria-hidden />
                    <p className="text-sm font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                      Menyimpan data anggota...
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CustomScrollArea>

        <DrawerFooter className="flex shrink-0 flex-row items-center justify-between gap-3 border-t border-[#f1f5f9] bg-white px-6 py-4 dark:border-[#24332d] dark:bg-[#131d1a]">
          {isLoadingSettings ? (
            <div className="h-11 w-full" />
          ) : (
            <>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isSubmitting || isValidating}
                  className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-[#85929f] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
                >
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                  )}
                  <span>Sebelumnya</span>
                </button>
              ) : (
                <DrawerClose asChild>
                  <button
                    type="button"
                    disabled={isSubmitting || isValidating}
                    className="min-h-[44px] cursor-pointer rounded-lg border border-[#85929f] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] disabled:opacity-50 dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
                  >
                    Batal
                  </button>
                </DrawerClose>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStep === 2 && !isStep2Complete}
                  className={`flex min-h-[44px] items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold shadow-sm transition-colors ${
                    currentStep === 2 && !isStep2Complete
                      ? "cursor-not-allowed bg-[#006c49]/50 text-white opacity-60 dark:bg-[#057a55]/50"
                      : "cursor-pointer bg-[#006c49] text-white hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e]"
                  }`}
                >
                  <span>Selanjutnya</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isStep3SubmitReady || isValidating}
                  className={`flex min-h-[44px] items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold shadow-sm transition-colors ${
                    isStep3SubmitReady && !isValidating
                      ? "cursor-pointer bg-[#006c49] text-white hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e]"
                      : "cursor-not-allowed bg-[#006c49]/50 text-white opacity-60 dark:bg-[#057a55]/50"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      <span>Memproses...</span>
                    </>
                  ) : isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      <span>Mengecek KTM...</span>
                    </>
                  ) : (
                    <>
                      <span>Simpan Anggota</span>
                      <Send className="h-4 w-4" aria-hidden />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
