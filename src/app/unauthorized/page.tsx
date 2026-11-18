import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { ACTIVITY_ACTIONS, recordActivityLog } from '@/lib/activity-log';
import { ROLES } from '@/lib/constants/roles';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Akses Ditolak | Portal Pendaftaran",
  description: "Anda tidak memiliki izin yang cukup untuk mengakses halaman ini.",
};

export default async function UnauthorizedPage(props: {
  searchParams?: Promise<{ from?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = (await props.searchParams) ?? {};
  const rawFrom = typeof resolvedSearchParams.from === 'string' ? resolvedSearchParams.from.trim() : '';
  const sanitizedFrom = rawFrom.startsWith('/') ? rawFrom.slice(0, 200) : '';
  const attemptedPath = sanitizedFrom || '/unauthorized';

  const isLoggedIn = Boolean(session?.user?.id);
  const userRole = session?.user?.role;

  if (isLoggedIn && session?.user?.id && userRole && userRole !== ROLES.OWNER) {
    await recordActivityLog({
      actor: { id: session.user.id, role: userRole },
      action: ACTIVITY_ACTIONS.UNAUTHORIZED_ACCESS,
      entityType: 'Security',
      entityId: attemptedPath,
      details: `Mencoba mengakses halaman terproteksi '${attemptedPath}' menggunakan peran ${userRole} (Akses Ditolak)`,
    });
  }

  const backHref = isLoggedIn ? '/admin' : '/';
  const backLabel = isLoggedIn ? 'Kembali ke Panel Admin' : 'Kembali ke Beranda';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background w-full overflow-x-hidden">
      <div className="w-full max-w-[450px] bg-surface border border-border rounded-2xl p-8 flex flex-col items-center text-center shadow-lg animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#ba1a1a] dark:bg-[#f87171]"></div>
        <div className="w-20 h-20 bg-[#fef2f2] text-[#991b1b] dark:bg-[#3b1214] dark:text-[#fca5a5] rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[#191c1e] dark:text-[#eef2f4] mb-2 tracking-tight">
          Akses Ditolak
        </h1>
        <p className="text-sm text-[#3c4a42] dark:text-[#cbd6d0] mb-6 leading-relaxed">
          Maaf, Anda tidak memiliki izin (role) yang cukup untuk mengakses halaman tersebut.
        </p>
        {sanitizedFrom && (
          <div className="w-full mb-6 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3.5 py-2.5 text-xs text-[#991b1b] dark:border-[#f87171]/35 dark:bg-[#3b1214] dark:text-[#fca5a5]">
            Rute yang ditolak: <span className="font-mono font-semibold">{sanitizedFrom}</span>
          </div>
        )}
        <Link 
          href={backHref} 
          className="flex min-h-[44px] items-center gap-2 bg-[#006c49] hover:bg-[#005236] dark:bg-[#057a55] dark:hover:bg-[#046c4e] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer w-full justify-center"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
