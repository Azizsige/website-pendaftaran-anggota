"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileArchive,
  HardDrive,
  Lock,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ToggleSwitchField, fieldClass } from "@/components/ui/form-field";
import { formatDateTime } from "@/lib/format";
import { repairDataIntegrity, toggleMaintenanceMode } from "../actions";
import type { SystemDiagnostics } from "../types";

interface SystemHealthPanelProps {
  diagnostics: SystemDiagnostics;
}

export function SystemHealthPanel({ diagnostics }: SystemHealthPanelProps) {
  const router = useRouter();
  const {
    dbConnected,
    dbLatencyMs,
    checkedAt,
    registrationActive,
    maintenanceMode,
    maintenanceMessage,
    counts,
    tableCounts,
    storage,
    integrity,
    ownerSecurity,
  } = diagnostics;

  const [messageInput, setMessageInput] = useState(maintenanceMessage);
  const [prevMaintenanceMessage, setPrevMaintenanceMessage] = useState(maintenanceMessage);
  const [pendingToggleState, setPendingToggleState] = useState<boolean | null>(null);
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [isRepairDialogOpen, setIsRepairDialogOpen] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

  if (prevMaintenanceMessage !== maintenanceMessage) {
    setPrevMaintenanceMessage(maintenanceMessage);
    setMessageInput(maintenanceMessage);
  }

  const hasSecurityAlerts = counts.securityAlertsCount > 0;
  const repairableAnomalyCount = integrity.orphanMemberUsers + integrity.statusMismatches;
  const totalStoredFiles = storage.photosStored + storage.ktmStored + storage.documentsStored;

  const metricCards = [
    {
      label: "Total Log Non-Owner",
      value: counts.totalLogsNonOwner,
      hint: "Riwayat tersimpan saat ini",
      icon: ScrollText,
      iconClass:
        "bg-[#f1f5f9] text-[#334155] border-[#cbd5e1] dark:bg-[#1e2d28] dark:text-[#cbd6d0] dark:border-[#5f736b]",
      valueClass: "text-[#0f172a] dark:text-[#eef2f4]",
    },
    {
      label: "Aktivitas 24 Jam Terakhir",
      value: counts.logsLast24h,
      hint: "Aksi pengelola sehari terakhir",
      icon: Activity,
      iconClass:
        "bg-[#e6f4ee] text-[#005236] border-[#006c49]/20 dark:bg-[#0a3326] dark:text-[#6ee7b7] dark:border-[#34d399]/35",
      valueClass: "text-[#0f172a] dark:text-[#eef2f4]",
    },
    {
      label: "Pengelola Non-Owner Aktif",
      value: counts.activeAdminsNonOwner,
      hint: "Super Admin, Koordinator, Staff",
      icon: UserCog,
      iconClass:
        "bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe] dark:bg-[#132544] dark:text-[#93c5fd] dark:border-[#60a5fa]/35",
      valueClass: "text-[#0f172a] dark:text-[#eef2f4]",
    },
    {
      label: "Peringatan Keamanan",
      value: counts.securityAlertsCount,
      hint: "Akses ditolak & gagal login",
      icon: ShieldAlert,
      iconClass: hasSecurityAlerts
        ? "bg-[#fef2f2] text-[#991b1b] border-[#ef4444]/25 dark:bg-[#3b1214] dark:text-[#fca5a5] dark:border-[#f87171]/35"
        : "bg-[#f1f5f9] text-[#334155] border-[#cbd5e1] dark:bg-[#1e2d28] dark:text-[#cbd6d0] dark:border-[#5f736b]",
      valueClass: hasSecurityAlerts
        ? "text-[#991b1b] dark:text-[#fca5a5]"
        : "text-[#0f172a] dark:text-[#eef2f4]",
    },
  ];

  const handleConfirmToggleMaintenance = async () => {
    if (pendingToggleState === null) return;
    setIsTogglingMaintenance(true);
    try {
      const res = await toggleMaintenanceMode(pendingToggleState, messageInput);
      if (!res.success) {
        toast.error(res.error || "Gagal memperbarui mode pemeliharaan.");
        return;
      }
      toast.success(
        pendingToggleState
          ? "Mode Pemeliharaan Darurat diaktifkan. Publik dan admin non-Owner dikunci."
          : "Mode Pemeliharaan dimatikan. Seluruh layanan kembali dibuka."
      );
      setPendingToggleState(null);
      router.refresh();
    } finally {
      setIsTogglingMaintenance(false);
    }
  };

  const handleUpdateMaintenanceMessage = async () => {
    setIsSavingMessage(true);
    try {
      const res = await toggleMaintenanceMode(maintenanceMode, messageInput);
      if (!res.success) {
        toast.error(res.error || "Gagal menyimpan pesan pemeliharaan.");
        return;
      }
      toast.success("Pesan pemeliharaan berhasil diperbarui.");
      router.refresh();
    } finally {
      setIsSavingMessage(false);
    }
  };

  const handleConfirmRepairIntegrity = async () => {
    setIsRepairing(true);
    try {
      const res = await repairDataIntegrity();
      if (!res.success) {
        toast.error(res.error || "Gagal memperbaiki sinkronisasi data.");
        return;
      }
      const fixedTotal = (res.fixedUsersCount ?? 0) + (res.removedOrphansCount ?? 0);
      if (fixedTotal === 0) {
        toast.info("Tidak ada data tidak sinkron yang perlu diperbaiki.");
      } else {
        toast.success(
          `Sinkronisasi selesai: ${res.fixedUsersCount} status akun diselaraskan, ${res.removedOrphansCount} akun orphan dibersihkan.`
        );
      }
      setIsRepairDialogOpen(false);
      router.refresh();
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <section
      aria-label="Ringkasan status basis data, penyimpanan, dan kontrol sistem"
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#e2e8f0] bg-white p-5 sm:p-6 lg:col-span-5 dark:border-[#3c4d46] dark:bg-[#131d1a]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#006c49]/20 bg-[#e6f4ee] text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]"
                aria-hidden
              >
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                  Status Basis Data &amp; Tabel
                </h2>
                <p className="mt-0.5 text-xs text-[#52606d] dark:text-[#94a89e]">
                  Pengukuran langsung saat halaman dimuat
                </p>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                dbConnected
                  ? "border-[#006c49]/20 bg-[#e6f4ee] text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]"
                  : "border-[#ef4444]/25 bg-[#fef2f2] text-[#991b1b] dark:border-[#f87171]/35 dark:bg-[#3b1214] dark:text-[#fca5a5]"
              }`}
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${
                  dbConnected
                    ? "bg-[#006c49] dark:bg-[#34d399]"
                    : "bg-[#dc2626] dark:bg-[#f87171]"
                }`}
              />
              {dbConnected ? "Terhubung" : "Terputus"}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-3 border-t border-[#f1f5f9] pt-4 dark:border-[#24332d]">
            <div className="flex flex-col gap-1">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                Latensi Kueri
              </dt>
              <dd className="font-mono text-base font-bold text-[#0f172a] tabular-nums dark:text-[#eef2f4]">
                {dbConnected ? `${dbLatencyMs} ms` : "-"}
              </dd>
            </div>

            <div className="flex flex-col gap-1">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                Pendaftaran Publik
              </dt>
              <dd className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                {registrationActive ? (
                  <>
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-[#006c49] dark:text-[#34d399]"
                      aria-hidden
                    />
                    <span>Dibuka</span>
                  </>
                ) : (
                  <>
                    <AlertCircle
                      className="h-4 w-4 shrink-0 text-[#d97706] dark:text-[#fbbf24]"
                      aria-hidden
                    />
                    <span>Ditutup</span>
                  </>
                )}
              </dd>
            </div>

            <div className="flex flex-col gap-1">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                Anggota Aktif
              </dt>
              <dd className="text-base font-bold text-[#0f172a] tabular-nums dark:text-[#eef2f4]">
                {counts.totalMembers.toLocaleString("id-ID")}
              </dd>
            </div>

            <div className="flex flex-col gap-1">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                Antrean Calon Anggota
              </dt>
              <dd className="text-base font-bold text-[#0f172a] tabular-nums dark:text-[#eef2f4]">
                {counts.pendingApplicants.toLocaleString("id-ID")}
              </dd>
            </div>
          </dl>

          <div className="border-t border-[#f1f5f9] pt-3.5 dark:border-[#24332d]">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
              Total Baris per Tabel
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "User", value: tableCounts.users },
                { label: "Profil", value: tableCounts.memberProfiles },
                { label: "Log", value: tableCounts.activityLogs },
                { label: "Setting", value: tableCounts.systemSettings },
              ].map((row) => (
                <div
                  key={row.label}
                  className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-2 dark:border-[#3c4d46] dark:bg-[#1a2723]"
                >
                  <span className="block text-[11px] font-medium text-[#52606d] dark:text-[#94a89e]">
                    {row.label}
                  </span>
                  <span className="font-mono text-sm font-bold text-[#0f172a] tabular-nums dark:text-[#eef2f4]">
                    {row.value.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 border-t border-[#f1f5f9] pt-3 text-xs text-[#52606d] dark:border-[#24332d] dark:text-[#94a89e]">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Diperiksa pada {formatDateTime(checkedAt)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:col-span-7">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="flex items-start justify-between gap-3 rounded-xl border border-[#e2e8f0] bg-white p-5 dark:border-[#3c4d46] dark:bg-[#131d1a]"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                    {card.label}
                  </span>
                  <span
                    className={`text-2xl font-bold tracking-tight tabular-nums sm:text-[28px] ${card.valueClass}`}
                  >
                    {card.value.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-[#52606d] dark:text-[#94a89e]">
                    {card.hint}
                  </span>
                </div>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${card.iconClass}`}
                  aria-hidden
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#e2e8f0] bg-white p-5 sm:p-6 lg:col-span-6 dark:border-[#3c4d46] dark:bg-[#131d1a]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#bfdbfe] bg-[#eff6ff] text-[#1e40af] dark:border-[#60a5fa]/35 dark:bg-[#132544] dark:text-[#93c5fd]"
                aria-hidden
              >
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                  Monitor Berkas &amp; Integritas Data
                </h2>
                <p className="mt-0.5 text-xs text-[#52606d] dark:text-[#94a89e]">
                  Statistik dokumen pendaftaran dan deteksi anomali relasi User-MemberProfile
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-2.5 py-1 font-mono text-xs font-semibold text-[#334155] tabular-nums dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#cbd6d0]">
              {totalStoredFiles.toLocaleString("id-ID")} berkas
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 dark:border-[#3c4d46] dark:bg-[#1a2723]">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                Pas Foto
              </span>
              <span className="mt-0.5 block font-mono text-lg font-bold text-[#0f172a] tabular-nums dark:text-[#eef2f4]">
                {storage.photosStored.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 dark:border-[#3c4d46] dark:bg-[#1a2723]">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                Foto KTM
              </span>
              <span className="mt-0.5 block font-mono text-lg font-bold text-[#0f172a] tabular-nums dark:text-[#eef2f4]">
                {storage.ktmStored.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 dark:border-[#3c4d46] dark:bg-[#1a2723]">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                Dokumen Lain
              </span>
              <span className="mt-0.5 block font-mono text-lg font-bold text-[#0f172a] tabular-nums dark:text-[#eef2f4]">
                {storage.documentsStored.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-xs text-[#334155] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#cbd6d0]">
            <span>
              Cloud URL:{" "}
              <strong className="font-mono font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                {storage.cloudFilesCount.toLocaleString("id-ID")}
              </strong>
            </span>
            <span>
              Tersimpan Base64 di DB:{" "}
              <strong className="font-mono font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                {storage.base64FilesCount.toLocaleString("id-ID")}
              </strong>
            </span>
          </div>

          <div className="space-y-2.5 border-t border-[#f1f5f9] pt-3.5 dark:border-[#24332d]">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg border border-[#e2e8f0] px-3 py-2 text-xs dark:border-[#3c4d46]">
                <span className="text-[#475569] dark:text-[#cbd6d0]">Akun Orphan</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    integrity.orphanMemberUsers > 0
                      ? "text-[#991b1b] dark:text-[#fca5a5]"
                      : "text-[#005236] dark:text-[#6ee7b7]"
                  }`}
                >
                  {integrity.orphanMemberUsers}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[#e2e8f0] px-3 py-2 text-xs dark:border-[#3c4d46]">
                <span className="text-[#475569] dark:text-[#cbd6d0]">Status Tak Sinkron</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    integrity.statusMismatches > 0
                      ? "text-[#991b1b] dark:text-[#fca5a5]"
                      : "text-[#005236] dark:text-[#6ee7b7]"
                  }`}
                >
                  {integrity.statusMismatches}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[#e2e8f0] px-3 py-2 text-xs dark:border-[#3c4d46]">
                <span className="text-[#475569] dark:text-[#cbd6d0]">Berkas Kosong</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    integrity.incompleteDocuments > 0
                      ? "text-[#92400e] dark:text-[#fcd34d]"
                      : "text-[#005236] dark:text-[#6ee7b7]"
                  }`}
                >
                  {integrity.incompleteDocuments}
                </span>
              </div>
            </div>

            {repairableAnomalyCount > 0 ? (
              <button
                type="button"
                onClick={() => setIsRepairDialogOpen(true)}
                disabled={isRepairing}
                className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#f59e0b]/45 bg-[#fef3c7] px-4 py-2 text-xs font-semibold text-[#92400e] transition-colors hover:bg-[#fde68a]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#f59e0b]/45 dark:bg-[#3b2506] dark:text-[#fcd34d] dark:hover:bg-[#4f3209]"
              >
                <Wrench className="h-4 w-4" aria-hidden />
                <span>Perbaiki Sinkronisasi Data ({repairableAnomalyCount} temuan)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-[#006c49]/20 bg-[#e6f4ee] px-3.5 py-2.5 text-xs font-medium text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
                <span>Seluruh relasi User dan MemberProfile sinkron.</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#e2e8f0] bg-white p-5 sm:p-6 lg:col-span-6 dark:border-[#3c4d46] dark:bg-[#131d1a]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  maintenanceMode
                    ? "border-[#f59e0b]/40 bg-[#fef3c7] text-[#92400e] dark:border-[#f59e0b]/45 dark:bg-[#3b2506] dark:text-[#fcd34d]"
                    : "border-[#006c49]/20 bg-[#e6f4ee] text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]"
                }`}
                aria-hidden
              >
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                  Kontrol Darurat &amp; Cadangan Sistem
                </h2>
                <p className="mt-0.5 text-xs text-[#52606d] dark:text-[#94a89e]">
                  Kunci akses publik dan admin non-Owner saat pemeliharaan, atau unduh snapshot data
                </p>
              </div>
            </div>

            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                maintenanceMode
                  ? "border-[#f59e0b]/40 bg-[#fef3c7] text-[#92400e] dark:border-[#f59e0b]/45 dark:bg-[#3b2506] dark:text-[#fcd34d]"
                  : "border-[#006c49]/20 bg-[#e6f4ee] text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]"
              }`}
            >
              {maintenanceMode ? "Aktif - Sistem Dikunci" : "Nonaktif - Normal"}
            </span>
          </div>

          <ToggleSwitchField
            id="maintenance-mode-switch"
            checked={maintenanceMode}
            onChange={(nextChecked) => setPendingToggleState(nextChecked)}
            disabled={isTogglingMaintenance}
            label="Mode Pemeliharaan Darurat (Maintenance Mode)"
            description="Saat aktif, hanya akun Owner yang dapat membuka portal publik maupun panel admin."
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="maintenance-message-input"
              className="text-xs font-semibold text-[#0f172a] dark:text-[#eef2f4]"
            >
              Pesan Pemberitahuan Pemeliharaan
            </label>
            <textarea
              id="maintenance-message-input"
              rows={2}
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
              placeholder="Tuliskan alasan pemeliharaan untuk ditampilkan kepada pengguna..."
              className={fieldClass(false, "min-h-[72px] resize-y text-xs sm:text-sm")}
            />
          </div>

          <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-xs dark:border-[#3c4d46] dark:bg-[#1a2723]">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#e2e8f0] dark:border-[#3c4d46]">
              <span className="font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                Proteksi IP &amp; Perangkat Owner
              </span>
              <span className="text-[#475569] dark:text-[#cbd6d0]">
                IP Anda Saat Ini:{" "}
                <code className="select-all rounded border border-[#cbd5e1] bg-white px-1.5 py-0.5 font-mono font-semibold text-[#0f172a] dark:border-[#5f736b] dark:bg-[#131d1a] dark:text-[#eef2f4]">
                  {ownerSecurity.currentIp}
                </code>
              </span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#475569] dark:text-[#cbd6d0]">
                  Filter IP (<code>OWNER_ALLOWED_IPS</code>)
                </span>
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                    ownerSecurity.ipRestrictionEnabled
                      ? "border-[#006c49]/25 bg-[#e6f4ee] text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]"
                      : "border-[#f59e0b]/35 bg-[#fef3c7] text-[#92400e] dark:border-[#f59e0b]/45 dark:bg-[#3b2506] dark:text-[#fcd34d]"
                  }`}
                >
                  {ownerSecurity.ipRestrictionEnabled ? "Aktif" : "Belum Diatur"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#475569] dark:text-[#cbd6d0]">
                  Kunci Laptop (<code>OWNER_DEVICE_SECRET</code>)
                </span>
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                    ownerSecurity.deviceLockEnabled
                      ? "border-[#006c49]/25 bg-[#e6f4ee] text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]"
                      : "border-[#f59e0b]/35 bg-[#fef3c7] text-[#92400e] dark:border-[#f59e0b]/45 dark:bg-[#3b2506] dark:text-[#fcd34d]"
                  }`}
                >
                  {ownerSecurity.deviceLockEnabled ? "Aktif" : "Belum Diatur"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 border-t border-[#f1f5f9] pt-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-[#24332d]">
            <a
              href="/api/admin/system/backup"
              download
              className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#85929f] bg-white px-4 py-2 text-sm font-semibold text-[#0f172a] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              <span>Unduh Backup Snapshot (.JSON)</span>
            </a>

            <button
              type="button"
              onClick={handleUpdateMaintenanceMessage}
              disabled={isSavingMessage || messageInput.trim() === maintenanceMessage.trim()}
              className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#006c49] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#005236] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#057a55] dark:hover:bg-[#046c4e] dark:focus-visible:ring-[#34d399]"
            >
              <FileArchive className="h-4 w-4 shrink-0" aria-hidden />
              <span>{isSavingMessage ? "Menyimpan..." : "Simpan Pesan"}</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingToggleState !== null}
        onOpenChange={(open) => {
          if (!open && !isTogglingMaintenance) setPendingToggleState(null);
        }}
        tone={pendingToggleState ? "warning" : "primary"}
        icon={pendingToggleState ? "warning" : "check_circle"}
        title={
          pendingToggleState
            ? "Aktifkan Mode Pemeliharaan Darurat?"
            : "Matikan Mode Pemeliharaan?"
        }
        description="Pengaturan akses darurat oleh Owner"
        message={
          pendingToggleState
            ? "Seluruh pengunjung publik, formulir pendaftaran, dan admin selain Owner akan langsung melihat layar pemeliharaan terjadwal."
            : "Layanan publik dan seluruh halaman panel admin akan segera dibuka kembali untuk pengguna sesuai peran masing-masing."
        }
        confirmLabel={
          pendingToggleState ? "Ya, Kunci Sistem Sekarang" : "Ya, Buka Kembali Sistem"
        }
        cancelLabel="Batal"
        isPending={isTogglingMaintenance}
        pendingTitle="Memperbarui Status Sistem"
        pendingMessage="Sedang menerapkan konfigurasi pemeliharaan..."
        onConfirm={handleConfirmToggleMaintenance}
      />

      <ConfirmDialog
        open={isRepairDialogOpen}
        onOpenChange={(open) => {
          if (!isRepairing) setIsRepairDialogOpen(open);
        }}
        tone="warning"
        icon="warning"
        title="Perbaiki Sinkronisasi Data?"
        description="Penyelarasan otomatis tabel User dan MemberProfile"
        message="Tindakan ini akan menyelaraskan status User yang tidak cocok dengan status MemberProfile serta membersihkan akun Member orphan yang tidak memiliki profil."
        confirmLabel="Ya, Perbaiki Sekarang"
        cancelLabel="Batal"
        isPending={isRepairing}
        pendingTitle="Menyelaraskan Data"
        pendingMessage="Sedang memperbaiki integritas tabel basis data..."
        onConfirm={handleConfirmRepairIntegrity}
      />
    </section>
  );
}
