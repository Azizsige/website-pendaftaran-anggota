import React from "react";
import {
  User,
  FileText,
  ImageIcon,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { FormData } from "../types";
import { formatDate, formatIndonesianPhoneInput } from "@/lib/format";
import type { ValidationStatusType } from "../hooks/useOcrValidation";

interface ConfirmationSummaryProps {
  formData: FormData;
  reqKtm?: boolean;
  reqFoto?: boolean;
  validationStatus: ValidationStatusType;
  validationError: string;
  isInline?: boolean;
  rightPanelFooter?: React.ReactNode;
}

function SummaryField({
  label,
  value,
  className,
  mono = false,
}: {
  label: string;
  value: string;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div className={className}>
      <p className="font-sans text-[12px] leading-[16px] text-[#4b5850] dark:text-[#a8bab0]">
        {label}
      </p>
      <p
        className={`text-[13px] sm:text-[14px] leading-[20px] text-[#191c1e] dark:text-[#eef2f4] font-semibold break-words ${
          mono ? "font-mono" : "font-sans"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-[#5c6b62]/20 dark:border-[#3c4d46] pb-2">
      <Icon size={18} className="text-[#006c49] dark:text-[#34d399] shrink-0" aria-hidden="true" />
      <h3 className="font-sans text-[13px] leading-[18px] tracking-[0.02em] font-semibold text-[#191c1e] dark:text-[#eef2f4]">
        {title}
      </h3>
    </div>
  );
}

function DocumentItem({
  icon: Icon,
  label,
  fileName,
  status = "IDLE",
}: {
  icon: React.ElementType;
  label: string;
  fileName?: string;
  status?: ValidationStatusType;
}) {
  return (
    <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#131d1a] border border-[#5c6b62]/25 dark:border-[#3c4d46] px-2.5 py-2 rounded-lg">
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={18} className="text-[#3c4a42] dark:text-[#a8bab0] shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-sans text-[13px] leading-[18px] text-[#191c1e] dark:text-[#eef2f4] font-semibold">
            {label}
          </p>
          <p className="font-sans text-[11px] leading-[15px] text-[#4b5850] dark:text-[#a8bab0] truncate">
            {fileName || "Belum diunggah"}
          </p>
        </div>
      </div>
      {fileName && (
        <div className="flex items-center justify-center w-6 h-6 shrink-0">
          {status === "VALIDATING" && (
            <Loader2
              size={18}
              className="spinner-essential text-[#1d4ed8] dark:text-[#93c5fd]"
              aria-hidden="true"
            />
          )}
          {status === "FAILED" && (
            <AlertTriangle size={18} className="text-[#ba1a1a] dark:text-[#fca5a5]" aria-hidden="true" />
          )}
          {(status === "SUCCESS" || status === "BYPASSED") && (
            <CheckCircle size={18} className="text-[#006c49] dark:text-[#34d399]" aria-hidden="true" />
          )}
        </div>
      )}
    </div>
  );
}

export function ConfirmationSummary({
  formData,
  reqKtm = true,
  reqFoto = true,
  validationStatus,
  validationError,
  isInline = false,
  rightPanelFooter,
}: ConfirmationSummaryProps) {
  const birthDisplay = `${formData.tempatLahir || "-"}, ${formatDate(
    formData.tanggalLahir
  )}`;

  const personalSection = (
    <section className="bg-[#f7f9fb] dark:bg-[#1a2723] rounded-xl border border-[#5c6b62]/25 dark:border-[#3c4d46] p-3.5 sm:p-4 flex flex-col gap-3">
      <SectionHeader icon={User} title="Informasi Pribadi & Akademik" />
      <div
        className={
          isInline
            ? "grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4"
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2.5 gap-x-4"
        }
      >
        <SummaryField label="Nama Lengkap" value={formData.namaLengkap} />
        <SummaryField label="NIM" value={formData.nim} mono />
        <SummaryField label="Jenis Kelamin" value={formData.jenisKelamin} />
        <SummaryField label="Tempat, Tanggal Lahir" value={birthDisplay} />
        <SummaryField label="Alamat Email" value={formData.email} />
        <SummaryField
          label="Nomor Telepon"
          value={
            formatIndonesianPhoneInput(formData.noTelepon, {
              ensureLeadingZero: true,
            }) || formData.noTelepon
          }
          mono
        />
        <SummaryField label="Fakultas" value={formData.fakultas} />
        <SummaryField label="Program Studi / Jurusan" value={formData.jurusan} />
        <SummaryField label="Tahun Angkatan" value={formData.angkatan} mono />
        <SummaryField
          label="Alamat Domisili Lengkap"
          value={formData.alamat}
          className={isInline ? "sm:col-span-2" : "sm:col-span-2 md:col-span-3"}
        />
      </div>
    </section>
  );

  const documentSection = (reqKtm || reqFoto) ? (
    <section
      id="ktp-validation-item"
      className="bg-[#f7f9fb] dark:bg-[#1a2723] rounded-xl border border-[#5c6b62]/25 dark:border-[#3c4d46] p-3.5 sm:p-4 flex flex-col gap-2.5"
    >
      <SectionHeader icon={FileText} title="Dokumen Pendukung" />
      <div className="grid grid-cols-1 gap-2">
        {reqFoto && (
          <DocumentItem
            icon={ImageIcon}
            label="Pas Foto"
            fileName={formData.pasFoto?.name}
            status={formData.pasFoto ? "SUCCESS" : "IDLE"}
          />
        )}
        {reqKtm && (
          <DocumentItem
            icon={CreditCard}
            label="Foto KTM"
            fileName={formData.fotoKTM?.name}
            status={validationStatus}
          />
        )}
      </div>

      <div id="ktm-loading-section" className="scroll-mt-24">
        {validationStatus === "VALIDATING" && (
          <div className="flex items-center gap-2 p-2.5 bg-[#eff6ff] dark:bg-[#132544] text-[#1e40af] dark:text-[#93c5fd] rounded-lg text-xs font-medium border border-[#1d4ed8]/30 dark:border-[#3b82f6]/40">
            <Loader2 className="w-4 h-4 spinner-essential shrink-0" aria-hidden="true" />
            <span>Sistem sedang memverifikasi foto dokumen Anda...</span>
          </div>
        )}
        {validationStatus === "FAILED" && (
          <div className="flex flex-col gap-1.5 p-2.5 bg-[#fef2f2] dark:bg-[#3b1214] text-[#991b1b] dark:text-[#fca5a5] rounded-lg text-xs border border-[#ba1a1a]/30 dark:border-[#f87171]/40">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Validasi Foto Gagal:</strong> {validationError}{" "}
                <em>
                  Pastikan foto hanya menampilkan KTM yang terbaca jelas.
                </em>
              </span>
            </div>
            <p className="pl-6 text-[11px] font-medium text-[#991b1b] dark:text-[#fecaca]">
              Silakan kembali ke tahap Dokumen untuk mengunggah ulang foto KTM.
            </p>
          </div>
        )}
        {validationStatus === "BYPASSED" && (
          <div className="flex items-center gap-2 p-2.5 bg-[#fef3c7] dark:bg-[#3b2506] text-[#92400e] dark:text-[#fcd34d] rounded-lg text-xs font-medium border border-[#d97706]/35 dark:border-[#f59e0b]/40">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              Validasi otomatis diabaikan oleh Admin. Pastikan data diverifikasi manual.
            </span>
          </div>
        )}
        {validationStatus === "SUCCESS" &&
          (formData.fotoKTM || formData.pasFoto) && (
            <div className="flex items-center gap-2 p-2.5 bg-[#e6f4ee] dark:bg-[#0a3326] text-[#005236] dark:text-[#6ee7b7] rounded-lg text-xs font-semibold border border-[#006c49]/30 dark:border-[#34d399]/40">
              <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Foto dokumen berhasil diverifikasi.</span>
            </div>
          )}
      </div>
    </section>
  ) : null;

  if (isInline) {
    return (
      <div className="flex flex-col gap-4 mb-4">
        {personalSection}
        {documentSection}
        {rightPanelFooter}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      <div className="lg:col-span-7">{personalSection}</div>
      <div className="lg:col-span-5 flex flex-col gap-3">
        {documentSection}
        {rightPanelFooter}
      </div>
    </div>
  );
}
