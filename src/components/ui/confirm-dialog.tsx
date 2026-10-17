"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export type ConfirmTone = "primary" | "danger" | "warning" | "neutral";

const TONES: Record<
  ConfirmTone,
  { icon: string; iconBg: string; confirm: string; spinner: string }
> = {
  primary: {
    icon: "text-primary",
    iconBg: "bg-primary/10 border-primary/20",
    confirm: "bg-primary hover:bg-primary/90 focus:ring-primary/40",
    spinner: "text-primary",
  },
  danger: {
    icon: "text-error",
    iconBg: "bg-error/10 border-error/20",
    confirm: "bg-error hover:bg-error/90 focus:ring-error/40",
    spinner: "text-error",
  },
  warning: {
    icon: "text-[#f57f17]",
    iconBg: "bg-[#fff8e1] border-[#f57f17]/20",
    confirm: "bg-[#f57f17] hover:bg-[#e65100] focus:ring-[#f57f17]/40",
    spinner: "text-[#f57f17]",
  },
  neutral: {
    icon: "text-on-surface-variant",
    iconBg: "bg-surface-container-high border-outline-variant/30",
    confirm: "bg-on-surface-variant hover:bg-on-surface focus:ring-outline",
    spinner: "text-on-surface-variant",
  },
};

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Teks peringatan di bawah header. */
  message?: React.ReactNode;
  /** Nama Material Symbol, mis. "delete_forever". */
  icon: string;
  tone?: ConfirmTone;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isPending?: boolean;
  pendingTitle?: string;
  pendingMessage?: string;
  /** Konten tambahan (ringkasan data, textarea alasan, dll.). */
  children?: React.ReactNode;
  /** Wajib mengetik teks ini (mis. "HAPUS") sebelum tombol aktif. */
  requireText?: string;
  /** Wajib mencentang pernyataan ini sebelum tombol aktif. */
  acknowledgement?: string;
  confirmDisabled?: boolean;
  className?: string;
}

/**
 * Dialog konfirmasi tunggal untuk semua aksi (aktivasi, penolakan, penghapusan, dst.).
 * Menggantikan MemberConfirmModal, ApplicantDeleteModal, dan ApplicantRejectModal.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  message,
  icon,
  tone = "primary",
  confirmLabel,
  cancelLabel = "Batal",
  onConfirm,
  isPending = false,
  pendingTitle = "Memproses Permintaan",
  pendingMessage = "Harap tunggu sebentar...",
  children,
  requireText,
  acknowledgement,
  confirmDisabled = false,
  className,
}: ConfirmDialogProps) {
  const styles = TONES[tone];
  const [typedText, setTypedText] = React.useState("");
  const [acknowledged, setAcknowledged] = React.useState(false);
  const [prevOpen, setPrevOpen] = React.useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setTypedText("");
      setAcknowledged(false);
    }
  }

  const requirementsMet =
    (!requireText || typedText === requireText) && (!acknowledgement || acknowledged);

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className={cn("max-w-[520px]", className)}>
        {isPending && (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] animate-fade-in"
          >
            <span
              className={cn(
                "material-symbols-outlined mb-3 animate-spin text-[40px]",
                styles.spinner
              )}
              aria-hidden
            >
              progress_activity
            </span>
            <h4 className="text-lg font-bold text-on-surface">{pendingTitle}</h4>
            <p className="mt-1 text-sm text-on-surface-variant">{pendingMessage}</p>
          </div>
        )}

        <div className="p-6 sm:p-7">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm",
                  styles.iconBg,
                  styles.icon
                )}
              >
                <span className="material-symbols-outlined text-[26px]" aria-hidden>
                  {icon}
                </span>
              </div>
              <div>
                <DialogTitle>{title}</DialogTitle>
                {description ? (
                  <DialogDescription className="mt-0.5">{description}</DialogDescription>
                ) : (
                  <DialogDescription className="sr-only">{title}</DialogDescription>
                )}
              </div>
            </div>
            <DialogClose
              aria-label="Tutup"
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px] leading-none select-none flex items-center justify-center" aria-hidden>
                close
              </span>
            </DialogClose>
          </div>

          {message && (
            <p className="mb-5 text-body-sm leading-relaxed text-on-surface-variant">{message}</p>
          )}

          {children && <div className="mb-5">{children}</div>}

          {(acknowledgement || requireText) && (
            <div className="mb-6 space-y-4">
              {acknowledgement && (
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-red-100 bg-red-50/40 p-3 transition-colors hover:bg-red-50/60">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-red-300 text-error focus:ring-error"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                  />
                  <span className="select-none text-xs leading-snug text-on-surface">
                    {acknowledgement}
                  </span>
                </label>
              )}
              {requireText && (
                <div>
                  <label
                    htmlFor="confirm-dialog-text"
                    className="mb-1.5 block text-xs font-medium text-on-surface-variant"
                  >
                    Ketik{" "}
                    <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 font-bold text-error">
                      {requireText}
                    </span>{" "}
                    untuk mengonfirmasi:
                  </label>
                  <input
                    id="confirm-dialog-text"
                    type="text"
                    autoComplete="off"
                    placeholder={requireText}
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3.5 py-2 text-sm transition-all placeholder:text-on-surface-variant/40 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-error"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-outline-variant/20 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-lg border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-outline disabled:opacity-50 cursor-pointer active:scale-98 select-none"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending || confirmDisabled || !requirementsMet}
              className={cn(
                "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-98 select-none",
                styles.confirm
              )}
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden>
                {icon}
              </span>
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
