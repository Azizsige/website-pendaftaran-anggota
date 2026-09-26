"use client";

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useAdminUIStore } from '@/store/useAdminUIStore';

export default function AdminHeader() {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Admin';
  const { toggleSidebar } = useAdminUIStore();
  
  return (
    <header className="bg-surface dark:bg-surface-container docked full-width top-0 bg-surface-container-low dark:bg-surface-container-high flat no shadows z-10 sticky">
      <div className="flex justify-between items-center w-full px-lg h-16 max-w-container-max mx-auto">
        <div className="flex items-center gap-md">
          <button onClick={toggleSidebar} className="md:hidden text-on-surface-variant p-sm hover:bg-surface-variant/50 rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">menu</span>
          </button>
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex text-body-sm font-body-sm text-on-surface-variant">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link className="inline-flex items-center hover:text-primary transition-colors" href="/admin">
                  Admin
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
                  <span className="text-on-surface font-semibold ml-1 md:ml-2">Dashboard</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        <div className="flex items-center gap-lg">
          <div className="flex items-center gap-sm">
            <span className="text-sm font-medium text-on-surface-variant hidden sm:block">
              {userName}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
              {userName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
