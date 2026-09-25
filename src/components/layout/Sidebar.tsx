"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  FileText,
  Users,
  BarChart3,
  ClipboardList,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

interface SidebarProps {
  variant: "member" | "admin";
}

const memberNav: NavItem[] = [
  { label: "Dashboard", href: "/member", icon: LayoutDashboard },
  { label: "Profil Saya", href: "/member/profil", icon: User },
  { label: "Kartu Anggota", href: "/member/kta", icon: CreditCard },
  { label: "Pengaturan", href: "/member/pengaturan", icon: Settings },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Pendaftar Baru", href: "/admin/pendaftar", icon: ClipboardList, badge: 5 },
  { label: "Data Anggota", href: "/admin/anggota", icon: Users },
  { label: "Laporan", href: "/admin/laporan", icon: BarChart3 },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
];

export default function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = variant === "member" ? memberNav : adminNav;
  const userName = variant === "member" ? "Andi Pratama" : "Admin";
  const userRole = variant === "member" ? "Member" : "Super Admin";
  const memberId = variant === "member" ? "IDN-12345678" : undefined;

  const isActive = (href: string) => {
    if (href === `/${variant}`) return pathname === href;
    return pathname?.startsWith(href) ?? false;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center font-bold text-white text-sm shrink-0">
            M
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white tracking-tight whitespace-nowrap">
              Member<span className="text-[var(--primary-light)]">Hub</span>
            </span>
          )}
        </Link>

        {/* Collapse Toggle (Desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-7 h-7 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] items-center justify-center text-[var(--text-tertiary)] hover:text-white transition-colors"
        >
          <ChevronLeft
            size={14}
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* Close (Mobile) */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-5 pb-5 mb-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {userName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {userRole}
                {memberId && ` · ${memberId}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                active
                  ? "bg-[rgba(15,157,110,0.1)] text-[var(--primary-light)]"
                  : "text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.04)]"
              }`}
              title={collapsed ? item.label : undefined}
            >
              {/* Active Indicator */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--primary)]" />
              )}

              <Icon
                size={20}
                className={`shrink-0 ${
                  active
                    ? "text-[var(--primary-light)]"
                    : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]"
                }`}
              />

              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-md bg-[var(--danger)] text-white text-xs flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {collapsed && item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--danger)] text-white text-[10px] flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 mt-auto border-t border-[var(--border-subtle)]">
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[rgba(239,68,68,0.05)] transition-all"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl glass flex items-center justify-center text-white"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 glass-sidebar transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
