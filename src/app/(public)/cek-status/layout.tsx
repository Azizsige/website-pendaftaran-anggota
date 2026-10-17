import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cek Status | Komunitas Profesional",
  description: "Cek status pendaftaran keanggotaan Anda di sini.",
};

export default function CekStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
