"use client";

import React, { useState } from 'react';
import { toast } from "sonner";
import { updateMemberStatus, deleteMember } from '@/actions/admin-members';
import { ActionMenu, type ActionMenuItem } from '@/components/ui/dropdown';
import type { MemberWithUser } from '@/types/member';

export const ActionDropdown = ({ 
  member, 
  onUpdate, 
  onEdit, 
  onViewDetail, 
  onConfirmAction, 
  onDelete, 
  userRole 
}: { 
  member: MemberWithUser; 
  onUpdate?: () => void; 
  onEdit?: (member: MemberWithUser) => void; 
  onViewDetail?: (member: MemberWithUser) => void; 
  onConfirmAction?: (member: MemberWithUser, action: "ACTIVATE" | "SUSPEND" | "INACTIVE") => void; 
  onDelete?: (member: MemberWithUser) => void; 
  userRole?: string; 
}) => {
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (newStatus: "ACTIVE" | "SUSPENDED" | "INACTIVE") => {
    if (onConfirmAction) {
      onConfirmAction(member, newStatus === "ACTIVE" ? "ACTIVATE" : newStatus === "INACTIVE" ? "INACTIVE" : "SUSPEND");
      return;
    }
    
    setLoading(true);
    try {
      const res = await updateMemberStatus(member.id, newStatus);
      if (res.success) {
        toast.success("Status member berhasil diupdate!");
        if (onUpdate) onUpdate();
      } else {
        toast.error(res.error || "Gagal mengupdate status");
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
    
    if (!confirm("Apakah Anda yakin ingin menghapus member ini?")) return;
    setLoading(true);
    try {
      const res = await deleteMember(member.id);
      if (res.success) {
        toast.success("Member berhasil dihapus!");
        if (onUpdate) onUpdate();
      } else {
        toast.error(res.error || "Gagal menghapus member");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const items: (ActionMenuItem | "divider")[] = [
    {
      label: "View Details",
      icon: "visibility",
      onClick: () => onViewDetail?.(member),
    },
  ];

  if (userRole !== "STAFF") {
    items.push({
      label: "Edit Member",
      icon: "edit",
      onClick: () => onEdit?.(member),
    });
  }

  if (userRole === "OWNER" || userRole === "SUPER_ADMIN") {
    items.push("divider");

    if (member.status === 'ACTIVE') {
      items.push(
        {
          label: "Inactive Member",
          icon: "person_off",
          tone: "muted",
          onClick: () => handleUpdateStatus('INACTIVE'),
        },
        {
          label: "Suspend Member",
          icon: "block",
          tone: "danger",
          onClick: () => handleUpdateStatus('SUSPENDED'),
        }
      );
    } else {
      items.push({
        label: "Activate Member",
        icon: "check_circle",
        tone: "success",
        onClick: () => handleUpdateStatus('ACTIVE'),
      });
    }

    items.push({
      label: "Delete Member",
      icon: "delete",
      tone: "danger",
      onClick: handleDelete,
    });
  }

  return (
    <ActionMenu
      label={loading ? "Processing..." : "Actions"}
      disabled={loading}
      items={items}
    />
  );
};
