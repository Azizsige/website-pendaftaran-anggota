import type { Metadata } from "next";
import { DatabasePausedScreen } from "@/components/system/DatabasePausedScreen";
import { checkDatabaseAvailable } from "@/lib/db-health";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk | Portal Pendaftaran Anggota",
  description: "Masuk ke portal administrasi dan manajemen keanggotaan.",
};

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dbAvailable = await checkDatabaseAvailable();

  if (!dbAvailable) {
    return (
      <DatabasePausedScreen
        context="login"
        showThemeToggle
        orgEmail={process.env.NEXT_PUBLIC_ORG_EMAIL?.trim()}
      />
    );
  }

  return <>{children}</>;
}
