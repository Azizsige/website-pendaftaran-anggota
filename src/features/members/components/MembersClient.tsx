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
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-sm text-[36px] font-bold text-on-surface tracking-tight">
            Manajemen Anggota
          </h1>
          <p className="text-body-lg text-on-surface-variant mt-1">
            Kelola data seluruh anggota terdaftar dalam organisasi Anda.
          </p>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Action Buttons */}
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

      {/* Table & Pagination Container */}
      <div className="space-y-4">
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
        />

        {initialMembers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={limit}
            onPageChange={(page) => updateUrl({ page: page.toString() })}
            isPending={isPending}
          />
        )}
      </div>

      {/* Modals & Dialogs */}
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
