"use client";

import React, { useState } from "react";
import { toast } from "sonner";

import { updateMemberStatus, deleteMember } from "../actions";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/dropdown";
import type { MemberWithUser } from "../types";

export const ActionDropdown = ({
  member,
  onUpdate,
  onEdit,
  onViewDetail,
  onConfirmAction,
  onDelete,
  userRole,
}: {
  member: MemberWithUser;
  onUpdate?: () => void;
  onEdit?: (member: MemberWithUser) => void;
  onViewDetail?: (member: MemberWithUser) => void;
  onConfirmAction?: (
    member: MemberWithUser,
    action: "ACTIVATE" | "SUSPEND" | "INACTIVE"
  ) => void;
  onDelete?: (member: MemberWithUser) => void;
  userRole?: string;
}) => {
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (newStatus: "ACTIVE" | "SUSPENDED" | "INACTIVE") => {
    if (onConfirmAction) {
      onConfirmAction(
        member,
        newStatus === "ACTIVE"
          ? "ACTIVATE"
          : newStatus === "INACTIVE"
          ? "INACTIVE"
          : "SUSPEND"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await updateMemberStatus(member.id, newStatus);
      if (res.success) {
        toast.success("Status anggota berhasil diperbarui.");
        if (onUpdate) onUpdate();
      } else {
        toast.error(res.error || "Gagal memperbarui status anggota.");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(member);
      return;
    }

    setLoading(true);
    try {
      const res = await deleteMember(member.id);
      if (res.success) {
        toast.success("Anggota berhasil dihapus.");
        if (onUpdate) onUpdate();
      } else {
        toast.error(res.error || "Gagal menghapus anggota.");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const items: (ActionMenuItem | "divider")[] = [
    {
      label: "Lihat Detail",
      icon: "visibility",
      onClick: () => onViewDetail?.(member),
    },
  ];

  if (userRole !== "STAFF") {
    items.push({
      label: "Edit Anggota",
      icon: "edit",
      onClick: () => onEdit?.(member),
    });
  }

  if (userRole === "OWNER" || userRole === "SUPER_ADMIN") {
    items.push("divider");

    if (member.status === "ACTIVE") {
      items.push(
        {
          label: "Nonaktifkan Anggota",
          icon: "person_off",
          tone: "muted",
          onClick: () => handleUpdateStatus("INACTIVE"),
        },
        {
          label: "Bekukan Anggota",
          icon: "block",
          tone: "danger",
          onClick: () => handleUpdateStatus("SUSPENDED"),
        }
      );
    } else if (member.status === "INACTIVE") {
      items.push(
        {
          label: "Aktifkan Kembali",
          icon: "check_circle",
          tone: "success",
          onClick: () => handleUpdateStatus("ACTIVE"),
        },
        {
          label: "Bekukan Anggota",
          icon: "block",
          tone: "danger",
          onClick: () => handleUpdateStatus("SUSPENDED"),
        }
      );
    } else if (member.status === "SUSPENDED") {
      items.push({
        label: "Aktifkan Kembali",
        icon: "check_circle",
        tone: "success",
        onClick: () => handleUpdateStatus("ACTIVE"),
      });
    }

    items.push({
      label: "Hapus Anggota",
      icon: "delete",
      tone: "danger",
      onClick: handleDelete,
    });
  }

  return (
    <ActionMenu
      label={loading ? "Memproses..." : "Aksi"}
      disabled={loading}
      items={items}
    />
  );
};
