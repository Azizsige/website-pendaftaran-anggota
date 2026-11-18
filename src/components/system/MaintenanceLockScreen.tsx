"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ArrowLeft, Lock, LogIn, LogOut, Mail, ShieldAlert } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface MaintenanceLockScreenProps {
  context: "public" | "admin";
  message: string;
  userRole?: string;
  showThemeToggle?: boolean;
  orgEmail?: string;
}

export function MaintenanceLockScreen({
  context,
  message,
  userRole,
  showThemeToggle = false,
  orgEmail,
}: MaintenanceLockScreenProps) {
  const isAdminContext = context === "admin";

  return (
    <section
      aria-labelledby="maintenance-lock-heading"
      className="min-h-[calc(100dvh-72px)] bg-[#f7f9fb] dark:bg-[#0d1412] text-[#191c1e] dark:text-[#eef2f4] flex items-center justify-center px-4 py-12 sm:py-16"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#131d1a] border border-[#e2e8f0] dark:border-[#3c4d46] shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-[#d97706] dark:bg-[#f59e0b]" aria-hidden="true" />

        <div className="p-6 sm:p-8 lg:p-10 space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef3c7] dark:bg-[#3b2506] border border-[#f59e0b]/40 text-xs font-semibold text-[#92400e] dark:text-[#fcd34d]">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pemeliharaan Terjadwal</span>
              </span>
              <span className="text-xs font-medium text-[#475569] dark:text-[#cbd6d0] px-2.5 py-1 rounded-full bg-[#f1f5f9] dark:bg-[#1a2723] border border-[#cbd5e1] dark:border-[#3c4d46]">
                {isAdminContext ? "Panel Administrasi" : "Portal Publik"}
              </span>
            </div>

            {showThemeToggle && <ThemeToggle />}
          </div>

          <div className="space-y-3">
            <h1
              id="maintenance-lock-heading"
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a] dark:text-[#eef2f4] leading-snug"
            >
              {isAdminContext
                ? "Akses panel dikunci sementara untuk pemeliharaan"
                : "Sistem sedang dalam pemeliharaan terjadwal"}
            </h1>
            <p className="text-sm sm:text-base text-[#334155] dark:text-[#cbd6d0] leading-relaxed">
              {message}
            </p>
          </div>

          {isAdminContext && (
            <div className="rounded-xl border border-[#f59e0b]/35 bg-[#fef3c7]/60 dark:border-[#f59e0b]/40 dark:bg-[#3b2506]/60 px-4 py-3 flex items-start gap-3 text-xs sm:text-sm text-[#92400e] dark:text-[#fcd34d]">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Pengelola dengan peran{" "}
                <strong className="font-semibold">{userRole || "Admin"}</strong>{" "}
                dikunci sementara selama Owner melakukan pembaruan basis data atau sistem.
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-1">
            {isAdminContext ? (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut({ redirect: false, callbackUrl: "/login" });
                    window.location.assign("/login");
                  }}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#991b1b] hover:bg-[#7f1d1d] dark:bg-[#b91c1c] dark:hover:bg-[#991b1b] text-white font-semibold text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] dark:focus-visible:ring-[#f87171]"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>Keluar Akun</span>
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#f8fafc] dark:bg-[#1a2723] hover:bg-[#f1f5f9] dark:hover:bg-[#22322d] border border-[#85929f] dark:border-[#5f736b] text-[#0f172a] dark:text-[#eef2f4] font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Lihat Halaman Publik</span>
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span>Masuk Khusus Pengelola Utama (Owner)</span>
              </Link>
            )}
          </div>

          {orgEmail && (
            <div className="pt-5 border-t border-[#e2e8f0] dark:border-[#3c4d46] text-xs text-[#475569] dark:text-[#94a89e]">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>
                  Butuh informasi lebih lanjut? Hubungi{" "}
                  <a
                    href={`mailto:${orgEmail}`}
                    className="font-semibold text-[#005236] dark:text-[#6ee7b7] underline"
                  >
                    {orgEmail}
                  </a>
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
