"use client";

import React from "react";
import { Download, UserPlus } from "lucide-react";

import { DrawerTrigger } from "@/components/ui/drawer";
import { TableToolbar } from "@/components/ui/table-toolbar";
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
    const link = document.createElement("a");
    link.href = `/api/admin/members/export?${params.toString()}`;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const canAddMember = userRole === "OWNER" || userRole === "SUPER_ADMIN";

  return (
    <>
      <TableToolbar
        title="Daftar Anggota Terdaftar"
        description={
          selectedIds.length > 0
            ? `${selectedIds.length} anggota dipilih untuk ekspor data.`
            : "Cari anggota berdasarkan nama, NIM, atau alamat email."
        }
        searchValue={localSearch}
        onSearchChange={onSearchChange}
        searchPlaceholder="Cari nama, NIM, atau email anggota..."
        filter={{
          value: status,
          options: [
            { label: "Semua Status", value: "all" },
            { label: "Aktif", value: "ACTIVE" },
            { label: "Tidak Aktif", value: "INACTIVE" },
            { label: "Dibekukan", value: "SUSPENDED" },
          ],
          onChange: onStatusChange,
        }}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExport}
              className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#85929f] bg-white px-4 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
            >
              <Download className="h-4 w-4 text-[#475569] dark:text-[#94a89e]" aria-hidden />
              <span>Ekspor Data</span>
            </button>

            {canAddMember && (
              <AddMemberDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={onRefresh}
              >
                <DrawerTrigger asChild>
                  <button
                    type="button"
                    className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#006c49] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#005236] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] focus-visible:ring-offset-2 dark:bg-[#057a55] dark:hover:bg-[#046c4e] dark:focus-visible:ring-[#34d399] dark:focus-visible:ring-offset-[#131d1a]"
                  >
                    <UserPlus className="h-4 w-4" aria-hidden />
                    <span>Tambah Anggota</span>
                  </button>
                </DrawerTrigger>
              </AddMemberDrawer>
            )}
          </div>
        }
      />

      <EditMemberDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        member={selectedEditMember}
        onSuccess={onRefresh}
      />
    </>
  );
}
