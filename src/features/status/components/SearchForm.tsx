"use client";

import { useRef, useEffect, useState } from "react";
import { AlertCircle, IdCard, Mail, Search } from "lucide-react";
import { useCekStatusStore } from "@/store/useCekStatusStore";
import { checkRegistrationStatus } from "@/actions/status-actions";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Turnstile } from "@marsidev/react-turnstile";


export const SearchForm = () => {
  const { nim, email, isLoading, error, setNim, setEmail, setIsLoading, setError, setStatusData } = useCekStatusStore();
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
      const result = await checkRegistrationStatus(nim, email, turnstileToken);
      if (result.success && result.data) {
        setStatusData(result.data);
      } else {
        setError(result.message || "Data tidak ditemukan. Silakan periksa kembali NIM dan Email Anda.");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-5 animate-fade-in">
      {error && (
        <div role="alert" className="bg-red-50 text-red-700 dark:bg-[#3b1214] dark:text-[#fca5a5] p-4 rounded-lg text-sm border border-red-200 dark:border-[#f87171]/35 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nim" className="text-[14px] font-semibold text-[#191c1e] dark:text-[#eef2f4] ml-1">
          Nomor Induk Mahasiswa (NIM)
        </label>
        <div className="relative">
          <IdCard className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#74777f] dark:text-[#94a89e]" aria-hidden="true" />
          <input
            id="nim"
            type="text"
            ref={nimInputRef}
            maxLength={15}
            value={nim}
            onChange={(e) => setNim(e.target.value.replace(/\D/g, ""))}
            disabled={isLoading}
            placeholder="Contoh: 09021282126xxx"
            className="w-full min-h-[44px] pl-10 pr-4 py-[12px] bg-white dark:bg-[#1a2723] border border-[#bbcabf] dark:border-[#5f736b] rounded-lg text-[#191c1e] dark:text-[#eef2f4] placeholder:text-[#6c7a71] dark:placeholder:text-[#94a89e] focus:outline-none focus:ring-2 focus:ring-[#006c49]/20 focus:border-[#006c49] dark:focus:border-[#34d399] dark:focus:ring-[#34d399]/20 transition-all disabled:opacity-60 disabled:bg-slate-50 dark:disabled:bg-[#131d1a]"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[14px] font-semibold text-[#191c1e] dark:text-[#eef2f4] ml-1">
          Email Pendaftaran
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#74777f] dark:text-[#94a89e]" aria-hidden="true" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase().replace(/\s/g, ''))}
            disabled={isLoading}
            placeholder="nama@contoh.com"
            className="w-full min-h-[44px] pl-10 pr-4 py-[12px] bg-white dark:bg-[#1a2723] border border-[#bbcabf] dark:border-[#5f736b] rounded-lg text-[#191c1e] dark:text-[#eef2f4] placeholder:text-[#6c7a71] dark:placeholder:text-[#94a89e] focus:outline-none focus:ring-2 focus:ring-[#006c49]/20 focus:border-[#006c49] dark:focus:border-[#34d399] dark:focus:ring-[#34d399]/20 transition-all disabled:opacity-60 disabled:bg-slate-50 dark:disabled:bg-[#131d1a]"
            required
          />
        </div>
      </div>

      <div className="w-full flex justify-center mt-2">
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
        className="mt-4 w-full min-h-[44px] cursor-pointer bg-[#006c49] dark:bg-[#057a55] text-white font-semibold py-[12px] rounded-lg hover:bg-[#005236] dark:hover:bg-[#046c4e] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Cari Data
            <Search className="h-[18px] w-[18px]" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
};
