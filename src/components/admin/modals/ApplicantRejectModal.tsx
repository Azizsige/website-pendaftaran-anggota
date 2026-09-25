import React, { useState } from "react";
import { Applicant, formatId } from "../ApplicantsUtils";

type Props = {
  applicant: Applicant;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
  isPending: boolean;
};

export default function ApplicantRejectModal({
  applicant,
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: Props) {
  const [rejectReason, setRejectReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-[560px] overflow-hidden flex flex-col relative my-auto">
        {/* Modal Loading Overlay */}
        {isPending && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-[2px] animate-fade-in">
            <span className="material-symbols-outlined text-error text-[40px] animate-spin mb-3">progress_activity</span>
            <h4 className="font-headline-md font-bold text-on-surface text-lg">Sedang Memproses Penolakan</h4>
            <p className="text-sm text-on-surface-variant mt-1">Mohon tunggu sebentar...</p>
          </div>
        )}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 border-b border-outline-variant/15 bg-surface-container-lowest">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0 mt-0.5 border border-error/20">
              <span className="material-symbols-outlined text-[24px]">person_cancel</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-on-surface tracking-tight">Konfirmasi Penolakan Pendaftar</h3>
              <p className="font-body-sm text-xs text-on-surface-variant/80 mt-0.5">Tindakan ini tidak dapat dibatalkan setelah dikonfirmasi</p>
            </div>
          </div>
          <button 
            aria-label="Tutup Modal" 
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-highest transition-colors" 
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="p-6 space-y-5 bg-surface-container-lowest overflow-y-auto max-h-[75vh]">
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-on-surface text-xs">{applicant.user.name || "N/A"}</span>
                <span className="font-code-sm text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-secondary font-medium">
                  {formatId(applicant.id)}
                </span>
              </div>
              <span className="text-[11px] font-body-sm text-on-surface-variant/70">{applicant.user.email || "N/A"}</span>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-lg bg-error/10 border border-error/20 text-error">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">warning</span>
              <p className="text-[11px] font-body-sm leading-relaxed text-error">Tindakan ini akan menolak berkas pemohon dan mengirimkan pemberitahuan resmi ke email pendaftar.</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface flex items-center gap-1" htmlFor="rejection-reason">Alasan Penolakan <span className="text-error">*</span></label>
              <span className="text-[11px] font-code-sm text-on-surface-variant/60">{rejectReason.length} / 500 karakter</span>
            </div>
            <p className="text-[11px] font-body-sm text-on-surface-variant/70">Jelaskan secara spesifik alasan berkas atau persyaratan pemohon ditolak.</p>
            <textarea 
              className="w-full p-3 bg-surface border border-outline-variant/30 rounded-lg text-xs font-body-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-all" 
              id="rejection-reason" 
              placeholder="Contoh: Berkas KTP tidak terbaca jelas dan dokumen ijazah tidak sesuai dengan kriteria yang ditentukan organisasi..." 
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value.substring(0, 500))}
            />
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-on-surface-variant/70 block">Pilih Alasan Cepat:</span>
              <div className="flex flex-wrap gap-1.5">
                <button 
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-container-high text-on-surface-variant hover:bg-error/10 hover:text-error hover:border-error/30 border border-outline-variant/20 transition-colors" 
                  onClick={() => setRejectReason("Dokumen KTP yang diunggah buram dan tidak terbaca jelas.")} 
                  type="button"
                >
                  KTP Buram / Rusak
                </button>
                <button 
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-container-high text-on-surface-variant hover:bg-error/10 hover:text-error hover:border-error/30 border border-outline-variant/20 transition-colors" 
                  onClick={() => setRejectReason("Ijazah / sertifikat keahlian tidak memenuhi ketentuan kualifikasi organisasi.")} 
                  type="button"
                >
                  Tidak Memenuhi Kualifikasi
                </button>
                <button 
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-container-high text-on-surface-variant hover:bg-error/10 hover:text-error hover:border-error/30 border border-outline-variant/20 transition-colors" 
                  onClick={() => setRejectReason("Format atau keaslian berkas unggahan tidak dapat divalidasi.")} 
                  type="button"
                >
                  Dokumen Tidak Valid
                </button>
                <button 
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-container-high text-on-surface-variant hover:bg-error/10 hover:text-error hover:border-error/30 border border-outline-variant/20 transition-colors" 
                  onClick={() => setRejectReason("NIK atau identitas pendaftar terindikasi sudah terdaftar sebelumnya (data ganda).")} 
                  type="button"
                >
                  Data Ganda
                </button>
              </div>
            </div>
          </div>
          <div className="pt-1 border-t border-outline-variant/10">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input defaultChecked className="mt-0.5 rounded border-outline-variant/40 text-error focus:ring-error w-4 h-4 cursor-pointer" type="checkbox"/>
              <span className="text-xs font-body-sm text-on-surface-variant leading-tight">
                Kirim email notifikasi otomatis beserta alasan penolakan ke pemohon (<span className="text-primary font-medium">{applicant.user.email || "-"}</span>)
              </span>
            </label>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-end gap-3 shrink-0">
          <button 
            className="px-4 py-2 bg-surface text-on-surface-variant border border-outline-variant/30 rounded-lg hover:bg-surface-container-highest font-label-md text-xs font-semibold uppercase tracking-wider transition-colors" 
            onClick={onClose} 
            type="button"
            disabled={isPending}
          >
            Batal
          </button>
          <button 
            className="px-5 py-2 bg-error hover:opacity-90 text-on-error rounded-lg font-label-md text-xs font-semibold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 disabled:opacity-50" 
            onClick={() => onConfirm(applicant.id, rejectReason)} 
            type="button"
            disabled={isPending || !rejectReason.trim()}
          >
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            <span>Tolak Pendaftaran</span>
          </button>
        </div>
      </div>
    </div>
  );
}
