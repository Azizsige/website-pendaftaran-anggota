import Link from "next/link";
import Image from "next/image";
import { AtSign, GraduationCap, Mail, MapPin, Phone } from "lucide-react";

interface LandingFooterProps {
  orgName?: string;
  orgLogo?: string;
  orgAddress?: string;
  orgEmail?: string;
  orgWhatsapp?: string;
  orgInstagram?: string;
}

const PORTAL_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/daftar", label: "Formulir Pendaftaran" },
  { href: "/cek-status", label: "Cek Status & Unduh KTA" },
  { href: "/tentang", label: "Tentang Organisasi" },
  { href: "/login", label: "Masuk Pengurus" },
] as const;

export default function LandingFooter({
  orgName = "Organisasi Mahasiswa",
  orgLogo = "",
  orgAddress = "",
  orgEmail = "",
  orgWhatsapp = "",
  orgInstagram = "",
}: LandingFooterProps) {
  const year = new Date().getFullYear();
  const displayWhatsapp = orgWhatsapp.replace(/^(\+?62|0)+/, "").trim();
  const whatsappDigits = orgWhatsapp.replace(/\D/g, "").replace(/^(62|0)+/, "");
  const cleanInstagram = orgInstagram.replace(/^@/, "").trim();
  const hasContactInfo = Boolean(orgEmail || whatsappDigits || cleanInstagram);

  return (
    <footer className="bg-[#191c1e] dark:bg-[#09100e] text-[#f7f9fb] border-t border-white/10 dark:border-[#3c4d46]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8 md:pt-12 md:pb-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Identitas Organisasi */}
        <div className="md:col-span-5 lg:col-span-6 flex flex-col gap-3.5 min-w-0">
          <div className="flex items-center gap-3">
            {orgLogo ? (
              <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                <Image
                  src={orgLogo}
                  alt=""
                  aria-hidden="true"
                  width={32}
                  height={32}
                  className="h-7 w-7 object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <span className="w-9 h-9 rounded-lg bg-[#006c49] text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" aria-hidden="true" />
              </span>
            )}
            <span className="font-display text-lg font-bold tracking-tight text-white">
              {orgName}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-[#cbd5e1] max-w-[46ch]">
            Portal pendaftaran anggota resmi, verifikasi berkas mahasiswa berbasis
            NIM dan KTM, serta penerbitan Kartu Tanda Anggota (KTA) digital.
          </p>

          {orgAddress && (
            <address className="not-italic text-sm leading-relaxed text-[#e2e8f0] flex items-start gap-2.5 pt-1 max-w-[46ch]">
              <MapPin
                className="w-4 h-4 mt-1 text-[#6ffbbe] shrink-0"
                aria-hidden="true"
              />
              <span>{orgAddress}</span>
            </address>
          )}
        </div>

        {/* Layanan Portal */}
        <div className="md:col-span-3 lg:col-span-3 flex flex-col gap-2 min-w-0">
          <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-[#cbd5e1]">
            Layanan Portal
          </h2>
          <ul className="flex flex-col text-sm">
            {PORTAL_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex items-center min-h-[44px] py-1.5 text-[#e2e8f0] hover:text-white hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Kontak Sekretariat */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-2 min-w-0">
          <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-[#cbd5e1]">
            Kontak Sekretariat
          </h2>
          {hasContactInfo ? (
            <ul className="flex flex-col text-sm">
              {orgEmail && (
                <li>
                  <a
                    href={`mailto:${orgEmail}`}
                    className="inline-flex items-center gap-2.5 min-h-[44px] py-1.5 text-[#e2e8f0] hover:text-white hover:underline transition-colors break-all"
                  >
                    <Mail
                      className="w-4 h-4 text-[#6ffbbe] shrink-0"
                      aria-hidden="true"
                    />
                    <span>{orgEmail}</span>
                  </a>
                </li>
              )}
              {whatsappDigits && (
                <li>
                  <a
                    href={`https://wa.me/62${whatsappDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 min-h-[44px] py-1.5 text-[#e2e8f0] hover:text-white hover:underline transition-colors tabular-nums"
                  >
                    <Phone
                      className="w-4 h-4 text-[#6ffbbe] shrink-0"
                      aria-hidden="true"
                    />
                    <span>+62 {displayWhatsapp || whatsappDigits}</span>
                  </a>
                </li>
              )}
              {cleanInstagram && (
                <li>
                  <a
                    href={`https://instagram.com/${cleanInstagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 min-h-[44px] py-1.5 text-[#e2e8f0] hover:text-white hover:underline transition-colors"
                  >
                    <AtSign
                      className="w-4 h-4 text-[#6ffbbe] shrink-0"
                      aria-hidden="true"
                    />
                    <span>@{cleanInstagram}</span>
                  </a>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-[#cbd5e1] leading-relaxed pt-1">
              Pantau perkembangan pendaftaran Anda melalui halaman{" "}
              <Link
                href="/cek-status"
                className="text-white underline hover:text-[#6ffbbe]"
              >
                Cek Status
              </Link>
              .
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-[#cbd5e1]">
          <p>
            &copy; {year} {orgName}. Seluruh hak cipta dilindungi.
          </p>
          <p>Sistem Pendaftaran Anggota &amp; KTA Digital</p>
        </div>
      </div>
    </footer>
  );
}
