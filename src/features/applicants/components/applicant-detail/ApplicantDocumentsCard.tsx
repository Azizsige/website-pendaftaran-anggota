import React from "react";
import { Eye, FolderOpen, IdCard, Image as ImageIcon } from "lucide-react";

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
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 dark:border-[#3c4d46] dark:bg-[#131d1a]">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-[#0f172a] dark:text-[#eef2f4]">
          <FolderOpen className="h-4 w-4 text-[#006c49] dark:text-[#34d399]" aria-hidden />
          Dokumen Unggahan
        </h4>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3.5 dark:border-[#3c4d46] dark:bg-[#1a2723]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#006c49]/15 bg-[#e6f4ee] text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]">
              <IdCard className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                Kartu Tanda Mahasiswa (KTM)
              </p>
              <p className="text-[11px] text-[#64748b] dark:text-[#94a89e]">
                {applicant.ktmImageUrl ? "Terlampir" : "Belum diunggah"}
              </p>
            </div>
          </div>
          {applicant.ktmImageUrl && (
            <button
              type="button"
              onClick={() => onPreviewImage(applicant.ktmImageUrl!)}
              className="flex min-h-[40px] shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#85929f] bg-white px-3 py-1.5 text-xs font-medium text-[#334155] transition-colors hover:border-[#006c49] hover:text-[#005236] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#5f736b] dark:bg-[#131d1a] dark:text-[#eef2f4] dark:hover:border-[#34d399] dark:hover:text-[#6ee7b7] dark:focus-visible:ring-[#34d399]"
            >
              <Eye className="h-4 w-4" aria-hidden />
              <span>Lihat</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3.5 dark:border-[#3c4d46] dark:bg-[#1a2723]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#006c49]/15 bg-[#e6f4ee] text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]">
              <ImageIcon className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0f172a] dark:text-[#eef2f4]">Pas Foto</p>
              <p className="text-[11px] text-[#64748b] dark:text-[#94a89e]">
                {applicant.photoUrl ? "Terlampir" : "Belum diunggah"}
              </p>
            </div>
          </div>
          {applicant.photoUrl && (
            <button
              type="button"
              onClick={() => onPreviewImage(applicant.photoUrl!)}
              className="flex min-h-[40px] shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#85929f] bg-white px-3 py-1.5 text-xs font-medium text-[#334155] transition-colors hover:border-[#006c49] hover:text-[#005236] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#5f736b] dark:bg-[#131d1a] dark:text-[#eef2f4] dark:hover:border-[#34d399] dark:hover:text-[#6ee7b7] dark:focus-visible:ring-[#34d399]"
            >
              <Eye className="h-4 w-4" aria-hidden />
              <span>Lihat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
