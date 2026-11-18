"use client";

import React from "react";

import { Pagination } from "@/components/ui/pagination";
import { useMembers } from "../hooks/useMembers";
import { MembersToolbar } from "./MembersToolbar";
import { MembersTable } from "./MembersTable";
import { MembersModals } from "./MembersModals";
import type { MemberWithUser } from "../types";

interface Props {
  initialMembers: MemberWithUser[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  search: string;
  status: string;
  userRole?: string;
}

export function MembersClient({
  initialMembers,
  totalCount,
  totalPages,
  currentPage,
  search,
  status,
  userRole,
}: Props) {
  const limit = 10;
  const {
    isPending,
    router,
    isDrawerOpen,
    setIsDrawerOpen,
    isEditDrawerOpen,
    setIsEditDrawerOpen,
    selectedEditMember,
    setSelectedEditMember,
    selectedIds,
    handleSelectAll,
    handleSelectOne,
    selectedViewMember,
    setSelectedViewMember,
    selectedConfirmMember,
    setSelectedConfirmMember,
    selectedDeleteMember,
    setSelectedDeleteMember,
    confirmAction,
    setConfirmAction,
    localSearch,
    setLocalSearch,
    updateUrl,
    handleConfirmAction,
    handleConfirmDelete,
  } = useMembers({ initialMembers, search });

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl dark:text-[#eef2f4]">
            Manajemen Anggota
          </h1>
          <p className="mt-1 text-sm text-[#475569] dark:text-[#cbd6d0]">
            Kelola direktori anggota resmi, perbarui data akademik, dan atur status keanggotaan.
          </p>
        </div>
      </div>

      <div className="relative flex flex-col overflow-hidden rounded-xl border border-[#e2e8f0] bg-white dark:border-[#3c4d46] dark:bg-[#131d1a]">
        <MembersToolbar
          localSearch={localSearch}
          onSearchChange={setLocalSearch}
          status={status}
          onStatusChange={(newStatus) =>
            updateUrl({ status: newStatus === "all" ? null : newStatus, page: "1" })
          }
          selectedIds={selectedIds}
          search={search}
          userRole={userRole}
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          isEditDrawerOpen={isEditDrawerOpen}
          setIsEditDrawerOpen={setIsEditDrawerOpen}
          selectedEditMember={selectedEditMember}
          onRefresh={() => router.refresh()}
        />

        <MembersTable
          members={initialMembers}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          isPending={isPending}
          userRole={userRole}
          onRefresh={() => router.refresh()}
          onEdit={(m) => {
            setSelectedEditMember(m);
            setIsEditDrawerOpen(true);
          }}
          onViewDetail={(m) => setSelectedViewMember(m)}
          onConfirmAction={(m, action) => {
            setSelectedConfirmMember(m);
            setConfirmAction(action);
          }}
          onDelete={(m) => setSelectedDeleteMember(m)}
          footer={
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={limit}
              onPageChange={(page) => updateUrl({ page: page.toString() })}
              isPending={isPending}
            />
          }
        />
      </div>

      <MembersModals
        selectedViewMember={selectedViewMember}
        onCloseView={() => setSelectedViewMember(null)}
        selectedConfirmMember={selectedConfirmMember}
        confirmAction={confirmAction}
        onCloseConfirm={() => {
          setSelectedConfirmMember(null);
          setConfirmAction(null);
        }}
        onConfirmAction={handleConfirmAction}
        selectedDeleteMember={selectedDeleteMember}
        onCloseDelete={() => setSelectedDeleteMember(null)}
        onConfirmDelete={handleConfirmDelete}
        isPending={isPending}
      />
    </div>
  );
}
