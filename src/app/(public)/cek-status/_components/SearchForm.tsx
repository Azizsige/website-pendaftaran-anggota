import { useRef, useEffect, useState } from "react";
import { useCekStatusStore } from "@/store/useCekStatusStore";
import { checkRegistrationStatus } from "@/app/actions/status-actions";
import { Turnstile } from "@marsidev/react-turnstile";


export const SearchForm = () => {
  const { nim, email, isLoading, error, setNim, setEmail, setIsLoading, setError, setStatusData } = useCekStatusStore();
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
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100 flex gap-2">
          <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nim" className="text-[14px] font-semibold text-[#191c1e] ml-1">
          Nomor Induk Mahasiswa (NIM)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#74777f] text-[20px]">
            badge
          </span>
          <input
            id="nim"
            type="text"
            ref={nimInputRef}
            maxLength={15}
            value={nim}
            onChange={(e) => setNim(e.target.value.replace(/\D/g, ""))}
            disabled={isLoading}
            placeholder="Contoh: 09021282126xxx"
            className="w-full pl-10 pr-4 py-[12px] bg-white border border-[#bbcabf] rounded-lg text-[#191c1e] placeholder:text-[#74777f] focus:outline-none focus:ring-2 focus:ring-[#006c49]/20 focus:border-[#006c49] transition-all disabled:opacity-60 disabled:bg-slate-50"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[14px] font-semibold text-[#191c1e] ml-1">
          Email Pendaftaran
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#74777f] text-[20px]">
            mail
          </span>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase().replace(/\s/g, ''))}
            disabled={isLoading}
            placeholder="nama@contoh.com"
            className="w-full pl-10 pr-4 py-[12px] bg-white border border-[#bbcabf] rounded-lg text-[#191c1e] placeholder:text-[#74777f] focus:outline-none focus:ring-2 focus:ring-[#006c49]/20 focus:border-[#006c49] transition-all disabled:opacity-60 disabled:bg-slate-50"
            required
          />
        </div>
      </div>

      <div className="w-full flex justify-center mt-2">
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
          onSuccess={(token) => setTurnstileToken(token)}
        />
      </div>

      <button 
        type="submit" 
        disabled={isLoading} 
        className="mt-4 w-full bg-[#006c49] text-white font-semibold py-[12px] rounded-lg hover:bg-[#005236] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Cari Data
            <span className="material-symbols-outlined text-[18px]">search</span>
          </>
        )}
      </button>
    </form>
  );
};
