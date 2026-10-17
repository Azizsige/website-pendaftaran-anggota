import LandingNavbar from "@/components/layout/LandingNavbar";
import LandingFooter from "@/components/layout/LandingFooter";
import "../landing.css";
import { prisma } from "@/lib/prisma";
import ScrollToTop from "@/components/providers/ScrollToTop";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { logger } from "@/lib/logger";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    logger.error("Failed to load layout settings:", error);
  }

  return (
    <>
      <ScrollToTop />
      <LandingNavbar orgName={orgName} orgLogo={orgLogo} />
      <main>{children}</main>
      <LandingFooter />
    </>
  );
}
