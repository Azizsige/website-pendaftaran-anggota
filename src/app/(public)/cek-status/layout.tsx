import React from "react";
import type { Metadata } from "next";
import { DatabasePausedScreen } from "@/components/system/DatabasePausedScreen";
import { checkDatabaseAvailable } from "@/lib/db-health";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cek Status Pendaftaran | Organisasi Mahasiswa",
  description:
    "Cek status verifikasi pendaftaran dan unduh Kartu Tanda Anggota (KTA) digital Anda.",
};

export default async function CekStatusLayout({
  children,
}: {
  children: React.ReactNode;
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

  return <>{children}</>;
}
