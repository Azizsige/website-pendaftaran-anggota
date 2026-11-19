"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check, Download, Hourglass, Info } from "lucide-react";

interface RegistrationSuccessClientProps {
  registrationNumber: string;
  formattedDate: string;
}

export function RegistrationSuccessClient({
  registrationNumber,
  formattedDate,
}: RegistrationSuccessClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    interface Particle {
      element: HTMLDivElement;
      x: number;
      y: number;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      life: number;
    }

    const colors = ["#10b981", "#34d399", "#006c49", "#7cb2ff", "#fbbf24"];
    const particles: Particle[] = [];
    const numConfetti = 80;

    for (let i = 0; i < numConfetti; i++) {
      const confetti = document.createElement("div");
      confetti.style.position = "absolute";
      const width = Math.random() * 8 + 6;
      const height = Math.random() * 12 + 8;
      confetti.style.width = `${width}px`;
      confetti.style.height = `${height}px`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      if (Math.random() > 0.5) {
        confetti.style.borderRadius = "50%";
      }

      container.appendChild(confetti);

      particles.push({
        element: confetti,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 180,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        opacity: 1,
        life: Math.random() * 110 + 110,
      });
    }

    let frame = 0;
    let animationId = 0;

    function animateConfetti() {
      frame++;
      let active = false;

      particles.forEach((p) => {
        if (p.opacity > 0) {
          active = true;
          p.vy += 0.08;
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;

          if (frame > p.life) {
            p.opacity -= 0.025;
          }

          p.element.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg)`;
          p.element.style.opacity = Math.max(0, p.opacity).toString();
        }
      });

      if (active) {
        animationId = requestAnimationFrame(animateConfetti);
      } else if (container) {
        container.innerHTML = "";
      }
    }

    animationId = requestAnimationFrame(animateConfetti);

    return () => {
      cancelAnimationFrame(animationId);
      container.innerHTML = "";
    };
  }, []);

  const handleDownloadRingkasan = () => {
    window.print();
  };

  return (
    <div className="min-h-[calc(100dvh-68px)] bg-[#f7f9fb] dark:bg-[#0c1311] text-[#191c1e] dark:text-[#e9f1ee] flex flex-col relative overflow-x-clip font-sans print:min-h-0 print:bg-white print:text-[#191c1e]">
      <div
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden print:hidden"
        ref={containerRef}
        aria-hidden="true"
      />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 print:p-0">
        <section className="w-full max-w-[880px] bg-white dark:bg-[#121c19] border border-[#5c6b62]/25 dark:border-[#2a3b36] rounded-[16px] shadow-sm overflow-hidden flex flex-col print:shadow-none print:border-gray-300 print:bg-white">
          <div className="grid grid-cols-1 md:grid-cols-[5fr_6fr] gap-y-5 md:gap-y-0 md:gap-x-8 p-5 sm:p-7">
            {/* Centered Hero Column */}
            <div className="flex flex-col items-center justify-center text-center gap-3 py-2">
              <div
                aria-hidden="true"
                className="w-[54px] h-[54px] rounded-full border-2 border-[#006c49] dark:border-[#34d399] bg-[#e6f4ee] dark:bg-[#34d399]/10 text-[#006c49] dark:text-[#34d399] flex items-center justify-center shrink-0"
              >
                <Check className="w-[26px] h-[26px]" strokeWidth={2.5} />
              </div>
              <h1 className="font-display text-[22px] sm:text-[24px] font-bold leading-tight text-[#191c1e] dark:text-[#e9f1ee] print:text-[#191c1e]">
                Pendaftaran berhasil
              </h1>
              <p className="text-[14px] leading-[1.55] text-[#3c4a42] dark:text-[#9fb3ac] max-w-[290px] print:text-[#3c4a42]">
                Terima kasih telah bergabung. Data Anda telah kami terima dengan baik.
              </p>
            </div>

            {/* Right Detail & Next Step Column */}
            <div className="flex flex-col gap-3.5 min-w-0 pt-5 border-t border-[#5c6b62]/20 dark:border-[#2a3b36] md:pt-0 md:border-t-0 md:pl-8 md:border-l">
              <section>
                <h2 className="text-[13px] font-bold text-[#006c49] dark:text-[#34d399] mb-2.5 print:text-[#006c49]">
                  Detail pendaftaran
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 p-3.5 rounded-[12px] bg-[#f7f9fb] dark:bg-[#1a2824] border border-[#5c6b62]/20 dark:border-[#2a3b36] print:bg-white print:border-gray-300">
                  <div className="min-w-0">
                    <dt className="text-[12px] text-[#4b5850] dark:text-[#9fb3ac] mb-0.5 print:text-[#4b5850]">
                      Nomor registrasi
                    </dt>
                    <dd className="text-[14px] font-bold font-mono text-[#191c1e] dark:text-[#e9f1ee] break-words print:text-[#191c1e]">
                      {registrationNumber}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[12px] text-[#4b5850] dark:text-[#9fb3ac] mb-0.5 print:text-[#4b5850]">
                      Tanggal
                    </dt>
                    <dd className="text-[14px] font-bold text-[#191c1e] dark:text-[#e9f1ee] break-words print:text-[#191c1e]">
                      {formattedDate}
                    </dd>
                  </div>
                  <div className="sm:col-span-2 min-w-0">
                    <dt className="text-[12px] text-[#4b5850] dark:text-[#9fb3ac] mb-1 print:text-[#4b5850]">
                      Status
                    </dt>
                    <dd>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12.5px] font-bold text-[#92400e] bg-[#fef3c7] border border-[#f59e0b]/45 dark:text-[#fbbf24] dark:bg-[#fbbf24]/10 dark:border-[#fbbf24]/40">
                        <Hourglass className="w-[13px] h-[13px]" aria-hidden="true" />
                        <span>Menunggu verifikasi</span>
                      </span>
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="p-3.5 rounded-[12px] bg-[#eff6ff] dark:bg-[#3b82f6]/10 border border-[#1d4ed8]/25 dark:border-[#60a5fa]/35 flex flex-col gap-1.5 print:bg-white print:border-gray-300">
                <h3 className="flex items-center gap-1.5 text-[13px] font-bold text-[#1e40af] dark:text-[#7cb2ff] print:text-[#1e40af]">
                  <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Langkah selanjutnya</span>
                </h3>
                <p className="text-[13px] leading-[1.5] text-[#1e3a5f] dark:text-[#e9f1ee] print:text-[#3c4a42]">
                  Admin kami akan memverifikasi data Anda. Cek status pendaftaran kapan saja dengan NIM dan email yang didaftarkan.
                </p>
                <Link
                  href="/cek-status"
                  className="inline-flex items-center gap-1.5 w-fit min-h-[36px] text-[13px] font-bold text-[#005236] dark:text-[#34d399] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] rounded print:hidden"
                >
                  <span>Cek status pendaftaran</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </section>
            </div>
          </div>

          <footer className="px-5 sm:px-7 py-3 border-t border-[#5c6b62]/20 dark:border-[#2a3b36] bg-[#f7f9fb]/70 dark:bg-[#121c19] flex flex-col-reverse sm:flex-row justify-end gap-2.5 print:hidden">
            <button
              type="button"
              onClick={handleDownloadRingkasan}
              className="min-h-[44px] w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-4.5 py-2 rounded-[10px] border border-[#5c6b62] dark:border-[#3b524b] bg-transparent hover:border-[#006c49] dark:hover:border-[#34d399] text-[#191c1e] dark:text-[#e9f1ee] font-bold text-[13.5px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#006c49]/40 dark:focus-visible:ring-[#34d399]/50 transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Unduh ringkasan</span>
            </button>
            <Link
              href="/"
              className="min-h-[44px] w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2 rounded-[10px] bg-[#006c49] hover:bg-[#005236] dark:bg-[#0f7a58] dark:hover:bg-[#0c6a4d] text-white font-bold text-[13.5px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#006c49]/40 dark:focus-visible:ring-[#34d399]/50 transition-colors"
            >
              <span>Kembali ke halaman utama</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </footer>
        </section>
      </main>
    </div>
  );
}
