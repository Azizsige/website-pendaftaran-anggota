"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function LandingNavbar({ 
  orgName = "MemberHub", 
  orgLogo = "" 
}: { 
  orgName?: string; 
  orgLogo?: string; 
}) {
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
      className={`sticky top-0 z-50 border-b border-[#bbcabf]/10 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
          : "bg-white py-4"
      }`}
    >
      <div className="flex justify-between items-center w-full px-6 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <Link
          href="/"
          className="font-bold text-xl text-[#006c49] flex items-center gap-2"
        >
          {orgLogo ? (
            <img src={orgLogo} alt="Logo" className="h-8 object-contain" />
          ) : (
            <span
              className="material-symbols-outlined text-[#006c49]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              hub
            </span>
          )}
          <span className="truncate max-w-[200px] sm:max-w-none">{orgName}</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/tentang"
            className="text-[#3c4a42] hover:text-[#006c49] transition-colors py-2"
          >
            About
          </Link>
          <Link
            href="/#benefits"
            className="text-[#3c4a42] hover:text-[#006c49] transition-colors py-2"
          >
            Benefits
          </Link>
          <Link
            href="/cek-status"
            className="text-[#3c4a42] hover:text-[#006c49] transition-colors py-2"
          >
            Cek Status
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="text-[#3c4a42] hover:text-[#006c49] transition-colors p-2 rounded-full hover:bg-[#e0e3e5]/50">
            <span className="material-symbols-outlined">search</span>
          </button>
          <div className="hidden md:flex gap-2">
            <Link
              href="/login"
              className="px-4 py-2 rounded-full font-semibold text-sm text-[#006c49] border border-[#006c49] hover:bg-[#006c49]/10 transition-colors active:scale-95"
            >
              Login
            </Link>
            <Link
              href="/daftar"
              className="px-4 py-2 rounded-full font-semibold text-sm bg-[#006c49] text-white hover:bg-[#006c49]/90 transition-colors shadow-sm active:scale-95"
            >
              Register
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden text-[#191c1e] p-2 rounded-lg hover:bg-[#e0e3e5]/50 transition-colors"
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
        <div className="bg-white mx-4 mt-3 p-4 rounded-xl border border-[#bbcabf]/20 shadow-md">
          <div className="flex flex-col gap-1">
            <Link
              href="/tentang"
              className="px-4 py-3 rounded-lg text-sm font-medium text-[#3c4a42] hover:text-[#006c49] hover:bg-[#e0e3e5]/50 transition-all"
            >
              About
            </Link>
            <Link
              href="/#benefits"
              className="px-4 py-3 rounded-lg text-sm font-medium text-[#3c4a42] hover:text-[#006c49] hover:bg-[#e0e3e5]/50 transition-all"
            >
              Benefits
            </Link>
            <Link
              href="/cek-status"
              className="px-4 py-3 rounded-lg text-sm font-medium text-[#3c4a42] hover:text-[#006c49] hover:bg-[#e0e3e5]/50 transition-all"
            >
              Cek Status
            </Link>
            <hr className="border-[#bbcabf]/30 my-2" />
            <Link
              href="/login"
              className="px-4 py-3 rounded-lg text-sm font-medium text-[#3c4a42] hover:text-[#006c49] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/daftar"
              className="px-4 py-3 rounded-full text-sm font-semibold bg-[#006c49] text-white text-center mt-1"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
