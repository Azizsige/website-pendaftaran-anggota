import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { SETTING_KEYS, settingsToMap } from "@/lib/constants/settings";
import { LandingHero } from "./_components/LandingHero";
import { LandingStats } from "./_components/LandingStats";
import { LandingFeatures } from "./_components/LandingFeatures";
import { LandingSteps } from "./_components/LandingSteps";
import { LandingCta } from "./_components/LandingCta";
import { LandingFooter } from "./_components/LandingFooter";

export const metadata: Metadata = {
  title: "Beranda | Komunitas Profesional",
  description:
    "Tingkatkan karir dan koneksi Anda melalui ekosistem digital yang dirancang khusus untuk pertumbuhan profesional yang terukur dan terarah.",
};

export default async function LandingPage() {
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: [
          SETTING_KEYS.ORG_NAME,
          SETTING_KEYS.ORG_DESCRIPTION,
          SETTING_KEYS.ORG_WHATSAPP,
          SETTING_KEYS.ORG_INSTAGRAM,
          SETTING_KEYS.ORG_ADDRESS,
          SETTING_KEYS.ORG_LOGO,
        ],
      },
    },
  });

  const settingMap = settingsToMap(settings);

  const orgName = settingMap.get(SETTING_KEYS.ORG_NAME) || "Komunitas Profesional";
  const orgDesc =
    settingMap.get(SETTING_KEYS.ORG_DESCRIPTION) ||
    "Tingkatkan karir dan koneksi Anda melalui ekosistem digital yang dirancang khusus untuk pertumbuhan profesional yang terukur dan terarah.";
  const orgAddress = settingMap.get(SETTING_KEYS.ORG_ADDRESS) || "";
  const orgWhatsapp = settingMap.get(SETTING_KEYS.ORG_WHATSAPP) || "";
  const orgInstagram = settingMap.get(SETTING_KEYS.ORG_INSTAGRAM) || "";
  const orgLogo = settingMap.get(SETTING_KEYS.ORG_LOGO) || "";

  return (
    <div className="landing-theme bg-[#f7f9fb] text-[#191c1e] antialiased overflow-x-hidden">
      <LandingHero orgName={orgName} orgDesc={orgDesc} />
      <LandingStats />
      <LandingFeatures />
      <LandingSteps />
      <LandingCta orgName={orgName} />
      <LandingFooter
        orgName={orgName}
        orgLogo={orgLogo}
        orgAddress={orgAddress}
        orgWhatsapp={orgWhatsapp}
        orgInstagram={orgInstagram}
      />
    </div>
  );
}
