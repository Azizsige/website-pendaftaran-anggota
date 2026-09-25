import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  let favicon = undefined;
  let orgName = "Portal Pendaftaran Anggota";

  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['org_favicon', 'org_name'] } }
    });
    const faviconSetting = settings.find(s => s.key === 'org_favicon');
    const nameSetting = settings.find(s => s.key === 'org_name');
    
    if (faviconSetting?.value) favicon = faviconSetting.value;
    if (nameSetting?.value) orgName = nameSetting.value;
  } catch (error) {
    console.error("Failed to load metadata settings:", error);
  }

  return {
    title: `${orgName} | Bergabung Bersama Kami`,
    description: "Portal pendaftaran anggota online — Daftar, verifikasi, dan kelola keanggotaan Anda secara mudah dan cepat.",
    keywords: ["pendaftaran anggota", "registrasi member", "keanggotaan", "KTA digital"],
    authors: [{ name: "Admin Portal" }],
    icons: favicon ? { icon: favicon } : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
