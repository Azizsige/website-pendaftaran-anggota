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
  const [isImageValid, setIsImageValid] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (currentStep === 3) {
          const el = document.getElementById("ktp-validation-item");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        } else {
          topRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          if (currentStep === 1) firstInputRef.current?.focus();
        }
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
    else if (!/^(\+62|62|0)8\d{8,11}$/.test(formData.noTelepon.replace(/\s/g, ""))) errs.noTelepon = "Format no. telepon tidak valid";
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

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      {children}
      <DrawerContent className="w-[90%] md:w-[600px] lg:w-[45%] xl:w-[40%] bg-white shadow-2xl border-l border-[#bbcabf]/20 flex flex-col">
        <DrawerHeader className="border-b border-[#bbcabf]/10 p-6 flex flex-row items-center justify-between shrink-0">
          <div>
            <DrawerTitle className="font-headline-md text-[20px] font-semibold text-[#191c1e] tracking-tight text-left">Add New Member</DrawerTitle>
            <DrawerDescription className="text-left mt-1 text-[#3c4a42]">Fill in the details to add a new member.</DrawerDescription>
          </div>
          <DrawerClose asChild>
            <button className="p-2 text-[#3c4a42] hover:bg-black/5 rounded-full transition-colors cursor-pointer -mt-4">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto" ref={topRef}>
          <div className="px-6 pt-6 pb-4 border-b border-[#bbcabf]/10">
            <StepIndicator currentStep={currentStep} />
          </div>
          <div className="p-6 pb-20 [&_.animate-fade-in>h2]:hidden [&_.animate-fade-in>p]:hidden [&_.animate-fade-in>.text-center]:hidden">
            {currentStep === 1 && (
              <StepDataDiri formData={formData} errors={errors} updateField={updateField} firstInputRef={firstInputRef} />
            )}
            {currentStep === 2 && (
              <StepDokumen formData={formData} errors={errors} updateField={updateField} firstInputRef={firstInputRef} />
            )}
            {currentStep === 3 && (
              <StepKonfirmasi 
                formData={formData} 
                errors={errors} 
                updateField={updateField} 
                onValidationChange={setIsImageValid}
              />
            )}
          </div>
        </div>

        <DrawerFooter className="border-t border-[#bbcabf]/10 flex flex-row justify-between gap-3 bg-white shrink-0 p-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-[16px] py-[8px] rounded-lg border border-[#bbcabf] text-[#191c1e] font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold hover:bg-[#e0e3e5]/50 transition-colors flex items-center gap-[4px] cursor-pointer"
            >
              <ArrowLeft size={18} />
              Sebelumnya
            </button>
          ) : (
            <DrawerClose asChild>
              <button className="px-[16px] py-[8px] font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer">
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
              disabled={!isStep3SubmitReady}
              className={`font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold py-[8px] px-[24px] rounded-lg transition-colors flex items-center gap-[4px] shadow-sm ${
                isStep3SubmitReady
                  ? "bg-[#006c49] text-[#ffffff] hover:bg-[#006c49]/90 cursor-pointer"
                  : "bg-[#006c49]/50 text-[#ffffff] opacity-50 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Kirim Pendaftaran
                  <Send size={18} />
                </>
              )}
            </button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
