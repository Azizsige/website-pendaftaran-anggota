import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-deep)] border-t border-[var(--border-subtle)]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center font-bold text-white text-sm">
                M
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Member<span className="text-[var(--primary-light)]">Hub</span>
              </span>
            </Link>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
              Portal pendaftaran anggota online yang aman, cepat, dan terpercaya.
              Bergabung bersama kami untuk pengalaman keanggotaan digital terbaik.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary-light)] hover:border-[var(--primary)] transition-all duration-200"
                aria-label="Facebook"
              >
                <Globe size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary-light)] hover:border-[var(--primary)] transition-all duration-200"
                aria-label="Instagram"
              >
                <Globe size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary-light)] hover:border-[var(--primary)] transition-all duration-200"
                aria-label="Twitter"
              >
                <Globe size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Navigasi
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Beranda", href: "/" },
                { label: "Tentang Kami", href: "/tentang" },
                { label: "Pendaftaran", href: "/daftar" },
                { label: "Login", href: "/login" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-secondary)] text-sm hover:text-[var(--primary-light)] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Informasi
            </h4>
            <ul className="space-y-3">
              {[
                "Syarat & Ketentuan",
                "Kebijakan Privasi",
                "FAQ",
                "Panduan Pendaftaran",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-[var(--text-secondary)] text-sm hover:text-[var(--primary-light)] transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Kontak
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin
                  size={16}
                  className="text-[var(--primary)] mt-0.5 shrink-0"
                />
                <span className="text-[var(--text-secondary)] text-sm">
                  Jl. Sudirman No. 45, Jakarta Selatan, 12190
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone
                  size={16}
                  className="text-[var(--primary)] shrink-0"
                />
                <span className="text-[var(--text-secondary)] text-sm">
                  +62 21 1234 5678
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail
                  size={16}
                  className="text-[var(--primary)] shrink-0"
                />
                <span className="text-[var(--text-secondary)] text-sm">
                  info@memberhub.id
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[var(--text-tertiary)] text-xs">
              &copy; {currentYear} MemberHub. All rights reserved.
            </p>
            <p className="text-[var(--text-tertiary)] text-xs">
              Built with ❤️ in Indonesia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
