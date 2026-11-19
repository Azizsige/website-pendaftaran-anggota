import React from "react";
import Image from "next/image";
import { BadgeCheck, Phone, User } from "lucide-react";

import { normalizeIndonesianPhone } from "@/lib/format";
import type { Applicant } from "../../types";
import { formatId } from "../../utils";

interface ApplicantInfoCardProps {
  applicant: Applicant;
}

export function ApplicantInfoCard({ applicant }: ApplicantInfoCardProps) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 dark:border-[#3c4d46] dark:bg-[#131d1a]">
      <div className="flex items-center gap-4 border-b border-[#f1f5f9] pb-4 dark:border-[#24332d]">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#006c49]/20 bg-[#f1f5f9] dark:border-[#34d399]/30 dark:bg-[#1a2723]">
          {applicant.photoUrl ? (
            <Image
              alt="Pas Foto"
              className="h-full w-full object-cover"
              src={applicant.photoUrl}
              width={64}
              height={64}
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#64748b] dark:text-[#94a89e]">
              <User className="h-6 w-6" aria-hidden />
            </div>
          )}
        </div>
        <div>
          <h4 className="text-base font-semibold text-[#0f172a] dark:text-[#eef2f4]">
            {applicant.user.name || "Tanpa Nama"}
          </h4>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-[#005236] dark:text-[#34d399]">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            Calon Anggota
          </p>
          <span className="mt-1.5 inline-block rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 font-mono text-[11px] font-medium text-[#334155] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#cbd6d0]">
            ID: {formatId(applicant.id)}
          </span>
        </div>
      </div>

      <div className="space-y-3 pt-4 text-xs">
        <div className="flex items-start justify-between gap-2">
          <span className="shrink-0 text-[#64748b] dark:text-[#94a89e]">NIM</span>
          <span className="text-right font-mono font-semibold text-[#0f172a] tabular-nums dark:text-[#eef2f4]">
            {applicant.nim || "-"}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="shrink-0 text-[#64748b] dark:text-[#94a89e]">Tempat, Tanggal Lahir</span>
          <span className="text-right font-medium text-[#0f172a] dark:text-[#eef2f4]">
            {applicant.placeOfBirth || "-"},{" "}
            {applicant.dateOfBirth
              ? new Date(applicant.dateOfBirth).toLocaleDateString("id-ID")
              : "-"}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="shrink-0 text-[#64748b] dark:text-[#94a89e]">Jenis Kelamin</span>
          <span className="text-right font-medium text-[#0f172a] dark:text-[#eef2f4]">
            {applicant.gender || "-"}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="shrink-0 text-[#64748b] dark:text-[#94a89e]">Email Terverifikasi</span>
          <span className="truncate text-right font-medium text-[#005236] dark:text-[#34d399]">
            {applicant.user.email || "-"}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="shrink-0 text-[#64748b] dark:text-[#94a89e]">WhatsApp / No. HP</span>
          <span className="flex items-center gap-1 text-right font-medium text-[#0f172a] tabular-nums dark:text-[#eef2f4]">
            <Phone className="h-3.5 w-3.5 text-[#006c49] dark:text-[#34d399]" aria-hidden />
            {normalizeIndonesianPhone(applicant.phoneNumber) || "-"}
          </span>
        </div>
        <div className="flex flex-col gap-1 border-t border-[#f1f5f9] pt-3 dark:border-[#24332d]">
          <span className="text-[#64748b] dark:text-[#94a89e]">Data Akademik</span>
          <p className="text-xs leading-relaxed font-medium text-[#0f172a] dark:text-[#eef2f4]">
            Fakultas: {applicant.faculty || "-"}
            <br />
            Jurusan: {applicant.major || "-"}
            <br />
            Angkatan: {applicant.batchYear || "-"}
          </p>
        </div>
        <div className="flex flex-col gap-1 border-t border-[#f1f5f9] pt-3 dark:border-[#24332d]">
          <span className="text-[#64748b] dark:text-[#94a89e]">Alamat Domisili Lengkap</span>
          <p className="text-xs leading-relaxed font-medium text-[#0f172a] dark:text-[#eef2f4]">
            {applicant.address || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
