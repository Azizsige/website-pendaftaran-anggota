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
import { FormData } from "./types";
import { formatDate } from "@/lib/format";
import type { ValidationStatusType } from "./useOcrValidation";

interface ConfirmationSummaryProps {
  formData: FormData;
  reqKtm?: boolean;
  reqFoto?: boolean;
  validationStatus: ValidationStatusType;
  validationError: string;
}

function SummaryField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="font-sans text-[14px] leading-[20px] text-[#3c4a42]">
        {label}
      </p>
      <p className="font-sans text-[16px] leading-[24px] text-[#191c1e] font-medium">
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
    <div className="flex items-center gap-[8px] border-b border-[#bbcabf]/20 pb-[8px]">
      <Icon size={20} className="text-[#006c49]" />
      <h3 className="font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e]">
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
    <div className="flex items-center justify-between bg-white border border-[#bbcabf]/20 p-[8px] rounded-[4px]">
      <div className="flex items-center gap-[8px]">
        <Icon size={20} className="text-[#565e74]" />
        <div>
          <p className="font-sans text-[14px] leading-[20px] text-[#191c1e] font-medium">
            {label}
          </p>
          <p className="font-sans text-[12px] leading-[16px] text-[#3c4a42]">
            File terpilih: {fileName || "Belum diunggah"}
          </p>
        </div>
      </div>
      {fileName && (
        <div className="flex items-center justify-center w-6 h-6">
          {status === "VALIDATING" && (
            <Loader2 size={20} className="text-blue-500 animate-spin" />
          )}
          {status === "FAILED" && (
            <AlertTriangle size={20} className="text-red-500" />
          )}
          {(status === "SUCCESS" || status === "BYPASSED") && (
            <CheckCircle size={20} className="text-[#006c49]" />
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
}: ConfirmationSummaryProps) {
  const birthDisplay = `${formData.tempatLahir || "-"}, ${formatDate(
    formData.tanggalLahir
  )}`;

  return (
    <>
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
          <SummaryField
            label="Program Studi / Jurusan"
            value={formData.jurusan}
          />
          <SummaryField label="Angkatan" value={formData.angkatan} />
          <SummaryField
            label="Alamat Lengkap"
            value={formData.alamat}
            className="sm:col-span-2"
          />
        </div>
      </section>

      {/* Summary Section: Dokumen Pendukung */}
      {(reqKtm || reqFoto) && (
        <section
          id="ktp-validation-item"
          className="bg-[#f7f9fb] rounded-[8px] border border-[#bbcabf]/20 p-[16px] flex flex-col gap-[16px] mb-[24px]"
        >
          <SectionHeader icon={FileText} title="Dokumen Pendukung" />
          <div className="flex flex-col gap-[8px]">
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

          {/* Validation Status Indicator */}
          <div id="ktm-loading-section" className="mt-2">
            {validationStatus === "VALIDATING" && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-200">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sistem sedang memverifikasi foto dokumen Anda...
              </div>
            )}
            {validationStatus === "FAILED" && (
              <div className="flex flex-col gap-2 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>
                    <strong>Validasi Foto Gagal:</strong> {validationError}
                    <br />
                    <em>
                      Pastikan foto hanya menampilkan KTM (tanpa latar belakang
                      seperti keyboard/benda lain yang lebih mencolok).
                    </em>
                  </span>
                </div>
                <div className="mt-2 pl-7">
                  <p className="text-xs font-medium text-red-600">
                    Silakan kembali ke langkah sebelumnya untuk mengunggah ulang
                    foto KTM yang lebih jelas.
                  </p>
                </div>
              </div>
            )}
            {validationStatus === "BYPASSED" && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 text-orange-700 rounded-md text-sm border border-orange-200">
                <AlertTriangle className="w-4 h-4" />
                Validasi otomatis diabaikan oleh Admin. Pastikan data sudah
                diverifikasi manual.
              </div>
            )}
            {validationStatus === "SUCCESS" &&
              (formData.fotoKTM || formData.pasFoto) && (
                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">
                  <CheckCircle className="w-4 h-4" />
                  Foto dokumen berhasil diverifikasi.
                </div>
              )}
          </div>
        </section>
      )}
    </>
  );
}
