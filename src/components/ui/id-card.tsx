import React from "react";
import Image from "next/image";
import { QrCode } from "lucide-react";
import { addMonths } from "date-fns";
import { formatDate } from "@/lib/format";

export interface IdCardData {
  name?: string | null;
  nim?: string | null;
  faculty?: string | null;
  major?: string | null;
  joinDate?: Date | string | null;
  photoUrl?: string | null;
}

export interface IdCardConfig {
  orgName?: string;
  memberPrefix?: string;
  validityMonths?: number | string;
  frontBgUrl?: string;
  backBgUrl?: string;
  signatureUrl?: string;
  signatureName?: string;
  logoUrl?: string;
  terms?: string[];
  orgAddress?: string;
  orgEmail?: string;
  orgInstagram?: string;
  showMemberId?: boolean;
}

export interface IdCardProps {
  member: IdCardData;
  config: IdCardConfig;
  frontId?: string;
  backId?: string;
  scaled?: boolean;
  className?: string;
}

const styles = `
  .security-pattern {
    background-image: 
      radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.08) 0, transparent 35%),
      radial-gradient(circle at 0% 100%, rgba(30, 75, 153, 0.12) 0, transparent 40%),
      repeating-linear-gradient(45deg, rgba(15, 43, 92, 0.02) 0px, rgba(15, 43, 92, 0.02) 2px, transparent 2px, transparent 10px),
      repeating-linear-gradient(-45deg, rgba(245, 158, 11, 0.02) 0px, rgba(245, 158, 11, 0.02) 2px, transparent 2px, transparent 10px);
  }
  
  .hologram-strip {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.3) 0%, 
      rgba(254, 243, 199, 0.5) 25%, 
      rgba(219, 234, 254, 0.4) 50%, 
      rgba(254, 215, 170, 0.5) 75%, 
      rgba(255, 255, 255, 0.3) 100%);
  }

  .card-shadow {
    box-shadow: 0 25px 50px -12px rgba(11, 30, 63, 0.25), 0 0 0 1px rgba(11, 30, 63, 0.08);
  }
`;

export function IdCardFront({
  member,
  config,
  elementId,
}: {
  member: IdCardData;
  config: IdCardConfig;
  elementId?: string;
}) {
  const joinDateObj = member.joinDate ? new Date(member.joinDate) : new Date();
  const validityDate = addMonths(joinDateObj, parseInt(String(config.validityMonths)) || 12);
  const showMemberId = config.showMemberId !== false;

  return (
    <div
      id={elementId}
      className="relative w-[380px] h-[605px] bg-white rounded-3xl overflow-hidden card-shadow border border-slate-200/80 flex flex-col justify-between security-pattern select-none shrink-0"
    >
      {config.frontBgUrl && (
        <Image src={config.frontBgUrl} alt="Front BG" fill className="object-cover z-0" unoptimized />
      )}

      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-slate-200/80 border border-slate-300/60 z-30" />

      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#07162c] via-[#0b1e3f] to-[#0f2b5c] text-white pt-6 pb-4 px-6 rounded-b-[28px] shadow-md border-b-2 border-[#F59E0B] z-20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-14 h-14 p-1 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex-shrink-0 shadow-inner flex items-center justify-center">
            {config.logoUrl ? (
              <Image alt="Logo" className="w-12 h-12 object-contain drop-shadow" src={config.logoUrl} width={48} height={48} unoptimized />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center font-bold text-white text-xl">L</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-[9px] font-bold tracking-widest uppercase text-amber-300 font-mono">OFFICIAL ID CARD</span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white leading-tight truncate">
              {config.orgName || "BEM FT UNSRI"}
            </h2>
            <p className="text-[10px] font-medium text-slate-300 tracking-wider uppercase">
              KARTU TANDA ANGGOTA
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4 pb-2 flex flex-col justify-between relative z-10">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-[104px] h-[138px] rounded-2xl p-1 bg-white shadow-md border border-slate-200/90 relative z-10 overflow-hidden">
              <div className="w-full h-full rounded-xl bg-slate-100 overflow-hidden relative">
                {member.photoUrl ? (
                  <Image src={member.photoUrl} alt="Foto Profil" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                    <svg className="w-10 h-10 mb-1 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                    <span className="text-[8px] font-bold text-slate-400 tracking-wider">PAS FOTO</span>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl hologram-strip border border-white/80 shadow-sm flex items-center justify-center z-20">
              <div className="w-5 h-5 rounded-md border border-amber-600/40 flex items-center justify-center">
                <span className="text-[8px] font-black text-amber-900 font-mono">★</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <span className="text-[8.5px] font-bold text-slate-600 uppercase tracking-widest block mb-0.5">NAMA LENGKAP</span>
            <h3 className="text-[15px] font-black text-[#07162c] leading-tight mb-2 truncate">
              {member.name || "Ahmad Rizky Pratama"}
            </h3>

            {showMemberId && (
              <div className="mb-2">
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest block mb-0.5">NOMOR ANGGOTA</span>
                <span className="inline-block text-[10px] font-mono font-bold text-[#0b1e3f] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {config.memberPrefix || "BEM-2026-"}{member.nim || "2026012345"}
                </span>
              </div>
            )}

            <div className="space-y-1 text-[9.5px]">
              <div>
                <span className="text-[8px] font-medium text-slate-600 block leading-none">FAKULTAS</span>
                <p className="font-bold text-slate-800 truncate leading-snug">{member.faculty || "Teknik"}</p>
              </div>
              <div>
                <span className="text-[8px] font-medium text-slate-600 block leading-none">JURUSAN</span>
                <p className="font-bold text-slate-800 truncate leading-snug">{member.major || "Teknik Informatika"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Validity & Verification */}
        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 shadow-sm mt-3">
          <div className="grid grid-cols-2 gap-2 text-[9px] pb-2 mb-2 border-b border-slate-200/80">
            <div>
              <span className="text-[7.5px] font-bold text-slate-600 block uppercase tracking-wider">TANGGAL BERGABUNG</span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{formatDate(joinDateObj)}</p>
            </div>
            <div>
              <span className="text-[7.5px] font-bold text-slate-600 block uppercase tracking-wider">BERLAKU HINGGA</span>
              <p className="font-mono font-bold text-amber-700 mt-0.5">{formatDate(validityDate)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
                <QrCode size={48} className="text-slate-900" />
              </div>
              <div className="text-left">
                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-[#0f2b5c] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  <svg className="w-2 h-2 text-[#153a7a]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                  </svg>
                  VALIDASI QR
                </span>
                <p className="text-[9px] font-medium text-slate-700 leading-tight mt-1 max-w-[130px]">
                  Scan untuk verifikasi anggota & akses portal resmi
                </p>
                <p className="text-[8px] font-mono text-slate-600 mt-0.5">
                  SEC-ID: 8F2A-991C
                </p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">PENGESAH</span>
              {config.signatureUrl ? (
                <Image src={config.signatureUrl} alt="Signature" width={100} height={28} className="h-7 w-auto object-contain -my-0.5 opacity-80" unoptimized />
              ) : (
                <svg className="w-20 h-7 text-[#0b1e3f] -my-0.5 opacity-80" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 120 40">
                  <path d="M 10 25 C 25 10, 30 35, 45 15 C 55 5, 60 30, 75 18 C 85 10, 95 28, 110 20" />
                  <path d="M 40 28 L 85 28" strokeDasharray="2 2" strokeWidth="1.5" />
                </svg>
              )}
              <span className="text-[9px] font-extrabold text-slate-800">{config.signatureName || "Nama Penanda Tangan"}</span>
              <span className="text-[7.5px] font-mono text-slate-600">NIM 2024098112</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-2 bg-gradient-to-r from-[#F59E0B] via-[#0f2b5c] to-[#07162c] z-20" />
    </div>
  );
}

export function IdCardBack({
  config,
  elementId,
}: {
  config: IdCardConfig;
  elementId?: string;
}) {
  const terms = config.terms && config.terms.length > 0
    ? config.terms
    : [
        "Kartu Tanda Anggota (KTA) ini sah dan merupakan bukti keanggotaan aktif organisasi.",
        "Kartu ini tidak dapat dipindahtangankan kepada pihak lain dan wajib dibawa saat kegiatan resmi.",
        "Penyalahgunaan kartu dapat dikenakan sanksi sesuai Anggaran Dasar dan Anggaran Rumah Tangga.",
        "Apabila kartu ini hilang atau rusak, segera laporkan ke Sekretariat organisasi untuk penggantian.",
      ];

  return (
    <div
      id={elementId}
      className="relative w-[380px] h-[605px] bg-white rounded-3xl overflow-hidden card-shadow border border-slate-200/80 flex flex-col justify-between security-pattern select-none shrink-0"
    >
      {config.backBgUrl && (
        <Image src={config.backBgUrl} alt="Back BG" fill className="object-cover z-0" unoptimized />
      )}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-slate-200/80 border border-slate-300/60 z-30" />

      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#07162c] via-[#0b1e3f] to-[#0f2b5c] text-white pt-6 pb-4 px-6 rounded-b-[28px] shadow-md border-b-2 border-[#F59E0B] z-20">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 p-0.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center">
              {config.logoUrl ? (
                <Image alt="Logo" className="w-8 h-8 object-contain" src={config.logoUrl} width={32} height={32} unoptimized />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center font-bold text-white text-lg">L</div>
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white leading-tight">
                {config.orgName || "BEM FT UNSRI"}
              </h2>
              <p className="text-[9px] font-medium text-amber-300 tracking-wider uppercase">
                Fakultas Teknik Universitas Sriwijaya
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-[8px] font-mono uppercase bg-white/15 px-2 py-0.5 rounded text-white tracking-widest border border-white/20 font-bold whitespace-nowrap inline-block">
              KTA ELEKTRONIK
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 pt-3 pb-5 flex flex-col justify-between z-10">
        <div className="bg-slate-50/95 rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#0b1e3f] text-amber-300 flex items-center justify-center text-[10px] font-bold">
                §
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#07162c]">
                Ketentuan Kartu
              </h4>
            </div>
            <span className="text-[9px] font-mono text-slate-500 font-bold">REV-2026</span>
          </div>
          <ul className="space-y-1.5 text-[9px] text-slate-700 leading-snug font-medium">
            {terms.map((term: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-blue-100 text-[#0b1e3f] text-[8px] font-bold flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact info */}
        <div className="bg-gradient-to-br from-slate-900 via-[#07162c] to-[#0b1e3f] rounded-2xl p-3.5 text-white shadow-sm border border-slate-700 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-amber-300">Kontak Resmi</span>
                <h5 className="text-[11px] font-bold text-white tracking-tight">Sekretariat {config.orgName || "BEM FT UNSRI"}</h5>
              </div>
              <span className="text-[7.5px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                Indralaya & Palembang
              </span>
            </div>
            <div className="space-y-1.5 text-[9px] text-slate-200 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <span className="truncate">{config.orgAddress || "Jl. Raya Prabumulih KM. 32, Ogan Ilir"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <span className="font-mono text-[8.5px] text-slate-100 truncate">{config.orgEmail || "bemftunsri@example.com"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <span className="font-mono text-[8.5px] text-amber-300 truncate">{config.orgInstagram || "@bemftunsri"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barcode & Footer */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[8.5px] font-extrabold text-[#07162c] tracking-wide uppercase">
              Kartu Tanda Anggota (KTA)
            </p>
            <p className="text-[7.5px] text-slate-500 font-medium">
              Valid as official organization membership identification
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex flex-col items-end">
              <div className="h-3.5 flex items-end gap-[1.5px] px-1 bg-white border border-slate-300 rounded">
                <span className="w-[1px] h-3 bg-slate-900" />
                <span className="w-[2px] h-2.5 bg-slate-900" />
                <span className="w-[1px] h-3 bg-slate-900" />
                <span className="w-[3px] h-3 bg-slate-900" />
                <span className="w-[1px] h-2 bg-slate-900" />
                <span className="w-[2px] h-3 bg-slate-900" />
                <span className="w-[1px] h-2.5 bg-slate-900" />
                <span className="w-[3px] h-3 bg-slate-900" />
                <span className="w-[1px] h-2.5 bg-slate-900" />
                <span className="w-[2px] h-3 bg-slate-900" />
                <span className="w-[1px] h-2.5 bg-slate-900" />
              </div>
              <span className="text-[7px] font-mono text-slate-500 mt-0.5">UNSRI-KTA-PVC</span>
            </div>
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
  className = "",
}: IdCardProps) {
  if (scaled) {
    return (
      <div className={`flex flex-wrap gap-8 justify-center lg:justify-start ${className}`}>
        <style>{styles}</style>
        {/* Front preview */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between w-[247px] mb-1 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Sisi Depan</span>
            </div>
            {config.showMemberId !== false && (
              <span className="text-[9px] font-mono text-slate-500">ID: {config.memberPrefix || "BEM-2026-"}0001</span>
            )}
          </div>
          <div className="relative w-[247px] h-[393px]">
            <div className="transform scale-[0.65] origin-top-left">
              <IdCardFront member={member} config={config} elementId={frontId} />
            </div>
          </div>
        </div>

        {/* Back preview */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between w-[247px] mb-1 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0b1e3f]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Sisi Belakang</span>
            </div>
          </div>
          <div className="relative w-[247px] h-[393px]">
            <div className="transform scale-[0.65] origin-top-left">
              <IdCardBack config={config} elementId={backId} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col md:flex-row gap-6 justify-center bg-transparent p-0 ${className}`}>
      <style>{styles}</style>
      <IdCardFront member={member} config={config} elementId={frontId} />
      <IdCardBack config={config} elementId={backId} />
    </div>
  );
}
