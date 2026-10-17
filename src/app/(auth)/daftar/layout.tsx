import LandingNavbar from "@/components/layout/LandingNavbar";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { logger } from "@/lib/logger";

export const metadata: Metadata = {
  title: "Pendaftaran Anggota | Komunitas Profesional",
  description: "Daftar sekarang untuk bergabung dengan ekosistem profesional kami.",
};

export default async function DaftarLayout({ children }: { children: React.ReactNode }) {
  let orgName = "MemberHub";
  let orgLogo = "";

  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: [SETTING_KEYS.ORG_NAME, SETTING_KEYS.ORG_LOGO] } }
    });
    const nameSetting = settings.find(s => s.key === SETTING_KEYS.ORG_NAME);
    const logoSetting = settings.find(s => s.key === SETTING_KEYS.ORG_LOGO);
    if (nameSetting?.value) orgName = nameSetting.value;
    if (logoSetting?.value) orgLogo = logoSetting.value;
  } catch (error) {
    logger.error("Failed to load daftar layout settings:", error);
  }

  return (
    <>
      <LandingNavbar orgName={orgName} orgLogo={orgLogo} />
      {children}
    </>
  );
}
