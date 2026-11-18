"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Download, Info, Hourglass } from "lucide-react";

export default function PendaftaranBerhasil() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Confetti Animation Effect
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
    const colors = ['#10b981', '#6ffbbe', '#006c49', '#dae2fd', '#d3e4fe'];
    const particles: Particle[] = [];
    const numConfetti = 100;
    
    for (let i = 0; i < numConfetti; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        const width = Math.random() * 8 + 6;
        const height = Math.random() * 12 + 8;
        confetti.style.width = `${width}px`;
        confetti.style.height = `${height}px`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
        }
        
        container.appendChild(confetti);
        
        particles.push({
            element: confetti,
            x: Math.random() * window.innerWidth,
            y: -20 - Math.random() * 200,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 4 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5,
            opacity: 1,
            life: Math.random() * 120 + 120
        });
    }

    let frame = 0;
    let animationId: number;

    function animateConfetti() {
        frame++;
        let active = false;
        
        particles.forEach(p => {
            if (p.opacity > 0) {
                active = true;
                p.vy += 0.08;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                
                if (frame > p.life) {
                    p.opacity -= 0.02;
                }
                
                p.element.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg)`;
                p.element.style.opacity = Math.max(0, p.opacity).toString();
            }
        });
        
        if (active) {
            animationId = requestAnimationFrame(animateConfetti);
        } else if (container) {
          container.innerHTML = '';
        }
    }
    
    animationId = requestAnimationFrame(animateConfetti);

    return () => {
      cancelAnimationFrame(animationId);
      container.innerHTML = '';
    }
  }, []);

  const handleDownloadRingkasan = () => {
    window.print();
  };

  return (
    <div className="bg-[#f7f9fb] dark:bg-[#0d1412] text-[#191c1e] dark:text-[#eef2f4] min-h-screen flex flex-col relative overflow-hidden font-sans print:bg-white print:text-[#191c1e] print:overflow-visible">
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden print:hidden" ref={containerRef}></div>
      
      <main className="flex-grow flex items-center justify-center p-[16px] md:p-[24px] relative z-10 print:p-0">
        <div className="bg-white dark:bg-[#131d1a] border border-[#006c49]/20 dark:border-[#3c4d46] rounded-[12px] shadow-lg w-full max-w-[640px] p-[24px] md:p-[48px] flex flex-col items-center text-center animate-fade-in-up print:shadow-none print:border-gray-300 print:bg-white">
          
          <div className="w-24 h-24 rounded-full bg-[#10b981]/20 dark:bg-[#0a3326] flex items-center justify-center mb-[16px] border-2 border-[#006c49] dark:border-[#34d399]">
            <CheckCircle2 className="text-[#006c49] dark:text-[#34d399] w-12 h-12" />
          </div>
          
          <h1 className="text-[32px] md:text-[48px] font-bold text-[#191c1e] dark:text-[#eef2f4] mb-[8px] leading-tight tracking-tight">Pendaftaran Berhasil</h1>
          <p className="text-[16px] md:text-[18px] text-[#3c4a42] dark:text-[#cbd6d0] mb-[48px]">
              Terima kasih telah bergabung. Data Anda telah kami terima dengan baik.
          </p>

          <div className="bg-white dark:bg-[#1a2723] rounded-[8px] border border-[#bbcabf] dark:border-[#3c4d46] w-full p-[16px] mb-[24px] text-left shadow-sm print:bg-white print:border-gray-300">
            <h2 className="text-[20px] md:text-[24px] font-semibold text-[#191c1e] dark:text-[#eef2f4] mb-[16px] pb-[4px] border-b border-[#e0e3e5] dark:border-[#3c4d46] print:text-[#191c1e]">Detail Pendaftaran</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <div>
                <p className="text-[14px] font-semibold tracking-wide text-[#3c4a42] dark:text-[#cbd6d0] mb-[4px] print:text-[#3c4a42]">Nomor Registrasi</p>
                <p className="text-[16px] font-medium text-[#191c1e] dark:text-[#eef2f4] print:text-[#191c1e]">REG-20240512-001</p>
              </div>
              <div>
                <p className="text-[14px] font-semibold tracking-wide text-[#3c4a42] dark:text-[#cbd6d0] mb-[4px] print:text-[#3c4a42]">Tanggal</p>
                <p className="text-[16px] font-medium text-[#191c1e] dark:text-[#eef2f4] print:text-[#191c1e]">
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[14px] font-semibold tracking-wide text-[#3c4a42] dark:text-[#cbd6d0] mb-[4px] print:text-[#3c4a42]">Status</p>
                <div className="inline-flex items-center gap-[8px] bg-[#e6e8ea] dark:bg-[#131d1a] px-[10px] py-[4px] rounded-full border border-transparent dark:border-[#3c4d46]">
                  <Hourglass className="text-[#505f76] dark:text-[#cbd6d0] w-4 h-4" />
                  <span className="text-[14px] font-semibold text-[#505f76] dark:text-[#cbd6d0]">Menunggu Verifikasi</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full text-left bg-[#d0e1fb]/30 dark:bg-[#132544]/70 rounded-[8px] p-[16px] mb-[48px] border border-[#b7c8e1] dark:border-[#60a5fa]/35">
            <h3 className="text-[14px] font-semibold text-[#191c1e] dark:text-[#eef2f4] mb-[8px] flex items-center gap-[4px]">
              <Info className="text-[#006c49] dark:text-[#34d399] w-5 h-5" />
              Langkah Selanjutnya
            </h3>
            <p className="text-[16px] text-[#3c4a42] dark:text-[#cbd6d0] mb-[12px]">
                Admin kami akan memverifikasi data Anda. Anda dapat mengecek status pendaftaran Anda secara mandiri menggunakan NIM dan Email yang didaftarkan.
            </p>
            <Link href="/cek-status" className="inline-flex items-center gap-[4px] text-[#006c49] dark:text-[#34d399] font-semibold hover:underline">
              Cek Status Pendaftaran <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-[16px] w-full justify-center print:hidden">
            <Link href="/" className="min-h-[44px] bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white font-semibold text-[14px] py-[8px] px-[24px] rounded-[8px] transition-colors shadow-sm flex items-center justify-center gap-[8px] w-full sm:w-auto cursor-pointer">
              Kembali ke Halaman Utama
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button 
              onClick={handleDownloadRingkasan}
              className="min-h-[44px] bg-transparent hover:bg-[#e0e3e5]/50 dark:hover:bg-[#1a2723] border border-[#6c7a71] dark:border-[#5f736b] text-[#006c49] dark:text-[#34d399] font-semibold text-[14px] py-[8px] px-[24px] rounded-[8px] transition-colors flex items-center justify-center gap-[8px] w-full sm:w-auto cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Unduh Ringkasan
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
