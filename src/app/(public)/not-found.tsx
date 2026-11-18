import Link from "next/link";

export default function PublicNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-[#131d1a] rounded-2xl shadow-sm border border-slate-200 dark:border-[#3c4d46] p-8 space-y-4">
        <h1 className="text-6xl font-black text-[#006c49] dark:text-[#34d399]">404</h1>
        <h2 className="text-xl font-bold text-slate-800 dark:text-[#eef2f4]">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-slate-600 dark:text-[#cbd6d0]">
          Halaman publik yang Anda cari tidak tersedia atau tautan telah kedaluwarsa.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg bg-[#006c49] dark:bg-[#057a55] text-white text-sm font-medium hover:bg-[#005236] dark:hover:bg-[#046c4e] transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
