"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Dropdown, type DropdownOption } from "@/components/ui/dropdown";

export interface TableToolbarFilter {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
}

export interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filter?: TableToolbarFilter;
  /** Tombol aksi di sisi kanan (ekspor, tambah, dst.). */
  actions?: React.ReactNode;
  className?: string;
}

/** Toolbar tunggal: pencarian + filter status + slot aksi. */
export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Cari...",
  filter,
  actions,
  className,
}: TableToolbarProps) {
  return (
    <div
      className={cn(
        "relative z-10 flex flex-col items-stretch sm:items-center sm:flex-row justify-between gap-4 border-b border-outline-variant/10 bg-surface p-4 md:p-6",
        className
      )}
    >
      <div className="relative z-10 flex-1 w-full min-w-[260px] max-w-full sm:max-w-md group">
        <span
          className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 group-focus-within:text-primary transition-colors text-[20px]"
          aria-hidden
        >
          search
        </span>
        <input
          type="text"
          aria-label={searchPlaceholder}
          className="w-full min-w-0 rounded-lg border border-outline-variant/30 bg-surface py-2.5 pl-10 pr-9 text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface p-1 rounded-full cursor-pointer transition-colors"
            title="Hapus pencarian"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      <div className="relative z-20 flex w-full sm:w-auto items-center gap-3 shrink-0">
        {filter && (
          <div className={cn("flex-1 sm:w-[170px] sm:flex-none", filter.className)}>
            <Dropdown
              value={filter.value}
              options={filter.options}
              triggerClassName="w-full h-[42px]"
              onChange={filter.onChange}
            />
          </div>
        )}
        {actions}
      </div>
    </div>
  );
}
