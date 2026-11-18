import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

interface LandingRequirementsStepsProps {
  reqKtm: boolean;
  reqFoto: boolean;
  isOpen: boolean;
  isPausedDb?: boolean;
}

const STEPS = [
  {
    number: "01",
    title: "Lengkapi Formulir & Berkas",
    description:
      "Isi biodata akademik lintas fakultas beserta unggahan dokumen yang aktif pada periode ini.",
  },
  {
    number: "02",
    title: "Catat Nomor Registrasi Unik",
    description:
      "Setelah formulir tersimpan, sistem memberikan nomor registrasi sebagai kunci pemeriksaan status.",
  },
  {
    number: "03",
    title: "Proses Review Pengurus",
    description:
      "Tim verifikator memeriksa keabsahan NIM, foto KTM, serta ketersediaan kuota penerimaan.",
  },
  {
    number: "04",
    title: "Aktivasi & Unduh KTA Digital",
    description:
      "Pendaftar yang disetujui memperoleh nomor anggota resmi dan akses kartu digital dari Cek Status.",
  },
];

export function LandingRequirementsSteps({
  reqKtm,
  reqFoto,
  isOpen,
  isPausedDb = false,
}: LandingRequirementsStepsProps) {
  const requirements = [
    {
      label: "Nomor Induk Mahasiswa (NIM)",
      detail: "Digunakan untuk mencocokkan status mahasiswa aktif.",
      required: true,
    },
    {
      label: "Email & Nomor WhatsApp",
      detail: "Saluran informasi konfirmasi registrasi dan koordinasi awal.",
      required: true,
    },
    {
      label: "Kartu Tanda Mahasiswa (KTM)",
      detail: reqKtm
        ? "Unggah foto atau scan KTM dalam format JPG, PNG, atau PDF."
        : "Tidak wajib diunggah pada gelombang pendaftaran ini.",
      required: reqKtm,
    },
    {
      label: "Pas Foto Terbaru",
      detail: reqFoto
        ? "Foto formal atau semi-formal berlatar rapi untuk cetakan KTA."
        : "Dapat dilengkapi menyusul apabila diminta verifikator.",
      required: reqFoto,
    },
  ];

  return (
    <section
      id="alur"
      aria-labelledby="alur-heading"
      className="py-16 sm:py-20 bg-white dark:bg-[#131d1a] border-t border-[#5c6b62]/20 dark:border-[#3c4d46]/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left column: documentary registration visual + flat ruled checklist */}
          <div className="lg:col-span-5">
            <figure className="rounded-2xl overflow-hidden border border-[#5c6b62]/25 dark:border-[#3c4d46] bg-[#eef2f0] dark:bg-[#1a2723]">
              <Image
                src="/images/campus-registration.jpg"
                alt="Mahasiswa menyiapkan kartu identitas mahasiswa dan mengisi portal pendaftaran di laptop"
                width={1200}
                height={896}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="w-full aspect-[4/3] object-cover"
              />
              <figcaption className="px-4 py-2.5 bg-[#f7f9fb] dark:bg-[#0d1412] border-t border-[#5c6b62]/20 dark:border-[#3c4d46] text-xs text-[#3c4a42] dark:text-[#cbd6d0]">
                Persiapkan KTM dan pas foto digital sebelum membuka formulir.
              </figcaption>
            </figure>

            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#006c49] dark:text-[#34d399] mb-2">
                Kelengkapan Berkas
              </p>
              <h3 className="font-display text-lg sm:text-xl font-bold text-[#191c1e] dark:text-[#eef2f4] mb-4">
                Persyaratan sebelum mengisi formulir
              </h3>

              <ul className="border-y border-[#5c6b62]/25 dark:border-[#3c4d46] divide-y divide-[#5c6b62]/20 dark:divide-[#3c4d46]">
                {requirements.map((item) => (
                  <li
                    key={item.label}
                    className="py-3.5 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Check
                        className="w-4 h-4 text-[#006c49] dark:text-[#34d399] mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#191c1e] dark:text-[#eef2f4]">
                          {item.label}
                        </p>
                        <p className="text-xs text-[#4b5850] dark:text-[#94a89e] mt-0.5 leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        item.required
                          ? "bg-[#ecfdf5] dark:bg-[#064e3b] border-[#006c49]/30 dark:border-[#34d399]/35 text-[#005236] dark:text-[#6ee7b7]"
                          : "bg-[#f7f9fb] dark:bg-[#1a2723] border-[#5c6b62]/30 dark:border-[#3c4d46] text-[#4b5850] dark:text-[#a8bab0]"
                      }`}
                    >
                      {item.required ? "Wajib" : "Opsional"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column: editorial numbered timeline (replaces card grid) */}
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#006c49] dark:text-[#34d399] mb-2">
              Alur Pendaftaran
            </p>
            <h2
              id="alur-heading"
              className="font-display text-2xl sm:text-3xl font-bold text-[#191c1e] dark:text-[#eef2f4] tracking-tight leading-snug mb-3"
            >
              Empat langkah terstruktur dari pendaftaran hingga pengesahan
            </h2>
            <p className="text-sm sm:text-base text-[#3c4a42] dark:text-[#cbd6d0] leading-relaxed mb-8 max-w-2xl">
              Seluruh tahapan diproses melalui satu portal tanpa pengumpulan
              berkas fisik berulang di sekretariat.
            </p>

            <ol className="relative border-l-2 border-[#5c6b62]/30 dark:border-[#3c4d46] ml-4 sm:ml-5 space-y-7">
              {STEPS.map((step, index) => (
                <li key={step.number} className="relative pl-7 sm:pl-9">
                  <span
                    className={`absolute -left-[19px] top-0 w-9 h-9 rounded-lg flex items-center justify-center font-mono text-xs font-bold border ${
                      index === 0
                        ? "bg-[#006c49] dark:bg-[#057a55] border-[#006c49] dark:border-[#34d399]/50 text-white"
                        : "bg-[#f7f9fb] dark:bg-[#0d1412] border-[#5c6b62]/35 dark:border-[#3c4d46] text-[#005236] dark:text-[#34d399]"
                    }`}
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>

                  <div className="pt-0.5 pb-5 border-b border-[#5c6b62]/15 dark:border-[#3c4d46]/70">
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#191c1e] dark:text-[#eef2f4] mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#3c4a42] dark:text-[#cbd6d0] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
              {isOpen ? (
                <Link
                  href="/daftar"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-lg bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
                >
                  Mulai Isi Formulir
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              ) : isPausedDb ? (
                <a
                  href="#cek-status"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-lg bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
                >
                  Lihat Simulasi Cek Status
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              ) : (
                <Link
                  href="/cek-status"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-lg bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
                >
                  Pantau Status Pengajuan
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              )}

              <Link
                href="/tentang"
                className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-semibold text-[#005236] dark:text-[#34d399] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] rounded-lg"
              >
                Pelajari profil organisasi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
