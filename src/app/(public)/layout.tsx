import LandingNavbar from "@/components/layout/LandingNavbar";
import LandingFooter from "@/components/layout/LandingFooter";
import "../landing.css";
import { prisma } from "@/lib/prisma";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let orgName = "MemberHub";
  let orgLogo = "";

  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['org_name', 'org_logo'] } }
    });
    const nameSetting = settings.find(s => s.key === 'org_name');
    const logoSetting = settings.find(s => s.key === 'org_logo');
    
    if (nameSetting?.value) orgName = nameSetting.value;
    if (logoSetting?.value) orgLogo = logoSetting.value;
  } catch (error) {
    console.error("Failed to load layout settings:", error);
  }

  return (
    <>
      <LandingNavbar orgName={orgName} orgLogo={orgLogo} />
      <main>{children}</main>
      <LandingFooter />
    </>
  );
}
