import React from "react";
import { Applicant, getStatusStyle, formatId } from "./ApplicantsUtils";

type Props = {
  applicants: Applicant[];
  isPending: boolean;
  onViewDetail: (applicant: Applicant) => void;
  onDelete: (applicant: Applicant) => void;
  onSuspend: (id: string) => void;
  userRole?: string;
};

export default function ApplicantsTable({
  applicants,
  isPending,
  onViewDetail,
  onDelete,
  onSuspend,
  userRole,
}: Props) {
  return (
    <div className="overflow-x-auto relative z-0">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-surface-container-highest/30 border-b border-outline-variant/20 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            <th className="py-4 px-6 font-semibold w-40">NIM & Info</th>
            <th className="py-4 px-6 font-semibold">Nama Lengkap</th>
            <th className="py-4 px-6 font-semibold">Fakultas / Jurusan</th>
            <th className="py-4 px-6 font-semibold">Kontak</th>
            <th className="py-4 px-6 font-semibold">Tanggal Daftar</th>
            <th className="py-4 px-6 font-semibold w-32">Status</th>
            <th className="py-4 px-6 font-semibold text-right w-48">Aksi</th>
          </tr>
        </thead>
        <tbody className="font-body-sm text-body-sm text-on-surface">
          {applicants.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                Tidak ada data pendaftar.
              </td>
            </tr>
          ) : (
            applicants.map((applicant) => (
              <tr
                key={applicant.id}
                className="border-b border-outline-variant/10 hover:bg-surface-container-highest/20 transition-colors group"
              >
                <td className="py-4 px-6 font-code-sm text-code-sm text-secondary">
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface">{applicant.nim || "N/A"}</span>
                    <span className="text-xs text-on-surface-variant">{formatId(applicant.id)}</span>
                  </div>
                </td>
                <td className="py-4 px-6 font-medium text-on-surface">
                  {applicant.user.name || "N/A"}
                </td>
                <td className="py-4 px-6 text-on-surface-variant">
                  <div className="flex flex-col">
                    <span>{applicant.faculty || "N/A"}</span>
                    <span className="text-xs text-on-surface-variant/70">{applicant.major || "-"}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-on-surface-variant">
                  <div className="flex flex-col">
                    <span>{applicant.user.email || "N/A"}</span>
                    <span className="text-xs text-on-surface-variant/70">
                      {applicant.phoneNumber || "N/A"}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-on-surface-variant">
                  {new Date(applicant.joinDate).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                      applicant.status
                    )}`}
                  >
                    {applicant.status === "ACTIVE" ? "Aktif" : 
                     applicant.status === "PENDING" ? "Menunggu" : 
                     applicant.status === "REJECTED" ? "Ditolak" : 
                     applicant.status === "SUSPENDED" ? "Dibekukan" : applicant.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1 transition-opacity">
                    <button
                      className="p-1.5 text-on-surface-variant hover:text-primary rounded hover:bg-primary/10 transition-colors cursor-pointer"
                      title="Lihat Detail"
                      onClick={() => onViewDetail(applicant)}
                    >
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    {applicant.status === "ACTIVE" && userRole !== "STAFF" && (
                      <button
                        onClick={() => onSuspend(applicant.id)}
                        className="p-1.5 text-on-surface-variant hover:text-warning rounded hover:bg-warning/10 transition-colors cursor-pointer text-[#f57f17]"
                        title="Blokir"
                        disabled={isPending}
                      >
                        <span className="material-symbols-outlined text-[20px]">block</span>
                      </button>
                    )}
                    {(userRole === "OWNER" || userRole === "SUPER_ADMIN") && (
                      <>
                        <div className="w-px h-4 bg-outline-variant/30 mx-1"></div>
                        <button
                          onClick={() => onDelete(applicant)}
                          className="p-1.5 text-on-surface-variant hover:text-error rounded hover:bg-error/10 transition-colors cursor-pointer"
                          title="Hapus"
                          disabled={isPending}
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
