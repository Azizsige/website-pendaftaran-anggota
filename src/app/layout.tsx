import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import { prisma } from "@/lib/prisma";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { logger } from "@/lib/logger";

export async function generateMetadata(): Promise<Metadata> {
  let favicon = undefined;
  let orgName = "Portal Pendaftaran Anggota";

  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: [SETTING_KEYS.ORG_FAVICON, SETTING_KEYS.ORG_NAME] } }
    });
    const faviconSetting = settings.find(s => s.key === SETTING_KEYS.ORG_FAVICON);
    const nameSetting = settings.find(s => s.key === SETTING_KEYS.ORG_NAME);
    
    if (faviconSetting?.value) favicon = faviconSetting.value;
    if (nameSetting?.value) orgName = nameSetting.value;
  } catch (error) {
    logger.error("Failed to load metadata settings:", error);
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
      <body className="min-h-screen bg-background text-foreground" suppressHydrationWarning>
        <NextTopLoader
          color="#006c49"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #006c49,0 0 5px #006c49"
          zIndex={99999}
        />
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
