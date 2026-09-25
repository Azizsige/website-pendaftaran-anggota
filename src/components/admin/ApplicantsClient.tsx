"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Dropdown } from "@/components/ui/dropdown";
import { updateApplicantStatus, deleteApplicant, getApplicants, updateAdminNotes } from "@/actions/admin-pendaftar";
import { toast } from "sonner";

import { Applicant, getStatusStyle, formatId } from "./ApplicantsUtils";
import ApplicantDetailModal from "./modals/ApplicantDetailModal";
import ApplicantRejectModal from "./modals/ApplicantRejectModal";
import ApplicantDeleteModal from "./modals/ApplicantDeleteModal";
import ApplicantsToolbar from "./ApplicantsToolbar";
import ApplicantsTable from "./ApplicantsTable";
import ApplicantsPagination from "./ApplicantsPagination";


interface Props {
  initialApplicants: Applicant[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export default function ApplicantsClient({
  initialApplicants,
  totalCount: initialTotalCount,
  totalPages: initialTotalPages,
  currentPage: initialCurrentPage,
}: Props) {
  // Local state for data
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isPending, startTransition] = useTransition();
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [rejectingApplicant, setRejectingApplicant] = useState<Applicant | null>(null);
  const [deletingApplicant, setDeletingApplicant] = useState<Applicant | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (!isInitialMount) setCurrentPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, isInitialMount]);

  // Handle filter changes (status)
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Fetch data when filters or page changes
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    startTransition(async () => {
      try {
        const res = await getApplicants(debouncedSearch, statusFilter, currentPage);
        setApplicants(res.data as any);
        setTotalCount(res.totalCount);
        setTotalPages(res.totalPages);
        setCurrentPage(res.currentPage);
      } catch (error) {
        console.error("Failed to fetch applicants:", error);
      }
    });
  }, [debouncedSearch, statusFilter, currentPage, isInitialMount]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter !== "all") params.set("status", statusFilter);
    window.location.href = `/api/admin/pendaftar/export?${params.toString()}`;
  };

  const handleApprove = async (id: string) => {
    startTransition(async () => {
      const res = await updateApplicantStatus(id, "ACTIVE");
      if (!res.success) {
        toast.error("Gagal menyetujui pendaftar: " + res.error);
      } else {
        toast.success("Pendaftar berhasil disetujui");
        // Re-fetch data to reflect changes
        const fresh = await getApplicants(debouncedSearch, statusFilter, currentPage);
        setApplicants(fresh.data as any);
        handleCloseDetailModal();
      }
    });
  };

  const handleCloseDetailModal = () => {
    setSelectedApplicant(null);
  };

  const confirmReject = async (id: string, reason?: string) => {
    startTransition(async () => {
      const res = await updateApplicantStatus(id, "REJECTED", reason);
      if (!res.success) {
        toast.error("Gagal menolak pendaftar: " + res.error);
      } else {
        toast.success("Pendaftar berhasil ditolak");
        const fresh = await getApplicants(debouncedSearch, statusFilter, currentPage);
        setApplicants(fresh.data as any);
        setRejectingApplicant(null);
        if (selectedApplicant?.id === id) {
          handleCloseDetailModal();
        }
      }
    });
  };

  const confirmDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deleteApplicant(id);
      if (!res.success) {
        toast.error("Gagal menghapus pendaftar: " + res.error);
      } else {
        toast.success("Data pendaftar berhasil dihapus permanen");
        const fresh = await getApplicants(debouncedSearch, statusFilter, currentPage);
        setApplicants(fresh.data as any);
        setTotalCount(fresh.totalCount);
        setTotalPages(fresh.totalPages);
        setDeletingApplicant(null);
      }
    });
  };

  const handleSaveNotes = async (id: string, notes: string) => {
    startTransition(async () => {
      const res = await updateAdminNotes(id, notes);
      if (res.success) {
        toast.success("Catatan admin berhasil disimpan");
        if (selectedApplicant && selectedApplicant.id === id) {
          setSelectedApplicant({ ...selectedApplicant, adminNotes: notes });
        }
        const fresh = await getApplicants(debouncedSearch, statusFilter, currentPage);
        setApplicants(fresh.data as any);
      } else {
        toast.error("Gagal menyimpan catatan admin");
      }
    });
  };

  const handleSuspend = async (id: string) => {
    if (confirm("Are you sure you want to suspend this applicant?")) {
      startTransition(async () => {
        const res = await updateApplicantStatus(id, "SUSPENDED");
        if (!res.success) {
          toast.error("Gagal memblokir pendaftar: " + res.error);
        } else {
          toast.success("Pendaftar berhasil diblokir (suspended)");
          const fresh = await getApplicants(debouncedSearch, statusFilter, currentPage);
          setApplicants(fresh.data as any);
        }
      });
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-outline-variant/20 shadow-sm flex flex-col overflow-hidden relative min-h-[400px]">
      {/* Loading Overlay */}
      {isPending && !selectedApplicant && !rejectingApplicant && !deletingApplicant && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-surface-lowest/50 backdrop-blur-[2px] transition-all">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full shadow-lg border border-outline-variant text-on-surface">
            <span className="material-symbols-outlined text-primary animate-spin">progress_activity</span>
            <span className="font-label-md text-sm">Memuat Data...</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <ApplicantsToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        handleStatusChange={handleStatusChange}
        handleExport={handleExport}
      />

      {/* Table Container */}
      <ApplicantsTable
        applicants={applicants}
        isPending={isPending}
        onViewDetail={setSelectedApplicant}
        onDelete={setDeletingApplicant}
        onSuspend={handleSuspend}
      />

      {/* Pagination */}
      <ApplicantsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        isPending={isPending}
      />

      {/* Modals */}
      {selectedApplicant && (
        <ApplicantDetailModal
          applicant={selectedApplicant}
          isOpen={true}
          onClose={handleCloseDetailModal}
          onApprove={handleApprove}
          onReject={(id, notes) => {
            if (notes) {
              confirmReject(id, notes);
            } else {
              setRejectingApplicant(selectedApplicant);
            }
          }}
          onSaveNotes={handleSaveNotes}
          isPending={isPending}
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

      {deletingApplicant && (
        <ApplicantDeleteModal
          applicant={deletingApplicant}
          isOpen={true}
          onClose={() => setDeletingApplicant(null)}
          onConfirm={confirmDelete}
          isPending={isPending}
        />
      )}
    </div>
  );
}
