"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

import type { Applicant } from "../types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CheckboxField, fieldClass } from "@/components/ui/form-field";
import { PersonSummary } from "@/components/admin/PersonSummary";

type Props = {
  applicant: Applicant;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
  isPending: boolean;
};

const QUICK_REASONS = [
  {
    label: "Foto KTM buram",
    text: "Foto Kartu Tanda Mahasiswa (KTM) yang diunggah buram atau terpotong sehingga NIM tidak terbaca jelas.",
  },
  {
    label: "Pas foto tidak sesuai",
    text: "Pas foto yang diunggah tidak memenuhi ketentuan organisasi (wajah tidak terlihat jelas atau bukan foto formal).",
  },
  {
    label: "Berkas tidak valid",
    text: "Format atau keabsahan dokumen unggahan mahasiswa tidak dapat divalidasi oleh panitia.",
  },
  {
    label: "NIM sudah terdaftar",
    text: "NIM atau identitas mahasiswa terindikasi sudah terdaftar sebelumnya di sistem portal organisasi.",
  },
];

export default function ApplicantRejectModal({
  applicant,
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: Props) {
  const [rejectReason, setRejectReason] = useState("");
  const [notifyApplicant, setNotifyApplicant] = useState(true);

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      tone="danger"
      icon="person_cancel"
      title="Konfirmasi Penolakan Pendaftar"
      description="Keputusan penolakan akan tercatat pada riwayat verifikasi pendaftar"
      confirmLabel="Tolak Pendaftaran"
      cancelLabel="Batal"
      isPending={isPending}
      pendingTitle="Sedang Memproses Penolakan"
      pendingMessage="Mohon tunggu sebentar..."
      confirmDisabled={!rejectReason.trim()}
      onConfirm={() => onConfirm(applicant.id, rejectReason)}
    >
      <div className="space-y-4">
        <PersonSummary
          id={applicant.id}
          name={applicant.user.name}
          email={applicant.user.email}
          phoneNumber={applicant.phoneNumber}
          status={applicant.status}
        />

        <div className="flex items-start gap-2.5 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-[#991b1b] dark:border-[#f87171]/40 dark:bg-[#3b1214] dark:text-[#fca5a5]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p className="text-xs leading-relaxed">
            Penolakan ini menghentikan pengajuan keanggotaan saat ini dan menyimpan alasan untuk transparansi pendaftar.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              className="flex items-center gap-1 text-[13px] font-semibold text-[#0f172a] dark:text-[#eef2f4]"
              htmlFor="rejection-reason"
            >
              Alasan Penolakan <span className="text-[#dc2626] dark:text-[#f87171]" aria-hidden>*</span>
            </label>
            <span className="font-mono text-[11px] text-[#64748b] tabular-nums dark:text-[#94a89e]">
              {rejectReason.length} / 500
            </span>
          </div>

          <textarea
            id="rejection-reason"
            className={fieldClass(
              false,
              "min-h-[96px] resize-y focus:border-[#dc2626] focus:ring-[#dc2626]/20"
            )}
            placeholder="Contoh: Foto Kartu Tanda Mahasiswa (KTM) tidak terbaca jelas sehingga NIM belum bisa diverifikasi..."
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value.substring(0, 500))}
          />

          <div className="space-y-1.5 pt-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#52606d] dark:text-[#94a89e]">
              Template Alasan Cepat
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_REASONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setRejectReason(item.text)}
                  className="min-h-[36px] cursor-pointer rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5 text-xs font-medium text-[#334155] transition-colors hover:border-[#fecaca] hover:bg-[#fef2f2] hover:text-[#991b1b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#cbd6d0] dark:hover:border-[#f87171]/40 dark:hover:bg-[#3b1214] dark:hover:text-[#fca5a5] dark:focus-visible:ring-[#f87171]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <CheckboxField
          checked={notifyApplicant}
          onChange={setNotifyApplicant}
          label="Catat notifikasi penolakan untuk pendaftar"
          description={applicant.user.email || "Email pemohon tidak tersedia"}
        />
      </div>
    </ConfirmDialog>
  );
}
