import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background text-foreground">
      <h1 className="text-6xl font-bold text-[#006c49] dark:text-[#34d399] mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Halaman Tidak Ditemukan</h2>
      <p className="text-on-surface-variant mb-8 max-w-md">
        Halaman yang Anda cari mungkin telah dihapus, dipindahkan, atau memang tidak pernah ada.
      </p>
      <Button asChild>
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
