import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Info, Search } from "lucide-react";
import type { RegistrationWindowStatus } from "./landing-types";

interface LandingCtaProps {
  orgName: string;
  regStatus: RegistrationWindowStatus;
  remainingQuota: number | null;
  maxQuota: number | null;
  scheduleSummary: string | null;
}

export function LandingCta({
  orgName,
  regStatus,
  remainingQuota,
  maxQuota,
  scheduleSummary,
}: LandingCtaProps) {
  const isOpen = regStatus === "OPEN";
  const isPausedDb = regStatus === "PAUSED_DB";

  let heading = `Daftar sebagai anggota ${orgName}`;
  let subtext =
    "Siapkan NIM, data akademik aktif, serta foto KTM Anda untuk menyelesaikan pengajuan secara online.";

  if (regStatus === "PAUSED_DB") {
    heading = `Layanan pengajuan ${orgName} sedang dalam pemeliharaan`;
    subtext =
      "Tampilan profil dan panduan organisasi tetap dapat ditelusuri. Formulir pendaftaran dan cek status akan kembali tersedia setelah pemeliharaan selesai.";
  } else if (regStatus === "CLOSED_TOGGLE") {
    heading = `Pendaftaran ${orgName} sedang ditutup sementara`;
    subtext =
      "Pendaftar sebelumnya tetap dapat memantau proses verifikasi atau mengunduh KTA digital melalui halaman Cek Status.";
  } else if (regStatus === "CLOSED_QUOTA") {
    heading = `Kuota penerimaan periode ini sudah terpenuhi`;
    subtext = `Seluruh ${maxQuota ?? ""} slot penerimaan telah terisi. Pantau status pendaftaran Anda secara berkala di Cek Status.`;
  } else if (regStatus === "CLOSED_BEFORE") {
    heading = `Jadwal pendaftaran ${orgName} belum dimulai`;
    subtext = scheduleSummary
      ? `Jadwal penerimaan tercatat untuk ${scheduleSummary}. Sambil menunggu, Anda tetap dapat membaca profil organisasi.`
      : "Pembukaan pendaftaran belum dimulai. Sambil menunggu, Anda dapat mempelajari profil organisasi terlebih dahulu.";
  } else if (regStatus === "CLOSED_AFTER") {
    heading = `Periode pendaftaran ${orgName} telah berakhir`;
    subtext =
      "Masa pengisian formulir telah selesai. Calon anggota yang telah mendaftar tetap dapat memeriksa hasil seleksi di Cek Status.";
  } else if (remainingQuota !== null && maxQuota !== null) {
    subtext = `Masih tersedia ${remainingQuota} dari ${maxQuota} kursi penerimaan untuk periode berjalan. Lengkapi berkas sebelum jadwal berakhir.`;
  }

  return (
    <section
      aria-labelledby="cta-heading"
      className="py-14 sm:py-20 bg-[#f7f9fb] dark:bg-[#0d1412]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#006c49] dark:bg-[#064e3b] border border-[#005236] dark:border-[#059669]/40 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a7f3d0] mb-2">
                Langkah Berikutnya
              </p>
              <h2
                id="cta-heading"
                className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug mb-3"
              >
                {heading}
              </h2>
              <p className="text-sm sm:text-base text-emerald-50/95 leading-relaxed mb-7 max-w-2xl">
                {subtext}
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                {isOpen ? (
                  <>
                    <Link
                      href="/daftar"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-lg bg-white hover:bg-[#ecfdf5] text-[#005236] font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#006c49]"
                    >
                      Buka Formulir Pendaftaran
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/cek-status"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 rounded-lg border border-white/80 hover:bg-[#005236] dark:hover:bg-[#053b29] text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <Search className="w-4 h-4" aria-hidden="true" />
                      Cek Status
                    </Link>
                  </>
                ) : isPausedDb ? (
                  <>
                    <Link
                      href="/tentang"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-lg bg-white hover:bg-[#ecfdf5] text-[#005236] font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#006c49]"
                    >
                      <Info className="w-4 h-4" aria-hidden="true" />
                      Pelajari Profil Organisasi
                    </Link>
                    <a
                      href="#alur"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 rounded-lg border border-white/80 hover:bg-[#005236] dark:hover:bg-[#053b29] text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      Lihat Alur Pendaftaran
                    </a>
                  </>
                ) : (
                  <>
                    <Link
                      href="/cek-status"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-lg bg-white hover:bg-[#ecfdf5] text-[#005236] font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#006c49]"
                    >
                      <Search className="w-4 h-4" aria-hidden="true" />
                      Periksa Status Pendaftaran
                    </Link>
                    <Link
                      href="/tentang"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 rounded-lg border border-white/80 hover:bg-[#005236] dark:hover:bg-[#053b29] text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <Info className="w-4 h-4" aria-hidden="true" />
                      Tentang Organisasi
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 lg:pl-2">
              <figure className="rounded-xl overflow-hidden border border-white/25 bg-[#053b29]">
                <Image
                  src="/images/campus-community.jpg"
                  alt="Tiga pengurus organisasi mahasiswa berjalan bersama di koridor kampus sambil membahas kegiatan"
                  width={1200}
                  height={896}
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  className="w-full aspect-[4/3] object-cover object-top"
                />
                <figcaption className="px-4 py-2.5 text-xs text-emerald-50 border-t border-white/20">
                  Jejaring kegiatan mahasiswa lintas fakultas & program studi.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
