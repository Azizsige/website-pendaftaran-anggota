import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarX2, CheckCircle2, Clock, Info, Search } from "lucide-react";
import { LandingKtaPreview } from "./LandingKtaPreview";
import type { RegistrationWindowStatus } from "./landing-types";

interface LandingHeroProps {
  orgName: string;
  orgDesc: string;
  orgLogo: string;
  ktaOrgName: string;
  memberPrefix: string;
  validityMonths: number;
  showMemberId: boolean;
  showNim: boolean;
  showFaculty: boolean;
  showMajor: boolean;
  reqKtm: boolean;
  regStatus: RegistrationWindowStatus;
  scheduleSummary: string | null;
  maxQuota: number | null;
  remainingQuota: number | null;
  activeMemberCount?: number;
}

const CLOSED_LABELS: Record<Exclude<RegistrationWindowStatus, "OPEN">, string> = {
  CLOSED_TOGGLE: "Pendaftaran Sedang Ditutup",
  CLOSED_BEFORE: "Pendaftaran Belum Dibuka",
  CLOSED_AFTER: "Periode Pendaftaran Berakhir",
  CLOSED_QUOTA: "Kuota Pendaftaran Terpenuhi",
  PAUSED_DB: "Layanan Dalam Pemeliharaan",
};

export function LandingHero({
  orgName,
  orgDesc,
  orgLogo,
  ktaOrgName,
  memberPrefix,
  validityMonths,
  showMemberId,
  showNim,
  showFaculty,
  showMajor,
  reqKtm,
  regStatus,
  scheduleSummary,
  maxQuota,
  remainingQuota,
  activeMemberCount = 0,
}: LandingHeroProps) {
  const isOpen = regStatus === "OPEN";
  const isPausedDb = regStatus === "PAUSED_DB";
  const statusLabel = isOpen
    ? "Pendaftaran Anggota Dibuka"
    : CLOSED_LABELS[regStatus];

  const quotaOrMemberLabel =
    maxQuota !== null && remainingQuota !== null
      ? `${remainingQuota} kursi tersisa (maks. ${maxQuota})`
      : activeMemberCount > 0
        ? `${activeMemberCount} pendaftar & anggota tercatat`
        : "Terbuka lintas fakultas";

  const quotaHeading =
    maxQuota !== null && remainingQuota !== null
      ? "Kuota Periode"
      : activeMemberCount > 0
        ? "Data Portal"
        : "Cakupan";

  return (
    <section
      aria-label="Pengantar pendaftaran anggota"
      className="pt-7 sm:pt-11 lg:pt-14 pb-14 sm:pb-20 bg-[#f7f9fb] dark:bg-[#0d1412]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left column: editorial narrative & action controls */}
          <div className="lg:col-span-6 lg:pt-2">
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${
                  isOpen
                    ? "bg-[#ecfdf5] dark:bg-[#064e3b] border-[#006c49]/30 dark:border-[#34d399]/35 text-[#005236] dark:text-[#6ee7b7]"
                    : isPausedDb
                      ? "bg-[#fffbeb] dark:bg-[#2b1d07] border-[#f59e0b]/40 text-[#92400e] dark:text-[#fcd34d]"
                      : "bg-[#fef2f2] dark:bg-[#451a1a] border-[#ba1a1a]/30 dark:border-[#f87171]/35 text-[#991b1b] dark:text-[#fca5a5]"
                }`}
              >
                {isOpen ? (
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                ) : isPausedDb ? (
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <CalendarX2 className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>{statusLabel}</span>
              </div>

              {scheduleSummary && (
                <span className="text-xs font-medium text-[#4b5850] dark:text-[#a8bab0]">
                  Periode: {scheduleSummary}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-[#191c1e] dark:text-[#eef2f4] leading-[1.12] mb-5">
              Pendaftaran Anggota Baru {orgName}
            </h1>

            <p className="text-base sm:text-lg text-[#3c4a42] dark:text-[#cbd6d0] leading-relaxed mb-7 max-w-xl">
              {orgDesc}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 mb-9">
              {isOpen ? (
                <>
                  <Link
                    href="/daftar"
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-lg bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0d1412]"
                  >
                    Daftar Sekarang
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/cek-status"
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 rounded-lg bg-white dark:bg-[#131d1a] hover:bg-[#eef2f0] dark:hover:bg-[#1a2723] border border-[#5c6b62]/35 dark:border-[#3c4d46] text-[#191c1e] dark:text-[#eef2f4] font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0d1412]"
                  >
                    <Search
                      className="w-4 h-4 text-[#006c49] dark:text-[#34d399]"
                      aria-hidden="true"
                    />
                    Cek Status Pendaftaran
                  </Link>
                </>
              ) : isPausedDb ? (
                <>
                  <Link
                    href="/tentang"
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-lg bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0d1412]"
                  >
                    <Info className="w-4 h-4" aria-hidden="true" />
                    Tentang Organisasi
                  </Link>
                  <a
                    href="#alur"
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 rounded-lg bg-white dark:bg-[#131d1a] hover:bg-[#eef2f0] dark:hover:bg-[#1a2723] border border-[#5c6b62]/35 dark:border-[#3c4d46] text-[#191c1e] dark:text-[#eef2f4] font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
                  >
                    Lihat Alur Pendaftaran
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                </>
              ) : (
                <Link
                  href="/cek-status"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-lg bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0d1412]"
                >
                  <Search className="w-4 h-4" aria-hidden="true" />
                  Cek Status Pendaftaran
                </Link>
              )}

              {!isPausedDb && (
                <Link
                  href="/tentang"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 text-sm font-semibold text-[#005236] dark:text-[#34d399] hover:text-[#191c1e] dark:hover:text-[#eef2f4] transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
                >
                  <Info className="w-4 h-4" aria-hidden="true" />
                  Tentang Organisasi
                </Link>
              )}
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#5c6b62]/25 dark:border-[#3c4d46]">
              <div>
                <dt className="text-xs font-medium text-[#4b5850] dark:text-[#94a89e]">
                  {quotaHeading}
                </dt>
                <dd className="text-sm font-semibold text-[#191c1e] dark:text-[#eef2f4] mt-0.5">
                  {quotaOrMemberLabel}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#4b5850] dark:text-[#94a89e]">
                  Verifikasi Berkas
                </dt>
                <dd className="text-sm font-semibold text-[#191c1e] dark:text-[#eef2f4] mt-0.5">
                  {reqKtm ? "NIM & Foto KTM Wajib" : "Identitas Mahasiswa"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#4b5850] dark:text-[#94a89e]">
                  Identitas Resmi
                </dt>
                <dd className="text-sm font-semibold text-[#191c1e] dark:text-[#eef2f4] mt-0.5">
                  KTA Digital ({validityMonths} bln)
                </dd>
              </div>
            </dl>
          </div>

          {/* Right column: real campus documentary photo + docked KTA digital proof */}
          <div className="lg:col-span-6">
            <figure className="relative rounded-2xl overflow-hidden border border-[#5c6b62]/25 dark:border-[#3c4d46] bg-[#e6ebe8] dark:bg-[#131d1a] shadow-sm">
              <Image
                src="/images/campus-hero.jpg"
                alt="Pengurus dan mahasiswa kampus berdiskusi bersama di meja kerja ruang kegiatan mahasiswa"
                width={1200}
                height={896}
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="w-full aspect-[16/10] object-cover object-[50%_38%]"
              />
              <figcaption className="px-4 py-2.5 bg-white/95 dark:bg-[#131d1a] border-t border-[#5c6b62]/20 dark:border-[#3c4d46] flex items-center justify-between gap-2 text-xs text-[#3c4a42] dark:text-[#cbd6d0]">
                <span>Aktivitas kolaborasi pengurus & anggota di lingkungan kampus</span>
                <span className="font-mono text-[11px] font-semibold text-[#005236] dark:text-[#34d399] shrink-0">
                  {memberPrefix}SERIES
                </span>
              </figcaption>
            </figure>

            <div className="mt-4 lg:mt-5">
              <LandingKtaPreview
                ktaOrgName={ktaOrgName}
                orgLogo={orgLogo}
                memberPrefix={memberPrefix}
                validityMonths={validityMonths}
                showMemberId={showMemberId}
                showNim={showNim}
                showFaculty={showFaculty}
                showMajor={showMajor}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
