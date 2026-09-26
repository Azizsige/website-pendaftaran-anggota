"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dropdown } from "@/components/ui/dropdown";
import { DrawerTrigger } from "@/components/ui/drawer";
import { useSession } from "next-auth/react";

// Components
import { ActionDropdown } from './_components/ActionDropdown';
import { AddMemberDrawer } from './_components/AddMemberDrawer';
import { EditMemberDrawer } from './_components/EditMemberDrawer';
import { getMembers, updateMemberStatus, deleteMember } from '@/actions/admin-members';
import { getStatusStyle, getStatusDotStyle } from './_components/data';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from "sonner";

import ApplicantDetailModal from '@/components/admin/modals/ApplicantDetailModal';
import MemberConfirmModal from '@/components/admin/modals/MemberConfirmModal';
import ApplicantDeleteModal from '@/components/admin/modals/ApplicantDeleteModal';

export default function MembersPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedEditMember, setSelectedEditMember] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [selectedViewMember, setSelectedViewMember] = useState<any>(null);
  const [selectedConfirmMember, setSelectedConfirmMember] = useState<any>(null);
  const [selectedDeleteMember, setSelectedDeleteMember] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<"ACTIVATE" | "SUSPEND" | "INACTIVE" | null>(null);
  const [isPending, setIsPending] = useState(false);
  
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();
  const limit = 10;

  useEffect(() => {
    if (searchParams?.get("action") === "new") {
      setIsDrawerOpen(true);
      router.replace("/admin/members");
    }
  }, [searchParams, router]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMembers(debouncedSearch, status, page, limit);
      setMembers(res.data);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, page]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(members.map(m => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Helper for pagination
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - 1 && i <= page + 1)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`w-7 h-7 flex items-center justify-center text-body-sm font-medium rounded transition-colors cursor-pointer ${
              page === i 
                ? "bg-primary text-on-primary" 
                : "text-on-surface hover:bg-surface-container-highest"
            }`}
          >
            {i}
          </button>
        );
      } else if (
        i === page - 2 ||
        i === page + 2
      ) {
        pages.push(<span key={i} className="text-on-surface-variant px-1">...</span>);
      }
    }
    return pages;
  };

  const handleConfirmAction = async (id: string) => {
    if (!confirmAction) return;
    setIsPending(true);
    try {
      const statusToSet = confirmAction === "ACTIVATE" ? "ACTIVE" : confirmAction === "INACTIVE" ? "INACTIVE" : "SUSPENDED";
      const res = await updateMemberStatus(id, statusToSet);
      if (res.success) {
        toast.success(`Status member berhasil diupdate!`);
        setSelectedConfirmMember(null);
        setConfirmAction(null);
        fetchMembers();
      } else {
        toast.error(res.error || "Gagal mengupdate status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsPending(false);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    setIsPending(true);
    try {
      const res = await deleteMember(id);
      if (res.success) {
        toast.success("Member berhasil dihapus!");
        setSelectedDeleteMember(null);
        fetchMembers();
      } else {
        toast.error(res.error || "Gagal menghapus member");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display-sm text-[36px] font-bold text-on-surface tracking-tight">Manajemen Anggota</h1>
            <p className="text-body-lg text-on-surface-variant mt-1">Kelola data seluruh anggota terdaftar dalam organisasi Anda.</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full min-w-[250px] md:max-w-md relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Cari anggota berdasarkan nama, NIM, atau email..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full min-w-0 pl-12 pr-4 py-3 bg-surface border border-outline-variant/30 rounded-full text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <div className="flex-1 md:flex-none">
              <select 
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="w-full md:w-[150px] h-[48px] px-4 rounded-lg bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Semua Status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Tidak Aktif</option>
                <option value="SUSPENDED">Dibekukan</option>
              </select>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button 
                onClick={() => {
                  const params = new URLSearchParams();
                  if (search) params.set("search", search);
                  if (status !== "all") params.set("status", status);
                  if (selectedIds.length > 0) params.set("ids", selectedIds.join(","));
                  window.location.href = `/api/admin/members/export?${params.toString()}`;
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-label-md rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span className="hidden sm:inline">Ekspor Data</span>
              </button>
              
              {(userRole === "OWNER" || userRole === "SUPER_ADMIN") && (
                <AddMemberDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} onSuccess={fetchMembers}>
                  <DrawerTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md rounded-lg transition-colors shadow-sm cursor-pointer">
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      Tambah Anggota
                    </button>
                  </DrawerTrigger>
                </AddMemberDrawer>
              )}
              
              <EditMemberDrawer 
                open={isEditDrawerOpen} 
                onOpenChange={setIsEditDrawerOpen} 
                member={selectedEditMember} 
                onSuccess={fetchMembers} 
              />
            </div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-surface border border-outline-variant/20 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  <th className="py-4 px-4 w-12">
                    <input 
                      className="rounded-[4px] border-outline-variant/50 text-[#006c49] focus:ring-[#006c49] accent-[#006c49] cursor-pointer w-[18px] h-[18px] transition-colors" 
                      type="checkbox" 
                      checked={selectedIds.length === members.length && members.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant font-medium">Info Anggota</th>
                  <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant font-medium">NIM & Kontak</th>
                  <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant font-medium">Fakultas & Jurusan</th>
                  <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant font-medium">Tanggal Bergabung</th>
                  <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant font-medium">Status</th>
                  <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant font-medium text-right w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-on-surface-variant">Memuat data anggota...</td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-on-surface-variant">Tidak ada anggota yang ditemukan.</td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="py-3 px-4">
                        <input 
                          className="rounded-[4px] border-outline-variant/50 text-[#006c49] focus:ring-[#006c49] accent-[#006c49] cursor-pointer w-[18px] h-[18px] transition-colors" 
                          type="checkbox" 
                          checked={selectedIds.includes(member.id)}
                          onChange={() => handleSelectOne(member.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-body-md text-on-surface font-medium">{member.user?.name}</span>
                          <span className="font-body-sm text-on-surface-variant">{member.user?.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-body-md text-on-surface-variant">{member.nim || '-'}</span>
                          <span className="font-body-sm text-on-surface-variant">{member.phoneNumber || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-body-md text-on-surface-variant">{member.faculty || '-'}</span>
                          <span className="font-body-sm text-on-surface-variant">{member.major || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-body-md text-on-surface-variant">{new Date(member.joinDate).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusStyle(member.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotStyle(member.status)}`}></span>
                          {member.status === 'ACTIVE' ? 'Aktif' : member.status === 'INACTIVE' ? 'Tidak Aktif' : member.status === 'SUSPENDED' ? 'Dibekukan' : member.status}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end">
                          <ActionDropdown 
                            member={member} 
                            onUpdate={fetchMembers} 
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
          
          {/* Pagination */}
          {!loading && members.length > 0 && (
            <div className="p-4 border-t border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest">
              <span className="text-body-sm text-on-surface-variant">
                Menampilkan {Math.min((page - 1) * limit + 1, totalCount)} hingga {Math.min(page * limit, totalCount)} dari {totalCount} data
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 text-on-surface-variant hover:bg-surface-container-highest rounded transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {renderPagination()}
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 text-on-surface-variant hover:bg-surface-container-highest rounded transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedViewMember && (
        <ApplicantDetailModal
          applicant={selectedViewMember}
          isOpen={true}
          onClose={() => setSelectedViewMember(null)}
          titleMode="member"
        />
      )}

      {selectedConfirmMember && confirmAction && (
        <MemberConfirmModal
          member={selectedConfirmMember}
          isOpen={true}
          onClose={() => {
            setSelectedConfirmMember(null);
            setConfirmAction(null);
          }}
          onConfirm={handleConfirmAction}
          isPending={isPending}
          actionType={confirmAction}
        />
      )}

      {selectedDeleteMember && (
        <ApplicantDeleteModal
          applicant={selectedDeleteMember}
          isOpen={true}
          onClose={() => setSelectedDeleteMember(null)}
          onConfirm={handleConfirmDelete}
          isPending={isPending}
          titleMode="member"
        />
      )}
    </div>
  );
}
