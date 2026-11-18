"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { GraduationCap, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/cek-status", label: "Cek Status" },
  { href: "/tentang", label: "Tentang" },
] as const;

export default function LandingNavbar({
  orgName = "Organisasi Mahasiswa",
  orgLogo = "",
  initialLoggedIn = false,
}: {
  orgName?: string;
  orgLogo?: string;
  initialLoggedIn?: boolean;
}) {
  const { data: session, status } = useSession();
  const isAuthenticated =
    status === "loading" ? initialLoggedIn : Boolean(session?.user?.id);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white transition-shadow duration-150 dark:bg-[#0d1412]/95 dark:backdrop-blur-md ${
        isScrolled
          ? "border-[#5c6b62]/30 shadow-sm dark:border-[#3c4d46] dark:shadow-black/30"
          : "border-[#bbcabf]/50 dark:border-[#3c4d46]/70"
      }`}
    >
      <nav
        aria-label="Navigasi Utama"
        className="flex items-center justify-between gap-3 w-full px-4 sm:px-6 min-h-[68px] max-w-7xl mx-auto"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 min-h-[44px] py-1 text-[#191c1e] dark:text-[#eef2f4] font-display font-bold text-lg tracking-tight rounded-lg min-w-0"
        >
          {orgLogo ? (
            <Image
              src={orgLogo}
              alt={`Logo ${orgName}`}
              width={36}
              height={36}
              className="h-9 w-9 object-contain shrink-0 rounded-md"
              unoptimized
            />
          ) : (
            <span className="w-9 h-9 rounded-lg bg-[#006c49] dark:bg-[#057a55] text-white flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" aria-hidden="true" />
            </span>
          )}
          <span className="truncate max-w-[140px] sm:max-w-[220px] lg:max-w-[260px]">
            {orgName}
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`px-3.5 py-2.5 min-h-[44px] inline-flex items-center rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#e6f4ee] text-[#005236] font-semibold dark:bg-[#0c3528] dark:text-[#6ee7b7]"
                    : "text-[#3c4a42] hover:text-[#191c1e] hover:bg-[#f2f4f6] dark:text-[#cbd6d0] dark:hover:text-[#eef2f4] dark:hover:bg-[#1a2723]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <ThemeToggle />
          {!isAuthenticated && (
            <Link
              href="/login"
              className="px-4 py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-lg font-semibold text-sm text-[#191c1e] border border-[#5c6b62] bg-white hover:bg-[#f2f4f6] dark:text-[#eef2f4] dark:border-[#5f736b] dark:bg-[#1a2723] dark:hover:bg-[#22322d] transition-colors"
            >
              Masuk Admin
            </Link>
          )}
          <Link
            href="/daftar"
            className="px-4 py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-lg font-semibold text-sm bg-[#006c49] text-white hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] transition-colors"
          >
            Daftar Anggota
          </Link>
        </div>

        {/* Mobile Actions & Menu Toggle */}
        <div className="md:hidden flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <button
            ref={toggleButtonRef}
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-nav-menu"
            aria-label={
              isMobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
            }
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg border border-[#5c6b62]/70 bg-white text-[#191c1e] text-sm font-semibold hover:bg-[#f2f4f6] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] transition-colors cursor-pointer"
          >
            {isMobileOpen ? (
              <>
                <X className="w-5 h-5" aria-hidden="true" />
                <span>Tutup</span>
              </>
            ) : (
              <>
                <Menu className="w-5 h-5" aria-hidden="true" />
                <span>Menu</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <div
        id="mobile-nav-menu"
        className={
          isMobileOpen
            ? "md:hidden border-t border-[#bbcabf]/50 bg-white dark:border-[#3c4d46] dark:bg-[#0d1412]"
            : "hidden"
        }
      >
        <div className="px-4 py-4 flex flex-col gap-1.5">
          {NAV_LINKS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setIsMobileOpen(false)}
                className={`px-3.5 py-3 min-h-[44px] rounded-lg text-sm font-medium flex items-center transition-colors ${
                  isActive
                    ? "bg-[#e6f4ee] text-[#005236] font-semibold dark:bg-[#0c3528] dark:text-[#6ee7b7]"
                    : "text-[#3c4a42] hover:text-[#191c1e] hover:bg-[#f2f4f6] dark:text-[#cbd6d0] dark:hover:text-[#eef2f4] dark:hover:bg-[#1a2723]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="pt-3 mt-2 border-t border-[#bbcabf]/40 dark:border-[#3c4d46] flex flex-col gap-2">
            <Link
              href="/daftar"
              onClick={() => setIsMobileOpen(false)}
              className="w-full px-4 py-3 min-h-[44px] rounded-lg text-sm font-semibold bg-[#006c49] text-white text-center hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] transition-colors"
            >
              Daftar Anggota
            </Link>
            {!isAuthenticated && (
              <Link
                href="/login"
                onClick={() => setIsMobileOpen(false)}
                className="w-full px-4 py-3 min-h-[44px] rounded-lg text-sm font-semibold text-[#191c1e] border border-[#5c6b62] bg-white text-center hover:bg-[#f2f4f6] dark:text-[#eef2f4] dark:border-[#5f736b] dark:bg-[#1a2723] dark:hover:bg-[#22322d] transition-colors"
              >
                Masuk Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
