"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2, User, X, XCircle } from "lucide-react";

import type { Applicant } from "../types";
import { formatId } from "../utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { ApplicantInfoCard } from "./applicant-detail/ApplicantInfoCard";
import { ApplicantDocumentsCard } from "./applicant-detail/ApplicantDocumentsCard";
import { ApplicantNotesCard } from "./applicant-detail/ApplicantNotesCard";
import { ImageLightbox } from "./applicant-detail/ImageLightbox";

type Props = {
  applicant: Applicant;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, notes?: string) => void;
  onSaveNotes?: (id: string, notes: string) => void;
  isPending?: boolean;
  titleMode?: "pendaftar" | "member";
  userRole?: string;
};

export default function ApplicantDetailModal({
  applicant,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onSaveNotes,
  isPending = false,
  titleMode = "pendaftar",
  userRole,
}: Props) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(applicant.adminNotes || "");
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const handleSaveNotes = () => {
    if (onSaveNotes) onSaveNotes(applicant.id, tempNotes);
    setIsEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setIsEditingNotes(false);
    setTempNotes(applicant.adminNotes || "");
  };

  const handleReject = () => {
    if (!onReject) return;
    const notes = applicant.adminNotes?.trim();
    if (notes && notes.length > 0) {
      onReject(applicant.id, notes);
    } else {
      onReject(applicant.id);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="flex max-h-[92vh] w-[calc(100%-2rem)] max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-0 shadow-2xl dark:border-[#3c4d46] dark:bg-[#0d1412]">
          {isPending && (
            <div
              role="status"
              aria-live="polite"
              className="animate-fade-in absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/85 backdrop-blur-[2px] dark:bg-[#0d1412]/85"
            >
              <Loader2 className="mb-3 h-9 w-9 animate-spin text-[#006c49] dark:text-[#34d399]" aria-hidden />
              <h4 className="text-base font-bold text-[#0f172a] dark:text-[#eef2f4]">Sedang Memproses</h4>
              <p className="mt-1 text-sm text-[#475569] dark:text-[#cbd6d0]">Mohon tunggu sebentar...</p>
            </div>
          )}

          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e2e8f0] bg-white px-6 py-5 dark:border-[#3c4d46] dark:bg-[#131d1a]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#006c49]/15 bg-[#e6f4ee] text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]">
                <User className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#eef2f4]">
                    {titleMode === "pendaftar" ? "Detail Calon Anggota" : "Detail Anggota"}:{" "}
                    {applicant.user.name || "Tanpa Nama"}
                  </DialogTitle>
                  <span className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#334155] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#cbd6d0]">
                    {formatId(applicant.id)}
                  </span>
                  <StatusBadge status={applicant.status} />
                </div>
                <DialogDescription className="mt-0.5 text-xs text-[#64748b] dark:text-[#94a89e]">
                  Diajukan pada {formatDateTime(applicant.joinDate)} WIB | Formulir Registrasi Online
                </DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Tutup Modal Detail"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#475569] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:text-[#cbd6d0] dark:hover:bg-[#1a2723] dark:hover:text-[#eef2f4] dark:focus-visible:ring-[#34d399]"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </DialogClose>
          </div>

          <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto bg-[#f8fafc] p-6 text-left dark:bg-[#0d1412]">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-5 lg:col-span-5">
                <ApplicantInfoCard applicant={applicant} />
              </div>

              <div className="space-y-5 lg:col-span-7">
                <ApplicantDocumentsCard
                  applicant={applicant}
                  onPreviewImage={setPreviewImageUrl}
                />

                <ApplicantNotesCard
                  adminNotes={applicant.adminNotes}
                  tempNotes={tempNotes}
                  isEditingNotes={isEditingNotes}
                  onTempNotesChange={setTempNotes}
                  onStartEditing={() => setIsEditingNotes(true)}
                  onCancelEditing={handleCancelNotes}
                  onSaveNotes={handleSaveNotes}
                  isPending={isPending}
                  titleMode={titleMode}
                  userRole={userRole}
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center justify-between gap-3 border-t border-[#e2e8f0] bg-white px-6 py-4 sm:flex-row dark:border-[#3c4d46] dark:bg-[#131d1a]">
            <div className="flex-1" />
            <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
              {applicant.status === "PENDING" &&
                titleMode === "pendaftar" &&
                userRole !== "STAFF" && (
                  <>
                    <button
                      type="button"
                      className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-2 text-sm font-semibold text-[#991b1b] transition-colors hover:bg-[#fee2e2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] sm:flex-none dark:border-[#f87171]/40 dark:bg-[#3b1214] dark:text-[#fca5a5] dark:hover:bg-[#531a1d] dark:focus-visible:ring-[#f87171]"
                      onClick={handleReject}
                      disabled={isPending}
                    >
                      <XCircle className="h-4 w-4" aria-hidden />
                      <span>Tolak</span>
                    </button>
                    <button
                      type="button"
                      className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#006c49] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#005236] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] focus-visible:ring-offset-2 sm:flex-none dark:bg-[#057a55] dark:hover:bg-[#046c4e] dark:focus-visible:ring-[#34d399] dark:focus-visible:ring-offset-[#131d1a]"
                      onClick={() => {
                        if (onApprove) onApprove(applicant.id);
                      }}
                      disabled={isPending}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                      <span>Setujui</span>
                    </button>
                  </>
                )}
              {(applicant.status !== "PENDING" || titleMode === "member") && (
                <button
                  type="button"
                  className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-lg border border-[#85929f] bg-white px-5 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] sm:flex-none dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
                  onClick={onClose}
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImageLightbox imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
    </>
  );
}
