"use client";

import { Download, QrCode, CreditCard } from "lucide-react";

export default function KTAPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Kartu Tanda Anggota</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Lihat dan unduh KTA digital Anda.
        </p>
      </div>

      {/* KTA Card Preview */}
      <div className="card-glass p-0 overflow-hidden">
        <div className="p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <CreditCard size={18} className="text-[var(--primary-light)]" />
            Preview KTA Digital
          </h3>

          {/* Card */}
          <div className="max-w-md mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* Front Side */}
              <div className="bg-gradient-to-br from-[#0a1128] via-[#0f1729] to-[#1a2540] p-6 border border-[var(--border-default)]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center font-bold text-white text-xs">
                      M
                    </div>
                    <span className="text-sm font-bold text-white">
                      MemberHub
                    </span>
                  </div>
                  <span className="text-xs text-[var(--primary-light)] font-semibold px-3 py-1 rounded-full bg-[rgba(15,157,110,0.15)] border border-[rgba(15,157,110,0.2)]">
                    AKTIF
                  </span>
                </div>

                {/* Photo + Info */}
                <div className="flex gap-5">
                  <div className="w-20 h-24 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white text-xl font-bold shrink-0">
                    AP
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
                        Nama Lengkap
                      </p>
                      <p className="text-sm font-semibold text-white">
                        Andi Pratama
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
                        Nomor Induk Anggota
                      </p>
                      <p className="text-sm font-mono font-bold text-[var(--primary-light)]">
                        IDN-12345678
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
                        Berlaku Hingga
                      </p>
                      <p className="text-sm text-white">12 Desember 2027</p>
                    </div>
                  </div>
                </div>

                {/* Bottom */}
                <div className="flex items-end justify-between mt-6 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="space-y-1">
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      NIK: 3275012345678901
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      Diterbitkan: 15 Januari 2024
                    </p>
                  </div>
                  {/* QR Code Placeholder */}
                  <div className="w-16 h-16 rounded-lg bg-white p-1.5 flex items-center justify-center">
                    <QrCode size={44} className="text-[var(--bg-deep)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Actions */}
        <div className="bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] p-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button className="btn-primary inline-flex items-center gap-2 w-full sm:w-auto justify-center">
            <Download size={16} />
            Unduh PDF
          </button>
          <button className="btn-secondary inline-flex items-center gap-2 w-full sm:w-auto justify-center">
            <Download size={16} />
            Unduh PNG
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 rounded-xl bg-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.1)]">
        <p className="text-sm text-[var(--text-secondary)]">
          <strong className="text-white">Catatan:</strong> KTA digital ini
          memiliki QR Code unik yang dapat diverifikasi. Tunjukkan KTA ini saat
          diperlukan sebagai bukti keanggotaan yang sah.
        </p>
      </div>
    </div>
  );
}
