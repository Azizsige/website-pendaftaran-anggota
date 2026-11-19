"use server";

import { addMonths } from "date-fns";

import { prisma } from "@/lib/prisma";
import { checkDatabaseAvailable } from "@/lib/db-health";
import { getCachedSettingsMap } from "@/lib/settings-cache";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { MEMBER_STATUS } from "@/lib/constants/status";
import {
  expireElapsedSuspensions,
  getSuspendedUntilForProfile,
} from "@/lib/status-history";
import { formatDate, formatDateTime } from "@/lib/format";
import { logger } from "@/lib/logger";

export interface VerifiedMemberInfo {
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
}

export type VerifyKtaResult =
  | { state: "EMPTY"; orgName: string }
  | { state: "DB_PAUSED" }
  | { state: "INVALID"; orgName: string; nim: string }
  | { state: "INACTIVE"; orgName: string; memberInfo: VerifiedMemberInfo }
  | { state: "VALID"; orgName: string; memberInfo: VerifiedMemberInfo }
  | { state: "ERROR"; orgName: string; message: string };

export async function verifyKtaByNim(rawInput: string): Promise<VerifyKtaResult> {
  const fallbackOrgName = "Organisasi Mahasiswa";

  try {
    const dbAvailable = await checkDatabaseAvailable();
    if (!dbAvailable) {
      return { state: "DB_PAUSED" };
    }

    const settingsMap = await getCachedSettingsMap();
    const orgName =
      settingsMap.get(SETTING_KEYS.KTA_ORG_NAME)?.trim() ||
      settingsMap.get(SETTING_KEYS.ORG_NAME)?.trim() ||
      fallbackOrgName;
    const memberPrefix = settingsMap.get(SETTING_KEYS.KTA_MEMBER_PREFIX)?.trim() || "BEM-2026-";
    const parsedValidity = Number(settingsMap.get(SETTING_KEYS.KTA_VALIDITY_MONTHS) ?? 12);
    const validityMonths =
      Number.isFinite(parsedValidity) && parsedValidity > 0 ? Math.round(parsedValidity) : 12;
    const showPhoto = settingsMap.get(SETTING_KEYS.KTA_SHOW_PHOTO) !== "false";

    const rawNim = typeof rawInput === "string" ? rawInput.trim() : "";
    const nim = rawNim.replace(/\D/g, "");

    if (!rawNim) {
      return { state: "EMPTY", orgName };
    }

    if (!nim) {
      return { state: "INVALID", orgName, nim: rawNim };
    }

    let profile = await prisma.memberProfile.findUnique({
      where: { nim },
      select: {
        id: true,
        nim: true,
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

    if (
      !profile ||
      profile.status === MEMBER_STATUS.PENDING ||
      profile.status === MEMBER_STATUS.REJECTED
    ) {
      return { state: "INVALID", orgName, nim };
    }

    const isActive =
      (profile.status === MEMBER_STATUS.ACTIVE || profile.status === "APPROVED") &&
      profile.user.status === "ACTIVE";
    const suspendedUntil =
      profile.status === MEMBER_STATUS.SUSPENDED
        ? await getSuspendedUntilForProfile(profile.id)
        : null;

    const memberInfo: VerifiedMemberInfo = {
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

    return isActive
      ? { state: "VALID", orgName, memberInfo }
      : { state: "INACTIVE", orgName, memberInfo };
  } catch (error) {
    logger.error("verifyKtaByNim gagal", error);
    return {
      state: "ERROR",
      orgName: fallbackOrgName,
      message: "Gagal menghubungi server untuk memverifikasi KTA. Silakan coba lagi.",
    };
  }
}
