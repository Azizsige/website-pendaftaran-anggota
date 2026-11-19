"use client";

import { useRef, useEffect, useState } from "react";
import { AlertCircle, IdCard, Loader2, Mail, Search } from "lucide-react";
import { useCekStatusStore } from "@/store/useCekStatusStore";
import { checkRegistrationStatus } from "@/actions/status-actions";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Turnstile } from "@marsidev/react-turnstile";

const MIN_CHECK_LOADING_MS = 2300;

export const SearchForm = () => {
  const { nim, email, isLoading, error, setNim, setEmail, setIsLoading, setError, setStatusData } =
    useCekStatusStore();
  const { resolvedTheme } = useTheme();
  const nimInputRef = useRef<HTMLInputElement>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    nimInputRef.current?.focus();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nim || !email) return;
    if (!turnstileToken) {
      setError("Silakan selesaikan validasi keamanan CAPTCHA.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [result] = await Promise.all([
        checkRegistrationStatus(nim, email, turnstileToken),
        new Promise((resolve) => window.setTimeout(resolve, MIN_CHECK_LOADING_MS)),
      ]);
      if (result.success && result.data) {
        setStatusData(result.data);
      } else {
        setError(
          result.message || "Data tidak ditemukan. Silakan periksa kembali NIM dan Email Anda."
        );
      }
    } catch {
      setError("Terjadi kesalahan sistem. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="py-10 px-4 flex flex-col items-center text-center gap-4"
      >
        <div className="w-14 h-14 rounded-full bg-[#e6f4ee] border border-[#006c49]/25 dark:bg-[#0f7a58]/15 dark:border-[#34d399]/35 flex items-center justify-center">
          <Loader2
            className="h-7 w-7 text-[#006c49] dark:text-[#34d399] spinner-essential"
            aria-hidden="true"
          />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <p className="text-[15px] font-bold text-[#191c1e] dark:text-[#e9f1ee]">
            Memeriksa status pendaftaran...
          </p>
          <p className="text-[13px] leading-relaxed text-[#3c4a42] dark:text-[#9fb3ac]">
            Sedang mencocokkan NIM{" "}
            <span className="font-mono font-semibold text-[#005236] dark:text-[#34d399]">
              {nim}
            </span>{" "}
            dan email pada basis data resmi organisasi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-4 animate-fade-in">
      {error && (
        <div
          role="alert"
          className="bg-[#fef2f2] text-[#991b1b] dark:bg-[#f87171]/10 dark:text-[#f87171] p-3.5 rounded-[10px] text-[13px] border border-[#ba1a1a]/30 dark:border-[#f87171]/40 flex items-start gap-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="nim"
          className="text-[13px] font-semibold text-[#191c1e] dark:text-[#e9f1ee]"
        >
          Nomor Induk Mahasiswa (NIM)
        </label>
        <div className="relative">
          <IdCard
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4b5850] dark:text-[#9fb3ac]"
            aria-hidden="true"
          />
          <input
            id="nim"
            type="text"
            inputMode="numeric"
            ref={nimInputRef}
            maxLength={15}
            value={nim}
            onChange={(e) => setNim(e.target.value.replace(/\D/g, ""))}
            disabled={isLoading}
            placeholder="Contoh: 231402011"
            className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#1a2824] border border-[#5c6b62] dark:border-[#6c847b] rounded-[10px] text-[16px] sm:text-[14px] font-mono text-[#191c1e] dark:text-[#e9f1ee] placeholder:text-[#5c6b62] dark:placeholder:text-[#8aa098] focus:outline-none focus:ring-[3px] focus:ring-[#006c49]/25 focus:border-[#006c49] dark:focus:border-[#34d399] dark:focus:ring-[#34d399]/25 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-[13px] font-semibold text-[#191c1e] dark:text-[#e9f1ee]"
        >
          Email Pendaftaran
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4b5850] dark:text-[#9fb3ac]"
            aria-hidden="true"
          />
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase().replace(/\s/g, ""))}
            disabled={isLoading}
            placeholder="nama@email.com"
            className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#1a2824] border border-[#5c6b62] dark:border-[#6c847b] rounded-[10px] text-[16px] sm:text-[14px] text-[#191c1e] dark:text-[#e9f1ee] placeholder:text-[#5c6b62] dark:placeholder:text-[#8aa098] focus:outline-none focus:ring-[3px] focus:ring-[#006c49]/25 focus:border-[#006c49] dark:focus:border-[#34d399] dark:focus:ring-[#34d399]/25 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            required
          />
        </div>
      </div>

      <div className="w-full flex justify-center pt-1">
        <Turnstile
          key={resolvedTheme}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
          options={{ theme: resolvedTheme }}
          onSuccess={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken("")}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full min-h-[44px] cursor-pointer bg-[#006c49] hover:bg-[#005236] dark:bg-[#0f7a58] dark:hover:bg-[#0c6a4d] text-white font-bold text-[14px] py-2.5 px-4 rounded-[10px] transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#006c49]/40 dark:focus-visible:ring-[#34d399]/50 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span>Cari status pendaftaran</span>
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
};
