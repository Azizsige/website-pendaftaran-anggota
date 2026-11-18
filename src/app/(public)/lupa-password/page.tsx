import Link from "next/link";

export default function LupaPasswordPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="max-w-md w-full rounded-2xl border border-[#bbcabf] dark:border-[#3c4d46] bg-white dark:bg-[#131d1a] p-6 sm:p-8 text-center space-y-4">
        <h1 className="font-display text-xl font-bold text-[#191c1e] dark:text-[#eef2f4]">
          Lupa Kata Sandi
        </h1>
        <p className="text-sm text-[#3c4a42] dark:text-[#cbd6d0] leading-relaxed">
          Fitur pengaturan ulang kata sandi mandiri belum tersedia. Hubungi pengurus organisasi apabila mengalami kendala akses.
        </p>
        <Link
          href="/login"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#006c49] dark:bg-[#057a55] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#005236] dark:hover:bg-[#046c4e] transition-colors"
        >
          Kembali ke Halaman Masuk
        </Link>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Lupa Password",
};
