import React from "react";
import Link from "next/link";

interface LandingHeroProps {
  orgName: string;
  orgDesc: string;
}

export function LandingHero({ orgName, orgDesc }: LandingHeroProps) {
  return (
    <section className="relative pt-12 pb-32 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
      {/* Floating Geometric Shapes (Background) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#10b981]/20 rounded-full blur-3xl opacity-70 animate-pulse" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-[#d0e1fb]/30 rounded-full blur-3xl opacity-60 animate-[pulse_4s_infinite_alternate]" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-[#9ba2bb]/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto text-center flex flex-col items-center gap-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eceef0] border border-[#bbcabf]/30 text-[#006c49] font-semibold text-sm mb-4 shadow-sm">
          <span className="material-symbols-outlined text-sm">verified</span>
          <span>Platform Manajemen Keanggotaan Terpercaya</span>
        </div>

        {/* Heading */}
        <h1 className="text-[48px] leading-[56px] font-bold text-[#191c1e] max-w-4xl tracking-tight">
          Bergabung dengan{" "}
          <span className="text-[#006c49] relative inline-block">
            {orgName}
            <svg
              className="absolute w-full h-3 -bottom-1 left-0 text-[#6ffbbe] opacity-50"
              preserveAspectRatio="none"
              viewBox="0 0 100 10"
            >
              <path
                d="M0 5 Q 50 10 100 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          </span>{" "}
        </h1>

        {/* Subtitle */}
        <p className="text-lg leading-7 text-[#3c4a42] max-w-2xl mt-4">
          {orgDesc}
        </p>

        {/* CTA Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
          <Link
            href="/daftar"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#006c49] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:bg-[#00422b] transition-all flex items-center justify-center gap-2"
          >
            Daftar Sekarang
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
          <Link
            href="/cek-status"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-[#bbcabf] text-[#191c1e] font-semibold text-sm hover:bg-[#e0e3e5] transition-all flex items-center justify-center gap-2"
          >
            Cek Status
          </Link>
        </div>
      </div>
    </section>
  );
}
