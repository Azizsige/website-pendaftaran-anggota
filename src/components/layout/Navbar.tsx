"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Tentang", href: "/tentang" },
  { label: "Pendaftaran", href: "/daftar" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-navbar shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center font-bold text-white text-sm transition-transform group-hover:scale-105">
              M
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Member<span className="text-[var(--primary-light)]">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[var(--primary-light)] bg-[rgba(15,157,110,0.1)]"
                      : "text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="btn-ghost text-sm"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="btn-primary text-sm !py-2.5 !px-5"
            >
              Daftar Sekarang
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="glass-strong mx-4 mt-3 p-4 rounded-xl">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-[var(--primary-light)] bg-[rgba(15,157,110,0.1)]"
                      : "text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <hr className="border-[var(--border-subtle)] my-2" />
            <Link
              href="/login"
              className="px-4 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="btn-primary text-sm text-center !py-3 mt-1"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
