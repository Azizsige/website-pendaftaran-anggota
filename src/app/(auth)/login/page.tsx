"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Minus,
  ShieldCheck,
  X,
} from "lucide-react";

import { fieldClass } from "@/components/ui/form-field";
import { CustomScrollArea } from "@/components/ui/custom-scroll-area";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

const SHOW_DEMO_CREDENTIALS =
  process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS !== "false";

const DEMO_PASSWORD = ["admin", "123"].join("");

type DemoRoleKey = "SUPER_ADMIN" | "COORDINATOR" | "STAFF";

interface DemoAccount {
  role: DemoRoleKey;
  label: string;
  tierLabel: string;
  email: string;
  allowed: string[];
  restricted: string[];
  badgeClass: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "SUPER_ADMIN",
    label: "Super Admin",
    tierLabel: "Pengelola Sistem",
    email: "admin@system.local",
    allowed: [
      "Verifikasi pendaftar, kelola anggota, ekspor CSV & /admin/settings",
      "Tambah dan ubah akun Koordinator serta Staff",
    ],
    restricted: [
      "Tidak dapat mengubah atau menghapus akun Super Admin lain",
    ],
    badgeClass: "bg-[#e6f4ee] text-[#005236] border-[#006c49]/25 dark:bg-[#0a3326] dark:text-[#6ee7b7] dark:border-[#34d399]/35",
  },
  {
    role: "COORDINATOR",
    label: "Koordinator",
    tierLabel: "Verifikator",
    email: "coordinator@system.local",
    allowed: [
      "Review berkas KTM, setujui/tolak pendaftar & bekukan status anggota",
      "Pantau statistik dashboard & ekspor laporan data anggota",
    ],
    restricted: [
      "Tidak bisa hapus data permanen atau membuka /admin/settings",
    ],
    badgeClass: "bg-[#fef3c7] text-[#92400e] border-[#f59e0b]/35 dark:bg-[#3b2506] dark:text-[#fcd34d] dark:border-[#f59e0b]/40",
  },
  {
    role: "STAFF",
    label: "Staff",
    tierLabel: "Baca Saja",
    email: "staff@system.local",
    allowed: [
      "Lihat statistik dashboard, daftar pendaftar, anggota & laporan",
    ],
    restricted: [
      "Tidak bisa verifikasi, ubah status, ekspor CSV, atau buka pengaturan",
    ],
    badgeClass: "bg-[#f1f5f9] text-[#334155] border-[#cbd5e1] dark:bg-[#1e2d28] dark:text-[#cbd6d0] dark:border-[#4b5c55]",
  },
];

const DEFAULT_DEMO_ACCOUNT = SHOW_DEMO_CREDENTIALS ? DEMO_ACCOUNTS[0] : null;

function PermissionItems({
  allowed,
  restricted,
  phrasingOnly = false,
}: {
  allowed: string[];
  restricted: string[];
  phrasingOnly?: boolean;
}) {
  if (phrasingOnly) {
    return (
      <span className="block space-y-1.5 text-xs leading-snug text-[#334155] dark:text-[#cbd6d0]">
        {allowed.map((item) => (
          <span key={item} className="flex items-start gap-2">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#006c49] dark:text-[#34d399]" aria-hidden />
            <span className="min-w-0 flex-1">{item}</span>
          </span>
        ))}
        {restricted.map((item) => (
          <span key={item} className="flex items-start gap-2 text-[#475569] dark:text-[#94a89e]">
            <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#64748b] dark:text-[#94a89e]" aria-hidden />
            <span className="min-w-0 flex-1">{item}</span>
          </span>
        ))}
      </span>
    );
  }

  return (
    <ul className="space-y-1.5 text-xs leading-snug text-[#334155] dark:text-[#cbd6d0]">
      {allowed.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#006c49] dark:text-[#34d399]" aria-hidden />
          <span className="min-w-0 flex-1">{item}</span>
        </li>
      ))}
      {restricted.map((item) => (
        <li key={item} className="flex items-start gap-2 text-[#475569] dark:text-[#94a89e]">
          <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#64748b] dark:text-[#94a89e]" aria-hidden />
          <span className="min-w-0 flex-1">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState(DEFAULT_DEMO_ACCOUNT?.email ?? "");
  const [password, setPassword] = useState(DEFAULT_DEMO_ACCOUNT ? DEMO_PASSWORD : "");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [selectedRole, setSelectedRole] = useState<DemoRoleKey | null>(
    DEFAULT_DEMO_ACCOUNT?.role ?? null
  );
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedEmail = localStorage.getItem("rememberedEmail")?.trim();
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);

        if (SHOW_DEMO_CREDENTIALS) {
          const matchedDemo = DEMO_ACCOUNTS.find(
            (account) => account.email.toLowerCase() === savedEmail.toLowerCase()
          );
          if (matchedDemo) {
            setSelectedRole(matchedDemo.role);
            setPassword(DEMO_PASSWORD);
          } else {
            setSelectedRole(null);
            setPassword("");
          }
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const closeMobileSheet = useCallback((restoreFocusToTrigger = true) => {
    setIsMobileSheetOpen(false);
    if (restoreFocusToTrigger) {
      requestAnimationFrame(() => {
        mobileTriggerRef.current?.focus();
      });
    }
  }, []);

  useEffect(() => {
    if (!isMobileSheetOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const sheet = mobileSheetRef.current;
    const focusable = sheet?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusable?.[0];
    const lastFocusable = focusable?.[focusable.length - 1];
    firstFocusable?.focus();

    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsMobileSheetOpen(false);
      }
    };
    desktopMedia.addEventListener("change", handleViewportChange);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileSheet(true);
        return;
      }

      if (event.key !== "Tab" || !firstFocusable || !lastFocusable) return;

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      desktopMedia.removeEventListener("change", handleViewportChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileSheetOpen, closeMobileSheet]);

  const activeAccount =
    selectedRole ? DEMO_ACCOUNTS.find((account) => account.role === selectedRole) ?? null : null;

  const isSelectedAccountFilled =
    !!activeAccount && email === activeAccount.email && password === DEMO_PASSWORD;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    setIsLoading(true);
    setIsRedirecting(false);
    setIsMobileSheetOpen(false);

    const normalizedEmail = email.trim();
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", normalizedEmail);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    try {
      const res = await signIn("credentials", {
        email: normalizedEmail,
        password,
        rememberMe: rememberMe ? "true" : "false",
        redirect: false,
      });

      if (!res || res.error || !res.ok) {
        if (res?.error === "DATABASE_UNAVAILABLE") {
          setError(
            "Layanan portal sedang dalam pemeliharaan sementara. Memperbarui tampilan..."
          );
          setIsLoading(false);
          router.refresh();
          return;
        }
        if (res?.error === "ACCOUNT_SUSPENDED") {
          setError(
            "Akun Anda sedang dibekukan oleh pengurus. Hubungi sekretariat untuk informasi lebih lanjut."
          );
          setIsLoading(false);
          return;
        }
        if (res?.error === "ACCOUNT_INACTIVE") {
          setError(
            "Akun Anda berstatus tidak aktif. Hubungi admin untuk mengaktifkan kembali."
          );
          setIsLoading(false);
          return;
        }
        setError("Email atau kata sandi tidak sesuai. Silakan periksa kembali.");
        setIsLoading(false);
      } else {
        setIsRedirecting(true);
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Gagal terhubung ke server autentikasi. Silakan coba kembali.");
      setIsLoading(false);
    }
  };

  const handleSelectDemoRole = (account: DemoAccount, closeSheetOnSelect = false) => {
    if (isLoading) return;

    setSelectedRole(account.role);
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setError("");

    if (closeSheetOnSelect) {
      setIsMobileSheetOpen(false);
      requestAnimationFrame(() => {
        submitButtonRef.current?.focus();
      });
    }
  };

  const handleLockedNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLoading) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#f4f6f8] dark:bg-[#0d1412] px-4 py-4 sm:px-6 lg:py-6">
      <main
        className={cn(
          "mx-auto my-auto w-full rounded-2xl border border-[#e2e8f0] bg-white dark:border-[#3c4d46] dark:bg-[#131d1a] shadow-xs",
          SHOW_DEMO_CREDENTIALS
            ? "max-w-[460px] sm:max-w-[520px] lg:grid lg:max-w-[960px] lg:grid-cols-12"
            : "max-w-[460px]"
        )}
      >
        <section
          aria-labelledby="login-heading"
          className={cn(
            "flex min-w-0 flex-col justify-between p-5 sm:p-6",
            SHOW_DEMO_CREDENTIALS && "lg:col-span-7"
          )}
        >
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f1f5f9] dark:border-[#3c4d46] pb-3">
              <Link
                href="/"
                aria-disabled={isLoading || undefined}
                tabIndex={isLoading ? -1 : undefined}
                onClick={handleLockedNavigation}
                className={cn(
                  "-ml-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]",
                  isLoading
                    ? "cursor-not-allowed text-[#64748b] dark:text-[#94a89e] opacity-60"
                    : "text-[#334155] hover:bg-[#f8fafc] hover:text-[#005236] dark:text-[#cbd6d0] dark:hover:bg-[#1a2723] dark:hover:text-[#6ee7b7]"
                )}
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Kembali ke Beranda</span>
              </Link>

              <div className="flex items-center gap-2.5 text-xs font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#006c49] dark:bg-[#057a55] text-white">
                    <ShieldCheck className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="hidden xs:inline sm:inline">Portal Sekretariat</span>
                </div>
                <ThemeToggle />
              </div>
            </div>

            <div>
              <h1
                id="login-heading"
                className="text-xl font-bold tracking-tight text-[#0f172a] dark:text-[#eef2f4] sm:text-2xl"
              >
                Masuk Pengurus &amp; Admin
              </h1>
              <p className="mt-1 text-sm leading-snug text-[#475569] dark:text-[#cbd6d0]">
                Kelola verifikasi berkas KTM, status pendaftar, data anggota, dan KTA Digital.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3.5 py-2.5 text-xs leading-relaxed font-medium text-[#991b1b] dark:border-[#f87171]/35 dark:bg-[#3b1214] dark:text-[#fca5a5]"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              aria-busy={isLoading}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-[13px] font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569] dark:text-[#94a89e]"
                    aria-hidden
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@organisasi.ac.id"
                    className={fieldClass(false, "pl-10")}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-[13px] font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569] dark:text-[#94a89e]"
                    aria-hidden
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className={fieldClass(false, "pl-10 pr-12")}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] dark:text-[#cbd6d0] dark:hover:bg-[#22322d] dark:hover:text-[#eef2f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="remember"
                  className={cn(
                    "flex min-h-[44px] items-center gap-2.5 select-none",
                    isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  )}
                >
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    disabled={isLoading}
                    onChange={(e) => {
                      const nextChecked = e.target.checked;
                      setRememberMe(nextChecked);
                      if (!nextChecked) {
                        localStorage.removeItem("rememberedEmail");
                      }
                    }}
                    className="h-[18px] w-[18px] cursor-pointer rounded border border-[#85929f] bg-white accent-[#006c49] dark:border-[#5f736b] dark:bg-[#1a2723] dark:accent-[#10b981] disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-medium text-[#334155] dark:text-[#cbd6d0]">
                    Ingat saya (tetap masuk 30 hari)
                  </span>
                </label>

                {isSelectedAccountFilled && activeAccount && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#e6f4ee] px-2 py-1 text-[11px] font-semibold text-[#005236] dark:bg-[#0a3326] dark:text-[#6ee7b7]">
                    <Check className="h-3 w-3" aria-hidden />
                    Akun {activeAccount.label} siap masuk
                  </span>
                )}
              </div>

              <button
                ref={submitButtonRef}
                type="submit"
                disabled={isLoading}
                className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#006c49] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    <span>
                      {isRedirecting
                        ? "Mengalihkan ke Dashboard..."
                        : "Memeriksa Kredensial..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Portal</span>
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </>
                )}
              </button>

              {SHOW_DEMO_CREDENTIALS && (
                <button
                  ref={mobileTriggerRef}
                  type="button"
                  disabled={isLoading}
                  aria-haspopup="dialog"
                  aria-expanded={isMobileSheetOpen}
                  aria-controls="mobile-demo-sheet"
                  onClick={() => setIsMobileSheetOpen(true)}
                  className={cn(
                    "flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] disabled:cursor-not-allowed disabled:opacity-55 lg:hidden",
                    isSelectedAccountFilled && activeAccount
                      ? "border-[#006c49]/40 bg-[#e6f4ee] text-[#005236] dark:border-[#34d399]/45 dark:bg-[#0c3528] dark:text-[#6ee7b7]"
                      : "border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] hover:border-[#006c49]/40 dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:border-[#34d399]/60"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <KeyRound
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelectedAccountFilled ? "text-[#005236] dark:text-[#6ee7b7]" : "text-[#006c49] dark:text-[#34d399]"
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 truncate text-xs font-semibold">
                      {isSelectedAccountFilled && activeAccount
                        ? `Akun Uji: ${activeAccount.label}`
                        : "Pilih Akun Uji Portofolio (3 Peran)"}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-[#005236] dark:text-[#34d399]">
                    {isSelectedAccountFilled ? "Ganti" : "Pilih"}
                  </span>
                </button>
              )}
            </form>
          </div>

          <div className="mt-3 border-t border-[#f1f5f9] dark:border-[#3c4d46] pt-2">
            <nav
              aria-label="Tautan layanan publik"
              className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-[#475569] dark:text-[#cbd6d0]"
            >
              <Link
                href="/daftar"
                aria-disabled={isLoading || undefined}
                tabIndex={isLoading ? -1 : undefined}
                onClick={handleLockedNavigation}
                className={cn(
                  "inline-flex min-h-[44px] items-center font-semibold",
                  isLoading
                    ? "cursor-not-allowed text-[#64748b] dark:text-[#94a89e] opacity-55"
                    : "text-[#005236] hover:text-[#006c49] hover:underline dark:text-[#34d399] dark:hover:text-[#6ee7b7]"
                )}
              >
                Formulir Pendaftaran
              </Link>
              <span aria-hidden className="hidden text-[#cbd5e1] dark:text-[#4b5c55] sm:inline">
                |
              </span>
              <Link
                href="/cek-status"
                aria-disabled={isLoading || undefined}
                tabIndex={isLoading ? -1 : undefined}
                onClick={handleLockedNavigation}
                className={cn(
                  "inline-flex min-h-[44px] items-center",
                  isLoading
                    ? "cursor-not-allowed text-[#64748b] dark:text-[#94a89e] opacity-55"
                    : "hover:text-[#0f172a] hover:underline dark:hover:text-[#eef2f4]"
                )}
              >
                Cek Status &amp; Unduh KTA
              </Link>
              <span aria-hidden className="hidden text-[#cbd5e1] dark:text-[#4b5c55] sm:inline">
                |
              </span>
              <Link
                href="/tentang"
                aria-disabled={isLoading || undefined}
                tabIndex={isLoading ? -1 : undefined}
                onClick={handleLockedNavigation}
                className={cn(
                  "inline-flex min-h-[44px] items-center",
                  isLoading
                    ? "cursor-not-allowed text-[#64748b] dark:text-[#94a89e] opacity-55"
                    : "hover:text-[#0f172a] hover:underline dark:hover:text-[#eef2f4]"
                )}
              >
                Tentang Organisasi
              </Link>
            </nav>
          </div>
        </section>

        {SHOW_DEMO_CREDENTIALS && (
          <aside
            aria-labelledby="demo-sandbox-heading"
            className="hidden min-w-0 flex-col justify-between gap-3 rounded-r-2xl border-l border-[#e2e8f0] bg-[#f8fafc] dark:border-[#3c4d46] dark:bg-[#101815] p-6 lg:col-span-5 lg:flex"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#006c49]/15 bg-[#e6f4ee] text-[#005236] dark:border-[#34d399]/30 dark:bg-[#0a3326] dark:text-[#6ee7b7]">
                  <KeyRound className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 id="demo-sandbox-heading" className="text-sm font-bold text-[#0f172a] dark:text-[#eef2f4]">
                    Uji Akses Peran (Portofolio)
                  </h2>
                  <p className="text-xs leading-snug text-[#475569] dark:text-[#cbd6d0]">
                    Klik peran untuk mengisi form secara otomatis &amp; meninjau hak akses.
                  </p>
                </div>
              </div>

              <div
                role="group"
                aria-label="Pilih peran akun demo"
                className="grid grid-cols-2 gap-2"
              >
                {DEMO_ACCOUNTS.map((acc) => {
                  const isSelected = activeAccount?.role === acc.role;
                  const isFilled =
                    isSelected && email === acc.email && password === DEMO_PASSWORD;

                  return (
                    <button
                      key={acc.role}
                      type="button"
                      disabled={isLoading}
                      aria-pressed={isSelected}
                      onClick={() => handleSelectDemoRole(acc)}
                      className={cn(
                        "flex min-h-[44px] cursor-pointer flex-col items-start justify-center rounded-xl border px-3 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] disabled:cursor-not-allowed disabled:opacity-55",
                        acc.role === "SUPER_ADMIN" && "col-span-2",
                        isSelected
                          ? "border-[#006c49] bg-[#e6f4ee] text-[#005236] dark:border-[#34d399] dark:bg-[#0c3528] dark:text-[#6ee7b7]"
                          : "border-[#e2e8f0] bg-white text-[#334155] hover:border-[#006c49]/40 hover:text-[#0f172a] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#cbd6d0] dark:hover:border-[#34d399]/60 dark:hover:text-[#eef2f4]"
                      )}
                    >
                      <span className="flex w-full items-center justify-between gap-1 text-xs font-bold">
                        <span className="truncate">{acc.label}</span>
                        {isFilled && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] leading-tight",
                          isSelected ? "text-[#3c4a42] dark:text-[#cbd6d0]" : "text-[#475569] dark:text-[#94a89e]"
                        )}
                      >
                        {acc.tierLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                aria-live="polite"
                className="flex flex-col gap-2.5 rounded-xl border border-[#e2e8f0] bg-white dark:border-[#3c4d46] dark:bg-[#131d1a] p-3.5"
              >
                {activeAccount ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-semibold",
                          activeAccount.badgeClass
                        )}
                      >
                        {activeAccount.label}
                      </span>
                      <span className="text-[11px] font-medium text-[#475569] dark:text-[#cbd6d0]">
                        Sandi:{" "}
                        <code className="rounded border border-[#e2e8f0] bg-[#f8fafc] px-1.5 py-0.5 font-mono font-semibold text-[#0f172a] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#eef2f4]">
                          {DEMO_PASSWORD}
                        </code>
                      </span>
                    </div>

                    <p className="font-mono text-xs font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                      {activeAccount.email}
                    </p>

                    <div className="border-t border-[#f1f5f9] dark:border-[#3c4d46] pt-2.5">
                      <PermissionItems
                        allowed={activeAccount.allowed}
                        restricted={activeAccount.restricted}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 text-xs text-[#475569] dark:text-[#cbd6d0]">
                    <p className="font-medium text-[#0f172a] dark:text-[#eef2f4]">Belum ada peran dipilih</p>
                    <p className="leading-relaxed">
                      Ketuk salah satu tombol peran di atas untuk langsung mengisi alamat email &amp; kata sandi ke formulir masuk.
                    </p>
                    <p className="border-t border-[#f1f5f9] dark:border-[#3c4d46] pt-2 text-[11px]">
                      Seluruh akun uji memakai sandi{" "}
                      <code className="rounded border border-[#e2e8f0] bg-[#f8fafc] px-1.5 py-0.5 font-mono font-semibold text-[#0f172a] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#eef2f4]">
                        {DEMO_PASSWORD}
                      </code>
                      .
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p
              aria-live="polite"
              className="text-[11px] leading-snug text-[#475569] dark:text-[#94a89e]"
            >
              {isLoading ? (
                "Formulir dan pilihan peran dikunci sementara selama proses masuk berlangsung."
              ) : (
                <>
                  Setelah memilih peran, tekan{" "}
                  <strong className="font-semibold text-[#0f172a] dark:text-[#eef2f4]">Masuk ke Portal</strong> untuk melihat tampilan dashboard sesuai hak akses.
                </>
              )}
            </p>
          </aside>
        )}
      </main>

      {SHOW_DEMO_CREDENTIALS && isMobileSheetOpen && (
        <div
          id="mobile-demo-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-demo-sheet-title"
          className="fixed inset-0 z-50 flex items-end justify-center lg:hidden sm:items-center sm:p-4"
        >
          <div
            aria-hidden
            onClick={() => closeMobileSheet(true)}
            className="fixed inset-0 bg-[#0f172a]/45 dark:bg-black/65"
          />

          <div
            ref={mobileSheetRef}
            className="relative z-10 flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-[#e2e8f0] bg-white dark:border-[#3c4d46] dark:bg-[#131d1a] shadow-lg sm:max-w-[560px] sm:rounded-2xl"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#f1f5f9] dark:border-[#3c4d46] px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <h2
                  id="mobile-demo-sheet-title"
                  className="text-base font-bold text-[#0f172a] dark:text-[#eef2f4]"
                >
                  Pilih Akun Uji (Portofolio)
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-[#475569] dark:text-[#cbd6d0]">
                  Ketuk salah satu peran untuk langsung mengisi form.{" "}
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <span>Sandi:</span>
                    <code className="rounded border border-[#e2e8f0] bg-[#f8fafc] px-1.5 py-0.5 font-mono font-semibold text-[#0f172a] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#eef2f4]">
                      {DEMO_PASSWORD}
                    </code>
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => closeMobileSheet(true)}
                aria-label="Tutup panel akun uji"
                className="-mr-1.5 -mt-1 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] dark:text-[#cbd6d0] dark:hover:bg-[#22322d] dark:hover:text-[#eef2f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <CustomScrollArea
              className="min-h-0 flex-1 overscroll-contain"
              contentClassName="px-4 pt-3.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-5 sm:pb-5"
            >
              <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:items-stretch">
                {DEMO_ACCOUNTS.map((acc) => {
                  const isActiveAndFilled =
                    activeAccount?.role === acc.role &&
                    email === acc.email &&
                    password === DEMO_PASSWORD;

                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleSelectDemoRole(acc, true)}
                      className={cn(
                        "block w-full min-w-0 cursor-pointer rounded-xl border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]",
                        acc.role === "SUPER_ADMIN" && "sm:col-span-2",
                        isActiveAndFilled
                          ? "border-[#006c49] bg-[#f2faf6] dark:border-[#34d399] dark:bg-[#0c3528]"
                          : "border-[#e2e8f0] bg-white hover:border-[#006c49]/40 hover:bg-[#f8fafc] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:hover:border-[#34d399]/60 dark:hover:bg-[#22322d]"
                      )}
                    >
                      <span className="flex w-full items-center justify-between gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                            acc.badgeClass
                          )}
                        >
                          {acc.label}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[11px] font-semibold",
                            isActiveAndFilled ? "text-[#005236] dark:text-[#6ee7b7]" : "text-[#475569] dark:text-[#cbd6d0]"
                          )}
                        >
                          {isActiveAndFilled && <Check className="h-3 w-3" aria-hidden />}
                          <span>{isActiveAndFilled ? "Terisi" : acc.tierLabel}</span>
                        </span>
                      </span>

                      <span className="mt-2 block w-full break-all font-mono text-xs font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                        {acc.email}
                      </span>

                      <span className="mt-2.5 block w-full border-t border-[#f1f5f9] dark:border-[#3c4d46] pt-2.5">
                        <PermissionItems
                          allowed={acc.allowed}
                          restricted={acc.restricted}
                          phrasingOnly
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </CustomScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
