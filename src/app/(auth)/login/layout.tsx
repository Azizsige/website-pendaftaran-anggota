import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk | Portal Pendaftaran Anggota",
  description: "Masuk ke portal administrasi dan manajemen keanggotaan.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
