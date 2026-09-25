"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSent(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[var(--bg-deep)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(15,157,110,0.1)_0%,transparent_60%)]" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-8 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Login
        </Link>

        <div className="glass p-8 sm:p-10 rounded-2xl">
          {isSent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-[var(--success)]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">
                Email Terkirim!
              </h1>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Kami telah mengirim tautan reset password ke{" "}
                <span className="text-white font-medium">{email}</span>. Silakan
                periksa inbox email Anda.
              </p>
              <Link href="/login" className="btn-primary inline-flex items-center gap-2">
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center mb-6">
                <Mail size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Lupa Password?
              </h1>
              <p className="text-[var(--text-secondary)] text-sm mb-8">
                Masukkan email Anda dan kami akan mengirimkan tautan untuk
                mereset password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="reset-email" className="input-label">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="input-field"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Kirim Tautan Reset"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
