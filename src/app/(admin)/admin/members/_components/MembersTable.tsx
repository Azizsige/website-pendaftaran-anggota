"use client";

import React from "react";
import { ActionDropdown } from "./ActionDropdown";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/format";
import type { MemberWithUser } from "@/types/member";

interface MembersTableProps {
  members: MemberWithUser[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string) => void;
  isPending: boolean;
  userRole?: string;
  onRefresh: () => void;
  onEdit: (member: MemberWithUser) => void;
  onViewDetail: (member: MemberWithUser) => void;
  onConfirmAction: (
    member: MemberWithUser,
    action: "ACTIVATE" | "SUSPEND" | "INACTIVE"
  ) => void;
  onDelete: (member: MemberWithUser) => void;
}

export function MembersTable({
  members,
  selectedIds,
  onSelectAll,
  onSelectOne,
  isPending,
  userRole,
  onRefresh,
  onEdit,
  onViewDetail,
  onConfirmAction,
  onDelete,
}: MembersTableProps) {
  const isAllSelected =
    members.length > 0 && selectedIds.length === members.length;

  return (
    <div className="bg-surface border border-outline-variant/20 rounded-xl shadow-sm flex flex-col relative">
      {isPending && (
        <div className="absolute inset-0 bg-surface/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
          <span className="material-symbols-outlined animate-spin text-primary text-3xl">
            progress_activity
          </span>
        </div>
      )}

      <div className="overflow-x-auto min-h-[350px]">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              <th className="py-4 px-4 w-12">
                <input
                  className="rounded-[4px] border-outline-variant/50 text-[#006c49] focus:ring-[#006c49] accent-[#006c49] cursor-pointer w-[18px] h-[18px] transition-colors"
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant font-medium">
                Info Anggota
              </th>
              <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant font-medium">
                NIM & Kontak
              </th>
              <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant font-medium">
                Fakultas & Jurusan
              </th>
              <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant font-medium">
                Tanggal Bergabung
              </th>
              <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant font-medium">
                Status
              </th>
              <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant font-medium text-right w-32">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-on-surface-variant"
                >
                  Tidak ada anggota yang ditemukan.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-surface-container-lowest transition-colors group"
                >
                  <td className="py-3 px-4">
                    <input
                      className="rounded-[4px] border-outline-variant/50 text-[#006c49] focus:ring-[#006c49] accent-[#006c49] cursor-pointer w-[18px] h-[18px] transition-colors"
                      type="checkbox"
                      checked={selectedIds.includes(member.id)}
                      onChange={() => onSelectOne(member.id)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-body-md text-on-surface font-medium">
                        {member.user?.name}
                      </span>
                      <span className="font-body-sm text-on-surface-variant">
                        {member.user?.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-body-md text-on-surface-variant">
                        {member.nim || "-"}
                      </span>
                      <span className="font-body-sm text-on-surface-variant">
                        {member.phoneNumber
                          ? member.phoneNumber
                              .replace(/\D/g, "")
                              .replace(/^62/, "0")
                          : "-"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-body-md text-on-surface-variant">
                        {member.faculty || "-"}
                      </span>
                      <span className="font-body-sm text-on-surface-variant">
                        {member.major || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-body-md text-on-surface-variant">
                    {formatDate(member.joinDate)}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end">
                      <ActionDropdown
                        member={member}
                        onUpdate={onRefresh}
                        onEdit={onEdit}
                        onViewDetail={onViewDetail}
                        onConfirmAction={onConfirmAction}
                        onDelete={onDelete}
                        userRole={userRole}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
