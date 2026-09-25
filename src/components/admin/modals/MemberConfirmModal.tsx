import React from "react";
import { formatId } from "../ApplicantsUtils";

type Props = {
  member: any; // We use 'any' to be compatible with both Applicant and Member types
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isPending: boolean;
  actionType: "ACTIVATE" | "SUSPEND" | "INACTIVE";
};

export default function MemberConfirmModal({
  member,
  isOpen,
  onClose,
  onConfirm,
  isPending,
  actionType,
}: Props) {
  if (!isOpen) return null;

  const isActivate = actionType === "ACTIVATE";
  const isInactive = actionType === "INACTIVE";

  const config = {
    title: isActivate ? "Aktivasi Member?" : isInactive ? "Nonaktifkan Member?" : "Suspend Member?",
    description: isActivate 
      ? "Konfirmasi pengaktifan status keanggotaan" 
      : isInactive
      ? "Konfirmasi penonaktifan sementara status keanggotaan"
      : "Konfirmasi pembekuan status keanggotaan",
    warning: isActivate
      ? "Tindakan ini akan mengaktifkan kembali akun member, mengizinkan mereka untuk mengakses sistem."
      : isInactive
      ? "Tindakan ini akan menonaktifkan akun member. Mereka tidak akan bisa login sementara waktu, namun datanya tetap aman."
      : "Tindakan ini akan membekukan sementara akun member, mencegah mereka untuk mengakses sistem.",
    icon: isActivate ? "check_circle" : isInactive ? "person_off" : "block",
    iconColor: isActivate ? "text-primary" : isInactive ? "text-on-surface-variant" : "text-[#ba1a1a]",
    iconBg: isActivate ? "bg-primary/10 border-primary/20" : isInactive ? "bg-surface-container-high border-outline-variant/30" : "bg-[#ffb4ab]/10 border-[#ba1a1a]/20",
    confirmText: isActivate ? "Ya, Aktifkan" : isInactive ? "Ya, Nonaktifkan" : "Ya, Suspend",
    confirmBg: isActivate ? "bg-primary hover:bg-[#005236]" : isInactive ? "bg-on-surface-variant hover:bg-on-surface text-white" : "bg-[#ba1a1a] hover:bg-[#93000a]",
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto animate-fade-in" id="confirm-modal-overlay">
      <div className="relative w-full max-w-[520px] bg-white rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden transition-all my-8">
        {/* Modal Loading Overlay */}
        {isPending && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] animate-fade-in">
            <span className={`material-symbols-outlined ${config.iconColor} text-[40px] animate-spin mb-3`}>progress_activity</span>
            <h4 className="font-headline-md font-bold text-on-surface text-lg">Memproses Permintaan</h4>
            <p className="text-sm text-on-surface-variant mt-1">Harap tunggu sebentar...</p>
          </div>
        )}
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-full ${config.iconBg} ${config.iconColor} flex items-center justify-center shrink-0 shadow-sm border`}>
                <span className="material-symbols-outlined text-[26px]">{config.icon}</span>
              </div>
              <div>
                <h3 className="font-headline-md text-[20px] font-bold text-on-surface leading-tight">{config.title}</h3>
                <p className="text-xs text-on-surface-variant/70 mt-0.5">{config.description}</p>
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
            {config.warning}
          </p>
          
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface font-bold flex items-center justify-center text-sm shrink-0 border border-outline-variant/20">
                {member.user.name?.substring(0, 2).toUpperCase() || "NA"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-semibold text-on-surface text-sm truncate">{member.user.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[11px] font-code-sm bg-surface-container-highest/60 text-secondary border border-outline-variant/20">
                    {formatId(member.id)}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant truncate mb-2">
                  {member.user.email} {member.phoneNumber ? `• ${member.phoneNumber}` : ""}
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/10">
                  <span className="text-[11px] text-on-surface-variant/70">Status saat ini:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    member.status === "PENDING" ? "bg-[#fff8e1] text-[#f57f17] border-[#f57f17]/20" :
                    member.status === "ACTIVE" ? "bg-primary/10 text-primary border-primary/20" :
                    member.status === "SUSPENDED" ? "bg-error/10 text-error border-error/20" :
                    member.status === "INACTIVE" ? "bg-surface-container-high text-on-surface-variant border-outline-variant/30" :
                    "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
                  }`}>
                    {member.status === "PENDING" && <span className="w-1.5 h-1.5 rounded-full bg-[#f57f17] mr-1.5"></span>}
                    {member.status}
                  </span>
                </div>
              </div>
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
              className={`px-5 py-2.5 text-white rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 disabled:opacity-50 ${config.confirmBg}`} 
              type="button"
              onClick={() => onConfirm(member.id)}
              disabled={isPending}
            >
              <span className="material-symbols-outlined text-[18px]">{config.icon}</span>
              <span>{config.confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
