import React from "react";

export function LandingFeatures() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl leading-8 font-semibold text-[#191c1e] mb-2">
            Mengapa Memilih Kami?
          </h2>
          <p className="text-base leading-6 text-[#3c4a42] max-w-2xl mx-auto">
            Platform kami dirancang untuk memberikan pengalaman terbaik dari
            awal pendaftaran hingga aktivitas keanggotaan sehari-hari.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-[#f2f4f6] rounded-xl p-6 border border-[#bbcabf]/10 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#006c49] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <h3 className="text-[20px] leading-7 font-semibold text-[#191c1e]">
              Proses Cepat
            </h3>
            <p className="text-base leading-6 text-[#3c4a42]">
              Pendaftaran instan tanpa birokrasi rumit. Sistem kami
              mengotomatisasi verifikasi awal untuk mempercepat langkah Anda
              bergabung.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#f2f4f6] rounded-xl p-6 border border-[#bbcabf]/10 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#006c49] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined">shield_locked</span>
            </div>
            <h3 className="text-[20px] leading-7 font-semibold text-[#191c1e]">
              Aman &amp; Terpercaya
            </h3>
            <p className="text-base leading-6 text-[#3c4a42]">
              Data privasi Anda dilindungi dengan enkripsi tingkat bank. Kami
              memprioritaskan keamanan informasi setiap anggota komunitas.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#f2f4f6] rounded-xl p-6 border border-[#bbcabf]/10 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#10b981] flex items-center justify-center text-[#00422b] shadow-sm">
              <span className="material-symbols-outlined">badge</span>
            </div>
            <h3 className="text-[20px] leading-7 font-semibold text-[#191c1e]">
              KTA Digital
            </h3>
            <p className="text-base leading-6 text-[#3c4a42]">
              Dapatkan Kartu Tanda Anggota (KTA) digital secara langsung setelah
              disetujui, siap digunakan untuk berbagai akses eksklusif.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
