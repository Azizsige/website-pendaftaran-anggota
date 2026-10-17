import React from "react";
import Link from "next/link";

interface LandingCtaProps {
  orgName: string;
}

export function LandingCta({ orgName }: LandingCtaProps) {
  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto rounded-2xl p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg relative overflow-hidden bg-gradient-to-br from-[#006c49] via-[#006c49] to-[#005236]">
        <div className="relative z-10 flex flex-col gap-4 text-center md:text-left w-full md:w-2/3">
          <h2 className="text-[32px] leading-[40px] font-semibold text-white tracking-tight">
            Siap Untuk Berkembang Bersama?
          </h2>
          <p className="text-lg leading-7 text-[#4edea3]">
            Bergabunglah hari ini dan nikmati semua manfaat eksklusif yang telah
            menanti Anda di dalam ekosistem {orgName}.
          </p>
        </div>
        <div className="relative z-10 shrink-0 w-full md:w-auto flex justify-center md:justify-end">
          <Link
            href="/daftar"
            className="px-8 py-4 rounded-full bg-white text-[#006c49] font-semibold text-sm shadow-md hover:shadow-lg hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Bergabung Sekarang
            <span className="material-symbols-outlined text-sm">
              rocket_launch
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
