import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="max-w-md w-full bg-surface-container-lowest dark:bg-[#131d1a] border border-outline-variant/30 dark:border-[#3c4d46] rounded-2xl p-8 shadow-sm">
        <h1 className="text-5xl font-black text-primary dark:text-[#34d399] mb-2">404</h1>
        <h2 className="text-xl font-bold text-on-surface dark:text-[#eef2f4] mb-2">Menu Admin Tidak Ditemukan</h2>
        <p className="text-sm text-on-surface-variant dark:text-[#cbd6d0] mb-6">
          Halaman atau sumber daya admin yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <Button asChild>
          <Link href="/admin">Kembali ke Overview Admin</Link>
        </Button>
      </div>
    </div>
  );
}
