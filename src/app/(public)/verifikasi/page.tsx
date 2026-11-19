import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { addMonths } from "date-fns";
import { AlertTriangle, CheckCircle2, QrCode, Search, ShieldAlert, User } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { checkDatabaseAvailable } from "@/lib/db-health";
import { getCachedSettingsMap } from "@/lib/settings-cache";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { MEMBER_STATUS } from "@/lib/constants/status";
import { verifyKtaVerificationCode } from "@/lib/kta-verification";
import {
  expireElapsedSuspensions,
  getSuspendedUntilForProfile,
} from "@/lib/status-history";
import { formatDate, formatDateTime } from "@/lib/format";
import { DatabasePausedScreen } from "@/components/system/DatabasePausedScreen";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verifikasi KTA Resmi | Portal Keanggotaan",
  description: "Verifikasi keaslian Kartu Tanda Anggota (KTA) organisasi melalui kode QR atau SEC-ID.",
};

export default async function VerifikasiKtaPage(props: {
  searchParams?: Promise<{ nim?: string; code?: string }>;
}) {
  const dbAvailable = await checkDatabaseAvailable();
  if (!dbAvailable) {
    return (
      <DatabasePausedScreen
        context="status"
        orgEmail={process.env.NEXT_PUBLIC_ORG_EMAIL?.trim()}
      />
    );
  }

  const searchParams = (await props.searchParams) || {};
  const nim = typeof searchParams.nim === "string" ? searchParams.nim.replace(/\D/g, "").trim() : "";
  const code = typeof searchParams.code === "string" ? searchParams.code.trim().toUpperCase() : "";

  const settingsMap = await getCachedSettingsMap();
  const orgName =
    settingsMap.get(SETTING_KEYS.KTA_ORG_NAME)?.trim() ||
    settingsMap.get(SETTING_KEYS.ORG_NAME)?.trim() ||
    "Organisasi Mahasiswa";
  const memberPrefix = settingsMap.get(SETTING_KEYS.KTA_MEMBER_PREFIX)?.trim() || "BEM-2026-";
  const parsedValidity = Number(settingsMap.get(SETTING_KEYS.KTA_VALIDITY_MONTHS) ?? 12);
  const validityMonths =
    Number.isFinite(parsedValidity) && parsedValidity > 0 ? Math.round(parsedValidity) : 12;
  const showPhoto = settingsMap.get(SETTING_KEYS.KTA_SHOW_PHOTO) !== "false";

  let verificationState: "EMPTY" | "INVALID" | "INACTIVE" | "VALID" = "EMPTY";
  let memberInfo: {
    name: string;
    nim: string;
    memberId: string;
    faculty: string | null;
    major: string | null;
    batchYear: string | null;
    status: string;
    adminNotes: string | null;
    suspendedUntil: string | null;
    validUntil: string;
    photoUrl: string | null;
  } | null = null;

  if (nim && code) {
    let profile = await prisma.memberProfile.findUnique({
      where: { nim },
      select: {
        id: true,
        nim: true,
        userId: true,
        faculty: true,
        major: true,
        batchYear: true,
        status: true,
        adminNotes: true,
        joinDate: true,
        photoUrl: true,
        user: { select: { name: true, status: true } },
      },
    });

    if (profile?.status === MEMBER_STATUS.SUSPENDED) {
      const reactivated = await expireElapsedSuspensions([profile.id]);
      if (reactivated > 0) {
        profile = await prisma.memberProfile.findUnique({
          where: { nim },
          select: {
            id: true,
            nim: true,
            userId: true,
            faculty: true,
            major: true,
            batchYear: true,
            status: true,
            adminNotes: true,
            joinDate: true,
            photoUrl: true,
            user: { select: { name: true, status: true } },
          },
        });
      }
    }

    if (!profile || !verifyKtaVerificationCode(profile.nim, profile.userId, code)) {
      verificationState = "INVALID";
    } else {
      const isActive =
        (profile.status === MEMBER_STATUS.ACTIVE || profile.status === "APPROVED") &&
        profile.user.status === "ACTIVE";
      const suspendedUntil =
        profile.status === MEMBER_STATUS.SUSPENDED
          ? await getSuspendedUntilForProfile(profile.id)
          : null;
      verificationState = isActive ? "VALID" : "INACTIVE";
      memberInfo = {
        name: profile.user.name || "Anggota Terdaftar",
        nim: profile.nim,
        memberId: `${memberPrefix}${profile.nim}`,
        faculty: profile.faculty,
        major: profile.major,
        batchYear: profile.batchYear,
        status: profile.status,
        adminNotes: profile.adminNotes,
        suspendedUntil: suspendedUntil ? formatDateTime(suspendedUntil) : null,
        validUntil: formatDate(addMonths(profile.joinDate, validityMonths)),
        photoUrl: showPhoto ? profile.photoUrl : null,
      };
    }
  } else if (nim || code) {
    verificationState = "INVALID";
  }

  return (
    <div className="min-h-[calc(100dvh-68px)] bg-[#f7f9fb] dark:bg-[#0d1412] px-4 py-10 sm:py-14 flex items-start justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-xs dark:border-[#3c4d46] dark:bg-[#131d1a]">
        <div className="flex items-center gap-3 pb-4 border-b border-[#f1f5f9] dark:border-[#24332d]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e6f4ee] text-[#005236] border border-[#006c49]/20 dark:bg-[#0a3326] dark:text-[#6ee7b7] dark:border-[#34d399]/35">
            <QrCode className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-[#0f172a] dark:text-[#eef2f4] leading-tight">
              Verifikasi Keaslian KTA
            </h1>
            <p className="text-xs text-[#475569] dark:text-[#cbd6d0] truncate">{orgName}</p>
          </div>
        </div>

        {verificationState === "VALID" && memberInfo && (
          <div className="mt-5 space-y-5">
            <div className="rounded-xl border border-[#006c49]/25 bg-[#e6f4ee] p-4 flex items-start gap-3 dark:border-[#34d399]/35 dark:bg-[#0a3326]">
              <CheckCircle2
                className="h-5 w-5 text-[#005236] dark:text-[#6ee7b7] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-bold text-[#005236] dark:text-[#6ee7b7]">
                  KTA Terverifikasi Resmi
                </p>
                <p className="text-xs text-[#00422b] dark:text-[#cbd6d0] mt-0.5">
                  Kartu Tanda Anggota tercatat aktif pada basis data resmi {orgName}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 dark:border-[#3c4d46] dark:bg-[#1a2723]">
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-[#cbd5e1] bg-white dark:border-[#5f736b] dark:bg-[#131d1a] flex items-center justify-center">
                {memberInfo.photoUrl ? (
                  <Image
                    src={memberInfo.photoUrl}
                    alt={`Pas Foto ${memberInfo.name}`}
                    width={64}
                    height={80}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="h-7 w-7 text-[#64748b] dark:text-[#94a89e]" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-[#94a89e]">
                  Nama Anggota
                </p>
                <p className="text-base font-bold text-[#0f172a] dark:text-[#eef2f4] leading-snug">
                  {memberInfo.name}
                </p>
                <p className="mt-1 font-mono text-xs font-semibold text-[#005236] dark:text-[#6ee7b7]">
                  {memberInfo.memberId}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-[#e2e8f0] p-4 text-xs dark:border-[#3c4d46]">
              <div>
                <dt className="font-semibold text-[#475569] dark:text-[#94a89e]">NIM</dt>
                <dd className="mt-0.5 font-mono font-bold text-[#0f172a] dark:text-[#eef2f4]">
                  {memberInfo.nim}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#475569] dark:text-[#94a89e]">Berlaku Hingga</dt>
                <dd className="mt-0.5 font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                  {memberInfo.validUntil}
                </dd>
              </div>
              {memberInfo.faculty && (
                <div>
                  <dt className="font-semibold text-[#475569] dark:text-[#94a89e]">Fakultas</dt>
                  <dd className="mt-0.5 font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                    {memberInfo.faculty}
                  </dd>
                </div>
              )}
              {memberInfo.major && (
                <div>
                  <dt className="font-semibold text-[#475569] dark:text-[#94a89e]">Program Studi</dt>
                  <dd className="mt-0.5 font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                    {memberInfo.major}
                  </dd>
                </div>
              )}
              {memberInfo.batchYear && (
                <div>
                  <dt className="font-semibold text-[#475569] dark:text-[#94a89e]">Angkatan</dt>
                  <dd className="mt-0.5 font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                    {memberInfo.batchYear}
                  </dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-[#475569] dark:text-[#94a89e]">SEC-ID Kartu</dt>
                <dd className="mt-0.5 font-mono font-bold text-[#0f172a] dark:text-[#eef2f4]">
                  {code}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {verificationState === "INACTIVE" && memberInfo && (
          <div
            className={`mt-5 rounded-xl border p-4 flex items-start gap-3 ${
              memberInfo.status === MEMBER_STATUS.SUSPENDED
                ? "border-[#fdba74] bg-[#fff7ed] dark:border-[#fb923c]/40 dark:bg-[#431407]"
                : "border-[#f59e0b]/45 bg-[#fef3c7] dark:border-[#f59e0b]/40 dark:bg-[#3b2506]"
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 shrink-0 mt-0.5 ${
                memberInfo.status === MEMBER_STATUS.SUSPENDED
                  ? "text-[#9a3412] dark:text-[#fdba74]"
                  : "text-[#92400e] dark:text-[#fcd34d]"
              }`}
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p
                className={`text-sm font-bold ${
                  memberInfo.status === MEMBER_STATUS.SUSPENDED
                    ? "text-[#9a3412] dark:text-[#fdba74]"
                    : "text-[#92400e] dark:text-[#fcd34d]"
                }`}
              >
                {memberInfo.status === MEMBER_STATUS.SUSPENDED
                  ? "Keanggotaan Sedang Dibekukan"
                  : "Keanggotaan Tidak Aktif"}
              </p>
              <p
                className={`text-xs ${
                  memberInfo.status === MEMBER_STATUS.SUSPENDED
                    ? "text-[#9a3412] dark:text-[#fed7aa]"
                    : "text-[#92400e] dark:text-[#fde68a]"
                }`}
              >
                KTA atas nama <strong>{memberInfo.name}</strong> ({memberInfo.nim}) berstatus{" "}
                <strong>{memberInfo.status}</strong>{" "}
                {memberInfo.status === MEMBER_STATUS.SUSPENDED
                  ? "sehingga tidak berlaku untuk digunakan sementara."
                  : "dan saat ini tidak aktif."}
              </p>
              {memberInfo.status === MEMBER_STATUS.SUSPENDED && memberInfo.suspendedUntil && (
                <p className="text-xs font-medium text-[#9a3412] dark:text-[#fdba74]">
                  Masa pembekuan hingga: {memberInfo.suspendedUntil} WIB
                </p>
              )}
            </div>
          </div>
        )}

        {verificationState === "INVALID" && (
          <div className="mt-5 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 flex items-start gap-3 dark:border-[#f87171]/35 dark:bg-[#3b1214]">
            <ShieldAlert
              className="h-5 w-5 text-[#991b1b] dark:text-[#fca5a5] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-bold text-[#991b1b] dark:text-[#fca5a5]">
                Kode Verifikasi Tidak Valid
              </p>
              <p className="text-xs text-[#991b1b] dark:text-[#fecaca] mt-1">
                Kombinasi NIM dan SEC-ID tidak cocok dengan KTA resmi yang terdaftar. Pastikan QR Code dipindai dari kartu resmi.
              </p>
            </div>
          </div>
        )}

        <form method="GET" action="/verifikasi" className="mt-6 space-y-3 border-t border-[#f1f5f9] pt-5 dark:border-[#24332d]">
          <p className="text-xs font-semibold text-[#334155] dark:text-[#cbd6d0]">
            Periksa Kode Verifikasi Secara Manual
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="verify-nim" className="block text-xs font-semibold text-[#0f172a] dark:text-[#eef2f4] mb-1">
                NIM
              </label>
              <input
                id="verify-nim"
                name="nim"
                type="text"
                defaultValue={nim}
                placeholder="2026012345"
                required
                className="w-full min-h-[44px] rounded-lg border border-[#85929f] bg-white px-3 py-2 text-sm font-mono text-[#0f172a] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4]"
              />
            </div>
            <div>
              <label htmlFor="verify-code" className="block text-xs font-semibold text-[#0f172a] dark:text-[#eef2f4] mb-1">
                SEC-ID
              </label>
              <input
                id="verify-code"
                name="code"
                type="text"
                defaultValue={code}
                placeholder="XXXX-XXXX"
                required
                className="w-full min-h-[44px] rounded-lg border border-[#85929f] bg-white px-3 py-2 text-sm font-mono uppercase text-[#0f172a] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4]"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="submit"
              className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#006c49] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] transition-colors"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Verifikasi KTA</span>
            </button>
            <Link
              href="/cek-status"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#85929f] bg-white px-4 py-2 text-sm font-semibold text-[#0f172a] hover:bg-[#f8fafc] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] transition-colors"
            >
              Ke Cek Status
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
