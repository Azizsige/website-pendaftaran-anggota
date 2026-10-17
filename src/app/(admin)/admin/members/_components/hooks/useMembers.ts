"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { updateMemberStatus, deleteMember } from "@/actions/admin-members";
import type { MemberWithUser } from "@/types/member";

export type ConfirmActionType = "ACTIVATE" | "SUSPEND" | "INACTIVE" | null;

interface UseMembersProps {
  initialMembers: MemberWithUser[];
  search: string;
}

export function useMembers({ initialMembers, search }: UseMembersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedEditMember, setSelectedEditMember] = useState<MemberWithUser | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [selectedViewMember, setSelectedViewMember] = useState<MemberWithUser | null>(null);
  const [selectedConfirmMember, setSelectedConfirmMember] = useState<MemberWithUser | null>(null);
  const [selectedDeleteMember, setSelectedDeleteMember] = useState<MemberWithUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionType>(null);

  // Search state
  const [localSearch, setLocalSearch] = useState(search);

  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  // Sync action=new from query
  useEffect(() => {
    if (searchParams?.get("action") === "new") {
      setIsDrawerOpen(true);
      updateUrl({ action: null });
    }
  }, [searchParams]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        updateUrl({ search: localSearch || null, page: "1" });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, search]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(initialMembers.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirmAction = async (id: string) => {
    if (!confirmAction) return;
    startTransition(async () => {
      try {
        const statusToSet =
          confirmAction === "ACTIVATE"
            ? "ACTIVE"
            : confirmAction === "INACTIVE"
            ? "INACTIVE"
            : "SUSPENDED";
        const res = await updateMemberStatus(id, statusToSet);
        if (res.success) {
          toast.success("Status member berhasil diupdate!");
          setSelectedConfirmMember(null);
          setConfirmAction(null);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal mengupdate status");
        }
      } catch {
        toast.error("Terjadi kesalahan sistem.");
      }
    });
  };

  const handleConfirmDelete = async (id: string) => {
    startTransition(async () => {
      try {
        const res = await deleteMember(id);
        if (res.success) {
          toast.success("Member berhasil dihapus!");
          setSelectedDeleteMember(null);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal menghapus member");
        }
      } catch {
        toast.error("Terjadi kesalahan sistem.");
      }
    });
  };

  return {
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
  };
}
