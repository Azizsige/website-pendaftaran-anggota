import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "overlayscrollbars/overlayscrollbars.css";
import "./globals.css";
import { BodyScrollbars } from "@/components/providers/BodyScrollbars";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToasterProvider } from "@/components/providers/ToasterProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

import { SETTING_KEYS } from "@/lib/constants/settings";
import { checkDatabaseAvailable } from "@/lib/db-health";
import { getCachedSettingsMap } from "@/lib/settings-cache";
import { logger } from "@/lib/logger";

export async function generateMetadata(): Promise<Metadata> {
  let favicon = undefined;
  let orgName = "Organisasi Mahasiswa";

  try {
    const dbAvailable = await checkDatabaseAvailable();
    if (dbAvailable) {
      const map = await getCachedSettingsMap();
      const faviconSetting = map.get(SETTING_KEYS.ORG_FAVICON);
      const nameSetting = map.get(SETTING_KEYS.ORG_NAME);

      if (faviconSetting) favicon = faviconSetting;
      if (nameSetting) orgName = nameSetting;
    }
  } catch (error) {
    logger.error("Failed to load metadata settings:", error);
  }

  return {
    title: `${orgName} | Portal Pendaftaran Anggota`,
    description: "Portal pendaftaran anggota organisasi mahasiswa: lengkapi data NIM dan fakultas, unggah KTM, pantau verifikasi, dan unduh KTA digital.",
    keywords: ["pendaftaran anggota", "organisasi mahasiswa", "NIM", "KTM", "KTA digital"],
    authors: [{ name: "Pengurus Organisasi" }],
    icons: favicon ? { icon: favicon } : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} antialiased`}
      data-overlayscrollbars-initialize=""
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className="min-h-screen bg-background text-foreground"
        data-overlayscrollbars-initialize=""
        suppressHydrationWarning
      >
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
        <ThemeProvider>
          <BodyScrollbars />
          <AuthProvider>{children}</AuthProvider>
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
