import React from "react";
import { FileEdit, Lock, Pencil } from "lucide-react";

import { fieldClass } from "@/components/ui/form-field";

interface ApplicantNotesCardProps {
  adminNotes?: string | null;
  tempNotes: string;
  isEditingNotes: boolean;
  onTempNotesChange: (val: string) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveNotes: () => void;
  isPending: boolean;
  applicantStatus?: string;
  titleMode?: "pendaftar" | "member";
  userRole?: string;
}

export function ApplicantNotesCard({
  adminNotes,
  tempNotes,
  isEditingNotes,
  onTempNotesChange,
  onStartEditing,
  onCancelEditing,
  onSaveNotes,
  isPending,
  applicantStatus,
  titleMode,
  userRole,
}: ApplicantNotesCardProps) {
  const isRejected = applicantStatus === "REJECTED";
  const canEditNotes = titleMode === "pendaftar" && userRole !== "STAFF" && !isRejected;

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 dark:border-[#3c4d46] dark:bg-[#131d1a]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <label
          htmlFor="applicant-admin-notes"
          className="flex items-center gap-2 text-sm font-semibold text-[#0f172a] dark:text-[#eef2f4]"
        >
          <FileEdit className="h-4 w-4 text-[#64748b] dark:text-[#94a89e]" aria-hidden />
          Catatan Admin
        </label>
        {isRejected ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#475569] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#cbd6d0]">
            <Lock className="h-3 w-3" aria-hidden />
            <span>Hanya Baca</span>
          </span>
        ) : (
          !isEditingNotes &&
          canEditNotes && (
            <button
              type="button"
              onClick={onStartEditing}
              className="inline-flex min-h-[36px] cursor-pointer select-none items-center gap-1.5 rounded-full border border-[#006c49]/20 bg-[#e6f4ee] px-3 py-1 text-xs font-semibold text-[#005236] transition-colors hover:bg-[#cde9dc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7] dark:hover:bg-[#114d3a] dark:focus-visible:ring-[#34d399]"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              <span>Edit</span>
            </button>
          )
        )}
      </div>

      {isEditingNotes && canEditNotes ? (
        <div className="flex w-full flex-col gap-3">
          <textarea
            id="applicant-admin-notes"
            className={fieldClass(false, "min-h-[88px] resize-y text-xs")}
            value={tempNotes}
            onChange={(e) => onTempNotesChange(e.target.value)}
            placeholder="Masukkan catatan verifikasi admin di sini..."
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="min-h-[40px] cursor-pointer rounded-lg border border-[#85929f] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#f8fafc] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d]"
              onClick={onCancelEditing}
            >
              Batal
            </button>
            <button
              type="button"
              className="min-h-[40px] cursor-pointer rounded-lg bg-[#006c49] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#005236] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#057a55] dark:hover:bg-[#046c4e]"
              disabled={isPending}
              onClick={onSaveNotes}
            >
              Simpan
            </button>
          </div>
        </div>
      ) : canEditNotes ? (
        <button
          type="button"
          onClick={onStartEditing}
          className="min-h-[48px] w-full cursor-pointer rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-left text-xs text-[#334155] transition-colors hover:border-[#85929f] hover:bg-[#f1f5f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#cbd6d0] dark:hover:border-[#5f736b] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
        >
          {adminNotes || "Belum ada catatan admin. Klik untuk menambahkan catatan."}
        </button>
      ) : (
        <div className="min-h-[48px] w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-xs text-[#64748b] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#94a89e]">
          {adminNotes || "Belum ada catatan admin."}
        </div>
      )}
    </div>
  );
}
