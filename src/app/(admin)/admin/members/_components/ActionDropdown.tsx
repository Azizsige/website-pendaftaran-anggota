"use client";

import React, { useState, useRef, useEffect } from 'react';
import { toast } from "sonner";
import { updateMemberStatus, deleteMember } from '@/actions/admin-members';

export const ActionDropdown = ({ 
  member, 
  onUpdate, 
  onEdit,
  onViewDetail,
  onConfirmAction,
  onDelete,
  userRole
}: { 
  member: any, 
  onUpdate?: () => void, 
  onEdit?: (member: any) => void,
  onViewDetail?: (member: any) => void,
  onConfirmAction?: (member: any, action: "ACTIVATE" | "SUSPEND" | "INACTIVE") => void,
  onDelete?: (member: any) => void,
  userRole?: string
}) => {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 220);
    }
    setOpen(!open);
  };

  // handleUpdateStatus is now handled by the parent modal callback, but we keep it just in case
  const handleUpdateStatus = async (newStatus: "ACTIVE" | "SUSPENDED" | "INACTIVE") => {
    if (onConfirmAction) {
      setOpen(false);
      onConfirmAction(member, newStatus === "ACTIVE" ? "ACTIVATE" : newStatus === "INACTIVE" ? "INACTIVE" : "SUSPEND");
      return;
    }
    
    setLoading(true);
    try {
      const res = await updateMemberStatus(member.id, newStatus);
      if (res.success) {
        toast.success("Status member berhasil diupdate!");
        setOpen(false);
        if (onUpdate) onUpdate();
      } else {
        toast.error(res.error || "Gagal mengupdate status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      setOpen(false);
      onDelete(member);
      return;
    }
    
    // Fallback if no callback provided
    if (!confirm("Apakah Anda yakin ingin menghapus member ini?")) return;
    setLoading(true);
    try {
      const res = await deleteMember(member.id);
      if (res.success) {
        toast.success("Member berhasil dihapus!");
        setOpen(false);
        if (onUpdate) onUpdate();
      } else {
        toast.error(res.error || "Gagal menghapus member");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        ref={buttonRef}
        onClick={toggleDropdown}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded-lg text-on-surface font-label-sm transition-colors shadow-sm disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Actions'}
        <span className="material-symbols-outlined text-[18px]">expand_more</span>
      </button>
      
      {open && (
        <div className={`absolute right-0 ${dropUp ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right'} w-48 bg-surface rounded-xl shadow-lg border border-outline-variant/20 py-2 z-50 flex flex-col animate-fade-in`}>
          <button 
            onClick={() => {
              setOpen(false);
              if (onViewDetail) onViewDetail(member);
            }}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-lowest text-on-surface text-left font-label-md transition-colors w-full"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            View Details
          </button>
          
          {userRole !== "STAFF" && (
            <button 
              onClick={() => {
                setOpen(false);
                if (onEdit) onEdit(member);
              }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-lowest text-on-surface text-left font-label-md transition-colors w-full"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Member
            </button>
          )}
          
          <div className="h-[1px] bg-outline-variant/20 my-1 mx-3" />
          
          {(userRole === "OWNER" || userRole === "SUPER_ADMIN") && (
            <>
              {member.status === 'ACTIVE' ? (
                <>
                  <button 
                    onClick={() => handleUpdateStatus('INACTIVE')}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-lowest text-on-surface-variant text-left font-label-md transition-colors w-full"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_off</span>
                    Inactive Member
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('SUSPENDED')}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#ffb4ab]/10 text-[#ba1a1a] text-left font-label-md transition-colors w-full"
                  >
                    <span className="material-symbols-outlined text-[18px]">block</span>
                    Suspend Member
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => handleUpdateStatus('ACTIVE')}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#006c49]/10 text-[#006c49] text-left font-label-md transition-colors w-full"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Activate Member
                </button>
              )}
              <button 
                onClick={handleDelete}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-error/10 text-error text-left font-label-md transition-colors w-full"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Delete Member
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
