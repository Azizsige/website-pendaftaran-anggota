"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { toast } from "sonner";
import { FormData, Errors, initialFormData } from "@/app/(auth)/daftar/_components/types";
import StepIndicator from "@/app/(auth)/daftar/_components/StepIndicator";
import StepDataDiri from "@/app/(auth)/daftar/_components/StepDataDiri";
import StepDokumen from "@/app/(auth)/daftar/_components/StepDokumen";
import StepKonfirmasi from "@/app/(auth)/daftar/_components/StepKonfirmasi";
import { createMember } from "@/actions/admin-members";
import { hashFile } from "@/lib/utils";
import { getSystemSettings } from "@/app/actions/setting-actions";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface AddMemberDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  onSuccess?: () => void;
}

export const AddMemberDrawer = ({ open, onOpenChange, children, onSuccess }: AddMemberDrawerProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isImageValid, setIsImageValid] = useState(false);

  const [reqKtm, setReqKtm] = useState(true);
  const [reqFoto, setReqFoto] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const topRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      setIsLoadingSettings(true);
      const fetchSettings = async () => {
        try {
          const res = await getSystemSettings();
          if (res.success && res.data) {
            res.data.forEach((setting: any) => {
              if (setting.key === 'reg_req_ktm') setReqKtm(setting.value === 'true');
              if (setting.key === 'reg_req_foto') setReqFoto(setting.value === 'true');
            });
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingSettings(false);
        }
      };
      fetchSettings();

      setTimeout(() => {
        topRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        if (currentStep === 1) firstInputRef.current?.focus();
      }, 100);
    } else {
      // Reset form when drawer closes
      setCurrentStep(1);
      setFormData(initialFormData);
      setErrors({});
    }
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
    if (!formData.noTelepon.trim()) errs.noTelepon = "No. telepon wajib diisi";
    else if (formData.noTelepon.replace(/\D/g, "").length < 9) errs.noTelepon = "Format no. telepon tidak valid";
    if (!formData.tempatLahir.trim()) errs.tempatLahir = "Tempat lahir wajib diisi";
    if (!formData.tanggalLahir) errs.tanggalLahir = "Tanggal lahir wajib diisi";
    if (!formData.jenisKelamin) errs.jenisKelamin = "Jenis kelamin wajib dipilih";
    if (!formData.alamat.trim()) errs.alamat = "Alamat wajib diisi";
    if (!formData.fakultas) errs.fakultas = "Fakultas wajib dipilih";
    if (!formData.jurusan.trim()) errs.jurusan = "Jurusan wajib diisi";
    if (!formData.angkatan) errs.angkatan = "Angkatan wajib dipilih";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Errors = {};
    // Optional for admin upload for now, or you can require it
    // if (!formData.pasFoto) errs.pasFoto = "Pas foto wajib diupload";
    // if (!formData.fotoKTP) errs.fotoKTP = "Foto KTP wajib diupload";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const hasStep2 = reqKtm || reqFoto;

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(hasStep2 ? 2 : 3);
      } else {
        setTimeout(() => {
          const firstError = document.querySelector('.border-\\[\\#ba1a1a\\]') as HTMLElement;
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      // Convert file to Base64 to save permanently in database
      const getBase64 = (file: File | null): Promise<string> => {
        return new Promise((resolve, reject) => {
          if (!file) return resolve("");
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      };
      
      const pasFotoUrl = await getBase64(formData.pasFoto);
      const fotoKTMUrl = await getBase64(formData.fotoKTM);

      // Calculate hashes
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
        toast.success("Member berhasil ditambahkan!");
        onOpenChange(false);
        setCurrentStep(1);
        setFormData(initialFormData);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Gagal menambahkan member.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // We relaxed step 2 requirement since it's Admin uploading
  const isStep2Complete = true; // !!(formData.pasFoto && formData.fotoKTP);
  const isStep3SubmitReady = formData.persetujuan && !isSubmitting && isImageValid;

  return (
    <Drawer open={open} onOpenChange={(val) => {
      if (isSubmitting) return;
      onOpenChange(val);
    }} direction="right">
      {children}
      <DrawerContent 
        id="admin-member-drawer-content"
        onInteractOutside={(e) => {
          if ((e.target as Element).closest('#cropper-portal')) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          if ((e.target as Element).closest('#cropper-portal')) {
            e.preventDefault();
          }
        }}
        className="w-[90%] md:w-[600px] lg:w-[45%] xl:w-[40%] bg-white shadow-2xl border-l border-[#bbcabf]/20 flex flex-col"
      >
        <DrawerHeader className="border-b border-[#bbcabf]/10 p-6 flex flex-row items-center justify-between shrink-0">
          <div>
            <DrawerTitle className="font-headline-md text-[20px] font-semibold text-[#191c1e] tracking-tight text-left">Add New Member</DrawerTitle>
            <DrawerDescription className="text-left mt-1 text-[#3c4a42]">Fill in the details to add a new member.</DrawerDescription>
          </div>
          <DrawerClose asChild>
            <button disabled={isSubmitting} className="p-2 text-[#3c4a42] hover:bg-black/5 rounded-full transition-colors cursor-pointer -mt-4 disabled:opacity-50">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto" ref={topRef}>
          {isLoadingSettings ? (
            <div className="flex justify-center items-center h-40 mt-10">
              <div className="w-8 h-8 border-4 border-[#006c49] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="px-6 pt-6 pb-4 border-b border-[#bbcabf]/10">
                <StepIndicator currentStep={currentStep} hasStep2={hasStep2} />
              </div>
              <div className="p-6 pb-20 [&_.animate-fade-in>h2]:hidden [&_.animate-fade-in>p]:hidden [&_.animate-fade-in>.text-center]:hidden">
                {currentStep === 1 && (
                  <StepDataDiri formData={formData} errors={errors} updateField={updateField} firstInputRef={firstInputRef} />
                )}
                {currentStep === 2 && hasStep2 && (
                  <StepDokumen formData={formData} errors={errors} updateField={updateField} firstInputRef={firstInputRef} reqKtm={reqKtm} reqFoto={reqFoto} isInline={true} />
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
                  />
                )}
              </div>
              
              {/* Form Loading Overlay */}
              {isSubmitting && (
                <div className="absolute inset-0 z-[60] bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
                  <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-lg border border-[#bbcabf]/20">
                    <div className="w-10 h-10 border-4 border-[#006c49] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#006c49] font-medium animate-pulse">Menyimpan data...</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DrawerFooter className="border-t border-[#bbcabf]/10 flex flex-row justify-between gap-3 bg-white shrink-0 p-6">
          {isLoadingSettings ? (
            <div className="h-[40px] w-full" />
          ) : (
            <>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isSubmitting || isValidating}
                  className="px-[16px] py-[8px] rounded-lg border border-[#bbcabf] text-[#191c1e] font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold hover:bg-[#e0e3e5]/50 transition-colors flex items-center gap-[4px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? (
                    <div className="w-4 h-4 border-2 border-[#191c1e]/30 border-t-[#191c1e] rounded-full animate-spin" />
                  ) : (
                    <ArrowLeft size={18} />
                  )}
                  Sebelumnya
                </button>
              ) : (
                <DrawerClose asChild>
                  <button disabled={isSubmitting || isValidating} className="px-[16px] py-[8px] font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer disabled:opacity-50">
                    Cancel
                  </button>
                </DrawerClose>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStep === 2 && !isStep2Complete}
                  className={`font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold py-[8px] px-[24px] rounded-lg transition-colors flex items-center gap-[4px] shadow-sm ${
                    currentStep === 2 && !isStep2Complete
                      ? "bg-[#006c49]/50 text-[#ffffff] opacity-50 cursor-not-allowed"
                      : "bg-[#006c49] text-[#ffffff] hover:bg-[#006c49]/90 cursor-pointer"
                  }`}
                >
                  Selanjutnya
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isStep3SubmitReady || isValidating}
                  className={`font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold py-[8px] px-[24px] rounded-lg transition-colors flex items-center gap-[4px] shadow-sm ${
                    isStep3SubmitReady && !isValidating
                      ? "bg-[#006c49] text-[#ffffff] hover:bg-[#006c49]/90 cursor-pointer"
                      : "bg-[#006c49]/50 text-[#ffffff] opacity-50 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : isValidating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mengecek KTM...
                    </>
                  ) : (
                    <>
                      Kirim Pendaftaran
                      <Send size={18} />
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
