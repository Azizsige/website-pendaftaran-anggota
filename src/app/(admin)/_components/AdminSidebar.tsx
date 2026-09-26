"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useAdminUIStore } from '@/store/useAdminUIStore';

export default function AdminSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = (session?.user as any)?.role;
  const showSettings = role === 'OWNER' || role === 'SUPER_ADMIN';
  const { isSidebarOpen, setSidebarOpen } = useAdminUIStore();

  const getMenuClass = (path: string, exact: boolean = false) => {
    const isActive = exact ? pathname === path : pathname?.startsWith(path);
    const baseClass = "px-md py-sm rounded-r-lg border-l-4 transition-colors w-full cursor-pointer";
    if (isActive) {
      return `${baseClass} border-primary-fixed bg-primary-fixed/10 text-primary-fixed`;
    }
    return `${baseClass} border-transparent text-tertiary-fixed-dim/70 hover:bg-white/5 hover:text-white`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <nav className={`bg-on-tertiary-fixed dark:bg-inverse-surface h-screen fixed left-0 top-0 w-sidebar-width flex flex-col py-lg flat no shadows z-40 transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="px-lg mb-lg">
        <h1 className="font-headline-md text-headline-md text-primary-fixed">Portal Panitia</h1>
        <p className="font-label-md text-label-md text-tertiary-fixed-dim/70 mt-xs">Sistem Oprec BEM</p>
      </div>
      <ul className="flex-1 space-y-sm mt-md px-sm">
        <li>
          <Link onClick={() => setSidebarOpen(false)} className={`${getMenuClass('/admin', true)} flex items-center gap-md`} href="/admin">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link onClick={() => setSidebarOpen(false)} className={`${getMenuClass('/admin/pendaftar')} flex items-center justify-between`} href="/admin/pendaftar">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined">person_add</span>
              <span className="font-label-md text-label-md">Calon Anggota</span>
            </div>
          </Link>
        </li>
        <li>
          <Link onClick={() => setSidebarOpen(false)} className={`${getMenuClass('/admin/members')} flex items-center gap-md`} href="/admin/members">
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md text-label-md">Anggota Aktif</span>
          </Link>
        </li>
        <li>
          <Link onClick={() => setSidebarOpen(false)} className={`${getMenuClass('/admin/reports')} flex items-center gap-md`} href="/admin/reports">
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-label-md text-label-md">Laporan Data</span>
          </Link>
        </li>
        {showSettings && (
          <li>
            <Link onClick={() => setSidebarOpen(false)} className={`${getMenuClass('/admin/settings')} flex items-center gap-md`} href="/admin/settings?tab=general_settings">
              <span className="material-symbols-outlined" data-weight="regular">settings</span>
              <span className="font-label-md text-label-md font-bold">Pengaturan</span>
            </Link>
          </li>
        )}
      </ul>
      <ul className="mt-auto px-sm space-y-sm mb-4">
        <li>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-md px-md py-sm text-tertiary-fixed-dim/70 hover:bg-white/5 hover:text-white rounded-r-lg border-l-4 border-transparent transition-colors w-full text-left cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Keluar</span>
          </button>
        </li>
      </ul>
    </nav>
    </>
  );
}
