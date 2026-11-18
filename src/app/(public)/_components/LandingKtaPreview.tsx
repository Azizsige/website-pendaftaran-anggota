"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, QrCode, ShieldCheck, User } from "lucide-react";

interface LandingKtaPreviewProps {
  ktaOrgName: string;
  orgLogo: string;
  memberPrefix: string;
  validityMonths: number;
  showMemberId: boolean;
  showNim: boolean;
  showFaculty: boolean;
  showMajor: boolean;
}

export function LandingKtaPreview({
  ktaOrgName,
  orgLogo,
  memberPrefix,
  validityMonths,
  showMemberId,
  showNim,
  showFaculty,
  showMajor,
}: LandingKtaPreviewProps) {
  const [viewMode, setViewMode] = useState<"front" | "verify">("front");
  const sampleId = `${memberPrefix}0042`;

  return (
    <div className="w-full">
      <div className="rounded-2xl overflow-hidden bg-[#0b1e3f] text-white border border-[#1d3969] dark:border-[#3c4d46] shadow-xl">
        {/* Top segmented header */}
        <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-white/15 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#fbbf24]">
              Contoh KTA Digital
            </p>
            <p className="text-xs text-slate-200 truncate">{ktaOrgName}</p>
          </div>

          <div
            className="inline-flex rounded-lg bg-[#081630] p-1 border border-white/10 shrink-0"
            role="group"
            aria-label="Tampilan pratinjau KTA"
          >
            <button
              type="button"
              onClick={() => setViewMode("front")}
              aria-pressed={viewMode === "front"}
              className={`min-h-[36px] px-2.5 sm:px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24] ${
                viewMode === "front"
                  ? "bg-[#f59e0b] text-[#0b1e3f]"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              Tampak Kartu
            </button>
            <button
              type="button"
              onClick={() => setViewMode("verify")}
              aria-pressed={viewMode === "verify"}
              className={`min-h-[36px] px-2.5 sm:px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24] ${
                viewMode === "verify"
                  ? "bg-[#f59e0b] text-[#0b1e3f]"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              Validasi
            </button>
          </div>
        </div>

        {/* Gold Identity Strip */}
        <div className="h-1 w-full bg-[#f59e0b]" aria-hidden="true" />

        {viewMode === "front" ? (
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3 pb-3.5 border-b border-white/15">
              {orgLogo ? (
                <Image
                  src={orgLogo}
                  alt=""
                  aria-hidden="true"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-lg object-contain bg-white/10 p-1 shrink-0"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-lg bg-[#163466] border border-[#f59e0b]/50 flex items-center justify-center text-xs font-bold tracking-wider text-[#fbbf24] shrink-0"
                  aria-hidden="true"
                >
                  KTA
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#fbbf24]">
                  Kartu Tanda Anggota
                </p>
                <p className="text-sm font-bold text-white truncate">
                  {ktaOrgName}
                </p>
              </div>
            </div>

            <div className="pt-4 grid grid-cols-[64px_1fr] sm:grid-cols-[72px_1fr] gap-4 items-center">
              <div
                className="w-16 h-20 sm:w-[72px] sm:h-[88px] rounded-xl bg-[#132c57] border border-white/20 flex flex-col items-center justify-center text-slate-300 shrink-0"
                aria-hidden="true"
              >
                <User className="w-6 h-6 text-slate-200 mb-1" />
                <span className="text-[10px] font-medium text-slate-300">
                  Foto
                </span>
              </div>

              <div className="min-w-0 space-y-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-300">
                    Nama Anggota (Contoh)
                  </p>
                  <p className="text-sm sm:text-base font-bold text-white leading-tight truncate">
                    Nadia Kusuma Wardani
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  {showMemberId && (
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-slate-300">
                        No. Anggota
                      </dt>
                      <dd className="font-mono font-semibold text-[#fbbf24]">
                        {sampleId}
                      </dd>
                    </div>
                  )}

                  {showNim && (
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-slate-300">
                        NIM
                      </dt>
                      <dd className="font-mono font-medium text-white">
                        2401102048
                      </dd>
                    </div>
                  )}

                  {showFaculty && (
                    <div className="col-span-2">
                      <dt className="text-[10px] uppercase tracking-wider text-slate-300">
                        Fakultas / Prodi
                      </dt>
                      <dd className="text-slate-100 truncate">
                        Ilmu Komputer{showMajor ? " / Teknik Informatika" : ""}
                      </dd>
                    </div>
                  )}

                  {!showFaculty && showMajor && (
                    <div className="col-span-2">
                      <dt className="text-[10px] uppercase tracking-wider text-slate-300">
                        Program Studi
                      </dt>
                      <dd className="text-slate-100 truncate">
                        Teknik Informatika
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-200">
                <ShieldCheck
                  className="w-4 h-4 text-[#34d399]"
                  aria-hidden="true"
                />
                <span>Masa aktif {validityMonths} bulan</span>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#081630] border border-white/15 text-slate-100 font-mono text-[11px]">
                <QrCode
                  className="w-3.5 h-3.5 text-[#fbbf24]"
                  aria-hidden="true"
                />
                QR Terverifikasi
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#163466] border border-[#fbbf24]/40 flex items-center justify-center shrink-0">
                <QrCode
                  className="w-5 h-5 text-[#fbbf24]"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Mekanisme Terbit Otomatis
                </p>
                <p className="text-xs text-slate-200 leading-relaxed mt-1">
                  Setelah berkas disetujui verifikator, sistem menetapkan nomor
                  berformat <span className="font-mono text-[#fbbf24]">{sampleId}</span>{" "}
                  dan membuka akses unduhan pada halaman Cek Status.
                </p>
              </div>
            </div>

            <ul className="space-y-2 border-t border-white/15 pt-3 text-xs text-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4 text-[#34d399] shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Field aktif di kartu:{" "}
                  {[
                    showMemberId ? "No. Anggota" : null,
                    showNim ? "NIM" : null,
                    showFaculty ? "Fakultas" : null,
                    showMajor ? "Prodi" : null,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Identitas Dasar"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4 text-[#34d399] shrink-0"
                  aria-hidden="true"
                />
                <span>Berlaku {validityMonths} bulan sejak tanggal persetujuan</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      <p className="text-xs text-[#4b5850] dark:text-[#94a89e] leading-relaxed mt-2.5 px-0.5">
        Pratinjau di atas mengikuti pengaturan KTA resmi yang dikonfigurasi pengurus.
      </p>
    </div>
  );
}
