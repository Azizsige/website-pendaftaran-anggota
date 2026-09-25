"use client";

import Link from "next/link";
import {
  User,
  CreditCard,
  Settings,
  Download,
  CheckCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function MemberDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Beranda Dashboard
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Selamat datang kembali di portal keanggotaan Anda.
        </p>
      </div>

      {/* Welcome + Status Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="md:col-span-2 card-glass relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--primary)] opacity-[0.06] blur-3xl rounded-full" />
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Selamat Datang, Andi! 👋
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Keanggotaan Anda aktif. Akses profil, unduh KTA, atau perbarui
              data Anda melalui menu di samping.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/member/profil"
                className="btn-ghost inline-flex items-center gap-2 !bg-[var(--bg-surface)] !border !border-[var(--border-default)] !rounded-xl !text-white"
              >
                <User size={16} />
                Edit Profil
              </Link>
              <Link
                href="/member/kta"
                className="btn-primary inline-flex items-center gap-2 !py-2 !px-4 !text-sm"
              >
                <Download size={16} />
                Unduh KTA
              </Link>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="card-glass text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(34,197,94,0.05)] to-transparent" />
          <div className="relative z-10">
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Status Keanggotaan
            </p>
            <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.15)] border-2 border-[rgba(34,197,94,0.3)] flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={28} className="text-[var(--success)]" />
            </div>
            <p className="text-lg font-bold text-[var(--success)] mb-1">
              AKTIF
            </p>
            <div className="flex items-center justify-center gap-1 text-xs text-[var(--text-tertiary)]">
              <Calendar size={12} />
              Berlaku hingga: 12 Des 2027
            </div>
          </div>
        </div>
      </div>

      {/* Info Summary */}
      <div className="card-glass">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User size={18} className="text-[var(--primary-light)]" />
          Informasi Dasar
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: User, label: "Nama Lengkap", value: "Andi Pratama" },
            { icon: CreditCard, label: "NIK", value: "3275012345678901" },
            { icon: Mail, label: "Email", value: "andipratama@email.com" },
            { icon: Phone, label: "No. Telepon", value: "+62 812 3456 7890" },
            { icon: MapPin, label: "Alamat", value: "Jl. Sudirman No. 45, Jakarta Selatan" },
            { icon: Calendar, label: "Tanggal Bergabung", value: "15 Januari 2024" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
              >
                <Icon
                  size={16}
                  className="text-[var(--text-tertiary)] mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {item.label}
                  </p>
                  <p className="text-sm text-white font-medium">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            icon: User,
            title: "Edit Profil",
            desc: "Perbarui data diri Anda",
            href: "/member/profil",
            gradient: "from-[var(--accent-blue)] to-[var(--accent-purple)]",
          },
          {
            icon: CreditCard,
            title: "Kartu Anggota",
            desc: "Lihat & unduh KTA digital",
            href: "/member/kta",
            gradient: "from-[var(--primary)] to-[var(--primary-light)]",
          },
          {
            icon: Settings,
            title: "Pengaturan",
            desc: "Ubah password & preferensi",
            href: "/member/pengaturan",
            gradient: "from-[var(--warning)] to-[#fb923c]",
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="card-glass group cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <Icon size={18} className="text-white" />
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">
                {action.title}
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">
                {action.desc}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
