"use client";

import React from "react";
import { ConfirmDialog, ConfirmTone } from "@/components/ui/confirm-dialog";
import { PersonSummary } from "@/components/admin/PersonSummary";

export type ConfirmableMember = {
  id: string;
  status: string;
  phoneNumber?: string | null;
  user: {
    name?: string | null;
    email?: string | null;
  };
};

type Props = {
  member: ConfirmableMember;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isPending: boolean;
  actionType: "ACTIVATE" | "SUSPEND" | "INACTIVE";
};

export default function MemberConfirmModal({
  member,
  isOpen,
  onClose,
  onConfirm,
  isPending,
  actionType,
}: Props) {
  const isActivate = actionType === "ACTIVATE";
  const isInactive = actionType === "INACTIVE";

  const tone: ConfirmTone = isActivate ? "primary" : isInactive ? "neutral" : "danger";
  const title = isActivate ? "Aktivasi Member?" : isInactive ? "Nonaktifkan Member?" : "Suspend Member?";
  const description = isActivate
    ? "Konfirmasi pengaktifan status keanggotaan"
    : isInactive
    ? "Konfirmasi penonaktifan sementara status keanggotaan"
    : "Konfirmasi pembekuan status keanggotaan";
  const warning = isActivate
    ? "Tindakan ini akan mengaktifkan kembali akun member, mengizinkan mereka untuk mengakses sistem."
    : isInactive
    ? "Tindakan ini akan menonaktifkan akun member. Mereka tidak akan bisa login sementara waktu, namun datanya tetap aman."
    : "Tindakan ini akan membekukan sementara akun member, mencegah mereka untuk mengakses sistem.";
  const icon = isActivate ? "check_circle" : isInactive ? "person_off" : "block";
  const confirmLabel = isActivate ? "Ya, Aktifkan" : isInactive ? "Ya, Nonaktifkan" : "Ya, Suspend";

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      tone={tone}
      icon={icon}
      title={title}
      description={description}
      message={warning}
      confirmLabel={confirmLabel}
      isPending={isPending}
      onConfirm={() => onConfirm(member.id)}
    >
      <PersonSummary
        id={member.id}
        name={member.user.name}
        email={member.user.email}
        phoneNumber={member.phoneNumber}
        status={member.status}
      />
    </ConfirmDialog>
  );
}
