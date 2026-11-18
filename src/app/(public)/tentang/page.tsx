import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  FileCheck2,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { checkDatabaseAvailable } from "@/lib/db-health";
import { getCachedSettingsMap } from "@/lib/settings-cache";
import { DatabaseInfoBanner } from "@/components/system/DatabaseInfoBanner";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tentang Organisasi & Portal Keanggotaan",
  description:
    "Profil organisasi kemahasiswaan, visi dan misi kepengurusan, serta tata kelola pendaftaran anggota baru dan KTA digital.",
};

const MISSIONS = [
  {
    number: "01",
    title: "Rekrutmen Lintas Fakultas yang Terbuka",
    detail:
      "Membuka akses pendaftaran secara merata bagi mahasiswa aktif dari seluruh program studi melalui satu portal resmi.",
  },
  {
    number: "02",
    title: "Verifikasi Administrasi yang Terdokumentasi",
    detail:
      "Meninjau kelengkapan KTM, NIM, serta kecocokan berkas pengajuan secara objektif dengan catatan umpan balik yang jelas.",
  },
  {
    number: "03",
    title: "Penerbitan Identitas Anggota Digital",
    detail:
      "Menghadirkan Kartu Tanda Anggota (KTA) digital otomatis dengan nomor urut unik begitu pengajuan disetujui pengurus.",
  },
  {
    number: "04",
    title: "Koordinasi Program Kerja Berkelanjutan",
    detail:
      "Menjaga basis data keanggotaan tetap rapi dan mutakhir guna mendukung pelaksanaan kaderisasi dan pengabdian kampus.",
  },
];

const GOVERNANCE_PILLARS = [
  {
    title: "Seleksi Lintas Fakultas Terbuka",
    description:
      "Setiap periode penerimaan berjalan sesuai jadwal dan kuota aktif yang ditetapkan secara transparan oleh pengurus.",
    icon: Users,
  },
  {
    title: "Verifikasi KTM & Berkas Online",
    description:
      "Pendaftar tidak perlu menyerahkan salinan fisik berulang karena pemeriksaan KTM dilakukan terpusat di portal.",
    icon: FileCheck2,
  },
  {
    title: "KTA Digital Otomatis",
    description:
      "Anggota yang dinyatakan diterima langsung memiliki KTA digital resmi dengan format nomor dan masa berlaku standar.",
    icon: CreditCard,
  },
  {
    title: "Audit & Kontrol Verifikator",
    description:
      "Riwayat pemeriksaan status, pembekuan, dan pembaruan identitas dicatat oleh pengurus berwenang demi akurasi data.",
    icon: ShieldCheck,
  },
];

const WORK_VALUES = [
  {
    label: "Terbuka",
    description:
      "Kriteria berkas, jadwal periode, dan alur status seleksi dapat dilihat langsung tanpa informasi tertutup.",
  },
  {
    label: "Akuntabel",
    description:
      "Setiap keputusan verifikasi disertai status yang jelas dan tercatat dalam riwayat sistem pengurus.",
  },
  {
    label: "Kolaboratif",
    description:
      "Menghimpun potensi mahasiswa lintas jurusan untuk bergerak bersama dalam program pengembangan kampus.",
  },
  {
    label: "Disiplin",
    description:
      "Mengutamakan ketertiban administrasi dari tahap pengisian NIM hingga penerbitan kartu anggota resmi.",
  },
];

export default async function TentangPage() {
  const dbAvailable = await checkDatabaseAvailable();

  let orgName = "Organisasi Mahasiswa";
  let orgDesc =
    "Wadah kolaborasi mahasiswa lintas program studi yang mengelola pendaftaran anggota baru, kaderisasi, serta administrasi keanggotaan secara digital.";
  let orgLogo = "";
  let activeMemberCount = 0;

  if (dbAvailable) {
    try {
      const [map, memberCount] = await Promise.all([
        getCachedSettingsMap(),
        prisma.memberProfile.count({
          where: { status: { not: "REJECTED" } },
        }),
      ]);

      if (map.get(SETTING_KEYS.ORG_NAME)?.trim()) {
        orgName = map.get(SETTING_KEYS.ORG_NAME)!.trim();
      }
      if (map.get(SETTING_KEYS.ORG_DESCRIPTION)?.trim()) {
        orgDesc = map.get(SETTING_KEYS.ORG_DESCRIPTION)!.trim();
      }
      if (map.get(SETTING_KEYS.ORG_LOGO)?.trim()) {
        orgLogo = map.get(SETTING_KEYS.ORG_LOGO)!.trim();
      }
      activeMemberCount = memberCount;
    } catch (err) {
      logger.error("TENTANG_PAGE_FETCH_ERROR", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <div className="landing-theme bg-[#f7f9fb] dark:bg-[#0d1412] text-[#191c1e] dark:text-[#eef2f4] antialiased">
      {!dbAvailable && <DatabaseInfoBanner />}
      {/* 1. Asymmetric Editorial Hero with Wide Campus Forum Photo */}
      <section
        aria-label="Profil organisasi"
        className="pt-8 sm:pt-12 lg:pt-14 pb-14 sm:pb-20 bg-[#f7f9fb] dark:bg-[#0d1412]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                {orgLogo && (
                  <Image
                    src={orgLogo}
                    alt={`Logo ${orgName}`}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg object-contain bg-white dark:bg-[#131d1a] border border-[#5c6b62]/25 dark:border-[#3c4d46] p-1 shrink-0"
                  />
                )}
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#006c49] dark:text-[#34d399]">
                  Profil Organisasi
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight text-[#191c1e] dark:text-[#eef2f4] leading-[1.14] mb-5">
                Mengenal{" "}
                <span className="text-[#006c49] dark:text-[#34d399]">
                  {orgName}
                </span>
              </h1>

              <p className="text-base text-[#3c4a42] dark:text-[#cbd6d0] leading-relaxed mb-6">
                {orgDesc}
              </p>

              {activeMemberCount > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131d1a] border border-[#5c6b62]/25 dark:border-[#3c4d46] text-xs font-medium text-[#191c1e] dark:text-[#eef2f4] mb-6">
                  <span className="font-mono font-bold text-[#006c49] dark:text-[#34d399]">
                    {activeMemberCount}
                  </span>
                  <span>
                    pendaftar & anggota tercatat pada basis data keanggotaan
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                {dbAvailable ? (
                  <>
                    <Link
                      href="/daftar"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-lg bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
                    >
                      Daftar Jadi Anggota
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/cek-status"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 rounded-lg bg-white dark:bg-[#131d1a] hover:bg-[#eef2f0] dark:hover:bg-[#1a2723] border border-[#5c6b62]/35 dark:border-[#3c4d46] text-[#191c1e] dark:text-[#eef2f4] font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
                    >
                      <Search
                        className="w-4 h-4 text-[#006c49] dark:text-[#34d399]"
                        aria-hidden="true"
                      />
                      Cek Status
                    </Link>
                  </>
                ) : (
                  <>
                    <a
                      href="#visi-misi-heading"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-lg bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
                    >
                      Visi &amp; Misi Organisasi
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </a>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 rounded-lg bg-white dark:bg-[#131d1a] hover:bg-[#eef2f0] dark:hover:bg-[#1a2723] border border-[#5c6b62]/35 dark:border-[#3c4d46] text-[#191c1e] dark:text-[#eef2f4] font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
                    >
                      <ArrowLeft
                        className="w-4 h-4 text-[#006c49] dark:text-[#34d399]"
                        aria-hidden="true"
                      />
                      Beranda
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-7">
              <figure className="rounded-2xl overflow-hidden border border-[#5c6b62]/25 dark:border-[#3c4d46] bg-white dark:bg-[#131d1a] shadow-sm">
                <Image
                  src="/images/campus-forum.jpg"
                  alt="Suasana forum diskusi dan lokakarya kaderisasi mahasiswa di ruang aula kampus"
                  width={1376}
                  height={768}
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 1024px) 100vw, 56vw"
                  className="w-full aspect-[16/9] object-cover object-center"
                />
                <figcaption className="px-4 sm:px-5 py-3 bg-white dark:bg-[#131d1a] border-t border-[#5c6b62]/20 dark:border-[#3c4d46] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#3c4a42] dark:text-[#cbd6d0]">
                  <span>
                    Forum pembahasan program kerja & pembekalan calon anggota
                    lintas jurusan.
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[#005236] dark:text-[#34d399] shrink-0">
                    KADERISASI AKTIF
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Visi & Misi Asymmetric Editorial Spread (no side-by-side cloned boxes) */}
      <section
        aria-labelledby="visi-misi-heading"
        className="py-16 sm:py-20 bg-white dark:bg-[#131d1a] border-t border-[#5c6b62]/20 dark:border-[#3c4d46]/70"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#006c49] dark:text-[#34d399] mb-2">
                Arah Kepengurusan
              </p>
              <h2
                id="visi-misi-heading"
                className="font-display text-2xl sm:text-3xl font-bold text-[#191c1e] dark:text-[#eef2f4] tracking-tight mb-6"
              >
                Visi & Misi Organisasi
              </h2>

              <blockquote className="border-l-4 border-[#006c49] dark:border-[#34d399] pl-5 py-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#4b5850] dark:text-[#94a89e] mb-2">
                  Visi Utama
                </p>
                <p className="font-display text-lg sm:text-xl font-bold text-[#191c1e] dark:text-[#eef2f4] leading-snug">
                  Menjadi organisasi mahasiswa yang inklusif, tertib secara
                  administrasi digital, dan melahirkan kader siap berkontribusi
                  di lingkungan kampus maupun masyarakat.
                </p>
              </blockquote>

              <figure className="mt-8 rounded-2xl overflow-hidden border border-[#5c6b62]/25 dark:border-[#3c4d46] bg-[#f7f9fb] dark:bg-[#0d1412]">
                <Image
                  src="/images/campus-community.jpg"
                  alt="Tiga anggota panitia kemahasiswaan berjalan di koridor kampus sambil membahas rancangan kegiatan"
                  width={1200}
                  height={896}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="w-full aspect-[4/3] object-cover object-top"
                />
                <figcaption className="px-4 py-2.5 text-xs text-[#3c4a42] dark:text-[#cbd6d0] border-t border-[#5c6b62]/20 dark:border-[#3c4d46]">
                  Koordinasi lintas divisi dijalankan langsung di area kampus.
                </figcaption>
              </figure>
            </div>

            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4b5850] dark:text-[#94a89e] mb-4">
                Misi Operasional
              </p>

              <ol className="border-y border-[#5c6b62]/25 dark:border-[#3c4d46] divide-y divide-[#5c6b62]/20 dark:divide-[#3c4d46]">
                {MISSIONS.map((mission) => (
                  <li
                    key={mission.number}
                    className="py-5 sm:py-6 flex items-start gap-4 sm:gap-6"
                  >
                    <span className="font-mono text-sm sm:text-base font-bold text-[#006c49] dark:text-[#34d399] pt-0.5 shrink-0">
                      {mission.number}
                    </span>
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-[#191c1e] dark:text-[#eef2f4] mb-1.5">
                        {mission.title}
                      </h3>
                      <p className="text-sm text-[#3c4a42] dark:text-[#cbd6d0] leading-relaxed">
                        {mission.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Architectural 2x2 Matrix for Organizational Governance */}
      <section
        aria-labelledby="tata-kelola-heading"
        className="py-16 sm:py-20 bg-[#f7f9fb] dark:bg-[#0d1412] border-t border-[#5c6b62]/20 dark:border-[#3c4d46]/70"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#006c49] dark:text-[#34d399] mb-2">
                Tata Kelola Portal
              </p>
              <h2
                id="tata-kelola-heading"
                className="font-display text-2xl sm:text-3xl font-bold text-[#191c1e] dark:text-[#eef2f4] tracking-tight mb-3"
              >
                Standar pengelolaan data keanggotaan
              </h2>
              <p className="text-sm text-[#3c4a42] dark:text-[#cbd6d0] leading-relaxed mb-6">
                Portal digital dirancang untuk memisahkan kewenangan pendaftar
                dan pengurus agar seleksi berlangsung tertib dan dapat diaudit.
              </p>

              <figure className="rounded-xl overflow-hidden border border-[#5c6b62]/25 dark:border-[#3c4d46] bg-white dark:bg-[#131d1a]">
                <Image
                  src="/images/campus-hero.jpg"
                  alt="Tim verifikator dan pengurus mahasiswa melakukan pendataan anggota di sekretariat"
                  width={1200}
                  height={896}
                  sizes="(max-width: 1024px) 100vw, 32vw"
                  className="w-full aspect-[4/3] object-cover object-[50%_35%]"
                />
              </figure>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#5c6b62]/25 dark:bg-[#3c4d46] rounded-2xl overflow-hidden border border-[#5c6b62]/25 dark:border-[#3c4d46]">
                {GOVERNANCE_PILLARS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="bg-white dark:bg-[#131d1a] p-6 sm:p-7"
                    >
                      <div
                        className="w-9 h-9 rounded-lg bg-[#ecfdf5] dark:bg-[#064e3b] border border-[#006c49]/25 dark:border-[#34d399]/30 flex items-center justify-center mb-4"
                        aria-hidden="true"
                      >
                        <Icon className="w-4 h-4 text-[#006c49] dark:text-[#34d399]" />
                      </div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-[#191c1e] dark:text-[#eef2f4] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[#3c4a42] dark:text-[#cbd6d0] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Nilai Kerja (Top-ruled strip) & Closing Navigation */}
      <section
        aria-labelledby="nilai-heading"
        className="py-16 sm:py-20 bg-white dark:bg-[#131d1a] border-t border-[#5c6b62]/20 dark:border-[#3c4d46]/70"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#006c49] dark:text-[#34d399] mb-2">
              Prinsip Kerja
            </p>
            <h2
              id="nilai-heading"
              className="font-display text-2xl sm:text-3xl font-bold text-[#191c1e] dark:text-[#eef2f4] tracking-tight"
            >
              Nilai yang dijaga pengurus & anggota
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {WORK_VALUES.map((val) => (
              <div
                key={val.label}
                className="border-t-2 border-[#006c49]/45 dark:border-[#34d399]/45 pt-4"
              >
                <h3 className="font-display text-base sm:text-lg font-bold text-[#191c1e] dark:text-[#eef2f4] mb-1.5">
                  {val.label}
                </h3>
                <p className="text-sm text-[#3c4a42] dark:text-[#cbd6d0] leading-relaxed">
                  {val.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-2xl bg-[#f7f9fb] dark:bg-[#0d1412] border border-[#5c6b62]/25 dark:border-[#3c4d46] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-[#191c1e] dark:text-[#eef2f4]">
                Siap bergabung bersama {orgName}?
              </h3>
              <p className="text-sm text-[#3c4a42] dark:text-[#cbd6d0] mt-1">
                Ajukan pendaftaran mahasiswa baru secara online atau periksa
                riwayat pendaftaran Anda.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {dbAvailable && (
                <Link
                  href="/daftar"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
                >
                  Daftar Anggota
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              )}
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-white dark:bg-[#131d1a] hover:bg-[#eef2f0] dark:hover:bg-[#1a2723] border border-[#5c6b62]/35 dark:border-[#3c4d46] text-[#191c1e] dark:text-[#eef2f4] font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Beranda
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
