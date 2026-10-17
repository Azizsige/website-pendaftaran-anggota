"use client";

import React, { useState } from "react";
import type { Applicant } from "../types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PersonSummary } from "@/components/admin/PersonSummary";

type Props = {
  applicant: Applicant;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
  isPending: boolean;
};

const QUICK_REASONS = [
  "Dokumen KTP yang diunggah buram dan tidak terbaca jelas.",
  "Ijazah / sertifikat keahlian tidak memenuhi ketentuan kualifikasi organisasi.",
  "Format atau keaslian berkas unggahan tidak dapat divalidasi.",
  "NIK atau identitas pendaftar terindikasi sudah terdaftar sebelumnya (data ganda).",
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
      description="Tindakan ini tidak dapat dibatalkan setelah dikonfirmasi"
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

        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-error/10 border border-error/20 text-error">
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
          <p className="text-xs leading-relaxed text-error">
            Tindakan ini akan menolak berkas pemohon dan mencatat alasan penolakan secara permanen.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-on-surface flex items-center gap-1" htmlFor="rejection-reason">
              Alasan Penolakan <span className="text-error">*</span>
            </label>
            <span className="text-[11px] font-code-sm text-on-surface-variant/60">
              {rejectReason.length} / 500 karakter
            </span>
          </div>

          <textarea
            id="rejection-reason"
            className="w-full p-3 bg-surface border border-outline-variant/30 rounded-lg text-xs font-body-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-all"
            placeholder="Contoh: Berkas KTP tidak terbaca jelas dan dokumen ijazah tidak sesuai dengan kriteria yang ditentukan organisasi..."
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value.substring(0, 500))}
          />

          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-on-surface-variant/70 block">
              Pilih Alasan Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-container-high text-on-surface-variant hover:bg-error/10 hover:text-error hover:border-error/30 border border-outline-variant/20 transition-colors cursor-pointer"
                  onClick={() => setRejectReason(reason)}
                >
                  {reason.split(" ")[0]} {reason.split(" ")[1]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-outline-variant/10">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notifyApplicant}
              onChange={(e) => setNotifyApplicant(e.target.checked)}
              className="mt-0.5 rounded border-outline-variant/40 text-error focus:ring-error w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-body-sm text-on-surface-variant leading-tight">
              Kirim email notifikasi otomatis beserta alasan penolakan ke pemohon (
              <span className="text-primary font-medium">{applicant.user.email || "-"}</span>)
            </span>
          </label>
        </div>
      </div>
    </ConfirmDialog>
  );
}
