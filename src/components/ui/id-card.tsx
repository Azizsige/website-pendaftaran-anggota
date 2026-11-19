import React from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { addMonths } from "date-fns";
import { formatDate } from "@/lib/format";

export interface IdCardData {
  name?: string | null;
  nim?: string | null;
  faculty?: string | null;
  major?: string | null;
  batchYear?: string | null;
  status?: string | null;
  joinDate?: Date | string | null;
  photoUrl?: string | null;
  verificationCode?: string | null;
  verificationUrl?: string | null;
}

export interface IdCardConfig {
  orgName?: string;
  orgSubtitle?: string;
  periodLabel?: string;
  memberPrefix?: string;
  validityMonths?: number | string;
  frontBgUrl?: string;
  backBgUrl?: string;
  signatureUrl?: string;
  signatureName?: string;
  signatureTitle?: string;
  logoUrl?: string;
  terms?: string[];
  orgAddress?: string;
  orgEmail?: string;
  orgInstagram?: string;
  showPhoto?: boolean;
  showName?: boolean;
  showNim?: boolean;
  showMemberId?: boolean;
  showFaculty?: boolean;
  showMajor?: boolean;
  showValidity?: boolean;
  showQr?: boolean;
}

export interface IdCardProps {
  member: IdCardData;
  config: IdCardConfig;
  frontId?: string;
  backId?: string;
  scaled?: boolean;
  printMode?: boolean;
  viewSide?: "both" | "front" | "back";
  className?: string;
}

const styles = `
  .security-pattern {
    background-image:
      radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.07) 0, transparent 35%),
      radial-gradient(circle at 0% 100%, rgba(30, 75, 153, 0.1) 0, transparent 40%),
      repeating-linear-gradient(45deg, rgba(15, 43, 92, 0.02) 0px, rgba(15, 43, 92, 0.02) 2px, transparent 2px, transparent 10px),
      repeating-linear-gradient(-45deg, rgba(245, 158, 11, 0.02) 0px, rgba(245, 158, 11, 0.02) 2px, transparent 2px, transparent 10px);
  }

  .kta-hex-wm {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='52'%3E%3Cpath d='M15 1l13 7.5v15L15 31 2 23.5v-15z' fill='none' stroke='%230B1B3D' stroke-width='1'/%3E%3C/svg%3E");
    background-size: 30px 52px;
  }

  .card-shadow {
    box-shadow: 0 25px 50px -12px rgba(11, 30, 63, 0.25), 0 0 0 1px rgba(11, 30, 63, 0.08);
  }
`;

function buildQrSvgPath(value: string): { size: number; path: string } {
  try {
    const qr = QRCode.create(value || "KTA", { errorCorrectionLevel: "M" });
    const { size, data } = qr.modules;
    let path = "";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (data[r * size + c]) {
          path += `M${c} ${r}h1v1h-1z`;
        }
      }
    }
    return { size, path };
  } catch {
    return { size: 21, path: "M2 2h7v7H2zM12 2h7v7h-7zM2 12h7v7H2z" };
  }
}

function resolveMemberStatusBadge(status?: string | null): {
  label: string;
  pillClass: string;
  dotClass: string;
} {
  const normalized = (status || "ACTIVE").toUpperCase();
  if (normalized === "PENDING") {
    return {
      label: "MENUNGGU VERIFIKASI",
      pillClass: "bg-[#fef3c7] text-[#92400e] border-[#f59e0b]/40",
      dotClass: "bg-[#d97706]",
    };
  }
  if (normalized === "SUSPENDED" || normalized === "REJECTED" || normalized === "INACTIVE") {
    return {
      label: "TIDAK AKTIF",
      pillClass: "bg-[#fef2f2] text-[#991b1b] border-[#ef4444]/40",
      dotClass: "bg-[#dc2626]",
    };
  }
  return {
    label: "ANGGOTA AKTIF",
    pillClass: "bg-[#E3F6EC] text-[#066B47] border-[#8FD3B1]",
    dotClass: "bg-[#0A8F5F]",
  };
}

function resolveVerificationCode(member: IdCardData): string {
  if (member.verificationCode?.trim()) {
    return member.verificationCode.trim().toUpperCase();
  }
  const digits = (member.nim || "00000000").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const padded = (digits + "00000000").slice(0, 8);
  return `${padded.slice(0, 4)}-${padded.slice(4, 8)}`;
}

function getCrossOriginAttr(url?: string): "anonymous" | undefined {
  if (!url) return undefined;
  return url.startsWith("data:") || url.startsWith("/") ? undefined : "anonymous";
}

export function IdCardFront({
  member,
  config,
  elementId,
  printMode = false,
}: {
  member: IdCardData;
  config: IdCardConfig;
  elementId?: string;
  printMode?: boolean;
}) {
  const joinDateObj = member.joinDate ? new Date(member.joinDate) : new Date();
  const validityMonths = parseInt(String(config.validityMonths), 10) || 12;
  const validityDate = addMonths(joinDateObj, validityMonths);

  const showPhoto = config.showPhoto !== false;
  const showName = config.showName !== false;
  const showNim = config.showNim !== false;
  const showMemberId = config.showMemberId !== false;
  const showFaculty = config.showFaculty !== false;
  const showMajor = config.showMajor !== false;
  const showValidity = config.showValidity !== false;
  const showQr = config.showQr !== false;

  const orgName = config.orgName?.trim() || "Organisasi Mahasiswa";
  const orgSubtitle = config.orgSubtitle?.trim();
  const periodLabel = config.periodLabel?.trim();
  const memberPrefix = config.memberPrefix ?? "KTA-";
  const memberNim = member.nim?.trim() || "2026012345";
  const memberIdText = `${memberPrefix}${memberNim}`;
  const secId = resolveVerificationCode(member);
  const statusBadge = resolveMemberStatusBadge(member.status);

  const qrPayload =
    member.verificationUrl?.trim() ||
    `/verifikasi?nim=${encodeURIComponent(memberNim)}&code=${encodeURIComponent(secId)}`;
  const qrMatrix = buildQrSvgPath(qrPayload);

  return (
    <div
      id={elementId}
      className={`relative w-[380px] h-[605px] bg-[#F6F8FC] text-[#0B1B3D] overflow-hidden flex flex-col justify-between select-none shrink-0 ${
        printMode
          ? "rounded-none border-0 shadow-none"
          : "rounded-3xl card-shadow border border-[#DCE3EF]"
      }`}
    >
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.05] kta-hex-wm pointer-events-none z-0" />

      {config.frontBgUrl && (
        <Image
          src={config.frontBgUrl}
          alt="Latar Depan KTA"
          fill
          className="object-cover z-0"
          crossOrigin={getCrossOriginAttr(config.frontBgUrl)}
          unoptimized
        />
      )}

      {/* Penanda lubang klip lanyard hanya tampil di preview layar, tidak ikut tercetak */}
      {!printMode && (
        <div
          aria-hidden="true"
          className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-white/25 border border-white/25 z-30"
        />
      )}

      {/* Header Navy dengan aksen dot grid & garis bawah amber */}
      <header
        className={`relative text-white rounded-b-[22px] border-b-[3px] border-[#F59E0B] px-5 flex items-center gap-3 z-20 ${
          printMode ? "h-[108px] pt-3" : "h-[102px] pt-1.5"
        }`}
        style={{
          background: "linear-gradient(110deg, #0B1B3D 0%, #0B1B3D 45%, #13306B 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-b-[22px] opacity-60 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1.2px)",
            backgroundSize: "13px 13px",
          }}
        />

        <div className="relative z-10 w-12 h-12 rounded-[14px] bg-white/10 border border-white/25 p-1 flex items-center justify-center shrink-0">
          {config.logoUrl ? (
            <Image
              alt={`Logo ${orgName}`}
              className="w-10 h-10 object-contain drop-shadow"
              src={config.logoUrl}
              width={40}
              height={40}
              crossOrigin={getCrossOriginAttr(config.logoUrl)}
              unoptimized
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center font-extrabold text-[#FFD98A] text-sm">
              KTA
            </div>
          )}
        </div>

        <div className="relative z-10 flex-1 min-w-0">
          {orgSubtitle && (
            <p className="text-[9.5px] font-semibold uppercase tracking-wider text-[#FFD98A] truncate leading-tight">
              {orgSubtitle}
            </p>
          )}
          <h2 className="text-[16.5px] font-extrabold tracking-tight text-white leading-[1.12] line-clamp-2">
            {orgName}
          </h2>
          <p className="mt-1 text-[9.5px] font-semibold tracking-[0.16em] text-[#C9D5EE] uppercase leading-tight">
            KARTU TANDA ANGGOTA
          </p>
        </div>

        {periodLabel && (
          <span className="relative z-10 shrink-0 rounded-full border border-[#F59E0B] bg-black/25 px-2.5 py-1 text-[10px] font-bold text-[#FFD98A] tabular-nums">
            {periodLabel}
          </span>
        )}
      </header>

      {/* Konten Utama Terpusat */}
      <div className="flex-1 px-5 pt-2.5 pb-2 flex flex-col items-center justify-between relative z-10 min-h-0">
        {/* Foto, Badge Status & Nama */}
        <div className="w-full flex flex-col items-center">
          {showPhoto && (
            <div className="relative mt-0.5 shrink-0">
              <div className="w-[104px] h-[136px] rounded-[13px] bg-white p-[3.5px] border border-[#C9D3E6] shadow-[0_5px_14px_rgba(11,27,61,0.18)]">
                <div className="w-full h-full rounded-[9.5px] overflow-hidden bg-gradient-to-b from-[#DCE6F7] to-[#B9CBEA] relative">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={`Pas Foto ${member.name || "Anggota"}`}
                      fill
                      className="object-cover"
                      crossOrigin={getCrossOriginAttr(member.photoUrl)}
                      unoptimized
                    />
                  ) : (
                    <svg
                      viewBox="0 0 222 300"
                      className="w-full h-full block"
                      preserveAspectRatio="xMidYMax slice"
                      aria-hidden="true"
                    >
                      <circle cx="111" cy="112" r="44" fill="#F4F7FD" />
                      <path d="M20 300c0-62 40-96 91-96s91 34 91 96z" fill="#F4F7FD" />
                    </svg>
                  )}
                </div>
              </div>
              <span
                className={`absolute left-1/2 -bottom-[9px] -translate-x-1/2 whitespace-nowrap inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9.5px] font-extrabold tracking-[0.07em] shadow-xs ${statusBadge.pillClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
                {statusBadge.label}
              </span>
            </div>
          )}

          {!showPhoto && (
            <span
              className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9.5px] font-extrabold tracking-[0.07em] ${statusBadge.pillClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
              {statusBadge.label}
            </span>
          )}

          {showName && (
            <h3
              className={`${
                showPhoto ? "mt-[17px]" : "mt-2"
              } max-w-[330px] text-[17.5px] font-extrabold text-[#0B1B3D] tracking-tight leading-[1.14] text-center line-clamp-2 break-words`}
            >
              {member.name || "Ahmad Rizky Pratama"}
            </h3>
          )}
        </div>

        {/* Kartu 1: NIM & No. Anggota */}
        {(showNim || showMemberId) && (
          <div className="w-full rounded-[13px] bg-white border border-[#DCE3EF] shadow-[0_2px_7px_rgba(11,27,61,0.06)] py-1.5 flex divide-x divide-[#DCE3EF]">
            {showNim && (
              <div className="flex-1 min-w-0 px-2 text-center">
                <p className="text-[9.5px] font-bold text-[#53607A] uppercase tracking-[0.08em] leading-tight">
                  NIM
                </p>
                <p className="mt-0.5 font-mono font-bold text-[10.5px] text-[#0B1B3D] tabular-nums truncate">
                  {memberNim}
                </p>
              </div>
            )}
            {showMemberId && (
              <div className="flex-1 min-w-0 px-2 text-center">
                <p className="text-[9.5px] font-bold text-[#53607A] uppercase tracking-[0.08em] leading-tight">
                  NO. ANGGOTA
                </p>
                <p className="mt-0.5 font-mono font-bold text-[10.5px] text-[#0B1B3D] tabular-nums break-all leading-tight">
                  {memberIdText}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Kartu 2: Fakultas, Program Studi, Angkatan & Berlaku Hingga */}
        <div className="w-full rounded-[13px] bg-white border border-[#DCE3EF] shadow-[0_2px_7px_rgba(11,27,61,0.06)] px-4 divide-y divide-[#DCE3EF]">
          {showFaculty && (
            <div className="py-1.5">
              <p className="text-[9.5px] font-bold text-[#53607A] uppercase tracking-[0.08em] leading-tight">
                FAKULTAS
              </p>
              <p className="mt-0.5 text-[11px] font-bold text-[#0B1B3D] leading-snug line-clamp-1">
                {member.faculty || "Ilmu Komputer"}
              </p>
            </div>
          )}

          {showMajor && (
            <div className="py-1.5">
              <p className="text-[9.5px] font-bold text-[#53607A] uppercase tracking-[0.08em] leading-tight">
                PROGRAM STUDI
              </p>
              <p className="mt-0.5 text-[11px] font-bold text-[#0B1B3D] leading-snug line-clamp-2 break-words">
                {member.major || "Teknik Informatika"}
              </p>
            </div>
          )}

          <div className={`py-1.5 grid gap-3 ${showValidity ? "grid-cols-2" : "grid-cols-1"}`}>
            <div className="min-w-0">
              <p className="text-[9.5px] font-bold text-[#53607A] uppercase tracking-[0.08em] leading-tight">
                {member.batchYear ? "ANGKATAN" : "BERGABUNG"}
              </p>
              <p className="mt-0.5 text-[11px] font-bold text-[#0B1B3D] leading-snug truncate">
                {member.batchYear ? `Angkatan ${member.batchYear}` : formatDate(joinDateObj)}
              </p>
            </div>

            {showValidity && (
              <div className="min-w-0">
                <p className="text-[9.5px] font-bold text-[#53607A] uppercase tracking-[0.08em] leading-tight">
                  BERLAKU HINGGA
                </p>
                <p className="mt-0.5 text-[11px] font-extrabold text-[#9A4A07] tabular-nums leading-snug truncate">
                  {formatDate(validityDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Validasi QR & Pengesah */}
      <footer className="relative z-10 shrink-0 px-5 pt-1.5 pb-3.5">
        <div className="h-[2px] w-full rounded-full bg-gradient-to-r from-[#F7C36B] to-[#F59E0B]" />

        <div className="pt-2.5 flex items-center justify-between gap-3">
          {showQr ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-[70px] h-[70px] bg-white border border-[#C9D3E6] rounded-[11px] p-[6px] shadow-[0_2px_6px_rgba(11,27,61,0.08)] shrink-0">
                <svg
                  width="56"
                  height="56"
                  viewBox={`0 0 ${qrMatrix.size} ${qrMatrix.size}`}
                  shapeRendering="crispEdges"
                  role="img"
                  aria-label={`QR Verifikasi ${memberNim}`}
                  className="block w-full h-full"
                >
                  <rect width={qrMatrix.size} height={qrMatrix.size} fill="#ffffff" />
                  <path d={qrMatrix.path} fill="#0B1B3D" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="inline-block bg-[#E3F6EC] border border-[#8FD3B1] text-[#0B1B3D] font-extrabold text-[9.5px] px-2 py-0.5 rounded-[6px]">
                  VALIDASI QR
                </span>
                <p className="text-[9.5px] font-medium text-[#53607A] leading-tight mt-1">
                  Scan untuk verifikasi resmi
                </p>
                <p className="text-[9.5px] font-mono font-bold text-[#0B1B3D] mt-1">
                  SEC-ID: {secId}
                </p>
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <span className="inline-block bg-[#E3F6EC] border border-[#8FD3B1] text-[#0B1B3D] font-extrabold text-[9.5px] px-2 py-0.5 rounded-[6px]">
                TERVERIFIKASI
              </span>
              <p className="text-[9.5px] font-mono font-bold text-[#0B1B3D] mt-1">
                SEC-ID: {secId}
              </p>
            </div>
          )}

          <div className="w-[116px] text-center flex flex-col items-center shrink-0">
            <span className="text-[9.5px] font-bold text-[#53607A] uppercase tracking-[0.09em]">
              PENGESAH
            </span>
            {config.signatureUrl ? (
              <Image
                src={config.signatureUrl}
                alt="Tanda Tangan Pengesah"
                width={96}
                height={28}
                className="h-7 w-auto max-w-[100px] object-contain my-0.5"
                crossOrigin={getCrossOriginAttr(config.signatureUrl)}
                unoptimized
              />
            ) : (
              <svg
                className="w-[85px] h-7 text-[#13306B] my-0.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                viewBox="0 0 170 60"
                aria-hidden="true"
              >
                <path d="M8 40C22 8 36 6 38 24c2 16-10 26-4 28s16-30 28-30c8 0 2 22 12 22s14-18 26-18 6 14 20 10 20-18 30-14" />
              </svg>
            )}
            <span className="w-full border-t border-[#0B1B3D] pt-1 text-[10px] font-extrabold text-[#0B1B3D] leading-tight truncate">
              {config.signatureName?.trim() || "Nama Penanda Tangan"}
            </span>
            {config.signatureTitle?.trim() && (
              <span className="w-full text-[9.5px] font-medium text-[#53607A] leading-tight truncate mt-0.5">
                {config.signatureTitle.trim()}
              </span>
            )}
          </div>
        </div>
      </footer>

      <div
        className="h-1.5 w-full shrink-0 z-20"
        style={{
          background:
            "linear-gradient(90deg, #F59E0B, #C7792A 35%, #13306B 70%, #0B1B3D)",
        }}
      />
    </div>
  );
}

export function IdCardBack({
  member,
  config,
  elementId,
  printMode = false,
}: {
  member?: IdCardData;
  config: IdCardConfig;
  elementId?: string;
  printMode?: boolean;
}) {
  const orgName = config.orgName?.trim() || "Organisasi Mahasiswa";
  const orgSubtitle = config.orgSubtitle?.trim();
  const periodLabel = config.periodLabel?.trim();
  const showMemberId = config.showMemberId !== false;
  const memberNim = member?.nim?.trim() || "2026012345";
  const memberIdText = `${config.memberPrefix ?? "KTA-"}${memberNim}`;
  const secId = member ? resolveVerificationCode(member) : "0000-0000";

  const rawTerms =
    config.terms && config.terms.length > 0
      ? config.terms.filter((t) => t.trim().length > 0).slice(0, 5)
      : [
          "Kartu Tanda Anggota (KTA) ini sah dan merupakan bukti keanggotaan aktif organisasi.",
          "Kartu ini tidak dapat dipindahtangankan kepada pihak lain dan wajib dibawa saat kegiatan resmi.",
          "Penyalahgunaan kartu dapat dikenakan sanksi sesuai aturan organisasi.",
          "Apabila kartu hilang atau rusak, segera laporkan ke Sekretariat organisasi.",
        ];

  const cleanAddress = config.orgAddress?.trim();
  const cleanEmail = config.orgEmail?.trim();
  const cleanInstagram = config.orgInstagram?.trim()
    ? config.orgInstagram.trim().startsWith("@")
      ? config.orgInstagram.trim()
      : `@${config.orgInstagram.trim()}`
    : "";
  const hasContactInfo = Boolean(cleanAddress || cleanEmail || cleanInstagram);

  return (
    <div
      id={elementId}
      className={`relative w-[380px] h-[605px] bg-white overflow-hidden flex flex-col justify-between security-pattern select-none shrink-0 ${
        printMode
          ? "rounded-none border-0 shadow-none"
          : "rounded-3xl card-shadow border border-slate-200/80"
      }`}
    >
      {config.backBgUrl && (
        <Image
          src={config.backBgUrl}
          alt="Latar Belakang KTA"
          fill
          className="object-cover z-0"
          crossOrigin={getCrossOriginAttr(config.backBgUrl)}
          unoptimized
        />
      )}

      {!printMode && (
        <div
          aria-hidden="true"
          className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-slate-200/75 border border-slate-300/60 z-30"
        />
      )}

      {/* Header dengan safe margin atas untuk lubang lanyard */}
      <div
        className={`relative bg-gradient-to-r from-[#07162c] via-[#0b1e3f] to-[#0f2b5c] text-white ${
          printMode ? "pt-9 pb-4" : "pt-7 pb-4"
        } px-5 rounded-b-[24px] shadow-md border-b-[3px] border-[#F59E0B] z-20`}
      >
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 p-1 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center shrink-0">
              {config.logoUrl ? (
                <Image
                  alt={`Logo ${orgName}`}
                  className="w-8 h-8 object-contain"
                  src={config.logoUrl}
                  width={32}
                  height={32}
                  crossOrigin={getCrossOriginAttr(config.logoUrl)}
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center font-bold text-[#fcd34d] text-xs">
                  KTA
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[14px] font-extrabold tracking-tight text-white leading-tight truncate">
                {orgName}
              </h2>
              {orgSubtitle && (
                <p className="text-[10px] font-medium text-[#fcd34d] tracking-wide uppercase truncate">
                  {orgSubtitle}
                </p>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono uppercase bg-white/15 px-2 py-0.5 rounded text-white tracking-wider border border-white/20 font-bold whitespace-nowrap inline-block">
              {periodLabel || "KTA RESMI"}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 pt-4 pb-4 flex flex-col justify-between z-10 min-h-0 gap-3">
        <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-[#07162c]">
              Ketentuan Kartu
            </h4>
            <span className="text-[10px] font-mono text-[#475569] font-bold">
              {periodLabel || "RESMI"}
            </span>
          </div>
          <ul className="space-y-2 text-[10px] text-[#1e293b] leading-snug font-medium">
            {rawTerms.map((term, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="shrink-0 w-4 h-4 rounded-full bg-[#e6f4ee] text-[#005236] border border-[#006c49]/25 text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                <span className="flex-1">{term}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Kontak Resmi Sekretariat */}
        <div className="bg-gradient-to-br from-[#07162c] via-[#0b1e3f] to-[#0f2b5c] rounded-2xl p-4 text-white shadow-sm border border-[#1d3969]">
          <div className="mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#fcd34d] block">
              Kontak Resmi
            </span>
            <h5 className="text-[12px] font-bold text-white tracking-tight truncate">
              Sekretariat {orgName}
            </h5>
          </div>

          {hasContactInfo ? (
            <div className="space-y-1.5 text-[10px] text-slate-200">
              {cleanAddress && (
                <p className="leading-snug line-clamp-2">
                  <strong className="text-[#fcd34d] font-semibold">Alamat: </strong>
                  {cleanAddress}
                </p>
              )}
              {cleanEmail && (
                <p className="font-mono text-slate-100 truncate">
                  <strong className="font-sans text-[#fcd34d] font-semibold">Email: </strong>
                  {cleanEmail}
                </p>
              )}
              {cleanInstagram && (
                <p className="font-mono text-[#fcd34d] truncate">
                  <strong className="font-sans font-semibold">Instagram: </strong>
                  {cleanInstagram}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-slate-200 leading-snug">
              Verifikasi dan informasi keanggotaan resmi dapat diakses melalui portal organisasi.
            </p>
          )}
        </div>

        {/* Footer Belakang */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold text-[#07162c] tracking-wide uppercase truncate">
              Kartu Tanda Anggota Resmi
            </p>
            <p className="text-[10px] text-[#475569] font-medium truncate">
              Dokumen identitas sah organisasi
            </p>
          </div>
          <div className="text-right shrink-0">
            {showMemberId && (
              <p className="text-[10px] font-mono font-bold text-[#0b1e3f]">{memberIdText}</p>
            )}
            <p className="text-[10px] font-mono text-[#475569]">SEC-ID: {secId}</p>
          </div>
        </div>
      </div>

      <div className="h-2 bg-gradient-to-r from-[#07162c] via-[#0f2b5c] to-[#F59E0B] z-20" />
    </div>
  );
}

export function IdCard({
  member,
  config,
  frontId = "id-card-element",
  backId = "id-card-back-element",
  scaled = false,
  printMode = false,
  viewSide = "both",
  className = "",
}: IdCardProps) {
  const showFront = viewSide === "both" || viewSide === "front";
  const showBack = viewSide === "both" || viewSide === "back";

  if (scaled) {
    return (
      <div className={`flex flex-wrap gap-6 justify-center lg:justify-start ${className}`}>
        <style>{styles}</style>
        {showFront && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between w-[247px] px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-[#cbd6d0]">
                  Sisi Depan
                </span>
              </div>
              {config.showMemberId !== false && (
                <span className="text-[10px] font-mono text-slate-500 dark:text-[#94a89e]">
                  {config.memberPrefix || "KTA-"}
                  {member.nim || "0001"}
                </span>
              )}
            </div>
            <div
              className={`relative w-[247px] h-[393px] ${
                printMode ? "border border-slate-300 dark:border-[#3c4d46]" : ""
              }`}
            >
              <div className="transform scale-[0.65] origin-top-left">
                <IdCardFront
                  member={member}
                  config={config}
                  elementId={frontId}
                  printMode={printMode}
                />
              </div>
            </div>
          </div>
        )}

        {showBack && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between w-[247px] px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0b1e3f] dark:bg-[#93c5fd]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-[#cbd6d0]">
                  Sisi Belakang
                </span>
              </div>
            </div>
            <div
              className={`relative w-[247px] h-[393px] ${
                printMode ? "border border-slate-300 dark:border-[#3c4d46]" : ""
              }`}
            >
              <div className="transform scale-[0.65] origin-top-left">
                <IdCardBack
                  member={member}
                  config={config}
                  elementId={backId}
                  printMode={printMode}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col md:flex-row gap-6 justify-center bg-transparent p-0 ${className}`}>
      <style>{styles}</style>
      {showFront && (
        <IdCardFront
          member={member}
          config={config}
          elementId={frontId}
          printMode={printMode}
        />
      )}
      {showBack && (
        <IdCardBack
          member={member}
          config={config}
          elementId={backId}
          printMode={printMode}
        />
      )}
    </div>
  );
}
