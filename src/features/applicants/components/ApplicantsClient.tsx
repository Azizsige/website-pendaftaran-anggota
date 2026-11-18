"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { updateApplicantStatus, deleteApplicant, updateAdminNotes } from "../actions";
import { trackAdminActivity } from "@/features/logs/actions";
import type { Applicant } from "../types";
import ApplicantDetailModal from "./ApplicantDetailModal";
import ApplicantRejectModal from "./ApplicantRejectModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PersonSummary } from "@/components/admin/PersonSummary";
import ApplicantsToolbar from "./ApplicantsToolbar";
import ApplicantsTable from "./ApplicantsTable";
import { Pagination } from "@/components/ui/pagination";

interface Props {
  initialApplicants: Applicant[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  userRole?: string;
  search: string;
  status: string;
}

export default function ApplicantsClient({
  initialApplicants,
  totalCount,
  totalPages,
  currentPage,
  userRole,
  search,
  status,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [rejectingApplicant, setRejectingApplicant] = useState<Applicant | null>(null);
  const [suspendingApplicant, setSuspendingApplicant] = useState<Applicant | null>(null);
  const [deletingApplicant, setDeletingApplicant] = useState<Applicant | null>(null);

  if (prevSearch !== search) {
    setPrevSearch(search);
    setSearchTerm(search);
  }

  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== search) {
        updateUrl({ search: searchTerm || null, page: "1" });
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, search]);

  const handleStatusChange = (value: string) => {
    updateUrl({ status: value === "all" ? null : value, page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateUrl({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExport = () => {
    const params = new URLSearchParams(searchParams.toString());
    const link = document.createElement("a");
    link.href = `/api/admin/pendaftar/export?${params.toString()}`;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleApprove = async (id: string) => {
    startTransition(async () => {
      const res = await updateApplicantStatus(id, "ACTIVE");
      if (!res.success) toast.error("Gagal menyetujui pendaftar: " + res.error);
      else {
        toast.success("Pendaftar berhasil disetujui");
        setSelectedApplicant(null);
        router.refresh();
      }
    });
  };

  const handleViewDetail = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    if (userRole && userRole !== "OWNER") {
      void trackAdminActivity({
        action: "VIEW_APPLICANT_DETAIL",
        entityType: "MemberProfile",
        entityId: applicant.id,
        details: `Membuka rincian berkas calon anggota ${applicant.user?.name || "-"} (NIM ${applicant.nim})`,
      });
    }
  };

  const handleCloseDetailModal = () => setSelectedApplicant(null);

  const confirmReject = async (id: string, reason?: string) => {
    startTransition(async () => {
      const res = await updateApplicantStatus(id, "REJECTED", reason);
      if (!res.success) toast.error("Gagal menolak pendaftar: " + res.error);
      else {
        toast.success("Pendaftar berhasil ditolak");
        setRejectingApplicant(null);
        if (selectedApplicant?.id === id) handleCloseDetailModal();
        router.refresh();
      }
    });
  };

  const confirmSuspend = async (id: string) => {
    startTransition(async () => {
      const res = await updateApplicantStatus(id, "SUSPENDED");
      if (!res.success) toast.error("Gagal membekukan pendaftar: " + res.error);
      else {
        toast.success("Status pendaftar berhasil dibekukan");
        setSuspendingApplicant(null);
        router.refresh();
      }
    });
  };

  const confirmDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deleteApplicant(id);
      if (!res.success) toast.error("Gagal menghapus pendaftar: " + res.error);
      else {
        toast.success("Data pendaftar berhasil dihapus permanen");
        setDeletingApplicant(null);
        router.refresh();
      }
    });
  };

  const handleSaveNotes = async (id: string, notes: string) => {
    startTransition(async () => {
      const res = await updateAdminNotes(id, notes);
      if (res.success) {
        toast.success("Catatan admin berhasil disimpan");
        if (selectedApplicant?.id === id) {
          setSelectedApplicant({ ...selectedApplicant, adminNotes: notes });
        }
        router.refresh();
      } else {
        toast.error("Gagal menyimpan catatan admin");
      }
    });
  };

  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-[#e2e8f0] bg-white dark:border-[#3c4d46] dark:bg-[#131d1a]">
      <ApplicantsToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={status}
        handleStatusChange={handleStatusChange}
        handleExport={handleExport}
      />

      <ApplicantsTable
        applicants={initialApplicants}
        isPending={isPending}
        onViewDetail={handleViewDetail}
        onDelete={setDeletingApplicant}
        onSuspend={setSuspendingApplicant}
        userRole={userRole}
        footer={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            isPending={isPending}
          />
        }
      />

      {selectedApplicant && (
        <ApplicantDetailModal
          applicant={selectedApplicant}
          isOpen={true}
          onClose={handleCloseDetailModal}
          onApprove={handleApprove}
          onReject={(id, notes) =>
            notes ? confirmReject(id, notes) : setRejectingApplicant(selectedApplicant)
          }
          onSaveNotes={handleSaveNotes}
          isPending={isPending}
          userRole={userRole}
        />
      )}

      {rejectingApplicant && (
        <ApplicantRejectModal
          applicant={rejectingApplicant}
          isOpen={true}
          onClose={() => setRejectingApplicant(null)}
          onConfirm={confirmReject}
          isPending={isPending}
        />
      )}

      {suspendingApplicant && (
        <ConfirmDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setSuspendingApplicant(null);
          }}
          tone="warning"
          icon="block"
          title="Bekukan Pendaftar?"
          description="Status calon anggota akan diubah menjadi Dibekukan"
          message="Pendaftar yang dibekukan tidak dapat mengakses kartu anggota hingga diaktifkan kembali oleh admin."
          confirmLabel="Ya, Bekukan"
          cancelLabel="Batal"
          isPending={isPending}
          pendingTitle="Membekukan Data"
          pendingMessage="Mohon tunggu sebentar..."
          onConfirm={() => confirmSuspend(suspendingApplicant.id)}
        >
          <PersonSummary
            id={suspendingApplicant.id}
            name={suspendingApplicant.user?.name}
            email={suspendingApplicant.user?.email}
            phone={suspendingApplicant.phoneNumber}
            status={suspendingApplicant.status}
          />
        </ConfirmDialog>
      )}

      {deletingApplicant && (
        <ConfirmDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setDeletingApplicant(null);
          }}
          tone="danger"
          icon="delete_forever"
          title="Hapus Data Pendaftar?"
          description="Konfirmasi tindakan destruktif sistem"
          message="Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Semua berkas formulir, dokumen lampiran, dan riwayat verifikasi akan dihapus dari sistem."
          confirmLabel="Ya, Hapus Permanen"
          requireText="HAPUS"
          acknowledgement="Saya memahami bahwa data pendaftar ini akan dihapus secara permanen dan tidak dapat dipulihkan."
          isPending={isPending}
          onConfirm={() => confirmDelete(deletingApplicant.id)}
        >
          <PersonSummary
            id={deletingApplicant.id}
            name={deletingApplicant.user?.name}
            email={deletingApplicant.user?.email}
            phone={deletingApplicant.phoneNumber}
            status={deletingApplicant.status}
          />
        </ConfirmDialog>
      )}
    </div>
  );
}
