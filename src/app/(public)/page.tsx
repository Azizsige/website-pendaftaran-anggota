import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="landing-theme bg-[#f7f9fb] text-[#191c1e] antialiased overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-32 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
        {/* Floating Geometric Shapes (Background) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#10b981]/20 rounded-full blur-3xl opacity-70 animate-pulse"></div>
          <div
            className="absolute top-40 right-20 w-72 h-72 bg-[#d0e1fb]/30 rounded-full blur-3xl opacity-60"
            style={{ animation: "pulse 4s infinite alternate" }}
          ></div>
          <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-[#9ba2bb]/20 rounded-full blur-3xl opacity-50"></div>
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
              Komunitas Profesional
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
            Kami
          </h1>

          {/* Subtitle */}
          <p className="text-lg leading-7 text-[#3c4a42] max-w-2xl mt-4">
            Tingkatkan karir dan koneksi Anda melalui ekosistem digital yang
            dirancang khusus untuk pertumbuhan profesional yang terukur dan
            terarah.
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
              href="/tentang"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-[#bbcabf] text-[#191c1e] font-semibold text-sm hover:bg-[#e0e3e5] transition-all flex items-center justify-center gap-2"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Counter Section (Bento Style) */}
      <section className="py-12 px-6 bg-white relative z-20 -mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stat Card 1 */}
            <div className="bg-[#f7f9fb] border border-[#bbcabf]/20 rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#006c49] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              <div className="p-3 bg-[#10b981]/10 rounded-full text-[#006c49] mb-4">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "32px" }}
                >
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
              <div className="absolute top-0 left-0 w-full h-1 bg-[#505f76] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              <div className="p-3 bg-[#d0e1fb]/20 rounded-full text-[#505f76] mb-4">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "32px" }}
                >
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
              <div className="absolute top-0 left-0 w-full h-1 bg-[#565e74] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              <div className="p-3 bg-[#9ba2bb]/20 rounded-full text-[#565e74] mb-4">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "32px" }}
                >
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

      {/* Keunggulan (Features) Section */}
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
                <span className="material-symbols-outlined">
                  shield_locked
                </span>
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
                Dapatkan Kartu Tanda Anggota (KTA) digital secara langsung
                setelah disetujui, siap digunakan untuk berbagai akses eksklusif.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alur Pendaftaran (Process Stepper) */}
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
            <div className="hidden md:block absolute top-[32px] left-0 w-full h-[2px] bg-[#bbcabf]/30 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-auto text-center">
              <div className="w-16 h-16 rounded-full bg-[#006c49] text-white flex items-center justify-center shadow-md text-2xl font-semibold">
                1
              </div>
              <h4 className="font-semibold text-sm text-[#191c1e]">
                Daftar
              </h4>
              <p className="text-sm text-[#3c4a42] max-w-[150px] hidden md:block">
                Isi formulir online
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-auto text-center">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-[#006c49] text-[#006c49] flex items-center justify-center text-2xl font-semibold">
                2
              </div>
              <h4 className="font-semibold text-sm text-[#191c1e]">
                Verifikasi
              </h4>
              <p className="text-sm text-[#3c4a42] max-w-[150px] hidden md:block">
                Tinjauan dokumen
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-auto text-center">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-[#bbcabf] text-[#505f76] flex items-center justify-center text-2xl font-semibold">
                3
              </div>
              <h4 className="font-semibold text-sm text-[#191c1e]">
                Terima
              </h4>
              <p className="text-sm text-[#3c4a42] max-w-[150px] hidden md:block">
                Konfirmasi persetujuan
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-auto text-center">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-[#bbcabf] text-[#505f76] flex items-center justify-center text-2xl font-semibold">
                4
              </div>
              <h4 className="font-semibold text-sm text-[#191c1e]">
                Akses
              </h4>
              <p className="text-sm text-[#3c4a42] max-w-[150px] hidden md:block">
                Masuk ke dashboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto rounded-2xl p-12 flex flex-col md:flex-row items-center justify-between shadow-lg relative overflow-hidden" style={{ background: "linear-gradient(135deg, #006c49 0%, #006c49 50%, #005236 100%)" }}>
          <div className="relative z-10 flex flex-col gap-4 text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-[32px] leading-[40px] font-semibold text-white tracking-tight">
              Siap Untuk Berkembang Bersama?
            </h2>
            <p className="text-lg leading-7 text-[#4edea3] max-w-xl">
              Bergabunglah hari ini dan nikmati semua manfaat eksklusif yang
              telah menanti Anda di dalam ekosistem MemberHub.
            </p>
          </div>
          <div className="relative z-10">
            <Link
              href="/daftar"
              className="px-8 py-4 rounded-full bg-white text-[#006c49] font-semibold text-sm shadow-md hover:shadow-lg hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              Bergabung Sekarang
              <span className="material-symbols-outlined text-sm">
                rocket_launch
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
