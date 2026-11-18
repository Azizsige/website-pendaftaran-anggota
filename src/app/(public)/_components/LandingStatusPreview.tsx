import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck2,
  Search,
  XCircle,
} from "lucide-react";

interface LandingStatusPreviewProps {
  activeMemberCount?: number;
  isPausedDb?: boolean;
}

const STATUS_EXAMPLES = [
  {
    code: "PENDING",
    label: "Menunggu Review",
    description: "Berkas diterima dan masuk antrean verifikasi pengurus.",
    icon: Clock,
    badgeClass:
      "bg-[#fef3c7] dark:bg-[#452e0d] text-[#92400e] dark:text-[#fcd34d] border-[#f59e0b]/40",
    iconClass: "text-[#b45309] dark:text-[#fbbf24]",
  },
  {
    code: "DISETUJUI",
    label: "Aktif & Terverifikasi",
    description: "Nomor anggota resmi terbit beserta tombol unduh KTA digital.",
    icon: CheckCircle2,
    badgeClass:
      "bg-[#ecfdf5] dark:bg-[#064e3b] text-[#005236] dark:text-[#6ee7b7] border-[#006c49]/35 dark:border-[#34d399]/35",
    iconClass: "text-[#006c49] dark:text-[#34d399]",
  },
  {
    code: "DITOLAK",
    label: "Perlu Perbaikan",
    description: "Menampilkan catatan alasan peninjauan dari tim verifikator.",
    icon: XCircle,
    badgeClass:
      "bg-[#fef2f2] dark:bg-[#451a1a] text-[#991b1b] dark:text-[#fca5a5] border-[#ba1a1a]/30 dark:border-[#f87171]/35",
    iconClass: "text-[#ba1a1a] dark:text-[#f87171]",
  },
];

const CAPABILITIES = [
  {
    title: "Pencocokan NIM & Nomor Registrasi",
    description:
      "Cukup masukkan NIM dan kode registrasi untuk memantau status tanpa perlu membuat kata sandi tambahan.",
    icon: Search,
  },
  {
    title: "Transparansi Catatan Verifikator",
    description:
      "Jika berkas belum sesuai ketentuan, alasan penolakan atau perbaikan tampil langsung pada hasil pemeriksaan.",
    icon: FileCheck2,
  },
  {
    title: "Akses Kartu Tanda Anggota Instan",
    description:
      "Pendaftar berstatus aktif langsung mendapatkan KTA digital lengkap dengan detail masa berlaku organisasi.",
    icon: CreditCard,
  },
];

export function LandingStatusPreview({
  activeMemberCount = 0,
  isPausedDb = false,
}: LandingStatusPreviewProps) {
  return (
    <section
      id="cek-status"
      aria-labelledby="status-heading"
      className="py-16 sm:py-20 bg-[#f7f9fb] dark:bg-[#0d1412] border-t border-[#5c6b62]/20 dark:border-[#3c4d46]/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: Concrete lookup window preview */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-white dark:bg-[#131d1a] border border-[#5c6b62]/25 dark:border-[#3c4d46] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-[#f7f9fb] dark:bg-[#1a2723] border-b border-[#5c6b62]/20 dark:border-[#3c4d46] flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-[#3c4a42] dark:text-[#cbd6d0] truncate">
                  portal/cek-status
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ecfdf5] dark:bg-[#064e3b] text-[#005236] dark:text-[#6ee7b7] border border-[#006c49]/30 dark:border-[#34d399]/30 shrink-0">
                  Akses Mandiri
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[#f7f9fb] dark:bg-[#0d1412] border border-[#5c6b62]/25 dark:border-[#3c4d46] px-3.5 py-2.5">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#4b5850] dark:text-[#94a89e]">
                      Input NIM
                    </span>
                    <span className="block font-mono text-sm font-medium text-[#191c1e] dark:text-[#eef2f4] mt-0.5">
                      2401102048
                    </span>
                  </div>
                  <div className="rounded-lg bg-[#f7f9fb] dark:bg-[#0d1412] border border-[#5c6b62]/25 dark:border-[#3c4d46] px-3.5 py-2.5">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#4b5850] dark:text-[#94a89e]">
                      Kode Registrasi
                    </span>
                    <span className="block font-mono text-sm font-medium text-[#191c1e] dark:text-[#eef2f4] mt-0.5">
                      REG-2026-0042
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#4b5850] dark:text-[#94a89e] mb-2.5">
                    Kemungkinan Status Verifikasi
                  </p>
                  <ul className="divide-y divide-[#5c6b62]/20 dark:divide-[#3c4d46] border-y border-[#5c6b62]/20 dark:border-[#3c4d46]">
                    {STATUS_EXAMPLES.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li
                          key={item.code}
                          className="py-3 flex items-start gap-3"
                        >
                          <Icon
                            className={`w-4 h-4 mt-0.5 shrink-0 ${item.iconClass}`}
                            aria-hidden="true"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-[#191c1e] dark:text-[#eef2f4]">
                                {item.label}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${item.badgeClass}`}
                              >
                                {item.code}
                              </span>
                            </div>
                            <p className="text-xs text-[#4b5850] dark:text-[#94a89e] mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Explanation + inline divided specification list */}
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#006c49] dark:text-[#34d399] mb-2">
              Pantau Pengajuan
            </p>
            <h2
              id="status-heading"
              className="font-display text-2xl sm:text-3xl font-bold text-[#191c1e] dark:text-[#eef2f4] tracking-tight leading-snug mb-3"
            >
              Lacak perkembangan verifikasi secara langsung kapan saja
            </h2>
            <p className="text-sm sm:text-base text-[#3c4a42] dark:text-[#cbd6d0] leading-relaxed mb-6">
              Setiap tahap pemeriksaan tercatat rapi sehingga calon anggota
              mengetahui status seleksi maupun jadwal terbit KTA digitalnya.
            </p>

            {activeMemberCount > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131d1a] border border-[#5c6b62]/25 dark:border-[#3c4d46] text-xs font-medium text-[#191c1e] dark:text-[#eef2f4] mb-6">
                <span className="font-mono font-bold text-[#006c49] dark:text-[#34d399]">
                  {activeMemberCount}
                </span>
                <span>pendaftar & anggota tercatat pada portal saat ini</span>
              </div>
            )}

            <ul className="divide-y divide-[#5c6b62]/20 dark:divide-[#3c4d46] border-y border-[#5c6b62]/20 dark:border-[#3c4d46] mb-7">
              {CAPABILITIES.map((cap) => {
                const Icon = cap.icon;
                return (
                  <li key={cap.title} className="py-3.5 flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg bg-[#ecfdf5] dark:bg-[#064e3b] border border-[#006c49]/25 dark:border-[#34d399]/30 flex items-center justify-center shrink-0 mt-0.5"
                      aria-hidden="true"
                    >
                      <Icon className="w-4 h-4 text-[#006c49] dark:text-[#34d399]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#191c1e] dark:text-[#eef2f4]">
                        {cap.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4b5850] dark:text-[#94a89e] mt-0.5 leading-relaxed">
                        {cap.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {isPausedDb ? (
              <p className="inline-flex items-center px-3.5 py-2.5 rounded-lg bg-[#fffbeb] dark:bg-[#2b1d07] border border-[#f59e0b]/40 text-xs font-medium text-[#78350f] dark:text-[#fde68a]">
                Layanan pemeriksaan status langsung belum tersedia selama masa pemeliharaan berlangsung.
              </p>
            ) : (
              <Link
                href="/cek-status"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-white dark:bg-[#131d1a] hover:bg-[#eef2f0] dark:hover:bg-[#1a2723] border border-[#5c6b62]/35 dark:border-[#3c4d46] text-[#191c1e] dark:text-[#eef2f4] font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
              >
                Buka Halaman Cek Status
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
