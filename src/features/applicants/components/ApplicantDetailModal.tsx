"use client";

import React, { useState } from "react";
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
        <DialogContent className="max-w-5xl w-[calc(100%-2rem)] max-h-[92vh] p-0 flex flex-col overflow-hidden bg-[#f8fafc] rounded-2xl shadow-2xl border border-slate-200">
          {/* Loading Overlay */}
          {isPending && (
            <div
              role="status"
              aria-live="polite"
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] animate-fade-in"
            >
              <span
                className="material-symbols-outlined text-[#006c49] text-[40px] animate-spin mb-3"
                aria-hidden
              >
                progress_activity
              </span>
              <h4 className="font-headline-md font-bold text-slate-900 text-lg">
                Sedang Memproses
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                Mohon tunggu sebentar...
              </p>
            </div>
          )}

          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006c49] border border-emerald-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]" aria-hidden>
                  person
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="font-headline-md text-lg font-bold text-slate-900 tracking-tight">
                    {titleMode === "pendaftar" ? "Detail Pendaftar" : "Detail Member"} -{" "}
                    {applicant.user.name || "N/A"}
                  </DialogTitle>
                  <span className="font-code-sm text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    {formatId(applicant.id)}
                  </span>
                  <StatusBadge status={applicant.status} />
                </div>
                <DialogDescription className="font-body-sm text-xs text-slate-500 mt-0.5">
                  Diajukan pada {formatDateTime(applicant.joinDate)} WIB • Formulir Registrasi Online
                </DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Tutup Modal Detail"
                className="flex h-9 w-9 items-center justify-center text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#006c49] shrink-0"
              >
                <span className="material-symbols-outlined text-[20px] leading-none select-none flex items-center justify-center" aria-hidden>
                  close
                </span>
              </button>
            </DialogClose>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 bg-[#f8fafc] text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-5">
                <ApplicantInfoCard applicant={applicant} />
              </div>

              <div className="lg:col-span-7 space-y-5">
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

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex-1" />
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {applicant.status === "PENDING" &&
                titleMode === "pendaftar" &&
                userRole !== "STAFF" && (
                  <>
                    <button
                      type="button"
                      className="flex-1 sm:flex-none px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-label-md text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
                      onClick={handleReject}
                      disabled={isPending}
                    >
                      <span className="material-symbols-outlined text-[16px]" aria-hidden>
                        cancel
                      </span>
                      <span>Tolak</span>
                    </button>
                    <button
                      type="button"
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-[#006c49] hover:bg-[#005236] text-white rounded-lg font-label-md text-xs font-semibold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#006c49]"
                      onClick={() => {
                        if (onApprove) onApprove(applicant.id);
                      }}
                      disabled={isPending}
                    >
                      <span className="material-symbols-outlined text-[18px]" aria-hidden>
                        check_circle
                      </span>
                      <span>Setujui</span>
                    </button>
                  </>
                )}
              {(applicant.status !== "PENDING" || titleMode === "member") && (
                <button
                  type="button"
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-label-md text-xs font-semibold uppercase tracking-wider border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
                  onClick={onClose}
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      <ImageLightbox
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </>
  );
}
