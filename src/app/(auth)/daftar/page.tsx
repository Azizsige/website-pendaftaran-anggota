"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { toast } from "sonner";
import { checkDuplicateRegistration } from "@/actions/register";
import { hashFile } from "@/lib/utils";

import { FormData, Errors, initialFormData } from "./_components/types";
import StepIndicator from "./_components/StepIndicator";
import StepDataDiri from "./_components/StepDataDiri";
import StepDokumen from "./_components/StepDokumen";
import StepKonfirmasi from "./_components/StepKonfirmasi";

/* ─── Main Registration Page ─── */
export default function DaftarPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<any>(null);

  useEffect(() => {
    if (currentStep === 3) {
      setTimeout(() => {
        const el = document.getElementById("ktp-validation-item");
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      topRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [currentStep]);

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

  /* ─── Validation ─── */
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
    if (!formData.pasFoto) errs.pasFoto = "Pas foto wajib diupload";
    if (!formData.fotoKTM) errs.fotoKTM = "Foto KTM wajib diupload";
    if (!formData.krsDokumen) errs.krsDokumen = "KRS Aktif / CV wajib diupload";
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
      let ktmHash = undefined;
      if (formData.fotoKTM) {
        ktmHash = await hashFile(formData.fotoKTM);
      }

      // Cek ke Database via Server Action
      const check = await checkDuplicateRegistration(formData.nim, formData.email, ktmHash);

      if (check.isDuplicate) {
        toast.error(check.error || "Data sudah terdaftar di sistem.");
        setIsSubmitting(false);
        return;
      }

      // Simulasi proses upload dan penyimpanan akhir (2 detik)
      // Di aplikasi sungguhan, proses insert ke DB dilakukan di sini
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push("/daftar/sukses");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem saat memverifikasi data.");
      setIsSubmitting(false);
    }
  };

  /* ─── Derived state for button disabled ─── */
  const isStep2Complete = !!(formData.pasFoto && formData.fotoKTM && formData.krsDokumen);
  const isStep3SubmitReady = formData.persetujuan && !isSubmitting;

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-sans min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#10b981]/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-[#d0e1fb]/30 rounded-full blur-[120px]"></div>
      </div>

      {/* TopNavBar */}
      <header className="flex justify-between items-center w-full px-[24px] py-[16px] max-w-[1280px] mx-auto bg-[#f7f9fb]/70 backdrop-blur-md border-b border-[#bbcabf]/10 shadow-sm sticky top-0 z-50">
        <Link href="/" className="font-sans text-[24px] leading-[32px] font-bold text-[#006c49] hover:opacity-80 transition-opacity cursor-pointer">
          MemberHub
        </Link>
        <Link
          href="/"
          className="font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#3c4a42] hover:text-[#006c49] transition-colors cursor-pointer"
        >
          Cancel
        </Link>
      </header>

      <main className="flex-grow flex items-start sm:items-center justify-center py-[48px] px-4 relative z-10 w-full">
        <div ref={topRef} className="w-full max-w-[640px] bg-white/80 backdrop-blur-[20px] border border-[#006c49]/15 rounded-xl shadow-sm overflow-hidden flex flex-col">

          {/* Progress Track Header */}
          <div className="px-[24px] md:px-[48px] pt-[24px] pb-[16px] border-b border-[#bbcabf]/10 bg-white">
            <StepIndicator currentStep={currentStep} />
          </div>

          {/* Form Content Body */}
          <div className="p-[24px] md:p-[48px] flex flex-col bg-white/50">
            {currentStep === 1 && (
              <StepDataDiri formData={formData} errors={errors} updateField={updateField} firstInputRef={firstInputRef} />
            )}
            {currentStep === 2 && (
              <StepDokumen formData={formData} errors={errors} updateField={updateField} firstInputRef={firstInputRef} />
            )}
            {currentStep === 3 && (
              <StepKonfirmasi formData={formData} errors={errors} updateField={updateField} />
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="px-[24px] md:px-[48px] py-[16px] border-t border-[#bbcabf]/10 bg-white flex justify-between items-center">
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
              <div></div>
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
          </div>

        </div>
      </main>
    </div>
  );
}
