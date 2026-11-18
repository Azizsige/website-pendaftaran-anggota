import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { checkDatabaseAvailable } from "@/lib/db-health";
import { getCachedAllSettings, getCachedSettingsMap } from "@/lib/settings-cache";
import { DatabaseInfoBanner } from "@/components/system/DatabaseInfoBanner";
import { logger } from "@/lib/logger";
import {
  parseRegistrationSettings,
  SETTING_KEYS,
  settingsToMap,
} from "@/lib/constants/settings";
import { LandingHero } from "./_components/LandingHero";
import { LandingRequirementsSteps } from "./_components/LandingRequirementsSteps";
import { LandingStatusPreview } from "./_components/LandingStatusPreview";
import { LandingCta } from "./_components/LandingCta";
import type { RegistrationWindowStatus } from "./_components/landing-types";

export const dynamic = "force-dynamic";

const DEFAULT_ORG_NAME = "Organisasi Mahasiswa";
const DEFAULT_ORG_DESC =
  "Portal resmi pendaftaran anggota baru organisasi mahasiswa. Lengkapi data akademik berbasis NIM, unggah Kartu Tanda Mahasiswa (KTM), pantau verifikasi, dan unduh KTA Digital Anda.";

const idDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function formatScheduleRange(dateFrom: Date | null, dateTo: Date | null): string | null {
  if (dateFrom && dateTo) {
    return `${idDateFormatter.format(dateFrom)} s.d. ${idDateFormatter.format(dateTo)}`;
  }
  if (dateFrom) {
    return `Mulai ${idDateFormatter.format(dateFrom)}`;
  }
  if (dateTo) {
    return `Sampai ${idDateFormatter.format(dateTo)}`;
  }
  return null;
}

function getBooleanSetting(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  const normalized = value.trim().toLowerCase();
  return normalized !== "false" && normalized !== "0";
}

export async function generateMetadata(): Promise<Metadata> {
  let orgName = DEFAULT_ORG_NAME;
  let orgDesc = DEFAULT_ORG_DESC;

  try {
    const dbAvailable = await checkDatabaseAvailable();
    if (dbAvailable) {
      const map = await getCachedSettingsMap();
      orgName = map.get(SETTING_KEYS.ORG_NAME)?.trim() || DEFAULT_ORG_NAME;
      orgDesc = map.get(SETTING_KEYS.ORG_DESCRIPTION)?.trim() || DEFAULT_ORG_DESC;
    }
  } catch (error) {
    logger.warn("LANDING_METADATA: Failed to load org settings for metadata", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return {
    title: `Beranda | ${orgName}`,
    description: orgDesc,
  };
}

export default async function LandingPage() {
  const dbAvailable = await checkDatabaseAvailable();
  let settings: Array<{ key: string; value: string }> = [];
  let activeMemberCount = 0;

  if (dbAvailable) {
    try {
      const [settingRows, memberCount] = await Promise.all([
        getCachedAllSettings(),
        prisma.memberProfile.count({
          where: { status: { not: "REJECTED" } },
        }),
      ]);
      settings = settingRows;
      activeMemberCount = memberCount;
    } catch (error) {
      logger.warn("LANDING_PAGE: Failed to fetch settings or count for landing page", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const settingMap = settingsToMap(settings);
  const regConfig = parseRegistrationSettings(settings);

  const orgName = settingMap.get(SETTING_KEYS.ORG_NAME)?.trim() || DEFAULT_ORG_NAME;
  const orgDesc = settingMap.get(SETTING_KEYS.ORG_DESCRIPTION)?.trim() || DEFAULT_ORG_DESC;
  const orgLogo = settingMap.get(SETTING_KEYS.ORG_LOGO)?.trim() || "";

  const ktaOrgName = settingMap.get(SETTING_KEYS.KTA_ORG_NAME)?.trim() || orgName;
  const memberPrefix = settingMap.get(SETTING_KEYS.KTA_MEMBER_PREFIX)?.trim() || "KTA-";
  const parsedValidity = Number(settingMap.get(SETTING_KEYS.KTA_VALIDITY_MONTHS) ?? 12);
  const validityMonths =
    Number.isFinite(parsedValidity) && parsedValidity > 0
      ? Math.round(parsedValidity)
      : 12;

  const showMemberId = getBooleanSetting(
    settingMap.get(SETTING_KEYS.KTA_SHOW_MEMBER_ID),
    true
  );
  const showNim = getBooleanSetting(settingMap.get(SETTING_KEYS.KTA_SHOW_NIM), true);
  const showFaculty = getBooleanSetting(
    settingMap.get(SETTING_KEYS.KTA_SHOW_FACULTY),
    true
  );
  const showMajor = getBooleanSetting(
    settingMap.get(SETTING_KEYS.KTA_SHOW_MAJOR),
    true
  );

  const now = new Date();
  let regStatus: RegistrationWindowStatus = dbAvailable ? "OPEN" : "PAUSED_DB";

  if (dbAvailable) {
    if (!regConfig.isActive) {
      regStatus = "CLOSED_TOGGLE";
    } else if (regConfig.dateFrom && now < regConfig.dateFrom) {
      regStatus = "CLOSED_BEFORE";
    } else if (regConfig.dateTo && now > regConfig.dateTo) {
      regStatus = "CLOSED_AFTER";
    } else if (regConfig.maxQuota > 0 && activeMemberCount >= regConfig.maxQuota) {
      regStatus = "CLOSED_QUOTA";
    }
  }

  const remainingQuota =
    regConfig.maxQuota > 0
      ? Math.max(0, regConfig.maxQuota - activeMemberCount)
      : null;
  const scheduleSummary = formatScheduleRange(regConfig.dateFrom, regConfig.dateTo);

  return (
    <div className="landing-theme bg-[#f7f9fb] dark:bg-[#0d1412] text-[#191c1e] dark:text-[#eef2f4] antialiased">
      {!dbAvailable && <DatabaseInfoBanner />}
      <LandingHero
        orgName={orgName}
        orgDesc={orgDesc}
        orgLogo={orgLogo}
        ktaOrgName={ktaOrgName}
        memberPrefix={memberPrefix}
        validityMonths={validityMonths}
        showMemberId={showMemberId}
        showNim={showNim}
        showFaculty={showFaculty}
        showMajor={showMajor}
        reqKtm={regConfig.reqKtm}
        regStatus={regStatus}
        scheduleSummary={scheduleSummary}
        maxQuota={regConfig.maxQuota}
        remainingQuota={remainingQuota}
        activeMemberCount={activeMemberCount}
      />

      <LandingRequirementsSteps
        reqKtm={regConfig.reqKtm}
        reqFoto={regConfig.reqFoto}
        isOpen={regStatus === "OPEN"}
        isPausedDb={!dbAvailable}
      />

      <LandingStatusPreview
        activeMemberCount={activeMemberCount}
        isPausedDb={!dbAvailable}
      />

      <LandingCta
        orgName={orgName}
        regStatus={regStatus}
        remainingQuota={remainingQuota}
        maxQuota={regConfig.maxQuota}
        scheduleSummary={scheduleSummary}
      />
    </div>
  );
}
