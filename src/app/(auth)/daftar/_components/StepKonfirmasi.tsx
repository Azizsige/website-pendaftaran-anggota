"use client";

import React, { useState, useEffect } from "react";
import { User, FileText, ImageIcon, CreditCard, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FormData, Errors } from "./types";
import { preprocessImageForOCR } from "@/lib/image-processing";
import { verifyKtpWithVision } from "@/actions/ocr-vision";

interface StepKonfirmasiProps {
  formData: FormData;
  errors: Errors;
  updateField: (field: keyof FormData, value: string | File | null | boolean) => void;
  onValidationChange?: (isValid: boolean) => void;
}

/* ─── Reusable sub-components (DRY) ─── */

function SummaryField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="font-sans text-[14px] leading-[20px] text-[#3c4a42]">{label}</p>
      <p className="font-sans text-[16px] leading-[24px] text-[#191c1e] font-medium">{value || "-"}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-[8px] border-b border-[#bbcabf]/20 pb-[8px]">
      <Icon size={20} className="text-[#006c49]" />
      <h3 className="font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e]">
        {title}
      </h3>
    </div>
  );
}

type ValidationStatusType = "IDLE" | "VALIDATING" | "SUCCESS" | "FAILED" | "BYPASSED";

function DocumentItem({ icon: Icon, label, fileName, status = "IDLE" }: { icon: React.ElementType; label: string; fileName?: string; status?: ValidationStatusType }) {
  return (
    <div className="flex items-center justify-between bg-white border border-[#bbcabf]/20 p-[8px] rounded-[4px]">
      <div className="flex items-center gap-[8px]">
        <Icon size={20} className="text-[#565e74]" />
        <div>
          <p className="font-sans text-[14px] leading-[20px] text-[#191c1e] font-medium">{label}</p>
          <p className="font-sans text-[12px] leading-[16px] text-[#3c4a42]">
            File terpilih: {fileName || "Belum diunggah"}
          </p>
        </div>
      </div>
      {fileName && (
        <div className="flex items-center justify-center w-6 h-6">
          {status === "VALIDATING" && <Loader2 size={20} className="text-blue-500 animate-spin" />}
          {status === "FAILED" && <AlertTriangle size={20} className="text-red-500" />}
          {(status === "SUCCESS" || status === "BYPASSED") && <CheckCircle size={20} className="text-[#006c49]" />}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */

export default function StepKonfirmasi({ formData, errors, updateField, onValidationChange }: StepKonfirmasiProps) {
  const [validationStatus, setValidationStatus] = useState<"IDLE" | "VALIDATING" | "SUCCESS" | "FAILED" | "BYPASSED">("IDLE");
  const [validationError, setValidationError] = useState<string>("");

  const birthDisplay = `${formData.tempatLahir || "-"}, ${
    formData.tanggalLahir ? format(new Date(formData.tanggalLahir), "d MMMM yyyy", { locale: id }) : "-"
  }`;

  useEffect(() => {
    // Only run validation if there are files
    if (!formData.fotoKTM) {
      setValidationStatus("SUCCESS");
      if (onValidationChange) onValidationChange(true);
      return;
    }

    let isMounted = true;

    const validateWithOCR = async () => {
      if (isMounted) {
        setValidationStatus("VALIDATING");
        if (onValidationChange) onValidationChange(false);
      }
      
      try {
        // Preprocess image to Black & White for smaller payload
        const preprocessedImageUrl = await preprocessImageForOCR(formData.fotoKTM!);

        // Panggil Google Cloud Vision API melalui Server Action
        const result = await verifyKtpWithVision(preprocessedImageUrl);

        if (!isMounted) return;

        if (!result.success) {
          setValidationStatus("FAILED");
          setValidationError(result.error || "Gagal memproses gambar KTM dengan Google Vision API.");
          if (onValidationChange) onValidationChange(false);
          return;
        }

        const rawText = result.text || "";
        // Normalisasi teks: hilangkan spasi, ubah huruf yang sering salah baca menjadi angka
        const normalizedText = rawText
          .replace(/\s/g, '')
          .replace(/O/gi, '0')
          .replace(/l/g, '1')
          .replace(/I/g, '1')
          .replace(/B/gi, '8')
          .replace(/S/gi, '5')
          .replace(/Z/gi, '2')
          .replace(/G/gi, '6')
          .replace(/A/gi, '4');

        // Ekstrak HANYA ANGKA
        const digitsOnly = normalizedText.replace(/\D/g, '');
        const targetNik = formData.nim;
        
        // Pengecekan EXACT MATCH 100% (Sangat Ketat)
        let isMatch = digitsOnly.includes(targetNik);

        // Cek apakah NIM yang diinput user ada kecocokan 100% di dalam teks OCR Google
        if (isMatch) {
          setValidationStatus("SUCCESS");
          if (onValidationChange) onValidationChange(true);
        } else {
          setValidationStatus("FAILED");
          setValidationError(`Data NIM tidak cocok dengan foto KTM. Mohon periksa kembali inputan Anda atau pastikan foto KTM terlihat jelas.`);
          if (onValidationChange) onValidationChange(false);
        }
      } catch (error) {
        console.error("OCR Error:", error);
        if (isMounted) {
          setValidationStatus("FAILED");
          setValidationError("Gagal memproses gambar KTM. Pastikan file yang diunggah valid.");
          if (onValidationChange) onValidationChange(false);
        }
      }
    };

    validateWithOCR();

    return () => {
      isMounted = false;
    };
  }, [formData.fotoKTM, formData.nim, onValidationChange]);

  return (
    <div className="transition-opacity duration-300 animate-fade-in">
      <div className="text-center mb-[24px]">
        <h2 className="font-sans text-[24px] md:text-[32px] md:leading-[40px] font-semibold text-[#191c1e] mb-[8px]">
          Konfirmasi Pendaftaran
        </h2>
        <p className="font-sans text-[16px] leading-[24px] text-[#3c4a42]">
          Silakan periksa kembali data Anda sebelum mengirimkan pendaftaran.
        </p>
      </div>

      {/* Summary Section: Informasi Pribadi */}
      <section className="bg-[#f7f9fb] rounded-[8px] border border-[#bbcabf]/20 p-[16px] flex flex-col gap-[16px] mb-[24px]">
        <SectionHeader icon={User} title="Informasi Pribadi" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-[12px] gap-x-[16px]">
          <SummaryField label="Nama Lengkap" value={formData.namaLengkap} />
          <SummaryField label="NIM" value={formData.nim} />
          <SummaryField label="Email" value={formData.email} />
          <SummaryField label="Nomor Telepon" value={formData.noTelepon} />
          <SummaryField label="Tempat, Tanggal Lahir" value={birthDisplay} />
          <SummaryField label="Jenis Kelamin" value={formData.jenisKelamin} />
          <SummaryField label="Fakultas" value={formData.fakultas} />
          <SummaryField label="Program Studi / Jurusan" value={formData.jurusan} />
          <SummaryField label="Angkatan" value={formData.angkatan} />
          <SummaryField label="Alamat Lengkap" value={formData.alamat} className="sm:col-span-2" />
        </div>
      </section>

      {/* Summary Section: Dokumen Pendukung */}
      <section id="ktp-validation-item" className="bg-[#f7f9fb] rounded-[8px] border border-[#bbcabf]/20 p-[16px] flex flex-col gap-[16px] mb-[24px]">
        <SectionHeader icon={FileText} title="Dokumen Pendukung" />
        <div className="flex flex-col gap-[8px]">
          <DocumentItem icon={ImageIcon} label="Pas Foto" fileName={formData.pasFoto?.name} status={formData.pasFoto ? "SUCCESS" : "IDLE"} />
          <DocumentItem icon={CreditCard} label="Foto KTM" fileName={formData.fotoKTM?.name} status={validationStatus} />
        </div>
        
        {/* Validation Status Indicator */}
        <div className="mt-2">
          {validationStatus === "VALIDATING" && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-200">
              <Loader2 className="w-4 h-4 animate-spin" />
              Sistem AI sedang menganalisis kualitas dokumen Anda...
            </div>
          )}
          {validationStatus === "FAILED" && (
            <div className="flex flex-col gap-2 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>
                  <strong>Validasi AI Gagal:</strong> {validationError}
                  <br />
                  <em>Pastikan foto hanya menampilkan KTM (tanpa latar belakang seperti keyboard/benda lain yang lebih mencolok).</em>
                </span>
              </div>
              <div className="mt-2 pl-7">
                <p className="text-xs font-medium text-red-600">
                  Silakan kembali ke langkah sebelumnya untuk mengunggah ulang foto KTM yang lebih jelas.
                </p>
              </div>
            </div>
          )}
          {validationStatus === "BYPASSED" && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 text-orange-700 rounded-md text-sm border border-orange-200">
              <AlertTriangle className="w-4 h-4" />
              Validasi AI diabaikan oleh Admin. Pastikan data sudah diverifikasi manual.
            </div>
          )}
          {validationStatus === "SUCCESS" && (formData.fotoKTM || formData.pasFoto) && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">
              <CheckCircle className="w-4 h-4" />
              Dokumen terverifikasi oleh AI.
            </div>
          )}
        </div>
      </section>

      {/* Agreement Section */}
      <div className="flex items-start gap-[8px]">
        <div className="pt-[2px]">
          <input
            type="checkbox"
            id="agreement"
            disabled={validationStatus !== "SUCCESS" && validationStatus !== "BYPASSED"}
            checked={formData.persetujuan}
            onChange={(e) => updateField("persetujuan", e.target.checked)}
            className="w-5 h-5 rounded border-[#bbcabf] text-[#006c49] focus:ring-[#006c49] focus:ring-2 focus:ring-offset-2 transition-colors cursor-pointer bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <label htmlFor="agreement" className={`font-sans text-[14px] leading-[20px] select-none ${(validationStatus !== "SUCCESS" && validationStatus !== "BYPASSED") ? "text-gray-400 cursor-not-allowed" : "text-[#3c4a42] cursor-pointer"}`}>
          Saya menyatakan bahwa semua data yang saya masukkan adalah benar dan dapat dipertanggungjawabkan.
        </label>
      </div>
      {errors.persetujuan && <p className="text-[14px] text-[#ba1a1a] mt-[4px]">{errors.persetujuan}</p>}
    </div>
  );
}
