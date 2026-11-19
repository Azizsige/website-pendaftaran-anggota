"use client";

import React from "react";

import ApplicantDetailModal from "@/features/applicants/components/ApplicantDetailModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PersonSummary } from "@/components/admin/PersonSummary";
import { SuspendReasonDialog } from "@/components/admin/SuspendReasonDialog";
import type { MemberWithUser } from "../types";
import type { ConfirmActionType } from "../hooks/useMembers";

interface MembersModalsProps {
  selectedViewMember: MemberWithUser | null;
  onCloseView: () => void;
  selectedConfirmMember: MemberWithUser | null;
  confirmAction: ConfirmActionType;
  onCloseConfirm: () => void;
  onConfirmAction: (
    id: string,
    options?: { reason?: string; suspendedUntil?: string | null }
  ) => void;
  selectedDeleteMember: MemberWithUser | null;
  onCloseDelete: () => void;
  onConfirmDelete: (id: string) => void;
  isPending: boolean;
}

export function MembersModals({
  selectedViewMember,
  onCloseView,
  selectedConfirmMember,
  confirmAction,
  onCloseConfirm,
  onConfirmAction,
  selectedDeleteMember,
  onCloseDelete,
  onConfirmDelete,
  isPending,
}: MembersModalsProps) {
  return (
    <>
      {selectedViewMember && (
        <ApplicantDetailModal
          applicant={selectedViewMember}
          isOpen={true}
          onClose={onCloseView}
          titleMode="member"
        />
      )}

      {selectedConfirmMember && confirmAction === "SUSPEND" && (
        <SuspendReasonDialog
          key={selectedConfirmMember.id}
          open={true}
          onClose={onCloseConfirm}
          person={{
            id: selectedConfirmMember.id,
            name: selectedConfirmMember.user?.name,
            email: selectedConfirmMember.user?.email,
            phoneNumber: selectedConfirmMember.phoneNumber,
            status: selectedConfirmMember.status,
          }}
          title="Bekukan Akun Anggota?"
          description="Berikan alasan pembekuan dan durasi pembatasan bila perlu"
          isPending={isPending}
          onConfirm={(id, reason, suspendedUntil) =>
            onConfirmAction(id, { reason, suspendedUntil })
          }
        />
      )}

      {selectedConfirmMember &&
        confirmAction &&
        confirmAction !== "SUSPEND" && (
          <ConfirmDialog
            open={true}
            onOpenChange={(open) => {
              if (!open) onCloseConfirm();
            }}
            tone={confirmAction === "ACTIVATE" ? "primary" : "neutral"}
            icon={confirmAction === "ACTIVATE" ? "check_circle" : "person_off"}
            title={
              confirmAction === "ACTIVATE"
                ? "Aktifkan Kembali Anggota?"
                : "Nonaktifkan Anggota?"
            }
            description={
              confirmAction === "ACTIVATE"
                ? "Konfirmasi pengaktifan kembali status keanggotaan"
                : "Konfirmasi penonaktifan sementara status keanggotaan"
            }
            message={
              confirmAction === "ACTIVATE"
                ? "Tindakan ini akan memulihkan akun anggota sehingga mereka dapat masuk dan mengakses KTA digital kembali."
                : "Tindakan ini menonaktifkan akun anggota sementara waktu. Seluruh data anggota tetap tersimpan aman."
            }
            confirmLabel={
              confirmAction === "ACTIVATE"
                ? "Ya, Aktifkan Kembali"
                : "Ya, Nonaktifkan"
            }
            isPending={isPending}
            onConfirm={() => onConfirmAction(selectedConfirmMember.id)}
          >
            <PersonSummary
              id={selectedConfirmMember.id}
              name={selectedConfirmMember.user?.name}
              email={selectedConfirmMember.user?.email}
              phone={selectedConfirmMember.phoneNumber}
              status={selectedConfirmMember.status}
            />
          </ConfirmDialog>
        )}

      {selectedDeleteMember && (
        <ConfirmDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) onCloseDelete();
          }}
          tone="danger"
          icon="delete_forever"
          title="Hapus Data Anggota?"
          description="Konfirmasi tindakan destruktif sistem"
          message="Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Semua berkas formulir, dokumen lampiran, dan riwayat verifikasi akan dihapus dari sistem."
          confirmLabel="Ya, Hapus Permanen"
          requireText="HAPUS"
          acknowledgement="Saya memahami bahwa data anggota ini akan dihapus secara permanen dan tidak dapat dipulihkan."
          isPending={isPending}
          onConfirm={() => onConfirmDelete(selectedDeleteMember.id)}
        >
          <PersonSummary
            id={selectedDeleteMember.id}
            name={selectedDeleteMember.user?.name}
            email={selectedDeleteMember.user?.email}
            phone={selectedDeleteMember.phoneNumber}
            status={selectedDeleteMember.status}
          />
        </ConfirmDialog>
      )}
    </>
  );
}
