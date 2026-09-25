"use client";

import {
  Target,
  Eye,
  Heart,
  Users,
  Award,
  Globe,
  TrendingUp,
} from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Integritas",
    desc: "Menjunjung tinggi kejujuran dan transparansi dalam setiap proses.",
  },
  {
    icon: Users,
    title: "Kebersamaan",
    desc: "Membangun komunitas yang solid dan saling mendukung satu sama lain.",
  },
  {
    icon: Award,
    title: "Profesionalisme",
    desc: "Berkomitmen pada standar tertinggi dalam pelayanan dan pengelolaan.",
  },
  {
    icon: Globe,
    title: "Inklusivitas",
    desc: "Terbuka untuk seluruh masyarakat Indonesia tanpa diskriminasi.",
  },
];

const stats = [
  { value: "2018", label: "Tahun Berdiri" },
  { value: "12,800+", label: "Anggota Aktif" },
  { value: "34", label: "Provinsi" },
  { value: "96%", label: "Tingkat Kepuasan" },
];

export default function TentangPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(15,157,110,0.08)_0%,transparent_50%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 animate-fade-in-up">
            Tentang{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]">
              Kami
            </span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto animate-fade-in-up delay-100">
            MemberHub adalah platform digital yang dibangun untuk mempermudah
            proses pendaftaran, verifikasi, dan pengelolaan keanggotaan secara
            online, transparan, dan efisien.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[var(--bg-base)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="card-glass text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[var(--primary-light)] mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visi Misi */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Visi */}
            <div className="card-glass relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-[0.04] blur-2xl rounded-full" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Eye size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Visi</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Menjadi platform keanggotaan digital terdepan di Indonesia yang
                menghubungkan, memberdayakan, dan melayani seluruh anggota
                dengan standar terbaik.
              </p>
            </div>

            {/* Misi */}
            <div className="card-glass relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-blue)] opacity-[0.04] blur-2xl rounded-full" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Misi</h2>
              <ul className="space-y-3">
                {[
                  "Menyediakan proses pendaftaran yang mudah, cepat, dan transparan.",
                  "Memastikan keamanan data anggota dengan teknologi terkini.",
                  "Membangun ekosistem digital yang mendukung pertumbuhan anggota.",
                  "Memberikan pelayanan administrasi yang efisien dan responsif.",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-[var(--text-secondary)]"
                  >
                    <TrendingUp
                      size={16}
                      className="text-[var(--accent-blue)] mt-1 shrink-0"
                    />
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[var(--bg-base)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Nilai-Nilai{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)]">
                Kami
              </span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Prinsip yang kami pegang teguh dalam setiap langkah.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val) => {
              const Icon = val.icon;
              return (
                <div
                  key={val.title}
                  className="card-glass text-center group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={22} className="text-[var(--accent-blue)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {val.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
