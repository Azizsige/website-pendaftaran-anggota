"use client";

import React, { useMemo, useState } from "react";
import { addDays } from "date-fns";
import { AlertTriangle, CalendarClock } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { fieldClass } from "@/components/ui/form-field";
import { PersonSummary } from "@/components/admin/PersonSummary";
import { formatDateTime } from "@/lib/format";

export interface SuspendTargetPerson {
  id: string;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  status: string;
}

interface SuspendReasonDialogProps {
  open: boolean;
  onClose: () => void;
  person: SuspendTargetPerson;
  title?: string;
  description?: string;
  isPending: boolean;
  onConfirm: (id: string, reason: string, suspendedUntil: string | null) => void;
}

type DurationPreset = "" | "7" | "14" | "30" | "CUSTOM";

const QUICK_SUSPEND_REASONS = [
  {
    label: "Pelanggaran tata tertib",
    text: "Pelanggaran terhadap kode etik atau tata tertib organisasi yang sedang dalam peninjauan pengurus.",
  },
  {
    label: "Penyalahgunaan KTA",
    text: "Terindikasi penyalahgunaan Kartu Tanda Anggota atau atribut resmi organisasi.",
  },
  {
    label: "Verifikasi ulang data",
    text: "Keanggotaan dibekukan sementara untuk proses klarifikasi dan verifikasi ulang identitas mahasiswa.",
  },
  {
    label: "Evaluasi pengurus",
    text: "Pembekuan sementara selama masa evaluasi dan penyelesaian administrasi keanggotaan.",
  },
];

const DURATION_OPTIONS: Array<{ value: DurationPreset; label: string }> = [
  { value: "", label: "Tanpa Batas" },
  { value: "7", label: "7 Hari" },
  { value: "14", label: "14 Hari" },
  { value: "30", label: "30 Hari" },
  { value: "CUSTOM", label: "Pilih Tanggal" },
];

export function SuspendReasonDialog({
  open,
  onClose,
  person,
  title = "Bekukan Akun Anggota?",
  description = "Anggota yang dibekukan tidak dapat masuk atau mengunduh KTA hingga dipulihkan",
  isPending,
  onConfirm,
}: SuspendReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [durationPreset, setDurationPreset] = useState<DurationPreset>("");
  const [customDate, setCustomDate] = useState("");

  const tomorrowIsoDate = useMemo(() => {
    const tomorrow = addDays(new Date(), 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const resolvedSuspendedUntil = useMemo<Date | null>(() => {
    if (!durationPreset) return null;
    if (durationPreset === "CUSTOM") {
      if (!customDate) return null;
      const parsed = new Date(`${customDate}T23:59:59`);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    const days = Number(durationPreset);
    return Number.isFinite(days) && days > 0 ? addDays(new Date(), days) : null;
  }, [durationPreset, customDate]);

  const isCustomIncomplete = durationPreset === "CUSTOM" && !resolvedSuspendedUntil;
  const canConfirm = reason.trim().length > 0 && !isCustomIncomplete;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      tone="warning"
      icon="block"
      title={title}
      description={description}
      confirmLabel="Ya, Bekukan"
      cancelLabel="Batal"
      isPending={isPending}
      pendingTitle="Membekukan Akun"
      pendingMessage="Menyimpan alasan pembekuan dan jejak audit..."
      confirmDisabled={!canConfirm}
      onConfirm={() => {
        if (!canConfirm) return;
        onConfirm(
          person.id,
          reason.trim(),
          resolvedSuspendedUntil ? resolvedSuspendedUntil.toISOString() : null
        );
      }}
    >
      <div className="space-y-4">
        <PersonSummary
          id={person.id}
          name={person.name}
          email={person.email}
          phoneNumber={person.phoneNumber}
          status={person.status}
        />

        <div className="flex items-start gap-2.5 rounded-lg border border-[#fdba74] bg-[#fff7ed] p-3 text-[#9a3412] dark:border-[#fb923c]/40 dark:bg-[#431407] dark:text-[#fdba74]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p className="text-xs leading-relaxed">
            Anggota tetap terlihat di daftar pengurus, namun tidak dapat login maupun mengakses KTA dan fitur anggota selama dibekukan.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="suspend-reason-input"
              className="flex items-center gap-1 text-[13px] font-semibold text-[#0f172a] dark:text-[#eef2f4]"
            >
              Alasan Pembekuan{" "}
              <span className="text-[#dc2626] dark:text-[#f87171]" aria-hidden>
                *
              </span>
            </label>
            <span className="font-mono text-[11px] text-[#64748b] tabular-nums dark:text-[#94a89e]">
              {reason.length} / 500
            </span>
          </div>

          <textarea
            id="suspend-reason-input"
            className={fieldClass(
              false,
              "min-h-[88px] resize-y focus:border-[#d97706] focus:ring-[#d97706]/20"
            )}
            placeholder="Jelaskan alasan pembekuan akun anggota ini..."
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 500))}
          />

          <div className="space-y-1.5 pt-0.5">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#52606d] dark:text-[#94a89e]">
              Alasan Cepat
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUSPEND_REASONS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setReason(preset.text)}
                  className="min-h-[32px] cursor-pointer rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-medium text-[#334155] transition-colors hover:border-[#fdba74] hover:bg-[#fff7ed] hover:text-[#9a3412] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#cbd6d0] dark:hover:border-[#fb923c]/50 dark:hover:bg-[#431407] dark:hover:text-[#fdba74]"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-[#e2e8f0] pt-3 dark:border-[#3c4d46]">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0f172a] dark:text-[#eef2f4]">
              <CalendarClock className="h-4 w-4 text-[#64748b] dark:text-[#94a89e]" aria-hidden />
              Durasi Pembekuan (Opsional)
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Pilih durasi pembekuan">
            {DURATION_OPTIONS.map((option) => {
              const active = durationPreset === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDurationPreset(option.value)}
                  className={`min-h-[36px] cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                    active
                      ? "border-[#d97706] bg-[#fff7ed] text-[#9a3412] dark:border-[#fb923c] dark:bg-[#431407] dark:text-[#fdba74]"
                      : "border-[#cbd5e1] bg-white text-[#475569] hover:bg-[#f8fafc] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#cbd6d0] dark:hover:bg-[#22322d]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {durationPreset === "CUSTOM" && (
            <div className="pt-1">
              <label
                htmlFor="suspend-custom-date"
                className="mb-1 block text-xs font-medium text-[#475569] dark:text-[#cbd6d0]"
              >
                Tanggal Berakhir Pembekuan
              </label>
              <input
                id="suspend-custom-date"
                type="date"
                min={tomorrowIsoDate}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className={fieldClass(false, "text-xs")}
              />
            </div>
          )}

          {resolvedSuspendedUntil && (
            <p className="text-xs font-medium text-[#9a3412] dark:text-[#fdba74]">
              Otomatis aktif kembali pada: {formatDateTime(resolvedSuspendedUntil)} WIB
            </p>
          )}
        </div>
      </div>
    </ConfirmDialog>
  );
}
