import Link from "next/link";

export default function PublicNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-4">
        <h1 className="text-6xl font-black text-emerald-600">404</h1>
        <h2 className="text-xl font-bold text-slate-800">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-slate-600">
          Halaman publik yang Anda cari tidak tersedia atau tautan telah kedaluwarsa.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
