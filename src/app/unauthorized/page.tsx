import React from 'react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-container-lowest w-screen overflow-hidden">
      <div className="w-[90%] min-w-[320px] max-w-[450px] bg-surface border border-outline-variant/20 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-error"></div>
        <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[40px]">gpp_maybe</span>
        </div>
        <h1 className="font-display-sm text-2xl font-bold text-on-surface mb-2 tracking-tight">Akses Ditolak</h1>
        <p className="text-body-md text-on-surface-variant mb-8">
          Maaf, Anda tidak memiliki izin (role) yang cukup untuk mengakses halaman pengaturan ini. Halaman ini hanya diperuntukkan bagi Developer dan Super Admin.
        </p>
        <Link 
          href="/admin" 
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-sm cursor-pointer w-full justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
