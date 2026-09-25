"use client";

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function AdminSidebar() {
  return (
    <nav className="bg-on-tertiary-fixed dark:bg-inverse-surface h-screen fixed left-0 top-0 w-sidebar-width flex flex-col py-lg flat no shadows z-20 transition-all duration-300 ease-in-out hidden md:flex">
      <div className="px-lg mb-lg">
        <h1 className="font-headline-md text-headline-md text-primary-fixed">Portal Panitia</h1>
        <p className="font-label-md text-label-md text-tertiary-fixed-dim/70 mt-xs">Sistem Oprec BEM</p>
      </div>
      <ul className="flex-1 space-y-sm mt-md px-sm">
        <li>
          <Link className="flex items-center gap-md px-md py-sm border-l-4 border-primary-fixed bg-primary-fixed/10 text-primary-fixed rounded-r-lg" href="/admin">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link className="flex items-center justify-between px-md py-sm text-tertiary-fixed-dim/70 hover:bg-white/5 hover:text-white rounded-r-lg border-l-4 border-transparent transition-colors" href="/admin/pendaftar">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined">person_add</span>
              <span className="font-label-md text-label-md">Calon Anggota</span>
            </div>
            <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full">12</span>
          </Link>
        </li>
        <li>
          <Link className="flex items-center gap-md px-md py-sm text-tertiary-fixed-dim/70 hover:bg-white/5 hover:text-white rounded-r-lg border-l-4 border-transparent transition-colors" href="/admin/members">
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md text-label-md">Anggota Aktif</span>
          </Link>
        </li>
        <li>
          <Link className="flex items-center gap-md px-md py-sm text-tertiary-fixed-dim/70 hover:bg-white/5 hover:text-white rounded-r-lg border-l-4 border-transparent transition-colors" href="/admin/reports">
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-label-md text-label-md">Laporan Data</span>
          </Link>
        </li>
        <li>
          <Link className="flex items-center gap-md px-md py-sm text-tertiary-fixed-dim/70 hover:bg-white/5 hover:text-white rounded-r-lg border-l-4 border-transparent transition-colors cursor-pointer" href="/admin/settings?tab=general_settings">
            <span className="material-symbols-outlined" data-weight="regular">settings</span>
            <span className="font-label-md text-label-md font-bold">Pengaturan</span>
          </Link>
        </li>
      </ul>
      <div className="px-lg mt-auto">
        <button className="w-full bg-primary-container text-on-primary-container font-label-md text-label-md py-sm rounded-lg hover:bg-primary-fixed transition-colors flex items-center justify-center gap-sm">
          <span className="material-symbols-outlined text-[18px]">post_add</span> Buat Laporan
        </button>
      </div>
      <ul className="mt-lg px-sm space-y-sm mb-4">
        <li>
          <Link className="flex items-center gap-md px-md py-sm text-tertiary-fixed-dim/70 hover:bg-white/5 hover:text-white rounded-r-lg border-l-4 border-transparent transition-colors" href="#">
            <span className="material-symbols-outlined">help</span>
            <span className="font-label-md text-label-md">Bantuan</span>
          </Link>
        </li>
        <li>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-md px-md py-sm text-tertiary-fixed-dim/70 hover:bg-white/5 hover:text-white rounded-r-lg border-l-4 border-transparent transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Keluar</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
