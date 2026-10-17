import React from "react";
import type { Applicant } from "../../types";

interface ApplicantDocumentsCardProps {
  applicant: Applicant;
  onPreviewImage: (url: string) => void;
}

export function ApplicantDocumentsCard({
  applicant,
  onPreviewImage,
}: ApplicantDocumentsCardProps) {
  return (
    <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600 text-[20px]">
            folder_shared
          </span>{" "}
          Dokumen Unggahan
        </h4>
      </div>
      <div className="space-y-3">
        {/* KTM */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                badge
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Kartu Tanda Mahasiswa (KTM)
              </p>
              <p className="text-[11px] text-slate-500">
                {applicant.ktmImageUrl ? "Terlampir" : "Belum diunggah"}
              </p>
            </div>
          </div>
          {applicant.ktmImageUrl && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onPreviewImage(applicant.ktmImageUrl!)}
                className="px-2.5 py-1.5 rounded text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  visibility
                </span>{" "}
                Lihat
              </button>
            </div>
          )}
        </div>

        {/* Pas Foto */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                account_box
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Foto Profil
              </p>
              <p className="text-[11px] text-slate-500">
                {applicant.photoUrl ? "Terlampir" : "Belum diunggah"}
              </p>
            </div>
          </div>
          {applicant.photoUrl && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onPreviewImage(applicant.photoUrl!)}
                className="px-2.5 py-1.5 rounded text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  visibility
                </span>{" "}
                Lihat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
