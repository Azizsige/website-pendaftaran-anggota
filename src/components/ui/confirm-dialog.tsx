"use client";

import * as React from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Loader2,
  PauseCircle,
  Trash2,
  UserX,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export type ConfirmTone = "primary" | "danger" | "warning" | "neutral";

const ICON_MAP: Record<string, LucideIcon> = {
  delete_forever: Trash2,
  delete: Trash2,
  person_cancel: UserX,
  person_off: UserX,
  check_circle: CheckCircle2,
  block: Ban,
  pause_circle: PauseCircle,
  warning: AlertTriangle,
};

const TONES: Record<
  ConfirmTone,
  { icon: string; iconBg: string; confirm: string; spinner: string }
> = {
  primary: {
    icon: "text-[#005236] dark:text-[#6ee7b7]",
    iconBg: "bg-[#e6f4ee] dark:bg-[#0a3326] border-[#006c49]/20 dark:border-[#34d399]/40",
    confirm: "bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]",
    spinner: "text-[#006c49] dark:text-[#34d399]",
  },
  danger: {
    icon: "text-[#991b1b] dark:text-[#fca5a5]",
    iconBg: "bg-[#fef2f2] dark:bg-[#3b1214] border-[#dc2626]/25 dark:border-[#f87171]/40",
    confirm: "bg-[#dc2626] hover:bg-[#b91c1c] focus-visible:ring-[#dc2626] dark:focus-visible:ring-[#f87171]",
    spinner: "text-[#dc2626] dark:text-[#fca5a5]",
  },
  warning: {
    icon: "text-[#92400e] dark:text-[#fcd34d]",
    iconBg: "bg-[#fef3c7] dark:bg-[#3b2506] border-[#f59e0b]/30 dark:border-[#f59e0b]/45",
    confirm: "bg-[#d97706] hover:bg-[#b45309] focus-visible:ring-[#d97706] dark:focus-visible:ring-[#fcd34d]",
    spinner: "text-[#d97706] dark:text-[#fcd34d]",
  },
  neutral: {
    icon: "text-[#475569] dark:text-[#cbd6d0]",
    iconBg: "bg-[#f1f5f9] dark:bg-[#1e2d28] border-[#cbd5e1] dark:border-[#5f736b]",
    confirm: "bg-[#334155] hover:bg-[#1e293b] dark:bg-[#2a3b34] dark:hover:bg-[#354b42] focus-visible:ring-[#475569] dark:focus-visible:ring-[#94a89e]",
    spinner: "text-[#475569] dark:text-[#cbd6d0]",
  },
};

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Teks peringatan di bawah header. */
  message?: React.ReactNode;
  /** Kunci ikon Material atau Lucide, mis. "delete_forever". */
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
 * Dialog konfirmasi tunggal untuk semua aksi (aktivasi, pembekuan, penolakan, penghapusan, dst.).
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
  const IconComponent = ICON_MAP[icon] ?? AlertTriangle;
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
      <DialogContent className={cn("max-w-[520px] rounded-2xl border border-[#e2e8f0] dark:border-[#3c4d46] bg-white dark:bg-[#131d1a] dark:text-[#eef2f4] p-0", className)}>
        {isPending && (
          <div
            role="status"
            aria-live="polite"
            className="animate-fade-in absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-white/85 dark:bg-[#0d1412]/85 backdrop-blur-[2px]"
          >
            <Loader2 className={cn("mb-3 h-9 w-9 animate-spin", styles.spinner)} aria-hidden />
            <h4 className="text-base font-bold text-[#0f172a] dark:text-[#eef2f4]">{pendingTitle}</h4>
            <p className="mt-1 text-sm text-[#475569] dark:text-[#cbd6d0]">{pendingMessage}</p>
          </div>
        )}

        <div className="p-6 sm:p-7">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border",
                  styles.iconBg,
                  styles.icon
                )}
              >
                <IconComponent className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-[#0f172a] dark:text-[#eef2f4]">{title}</DialogTitle>
                {description ? (
                  <DialogDescription className="mt-0.5 text-xs text-[#475569] dark:text-[#cbd6d0]">{description}</DialogDescription>
                ) : (
                  <DialogDescription className="sr-only">{title}</DialogDescription>
                )}
              </div>
            </div>
            <DialogClose
              aria-label="Tutup"
              disabled={isPending}
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#475569] dark:text-[#cbd6d0] transition-colors hover:bg-[#f1f5f9] dark:hover:bg-[#1a2723] hover:text-[#0f172a] dark:hover:text-[#eef2f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
            >
              <X className="h-5 w-5" aria-hidden />
            </DialogClose>
          </div>

          {message && (
            <p className="mb-5 text-sm leading-relaxed text-[#475569] dark:text-[#cbd6d0]">{message}</p>
          )}

          {children && <div className="mb-5">{children}</div>}

          {(acknowledgement || requireText) && (
            <div className="mb-6 space-y-4">
              {acknowledgement && (
                <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 transition-colors hover:bg-[#fee2e2]/70 dark:border-[#f87171]/40 dark:bg-[#3b1214] dark:hover:bg-[#531a1d]">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border border-[#dc2626] accent-[#dc2626] dark:border-[#f87171] dark:accent-[#ef4444]"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                  />
                  <span className="select-none text-xs leading-snug text-[#0f172a] dark:text-[#eef2f4]">
                    {acknowledgement}
                  </span>
                </label>
              )}
              {requireText && (
                <div>
                  <label
                    htmlFor="confirm-dialog-text"
                    className="mb-1.5 block text-xs font-medium text-[#475569] dark:text-[#cbd6d0]"
                  >
                    Ketik{" "}
                    <span className="rounded border border-[#fecaca] bg-[#fef2f2] px-1.5 py-0.5 font-bold text-[#991b1b] dark:border-[#f87171]/40 dark:bg-[#3b1214] dark:text-[#fca5a5]">
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
                    className="min-h-[44px] w-full rounded-lg border border-[#85929f] dark:border-[#5f736b] bg-white dark:bg-[#1a2723] px-3.5 py-2 text-sm text-[#0f172a] dark:text-[#eef2f4] placeholder:text-[#64748b] dark:placeholder:text-[#94a89e] transition-colors focus:border-[#dc2626] dark:focus:border-[#f87171] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 dark:focus:ring-[#f87171]/25"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-[#f1f5f9] dark:border-[#3c4d46] pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="min-h-[44px] cursor-pointer select-none rounded-lg border border-[#85929f] dark:border-[#5f736b] bg-white dark:bg-[#1a2723] px-4 py-2 text-sm font-semibold text-[#334155] dark:text-[#eef2f4] transition-colors hover:bg-[#f8fafc] dark:hover:bg-[#22322d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending || confirmDisabled || !requirementsMet}
              className={cn(
                "flex min-h-[44px] cursor-pointer select-none items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#131d1a] disabled:cursor-not-allowed disabled:opacity-50",
                styles.confirm
              )}
            >
              <IconComponent className="h-4 w-4" aria-hidden />
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
