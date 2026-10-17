import React from "react";

export function LandingSteps() {
  return (
    <section className="py-12 px-6 bg-[#f2f4f6]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl leading-8 font-semibold text-[#191c1e] mb-2">
            Alur Pendaftaran Sederhana
          </h2>
          <p className="text-base leading-6 text-[#3c4a42]">
            Hanya butuh beberapa langkah mudah untuk menjadi bagian dari kami.
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0 max-w-4xl mx-auto">
          {/* Track Line */}
          <div className="hidden md:block absolute top-[32px] left-0 w-full h-[2px] bg-[#bbcabf]/30 z-0" />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-auto text-center">
            <div className="w-16 h-16 rounded-full bg-[#006c49] text-white flex items-center justify-center shadow-md text-2xl font-semibold">
              1
            </div>
            <h4 className="font-semibold text-sm text-[#191c1e]">Daftar</h4>
            <p className="text-sm text-[#3c4a42] max-w-[150px] hidden md:block">
              Isi formulir online
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-auto text-center">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-[#006c49] text-[#006c49] flex items-center justify-center text-2xl font-semibold">
              2
            </div>
            <h4 className="font-semibold text-sm text-[#191c1e]">Verifikasi</h4>
            <p className="text-sm text-[#3c4a42] max-w-[150px] hidden md:block">
              Tinjauan dokumen
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-auto text-center">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-[#bbcabf] text-[#505f76] flex items-center justify-center text-2xl font-semibold">
              3
            </div>
            <h4 className="font-semibold text-sm text-[#191c1e]">Terima</h4>
            <p className="text-sm text-[#3c4a42] max-w-[150px] hidden md:block">
              Konfirmasi persetujuan
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-auto text-center">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-[#bbcabf] text-[#505f76] flex items-center justify-center text-2xl font-semibold">
              4
            </div>
            <h4 className="font-semibold text-sm text-[#191c1e]">Akses</h4>
            <p className="text-sm text-[#3c4a42] max-w-[150px] hidden md:block">
              Masuk ke dashboard
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
