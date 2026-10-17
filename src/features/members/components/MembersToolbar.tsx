"use client";

import React from "react";
import { DrawerTrigger } from "@/components/ui/drawer";
import { AddMemberDrawer } from "./AddMemberDrawer";
import { EditMemberDrawer } from "./EditMemberDrawer";
import type { MemberWithUser } from "../types";

interface MembersToolbarProps {
  localSearch: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  selectedIds: string[];
  search: string;
  userRole?: string;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isEditDrawerOpen: boolean;
  setIsEditDrawerOpen: (open: boolean) => void;
  selectedEditMember: MemberWithUser | null;
  onRefresh: () => void;
}

export function MembersToolbar({
  localSearch,
  onSearchChange,
  status,
  onStatusChange,
  selectedIds,
  search,
  userRole,
  isDrawerOpen,
  setIsDrawerOpen,
  isEditDrawerOpen,
  setIsEditDrawerOpen,
  selectedEditMember,
  onRefresh,
}: MembersToolbarProps) {
  const handleExport = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (selectedIds.length > 0) params.set("ids", selectedIds.join(","));
    window.location.href = `/api/admin/members/export?${params.toString()}`;
  };

  const canAddMember = userRole === "OWNER" || userRole === "SUPER_ADMIN";

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      {/* Search Input */}
      <div className="flex-1 w-full min-w-[250px] md:max-w-md relative group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
          search
        </span>
        <input
          type="text"
          placeholder="Cari anggota berdasarkan nama, NIM, atau email..."
          value={localSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full min-w-0 pl-12 pr-4 py-3 bg-surface border border-outline-variant/30 rounded-full text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
        {/* Status Filter */}
        <div className="flex-1 md:flex-none">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full md:w-[150px] h-[48px] px-4 rounded-lg bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Tidak Aktif</option>
            <option value="SUSPENDED">Dibekukan</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-label-md rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span className="hidden sm:inline">Ekspor Data</span>
          </button>

          {canAddMember && (
            <AddMemberDrawer
              open={isDrawerOpen}
              onOpenChange={setIsDrawerOpen}
              onSuccess={onRefresh}
            >
              <DrawerTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-label-md text-label-md rounded-lg transition-colors shadow-sm cursor-pointer">
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  Tambah Anggota
                </button>
              </DrawerTrigger>
            </AddMemberDrawer>
          )}

          <EditMemberDrawer
            open={isEditDrawerOpen}
            onOpenChange={setIsEditDrawerOpen}
            member={selectedEditMember}
            onSuccess={onRefresh}
          />
        </div>
      </div>
    </div>
  );
}
