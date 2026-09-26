import React, { useState } from "react";
import { Applicant, getStatusStyle, formatId } from "../ApplicantsUtils";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-fade-in relative">
        {/* Modal Loading Overlay */}
        {isPending && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-[2px] animate-fade-in">
            <span className="material-symbols-outlined text-primary text-[40px] animate-spin mb-3">progress_activity</span>
            <h4 className="font-headline-md font-bold text-on-surface text-lg">Sedang Memproses</h4>
            <p className="text-sm text-on-surface-variant mt-1">Mohon tunggu sebentar...</p>
          </div>
        )}
        <div className="px-6 py-5 border-b border-outline-variant/20 bg-surface-container-lowest flex items-center justify-between shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">person</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-headline-md text-lg font-bold text-on-surface tracking-tight">
                  {titleMode === "pendaftar" ? "Detail Pendaftar" : "Detail Member"} - {applicant.user.name || "N/A"}
                </h3>
                <span className="font-code-sm text-xs px-2.5 py-0.5 rounded bg-surface-container-high text-secondary font-semibold">
                  {formatId(applicant.id)}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(applicant.status)}`}>
                  {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1).toLowerCase()}
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant/80 mt-0.5">
                Diajukan pada {new Date(applicant.joinDate).toLocaleString("id-ID", {
                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                })} WIB • Formulir Registrasi Online
              </p>
            </div>
          </div>
          <button
            aria-label="Tutup Modal"
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-highest transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-5">
              <div className="p-5 rounded-xl bg-surface border border-outline-variant/20 shadow-sm">
                <div className="flex items-center gap-4 pb-4 border-b border-outline-variant/15">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-inner shrink-0 bg-surface-container-high">
                    {applicant.photoUrl ? (
                      <img alt="Pas Foto" className="w-full h-full object-cover" src={applicant.photoUrl} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-on-surface text-base">{applicant.user.name || "N/A"}</h4>
                    <p className="text-xs text-primary font-medium mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified</span> Calon Anggota
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-code-sm px-2 py-0.5 bg-surface-container-low text-on-surface-variant rounded border border-outline-variant/20">
                      ID: {formatId(applicant.id)}
                    </span>
                  </div>
                </div>
                <div className="pt-4 space-y-3 font-body-sm text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-on-surface-variant/80 shrink-0">NIM</span>
                    <span className="font-code-sm font-medium text-on-surface text-right">{applicant.nim || "-"}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-on-surface-variant/80 shrink-0">Tempat, Tgl Lahir</span>
                    <span className="font-medium text-on-surface text-right">
                      {applicant.placeOfBirth || "-"}, {applicant.dateOfBirth ? new Date(applicant.dateOfBirth).toLocaleDateString("id-ID") : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-on-surface-variant/80 shrink-0">Jenis Kelamin</span>
                    <span className="font-medium text-on-surface text-right">{applicant.gender || "-"}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-on-surface-variant/80 shrink-0">Email Terverifikasi</span>
                    <span className="font-medium text-on-surface text-right truncate text-primary hover:underline">{applicant.user.email || "-"}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-on-surface-variant/80 shrink-0">WhatsApp / No. HP</span>
                    <span className="font-medium text-on-surface text-right flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">call</span>{applicant.phoneNumber || "-"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/15 flex flex-col gap-1">
                    <span className="text-on-surface-variant/80">Data Akademik</span>
                    <p className="font-medium text-on-surface leading-relaxed text-xs">
                      Fakultas: {applicant.faculty || "-"}<br/>
                      Jurusan: {applicant.major || "-"}<br/>
                      Angkatan: {applicant.batchYear || "-"}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/15 flex flex-col gap-1">
                    <span className="text-on-surface-variant/80">Alamat Domisili Lengkap</span>
                    <p className="font-medium text-on-surface leading-relaxed text-xs">
                      {applicant.address || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <div className="p-5 rounded-xl bg-surface border border-outline-variant/20 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-on-surface text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">folder_shared</span> Dokumen Unggahan
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg border border-outline-variant/20 bg-surface-container-low flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">badge</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-on-surface">Kartu Tanda Mahasiswa (KTM)</p>
                        <p className="text-[11px] text-on-surface-variant/70">{applicant.ktmImageUrl ? "Terlampir" : "Belum diunggah"}</p>
                      </div>
                    </div>
                    {applicant.ktmImageUrl && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => setPreviewImageUrl(applicant.ktmImageUrl!)}
                          className="px-2.5 py-1.5 rounded text-xs font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-highest border border-outline-variant/30 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span> Lihat
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 rounded-lg border border-outline-variant/20 bg-surface-container-low flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">account_box</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-on-surface">Foto Profil</p>
                        <p className="text-[11px] text-on-surface-variant/70">{applicant.photoUrl ? "Terlampir" : "Belum diunggah"}</p>
                      </div>
                    </div>
                    {applicant.photoUrl && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => setPreviewImageUrl(applicant.photoUrl!)}
                          className="px-2.5 py-1.5 rounded text-xs font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-highest border border-outline-variant/30 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span> Lihat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface border border-outline-variant/20 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-on-surface text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[20px]">rate_review</span> Catatan Admin
                  </label>
                  {!isEditingNotes && titleMode === "pendaftar" && userRole !== "STAFF" && (
                    <button 
                      onClick={() => setIsEditingNotes(true)}
                      className="text-primary text-xs font-medium hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span> Edit
                    </button>
                  )}
                </div>
                {isEditingNotes ? (
                  <div className="flex flex-col gap-2 w-full">
                    <textarea
                      className="w-full p-3 bg-surface border border-outline-variant/30 rounded-lg text-xs font-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[80px]"
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Masukkan catatan admin di sini..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container-highest rounded"
                        onClick={() => {
                          setIsEditingNotes(false);
                          setTempNotes(applicant.adminNotes || "");
                        }}
                      >
                        Batal
                      </button>
                      <button
                        className="px-3 py-1.5 text-xs font-medium bg-primary text-on-primary rounded hover:bg-[#005236] transition-colors"
                        disabled={isPending}
                        onClick={() => {
                          if (onSaveNotes) onSaveNotes(applicant.id, tempNotes);
                          setIsEditingNotes(false);
                        }}
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`w-full p-3 border border-outline-variant/30 rounded-lg text-xs font-body-sm min-h-[44px] ${
                      titleMode === "pendaftar" && userRole !== "STAFF"
                        ? "bg-surface-container-low cursor-pointer hover:bg-surface-container-highest transition-colors" 
                        : "bg-surface-container-lowest/50 text-on-surface-variant/90"
                    }`}
                    onClick={() => {
                      if (titleMode === "pendaftar" && userRole !== "STAFF") setIsEditingNotes(true);
                    }}
                  >
                    {applicant.adminNotes || (titleMode === "pendaftar" && userRole !== "STAFF" ? "Tidak ada catatan admin. Klik untuk menambahkan." : "Tidak ada catatan admin.")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex-1"></div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {applicant.status === "PENDING" && titleMode === "pendaftar" && userRole !== "STAFF" && (
              <>
                <button
                  className="flex-1 sm:flex-none px-4 py-2.5 border border-error/30 text-error hover:bg-error/10 rounded-lg font-label-md text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  onClick={() => { 
                    if (onReject) {
                      if (applicant.adminNotes && applicant.adminNotes.trim().length > 0) {
                        onReject(applicant.id, applicant.adminNotes);
                      } else {
                        onReject(applicant.id);
                      }
                    }
                  }}
                  disabled={isPending}
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  <span>Tolak</span>
                </button>
                  <button
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-primary hover:bg-[#005236] text-on-primary rounded-lg font-label-md text-xs font-semibold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
                    onClick={() => { if (onApprove) onApprove(applicant.id); }}
                    disabled={isPending}
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Setujui</span>
                  </button>
              </>
            )}
            {(applicant.status !== "PENDING" || titleMode === "member") && (
              <button
                className="flex-1 sm:flex-none px-6 py-2.5 bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface rounded-lg font-label-md text-xs font-semibold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
                onClick={onClose}
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox Overlay */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 animate-fade-in" onClick={() => setPreviewImageUrl(null)}>
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImageUrl(null);
            }}
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
          <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={previewImageUrl} 
              alt="Document Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
