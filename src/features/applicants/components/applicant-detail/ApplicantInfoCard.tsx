import React from "react";
import Image from "next/image";
import type { Applicant } from "../../types";
import { formatId } from "../../utils";

interface ApplicantInfoCardProps {
  applicant: Applicant;
}

export function ApplicantInfoCard({ applicant }: ApplicantInfoCardProps) {
  return (
    <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
      <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/20 shadow-inner shrink-0 bg-slate-100">
          {applicant.photoUrl ? (
            <Image
              alt="Pas Foto"
              className="w-full h-full object-cover"
              src={applicant.photoUrl}
              width={64}
              height={64}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined">person</span>
            </div>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 text-base">
            {applicant.user.name || "N/A"}
          </h4>
          <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">
              verified
            </span>{" "}
            Calon Anggota
          </p>
          <span className="inline-block mt-1 text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
            ID: {formatId(applicant.id)}
          </span>
        </div>
      </div>

      <div className="pt-4 space-y-3 font-body-sm text-xs">
        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-500 shrink-0">NIM</span>
          <span className="font-mono font-medium text-slate-900 text-right">
            {applicant.nim || "-"}
          </span>
        </div>
        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-500 shrink-0">
            Tempat, Tgl Lahir
          </span>
          <span className="font-medium text-slate-900 text-right">
            {applicant.placeOfBirth || "-"},{" "}
            {applicant.dateOfBirth
              ? new Date(applicant.dateOfBirth).toLocaleDateString("id-ID")
              : "-"}
          </span>
        </div>
        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-500 shrink-0">
            Jenis Kelamin
          </span>
          <span className="font-medium text-slate-900 text-right">
            {applicant.gender || "-"}
          </span>
        </div>
        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-500 shrink-0">
            Email Terverifikasi
          </span>
          <span className="font-medium text-emerald-700 hover:underline text-right truncate">
            {applicant.user.email || "-"}
          </span>
        </div>
        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-500 shrink-0">
            WhatsApp / No. HP
          </span>
          <span className="font-medium text-slate-900 text-right flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-emerald-600">
              call
            </span>
            {applicant.phoneNumber || "-"}
          </span>
        </div>
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
          <span className="text-slate-500">Data Akademik</span>
          <p className="font-medium text-slate-800 leading-relaxed text-xs">
            Fakultas: {applicant.faculty || "-"}
            <br />
            Jurusan: {applicant.major || "-"}
            <br />
            Angkatan: {applicant.batchYear || "-"}
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
          <span className="text-slate-500">
            Alamat Domisili Lengkap
          </span>
          <p className="font-medium text-slate-800 leading-relaxed text-xs">
            {applicant.address || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
