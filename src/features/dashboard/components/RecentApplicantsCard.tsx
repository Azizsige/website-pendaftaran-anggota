"use client";

import Link from "next/link";
import { ArrowRight, RefreshCw, Users } from "lucide-react";
import { LoadingWaveDots } from "@/components/ui/loading-wave-dots";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { CustomScrollArea } from "@/components/ui/custom-scroll-area";
import { formatDate } from "@/lib/format";
import type { MemberProfileWithUser } from "@/types/member";

interface RecentApplicantsCardProps {
  applicants: MemberProfileWithUser[];
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onResetFilter: () => void;
}

function getStatusBadge(status: string): {
  label: string;
  className: string;
} {
  if (status === "ACTIVE" || status === "APPROVED") {
    return {
      label: "Disetujui",
      className: "bg-[#e6f4ee] dark:bg-[#0a3326] text-[#005236] dark:text-[#6ee7b7]",
    };
  }
  if (status === "PENDING") {
    return {
      label: "Menunggu",
      className: "bg-[#fef3c7] dark:bg-[#3b2506] text-[#92400e] dark:text-[#fcd34d]",
    };
  }
  if (status === "REJECTED") {
    return {
      label: "Ditolak",
      className: "bg-[#fef2f2] dark:bg-[#3b1214] text-[#991b1b] dark:text-[#fca5a5]",
    };
  }
  if (status === "SUSPENDED") {
    return {
      label: "Ditangguhkan",
      className: "bg-[#f1f5f9] dark:bg-[#1e2d28] text-[#475569] dark:text-[#cbd6d0]",
    };
  }
  return {
    label: status,
    className: "bg-[#f1f5f9] dark:bg-[#1e2d28] text-[#475569] dark:text-[#cbd6d0]",
  };
}

export default function RecentApplicantsCard({
  applicants,
  isLoading,
  errorMessage,
  onRetry,
  onResetFilter,
}: RecentApplicantsCardProps) {
  return (
    <section className="bg-white dark:bg-[#131d1a] rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46] overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-[#f1f5f9] dark:border-[#3c4d46] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#191c1e] dark:text-[#eef2f4]">
            Pendaftar Terbaru
          </h3>
          <p className="text-xs text-[#52606d] dark:text-[#94a89e] mt-0.5">
            Pengajuan mahasiswa terbaru pada rentang tanggal yang sedang dipilih
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isLoading && (
            <span className="inline-flex items-center gap-2 text-xs font-medium text-[#006c49] dark:text-[#6ee7b7] bg-[#e6f4ee] dark:bg-[#0a3326] px-2.5 py-1 rounded-full">
              <span>Memperbarui</span>
              <LoadingWaveDots size="sm" label="Memperbarui daftar pendaftar" />
            </span>
          )}
          <Link
            href="/admin/pendaftar"
            className="min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold text-[#006c49] dark:text-[#34d399] hover:bg-[#e6f4ee] dark:hover:bg-[#0c3528] inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {errorMessage ? (
        <div className="p-6">
          <div
            role="alert"
            className="rounded-lg border border-[#fecaca] dark:border-[#f87171]/40 bg-[#fef2f2] dark:bg-[#3b1214] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <p className="text-sm font-semibold text-[#991b1b] dark:text-[#fca5a5]">
                Gagal memuat daftar pendaftar terbaru
              </p>
              <p className="text-xs text-[#991b1b]/90 dark:text-[#fecaca] mt-0.5">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="min-h-[44px] px-4 py-2 rounded-lg bg-[#991b1b] dark:bg-[#dc2626] text-white text-sm font-semibold hover:bg-[#7f1d1d] dark:hover:bg-[#b91c1c] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Coba Lagi</span>
            </button>
          </div>
        </div>
      ) : applicants.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="w-11 h-11 rounded-full bg-[#f4f6f8] dark:bg-[#1a2723] text-[#52606d] dark:text-[#94a89e] flex items-center justify-center mx-auto mb-3">
            <Users className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-[#191c1e] dark:text-[#eef2f4]">
            Belum ada pendaftar pada rentang tanggal ini
          </p>
          <p className="text-xs text-[#52606d] dark:text-[#94a89e] mt-1 max-w-md mx-auto">
            Coba perluas rentang tanggal di bagian atas halaman atau lihat
            seluruh antrean calon anggota.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onResetFilter}
              className="min-h-[44px] px-4 py-2 rounded-lg border border-[#cbd5e1] dark:border-[#5f736b] bg-white dark:bg-[#1a2723] hover:bg-[#f8fafc] dark:hover:bg-[#22322d] text-sm font-semibold text-[#191c1e] dark:text-[#eef2f4] transition-colors cursor-pointer"
            >
              Tampilkan 30 Hari Terakhir
            </button>
            <Link
              href="/admin/pendaftar"
              className="min-h-[44px] px-4 py-2 rounded-lg bg-[#006c49] dark:bg-[#057a55] hover:bg-[#005236] dark:hover:bg-[#046c4e] text-white text-sm font-semibold inline-flex items-center transition-colors"
            >
              Buka Daftar Pendaftar
            </Link>
          </div>
        </div>
      ) : (
        <CustomScrollArea
          axis="x"
          className={`transition-opacity duration-150 ${
            isLoading ? "opacity-60" : "opacity-100"
          }`}
        >
          <table className="w-full min-w-[960px] text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] dark:bg-[#1a2723] border-b border-[#e2e8f0] dark:border-[#3c4d46] text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                <th scope="col" className="px-5 sm:px-6 py-3.5 whitespace-nowrap">
                  Mahasiswa
                </th>
                <th scope="col" className="px-4 py-3.5 whitespace-nowrap">
                  NIM
                </th>
                <th scope="col" className="px-4 py-3.5 whitespace-nowrap min-w-[200px]">
                  Fakultas &amp; Prodi
                </th>
                <th scope="col" className="px-4 py-3.5 whitespace-nowrap">
                  Tanggal Daftar
                </th>
                <th scope="col" className="px-4 py-3.5 whitespace-nowrap">
                  Status
                </th>
                <th scope="col" className="px-5 sm:px-6 py-3.5 text-right whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] dark:divide-[#24332d] text-sm">
              {applicants.map((item) => {
                const badge = getStatusBadge(item.status);
                const applicantName = item.user.name?.trim() || "Tanpa Nama";
                const applicantEmail = item.user.email?.trim() || "-";
                const reviewQuery = encodeURIComponent(
                  item.nim || item.user.email || ""
                );
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#f8fafc] dark:hover:bg-[#1a2723] transition-colors"
                  >
                    <td className="px-5 sm:px-6 py-3.5">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <MemberAvatar
                          src={item.photoUrl}
                          name={applicantName}
                          fallbackInitials="CA"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-[#191c1e] dark:text-[#eef2f4] truncate">
                            {applicantName}
                          </p>
                          <p className="text-xs text-[#52606d] dark:text-[#94a89e] truncate">
                            {applicantEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs sm:text-sm font-medium text-[#191c1e] dark:text-[#eef2f4] tabular-nums whitespace-nowrap">
                      {item.nim}
                    </td>
                    <td className="px-4 py-3.5 min-w-[180px]">
                      <p className="text-sm font-medium text-[#191c1e] dark:text-[#eef2f4] truncate">
                        {item.faculty || "Belum diisi"}
                      </p>
                      <p className="text-xs text-[#52606d] dark:text-[#94a89e] truncate">
                        {item.major || "Prodi belum diisi"}
                        {item.batchYear ? ` - Angkatan ${item.batchYear}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#4b5850] dark:text-[#cbd6d0] whitespace-nowrap">
                      {formatDate(item.createdAt, "d MMM yyyy")}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/pendaftar?search=${reviewQuery}`}
                        className="min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold text-[#006c49] dark:text-[#34d399] hover:bg-[#e6f4ee] dark:hover:bg-[#0c3528] inline-flex items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
                      >
                        Tinjau
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CustomScrollArea>
      )}
    </section>
  );
}
