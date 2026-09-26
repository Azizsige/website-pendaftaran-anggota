import React, { useState } from "react";
import { Applicant, formatId } from "../ApplicantsUtils";

type Props = {
  applicant: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isPending: boolean;
  titleMode?: "pendaftar" | "member" | "admin";
};

export default function ApplicantDeleteModal({
  applicant,
  isOpen,
  onClose,
  onConfirm,
  isPending,
  titleMode = "pendaftar",
}: Props) {
  const [isDeleteChecked, setIsDeleteChecked] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto animate-fade-in" id="delete-modal-overlay">
      <div className="relative w-full max-w-[520px] bg-white rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden transition-all my-8">
        {/* Modal Loading Overlay */}
        {isPending && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] animate-fade-in">
            <span className="material-symbols-outlined text-error text-[40px] animate-spin mb-3">progress_activity</span>
            <h4 className="font-headline-md font-bold text-on-surface text-lg">Menghapus Data</h4>
            <p className="text-sm text-on-surface-variant mt-1">Data sedang dihapus permanen...</p>
          </div>
        )}
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-error flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[26px]">delete_forever</span>
              </div>
              <div>
                <h3 className="font-headline-md text-[20px] font-bold text-on-surface leading-tight">
                  {titleMode === "pendaftar" ? "Hapus Data Pendaftar?" : titleMode === "member" ? "Hapus Data Member?" : "Hapus Data Admin?"}
                </h3>
                <p className="text-xs text-on-surface-variant/70 mt-0.5">Konfirmasi tindakan destruktif sistem</p>
              </div>
            </div>
            <button 
              aria-label="Tutup Modal" 
              className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-full transition-colors"
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <p className="text-body-sm text-on-surface-variant leading-relaxed mb-5">
            Tindakan ini bersifat <strong className="text-error font-semibold">permanen dan tidak dapat dibatalkan</strong>. Semua berkas formulir, dokumen lampiran, dan riwayat verifikasi akan dihapus dari sistem.
          </p>
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 border border-primary/20">
                {applicant.user?.name?.substring(0, 2).toUpperCase() || applicant.name?.substring(0, 2).toUpperCase() || "NA"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-semibold text-on-surface text-sm truncate">{applicant.user?.name || applicant.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[11px] font-code-sm bg-surface-container-highest/60 text-secondary border border-outline-variant/20">
                    {formatId(applicant.id)}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant truncate mb-2">
                  {applicant.user?.email || applicant.email} {applicant.phoneNumber ? `• ${applicant.phoneNumber}` : ""}
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/10">
                  <span className="text-[11px] text-on-surface-variant/70">Status saat ini:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    applicant.status === "PENDING" ? "bg-[#fff8e1] text-[#f57f17] border-[#f57f17]/20" :
                    applicant.status === "ACTIVE" ? "bg-primary/10 text-primary border-primary/20" :
                    applicant.status === "REJECTED" ? "bg-error/10 text-error border-error/20" :
                    applicant.status === "SUSPENDED" ? "bg-error/10 text-error border-error/20" :
                    "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
                  }`}>
                    {applicant.status === "PENDING" && <span className="w-1.5 h-1.5 rounded-full bg-[#f57f17] mr-1.5"></span>}
                    {applicant.status === "PENDING" ? "Pending (Menunggu Verifikasi)" : 
                     applicant.status === "ACTIVE" ? "Active" : 
                     applicant.status === "REJECTED" ? "Rejected" : 
                     applicant.status === "SUSPENDED" ? "Suspended" : applicant.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4 mb-6">
            <label className="flex items-start gap-3 p-3 bg-red-50/40 border border-red-100 rounded-lg cursor-pointer hover:bg-red-50/60 transition-colors">
              <input 
                className="mt-0.5 rounded border-red-300 text-error focus:ring-error h-4 w-4 shrink-0 cursor-pointer" 
                type="checkbox"
                checked={isDeleteChecked}
                onChange={(e) => setIsDeleteChecked(e.target.checked)}
              />
              <span className="text-xs text-on-surface leading-snug select-none">
                Saya memahami bahwa data {titleMode === "pendaftar" ? "pendaftar" : titleMode === "member" ? "member" : "admin"} ini akan dihapus secara permanen dan tidak dapat dipulihkan.
              </span>
            </label>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                Ketik <span className="font-code-sm font-bold text-error bg-red-50 px-1.5 py-0.5 rounded border border-red-200">HAPUS</span> untuk mengonfirmasi:
              </label>
              <input 
                className="w-full px-3.5 py-2 bg-surface border border-outline-variant/30 rounded-lg font-code-sm text-sm placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-all" 
                placeholder="HAPUS" 
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <button 
              className="px-4 py-2.5 bg-surface hover:bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-outline" 
              type="button"
              onClick={onClose}
              disabled={isPending}
            >
              Batal
            </button>
            <button 
              className="px-5 py-2.5 bg-error hover:bg-error/90 text-white rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-error/50 disabled:opacity-50" 
              type="button"
              onClick={() => onConfirm(applicant.id)}
              disabled={isPending || !isDeleteChecked || deleteConfirmText !== "HAPUS"}
            >
              <span className="material-symbols-outlined text-[18px]">delete_forever</span>
              <span>Ya, Hapus Permanen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
