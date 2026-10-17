"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PersonSummary } from "@/components/admin/PersonSummary";

export type DeletableTarget = {
  id: string;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  status?: string | null;
  user?: {
    name?: string | null;
    email?: string | null;
  };
};

type Props = {
  applicant: DeletableTarget;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isPending: boolean;
  titleMode?: "pendaftar" | "member" | "admin";
};

export default function ApplicantDeleteModal({
  applicant,
  isOpen,
  onClose,
  onConfirm,
  isPending,
  titleMode = "pendaftar",
}: Props) {
  const entityName = titleMode === "pendaftar" ? "pendaftar" : titleMode === "member" ? "member" : "admin";
  const title = titleMode === "pendaftar" ? "Hapus Data Pendaftar?" : titleMode === "member" ? "Hapus Data Member?" : "Hapus Data Admin?";

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      tone="danger"
      icon="delete_forever"
      title={title}
      description="Konfirmasi tindakan destruktif sistem"
      message={
        <span>
          Tindakan ini bersifat <strong className="text-error font-semibold">permanen dan tidak dapat dibatalkan</strong>. Semua berkas formulir, dokumen lampiran, dan riwayat verifikasi akan dihapus dari sistem.
        </span>
      }
      confirmLabel="Ya, Hapus Permanen"
      cancelLabel="Batal"
      isPending={isPending}
      pendingTitle="Menghapus Data"
      pendingMessage="Data sedang dihapus permanen..."
      requireText="HAPUS"
      acknowledgement={`Saya memahami bahwa data ${entityName} ini akan dihapus secara permanen dan tidak dapat dipulihkan.`}
      onConfirm={() => onConfirm(applicant.id)}
    >
      <PersonSummary
        id={applicant.id}
        name={applicant.user?.name || applicant.name}
        email={applicant.user?.email || applicant.email}
        phoneNumber={applicant.phoneNumber}
        status={applicant.status || undefined}
      />
    </ConfirmDialog>
  );
}
