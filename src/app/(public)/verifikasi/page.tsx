import type { Metadata } from "next";

import { checkDatabaseAvailable } from "@/lib/db-health";
import { getCachedSettingsMap } from "@/lib/settings-cache";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { DatabasePausedScreen } from "@/components/system/DatabasePausedScreen";
import { VerifikasiClient } from "./_components/VerifikasiClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verifikasi KTA Resmi | Portal Keanggotaan",
  description: "Verifikasi keaslian Kartu Tanda Anggota (KTA) organisasi melalui kode QR atau NIM.",
};

export default async function VerifikasiKtaPage(props: {
  searchParams?: Promise<{ nim?: string }>;
}) {
  const dbAvailable = await checkDatabaseAvailable();
  const orgEmail = process.env.NEXT_PUBLIC_ORG_EMAIL?.trim();

  if (!dbAvailable) {
    return <DatabasePausedScreen context="status" orgEmail={orgEmail} />;
  }

  const searchParams = (await props.searchParams) || {};
  const rawNim = typeof searchParams.nim === "string" ? searchParams.nim.trim() : "";

  const settingsMap = await getCachedSettingsMap();
  const orgName =
    settingsMap.get(SETTING_KEYS.KTA_ORG_NAME)?.trim() ||
    settingsMap.get(SETTING_KEYS.ORG_NAME)?.trim() ||
    "Organisasi Mahasiswa";

  return (
    <VerifikasiClient
      key={rawNim}
      initialRawNim={rawNim}
      orgName={orgName}
      orgEmail={orgEmail}
    />
  );
}
