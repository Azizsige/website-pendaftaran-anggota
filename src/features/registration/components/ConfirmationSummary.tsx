"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
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
  bottomBar?: React.ReactNode;
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
      <p className="font-sans text-[12px] leading-[16px] text-[#4b5850] dark:text-[#9fb3ac]">
        {label}
      </p>
      <p
        className={`text-[13px] sm:text-[14px] leading-[20px] text-[#191c1e] dark:text-[#e9f1ee] font-semibold break-words ${
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
    <div className="flex items-center gap-2 border-b border-[#5c6b62]/20 dark:border-[#2a3b36] pb-2.5">
      <Icon size={17} className="text-[#006c49] dark:text-[#34d399] shrink-0" aria-hidden="true" />
      <h2 className="font-sans text-[13px] leading-[18px] font-bold text-[#006c49] dark:text-[#34d399]">
        {title}
      </h2>
    </div>
  );
}

function DocumentItem({
  icon: Icon,
  label,
  file,
  status = "IDLE",
}: {
  icon: React.ElementType;
  label: string;
  file?: File | null;
  status?: ValidationStatusType;
}) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      const clearTimer = window.setTimeout(() => setThumbUrl(null), 0);
      return () => window.clearTimeout(clearTimer);
    }
    const url = URL.createObjectURL(file);
    const setTimer = window.setTimeout(() => setThumbUrl(url), 0);
    return () => {
      window.clearTimeout(setTimer);
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#121c19] border border-[#5c6b62]/25 dark:border-[#2a3b36] p-2.5 rounded-[10px]">
      <div className="flex items-center gap-3 min-w-0">
        {thumbUrl ? (
          <Image
            src={thumbUrl}
            alt={`Pratinjau ${label}`}
            width={44}
            height={44}
            unoptimized
            className="w-11 h-11 rounded-lg object-cover border border-[#5c6b62]/25 dark:border-[#3b524b] shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-lg bg-[#f2f4f6] dark:bg-[#1a2824] border border-[#5c6b62]/20 dark:border-[#2a3b36] flex items-center justify-center shrink-0">
            <Icon size={18} className="text-[#3c4a42] dark:text-[#9fb3ac]" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-sans text-[13px] leading-[18px] text-[#191c1e] dark:text-[#e9f1ee] font-semibold">
            {label}
          </p>
          <p className="font-sans text-[12px] leading-[16px] text-[#4b5850] dark:text-[#9fb3ac] truncate">
            {file
              ? `${file.name} (${(file.size / 1024).toFixed(0)} KB)`
              : "Belum diunggah"}
          </p>
        </div>
      </div>
      {file && (
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
  bottomBar,
}: ConfirmationSummaryProps) {
  const birthDisplay = `${formData.tempatLahir || "-"}, ${formatDate(
    formData.tanggalLahir
  )}`;
  const hasDocuments = reqKtm || reqFoto;

  const personalSection = (
    <section className="h-full bg-[#f7f9fb] dark:bg-[#1a2824]/70 rounded-xl border border-[#5c6b62]/25 dark:border-[#2a3b36] p-4 flex flex-col gap-3">
      <SectionHeader icon={User} title="Informasi pribadi & akademik" />
      <div
        className={
          isInline
            ? "grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4"
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2.5 gap-x-4"
        }
      >
        <SummaryField label="Nama lengkap" value={formData.namaLengkap} />
        <SummaryField label="NIM" value={formData.nim} mono />
        <SummaryField label="Jenis kelamin" value={formData.jenisKelamin} />
        <SummaryField label="Tempat, tanggal lahir" value={birthDisplay} />
        <SummaryField label="Email" value={formData.email} />
        <SummaryField
          label="Nomor telepon"
          value={
            formatIndonesianPhoneInput(formData.noTelepon, {
              ensureLeadingZero: true,
            }) || formData.noTelepon
          }
          mono
        />
        <SummaryField label="Fakultas" value={formData.fakultas} />
        <SummaryField label="Program studi" value={formData.jurusan} />
        <SummaryField label="Tahun angkatan" value={formData.angkatan} mono />
        <SummaryField
          label="Alamat domisili lengkap"
          value={formData.alamat}
          className={isInline ? "sm:col-span-2" : "sm:col-span-2 md:col-span-3"}
        />
      </div>
    </section>
  );

  const documentSection = hasDocuments ? (
    <section
      id="ktp-validation-item"
      className="h-full bg-[#f7f9fb] dark:bg-[#1a2824]/70 rounded-xl border border-[#5c6b62]/25 dark:border-[#2a3b36] p-4 flex flex-col gap-3"
    >
      <SectionHeader icon={FileText} title="Dokumen pendukung" />
      <div className="flex flex-col gap-2.5">
        {reqFoto && (
          <DocumentItem
            icon={ImageIcon}
            label="Pas Foto"
            file={formData.pasFoto}
            status={formData.pasFoto ? "SUCCESS" : "IDLE"}
          />
        )}
        {reqKtm && (
          <DocumentItem
            icon={CreditCard}
            label="Foto KTM"
            file={formData.fotoKTM}
            status={validationStatus}
          />
        )}
      </div>

      <div id="ktm-loading-section" className="mt-auto pt-1 scroll-mt-24">
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
                <em>Pastikan foto hanya menampilkan KTM yang terbaca jelas.</em>
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
        {bottomBar}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className={hasDocuments ? "lg:col-span-7" : "lg:col-span-12"}>
          {personalSection}
        </div>
        {hasDocuments && <div className="lg:col-span-5">{documentSection}</div>}
      </div>
      {bottomBar}
    </div>
  );
}
