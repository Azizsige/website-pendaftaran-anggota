"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isUnauthorized =
    error.name === "UnauthorizedError" ||
    error.message?.includes("login terlebih dahulu") ||
    error.message?.includes("Sesi tidak valid");

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="max-w-md w-full bg-surface-container-lowest dark:bg-[#131d1a] border border-outline-variant/30 dark:border-[#3c4d46] rounded-2xl p-8 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-[#3b1214] text-red-700 dark:text-[#fca5a5] flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-on-surface dark:text-[#eef2f4] mb-2">
          {isUnauthorized ? "Sesi Masuk Berakhir" : "Terjadi Kesalahan di Panel Admin"}
        </h2>
        <p className="text-sm text-on-surface-variant dark:text-[#cbd6d0] mb-6">
          {isUnauthorized
            ? "Sesi akun Anda telah berakhir atau tidak ditemukan. Silakan masuk kembali untuk melanjutkan."
            : "Gagal memuat data administrasi. Anda dapat mencoba memuat ulang komponen atau kembali ke dashboard."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isUnauthorized ? (
            <Button
              onClick={async () => {
                await signOut({ redirect: false, callbackUrl: "/login" });
                window.location.assign("/login");
              }}
              className="w-full sm:w-auto"
            >
              Masuk Kembali
            </Button>
          ) : (
            <>
              <Button
                onClick={() => reset()}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Coba Lagi
              </Button>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/admin">Kembali ke Overview</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
