import React from "react";

export function LandingStats() {
  return (
    <section className="py-12 px-6 bg-white relative z-20 -mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stat Card 1 */}
          <div className="bg-[#f7f9fb] border border-[#bbcabf]/20 rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#006c49] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            <div className="p-3 bg-[#10b981]/10 rounded-full text-[#006c49] mb-4">
              <span className="material-symbols-outlined text-[32px]">
                groups
              </span>
            </div>
            <h3 className="text-[32px] leading-[40px] font-semibold text-[#191c1e] tracking-tight">
              5.000+
            </h3>
            <p className="font-semibold text-sm text-[#505f76] mt-1 uppercase tracking-wider">
              Total Anggota
            </p>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-[#f7f9fb] border border-[#bbcabf]/20 rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#505f76] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            <div className="p-3 bg-[#d0e1fb]/20 rounded-full text-[#505f76] mb-4">
              <span className="material-symbols-outlined text-[32px]">
                how_to_reg
              </span>
            </div>
            <h3 className="text-[32px] leading-[40px] font-semibold text-[#191c1e] tracking-tight">
              120+
            </h3>
            <p className="font-semibold text-sm text-[#505f76] mt-1 uppercase tracking-wider">
              Pendaftar Hari Ini
            </p>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-[#f7f9fb] border border-[#bbcabf]/20 rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#565e74] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            <div className="p-3 bg-[#9ba2bb]/20 rounded-full text-[#565e74] mb-4">
              <span className="material-symbols-outlined text-[32px]">
                forum
              </span>
            </div>
            <h3 className="text-[32px] leading-[40px] font-semibold text-[#191c1e] tracking-tight">
              25+
            </h3>
            <p className="font-semibold text-sm text-[#505f76] mt-1 uppercase tracking-wider">
              Komunitas Aktif
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
