"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  QrCode,
  RefreshCw,
  Search,
  ShieldAlert,
  User,
} from "lucide-react";

import { MEMBER_STATUS } from "@/lib/constants/status";
import { DatabasePausedScreen } from "@/components/system/DatabasePausedScreen";
import { verifyKtaByNim, type VerifyKtaResult } from "../actions";

interface VerifikasiClientProps {
  initialRawNim: string;
  orgName: string;
  orgEmail?: string;
}

const MIN_LOADING_MS = 500;

export function VerifikasiClient({
  initialRawNim,
  orgName: initialOrgName,
  orgEmail,
}: VerifikasiClientProps) {
  const initialCleanNim = initialRawNim.replace(/\D/g, "");
  const [inputNim, setInputNim] = useState(initialCleanNim || initialRawNim);
  const [activeQueryNim, setActiveQueryNim] = useState(initialCleanNim || initialRawNim);
  const [isLoading, setIsLoading] = useState(Boolean(initialRawNim));
  const [inputError, setInputError] = useState("");
  const [result, setResult] = useState<VerifyKtaResult | null>(null);

  const requestIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const runVerification = useCallback(
    async (rawTarget: string) => {
      const trimmed = rawTarget.trim();
      const cleaned = trimmed.replace(/\D/g, "");

      if (!trimmed) {
        requestIdRef.current += 1;
        setIsLoading(false);
        setActiveQueryNim("");
        setResult({ state: "EMPTY", orgName: initialOrgName });
        return;
      }

      const currentRequestId = ++requestIdRef.current;
      setInputError("");
      setActiveQueryNim(cleaned || trimmed);
      setIsLoading(true);

      try {
        const [verificationResult] = await Promise.all([
          verifyKtaByNim(trimmed),
          new Promise((resolve) => window.setTimeout(resolve, MIN_LOADING_MS)),
        ]);

        if (requestIdRef.current !== currentRequestId) return;
        setResult(verificationResult);
      } catch {
        if (requestIdRef.current !== currentRequestId) return;
        setResult({
          state: "ERROR",
          orgName: initialOrgName,
          message: "Terjadi gangguan koneksi saat memverifikasi KTA. Silakan coba lagi.",
        });
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false);
        }
      }
    },
    [initialOrgName]
  );

  useEffect(() => {
    if (!initialRawNim) return;
    const initTimer = window.setTimeout(() => {
      void runVerification(initialRawNim);
    }, 0);
    return () => window.clearTimeout(initTimer);
  }, [initialRawNim, runVerification]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const nextNim = params.get("nim")?.trim() || "";
      setInputNim(nextNim.replace(/\D/g, "") || nextNim);
      void runVerification(nextNim);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [runVerification]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleaned = inputNim.replace(/\D/g, "").trim();

    if (!cleaned) {
      setInputError("Masukkan NIM berupa angka terlebih dahulu.");
      inputRef.current?.focus();
      return;
    }

    setInputNim(cleaned);

    const targetUrl = `/verifikasi?nim=${encodeURIComponent(cleaned)}`;
    if (`${window.location.pathname}${window.location.search}` !== targetUrl) {
      window.history.pushState({ nim: cleaned }, "", targetUrl);
    }

    void runVerification(cleaned);
  };

  if (!isLoading && result?.state === "DB_PAUSED") {
    return <DatabasePausedScreen context="status" orgEmail={orgEmail} />;
  }

  const orgName =
    result && "orgName" in result && result.orgName ? result.orgName : initialOrgName;

  return (
    <div className="min-h-[calc(100dvh-68px)] bg-[#f7f9fb] dark:bg-[#0d1412] px-4 py-10 sm:py-14 flex items-start justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-xs dark:border-[#3c4d46] dark:bg-[#131d1a]">
        <div className="flex items-center gap-3 pb-4 border-b border-[#f1f5f9] dark:border-[#24332d]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e6f4ee] text-[#005236] border border-[#006c49]/20 dark:bg-[#0a3326] dark:text-[#6ee7b7] dark:border-[#34d399]/35">
            <QrCode className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-[#0f172a] dark:text-[#eef2f4] leading-tight">
              Verifikasi Keaslian KTA
            </h1>
            <p className="text-xs text-[#475569] dark:text-[#cbd6d0] truncate">{orgName}</p>
          </div>
        </div>

        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="mt-5 rounded-xl border border-[#006c49]/25 bg-[#f8fafc] p-6 flex flex-col items-center text-center gap-3 dark:border-[#34d399]/30 dark:bg-[#1a2723]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f4ee] border border-[#006c49]/20 dark:bg-[#0a3326] dark:border-[#34d399]/35">
              <Loader2
                className="h-6 w-6 text-[#006c49] dark:text-[#34d399] spinner-essential"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#0f172a] dark:text-[#eef2f4]">
                Memverifikasi Keaslian KTA...
              </p>
              <p className="text-xs text-[#475569] dark:text-[#cbd6d0] leading-relaxed">
                Memeriksa NIM{" "}
                <span className="font-mono font-semibold text-[#005236] dark:text-[#6ee7b7]">
                  {activeQueryNim}
                </span>{" "}
                pada basis data resmi {orgName}.
              </p>
            </div>
          </div>
        )}

        {!isLoading && (!result || result.state === "EMPTY") && (
          <div className="mt-5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 flex items-start gap-3 dark:border-[#3c4d46] dark:bg-[#1a2723]">
            <QrCode
              className="h-5 w-5 text-[#006c49] dark:text-[#34d399] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-bold text-[#0f172a] dark:text-[#eef2f4]">
                Siap Memeriksa Keaslian KTA
              </p>
              <p className="text-xs text-[#475569] dark:text-[#cbd6d0] mt-0.5 leading-relaxed">
                Pindai QR Code pada Kartu Tanda Anggota atau masukkan NIM pada kolom di bawah untuk memeriksa status aktif keanggotaan.
              </p>
            </div>
          </div>
        )}

        {!isLoading && result?.state === "VALID" && (
          <div className="mt-5 space-y-5">
            <div className="rounded-xl border border-[#006c49]/25 bg-[#e6f4ee] p-4 flex items-start gap-3 dark:border-[#34d399]/35 dark:bg-[#0a3326]">
              <CheckCircle2
                className="h-5 w-5 text-[#005236] dark:text-[#6ee7b7] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-bold text-[#005236] dark:text-[#6ee7b7]">
                  KTA Terverifikasi Resmi
                </p>
                <p className="text-xs text-[#00422b] dark:text-[#cbd6d0] mt-0.5">
                  Kartu Tanda Anggota tercatat aktif pada basis data resmi {orgName}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 dark:border-[#3c4d46] dark:bg-[#1a2723]">
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-[#cbd5e1] bg-white dark:border-[#5f736b] dark:bg-[#131d1a] flex items-center justify-center">
                {result.memberInfo.photoUrl ? (
                  <Image
                    src={result.memberInfo.photoUrl}
                    alt={`Pas Foto ${result.memberInfo.name}`}
                    width={64}
                    height={80}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="h-7 w-7 text-[#64748b] dark:text-[#94a89e]" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-[#94a89e]">
                  Nama Anggota
                </p>
                <p className="text-base font-bold text-[#0f172a] dark:text-[#eef2f4] leading-snug">
                  {result.memberInfo.name}
                </p>
                <p className="mt-1 font-mono text-xs font-semibold text-[#005236] dark:text-[#6ee7b7]">
                  {result.memberInfo.memberId}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-[#e2e8f0] p-4 text-xs dark:border-[#3c4d46]">
              <div>
                <dt className="font-semibold text-[#475569] dark:text-[#94a89e]">NIM</dt>
                <dd className="mt-0.5 font-mono font-bold text-[#0f172a] dark:text-[#eef2f4]">
                  {result.memberInfo.nim}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#475569] dark:text-[#94a89e]">Berlaku Hingga</dt>
                <dd className="mt-0.5 font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                  {result.memberInfo.validUntil}
                </dd>
              </div>
              {result.memberInfo.faculty && (
                <div>
                  <dt className="font-semibold text-[#475569] dark:text-[#94a89e]">Fakultas</dt>
                  <dd className="mt-0.5 font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                    {result.memberInfo.faculty}
                  </dd>
                </div>
              )}
              {result.memberInfo.major && (
                <div>
                  <dt className="font-semibold text-[#475569] dark:text-[#94a89e]">Program Studi</dt>
                  <dd className="mt-0.5 font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                    {result.memberInfo.major}
                  </dd>
                </div>
              )}
              {result.memberInfo.batchYear && (
                <div>
                  <dt className="font-semibold text-[#475569] dark:text-[#94a89e]">Angkatan</dt>
                  <dd className="mt-0.5 font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                    {result.memberInfo.batchYear}
                  </dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-[#475569] dark:text-[#94a89e]">Status Keanggotaan</dt>
                <dd className="mt-0.5 font-semibold text-[#005236] dark:text-[#6ee7b7]">
                  Aktif
                </dd>
              </div>
            </dl>
          </div>
        )}

        {!isLoading && result?.state === "INACTIVE" && (
          <div
            className={`mt-5 rounded-xl border p-4 flex items-start gap-3 ${
              result.memberInfo.status === MEMBER_STATUS.SUSPENDED
                ? "border-[#fdba74] bg-[#fff7ed] dark:border-[#fb923c]/40 dark:bg-[#431407]"
                : "border-[#f59e0b]/45 bg-[#fef3c7] dark:border-[#f59e0b]/40 dark:bg-[#3b2506]"
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 shrink-0 mt-0.5 ${
                result.memberInfo.status === MEMBER_STATUS.SUSPENDED
                  ? "text-[#9a3412] dark:text-[#fdba74]"
                  : "text-[#92400e] dark:text-[#fcd34d]"
              }`}
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p
                className={`text-sm font-bold ${
                  result.memberInfo.status === MEMBER_STATUS.SUSPENDED
                    ? "text-[#9a3412] dark:text-[#fdba74]"
                    : "text-[#92400e] dark:text-[#fcd34d]"
                }`}
              >
                {result.memberInfo.status === MEMBER_STATUS.SUSPENDED
                  ? "Keanggotaan Sedang Dibekukan"
                  : "Keanggotaan Tidak Aktif"}
              </p>
              <p
                className={`text-xs ${
                  result.memberInfo.status === MEMBER_STATUS.SUSPENDED
                    ? "text-[#9a3412] dark:text-[#fed7aa]"
                    : "text-[#92400e] dark:text-[#fde68a]"
                }`}
              >
                KTA atas nama <strong>{result.memberInfo.name}</strong> ({result.memberInfo.nim}) berstatus{" "}
                <strong>{result.memberInfo.status}</strong>{" "}
                {result.memberInfo.status === MEMBER_STATUS.SUSPENDED
                  ? "sehingga tidak berlaku untuk digunakan sementara."
                  : "dan saat ini tidak aktif."}
              </p>
              {result.memberInfo.status === MEMBER_STATUS.SUSPENDED &&
                result.memberInfo.suspendedUntil && (
                  <p className="text-xs font-medium text-[#9a3412] dark:text-[#fdba74]">
                    Masa pembekuan hingga: {result.memberInfo.suspendedUntil} WIB
                  </p>
                )}
            </div>
          </div>
        )}

        {!isLoading && result?.state === "INVALID" && (
          <div className="mt-5 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 flex items-start gap-3 dark:border-[#f87171]/35 dark:bg-[#3b1214]">
            <ShieldAlert
              className="h-5 w-5 text-[#991b1b] dark:text-[#fca5a5] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-bold text-[#991b1b] dark:text-[#fca5a5]">
                Data KTA Tidak Ditemukan
              </p>
              <p className="text-xs text-[#991b1b] dark:text-[#fecaca] mt-1">
                NIM <span className="font-mono font-semibold">{result.nim}</span> tidak terdaftar sebagai anggota resmi pada basis data {orgName}. Pastikan NIM benar atau QR Code dipindai dari kartu resmi.
              </p>
            </div>
          </div>
        )}

        {!isLoading && result?.state === "ERROR" && (
          <div className="mt-5 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 flex flex-col gap-3 dark:border-[#f87171]/35 dark:bg-[#3b1214]">
            <div className="flex items-start gap-3">
              <ShieldAlert
                className="h-5 w-5 text-[#991b1b] dark:text-[#fca5a5] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-bold text-[#991b1b] dark:text-[#fca5a5]">
                  Verifikasi Gagal Diproses
                </p>
                <p className="text-xs text-[#991b1b] dark:text-[#fecaca] mt-1">
                  {result.message}
                </p>
              </div>
            </div>
            <div className="pl-8">
              <button
                type="button"
                onClick={() => void runVerification(activeQueryNim || inputNim)}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-[#991b1b]/30 bg-white px-3.5 py-2 text-xs font-semibold text-[#991b1b] hover:bg-[#fef2f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#991b1b] dark:border-[#fca5a5]/40 dark:bg-[#131d1a] dark:text-[#fca5a5] dark:hover:bg-[#1a2723] transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Coba Lagi</span>
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-3 border-t border-[#f1f5f9] pt-5 dark:border-[#24332d]"
        >
          <p className="text-xs font-semibold text-[#334155] dark:text-[#cbd6d0]">
            Periksa Keaslian KTA Secara Manual
          </p>
          <div>
            <label
              htmlFor="verify-nim"
              className="block text-xs font-semibold text-[#0f172a] dark:text-[#eef2f4] mb-1"
            >
              Nomor Induk Mahasiswa (NIM)
            </label>
            <input
              ref={inputRef}
              id="verify-nim"
              name="nim"
              type="text"
              inputMode="numeric"
              value={inputNim}
              disabled={isLoading}
              onChange={(e) => {
                setInputNim(e.target.value.replace(/\D/g, ""));
                if (inputError) setInputError("");
              }}
              placeholder="Contoh: 231402011"
              required
              aria-invalid={Boolean(inputError)}
              className={`w-full min-h-[44px] rounded-lg border bg-white px-3 py-2 text-base sm:text-sm font-mono text-[#0f172a] placeholder:text-[#5c6b62] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-[#1a2723] dark:text-[#eef2f4] dark:placeholder:text-[#94a89e] ${
                inputError
                  ? "border-[#ba1a1a] focus-visible:ring-[#ba1a1a] dark:border-[#f87171] dark:focus-visible:ring-[#f87171]"
                  : "border-[#5c6b62] focus-visible:ring-[#006c49] dark:border-[#6c847b] dark:focus-visible:ring-[#34d399]"
              }`}
            />
            {inputError && (
              <p className="text-xs text-[#ba1a1a] dark:text-[#fca5a5] mt-1">
                {inputError}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#006c49] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005236] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-[#057a55] dark:hover:bg-[#046c4e] dark:focus-visible:ring-[#34d399] dark:focus-visible:ring-offset-[#131d1a] transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 spinner-essential" aria-hidden="true" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <span>Verifikasi KTA</span>
                </>
              )}
            </button>
            <Link
              href="/cek-status"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#5c6b62] bg-white px-4 py-2 text-sm font-semibold text-[#0f172a] hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#6c847b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399] transition-colors"
            >
              Ke Cek Status
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
