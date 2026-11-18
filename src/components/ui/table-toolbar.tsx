"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dropdown, type DropdownOption } from "@/components/ui/dropdown";

export interface TableToolbarFilter {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
}

export interface TableToolbarProps {
  title?: string;
  description?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filter?: TableToolbarFilter;
  /** Tombol aksi di sisi kanan (ekspor, tambah, dst.). */
  actions?: React.ReactNode;
  className?: string;
}

/** Toolbar tunggal bergaya Analytix: judul opsional, pencarian, filter, dan slot aksi. */
export function TableToolbar({
  title,
  description,
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
        "relative z-10 flex flex-col gap-4 border-b border-[#f1f5f9] dark:border-[#3c4d46] bg-white dark:bg-[#131d1a] px-5 py-4 sm:px-6",
        className
      )}
    >
      {(title || description) && (
        <div className="flex flex-col gap-0.5">
          {title && <h2 className="text-base font-semibold text-[#0f172a] dark:text-[#eef2f4]">{title}</h2>}
          {description && <p className="text-xs text-[#64748b] dark:text-[#94a89e]">{description}</p>}
        </div>
      )}

      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="group relative z-10 w-full min-w-0 flex-1 sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b] dark:text-[#94a89e] transition-colors group-focus-within:text-[#006c49] dark:group-focus-within:text-[#34d399]"
            aria-hidden
          />
          <input
            type="text"
            aria-label={searchPlaceholder}
            className="min-h-[44px] w-full min-w-0 rounded-lg border border-[#85929f] dark:border-[#5f736b] bg-white dark:bg-[#1a2723] py-2 pl-10 pr-10 text-sm text-[#0f172a] dark:text-[#eef2f4] placeholder:text-[#64748b] dark:placeholder:text-[#94a89e] transition-colors hover:border-[#64748b] dark:hover:border-[#94a89e] focus:border-[#006c49] dark:focus:border-[#34d399] focus:outline-none focus:ring-2 focus:ring-[#006c49]/15 dark:focus:ring-[#34d399]/25"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Hapus pencarian"
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#64748b] dark:text-[#94a89e] transition-colors hover:bg-[#f1f5f9] dark:hover:bg-[#22322d] hover:text-[#0f172a] dark:hover:text-[#eef2f4]"
              title="Hapus pencarian"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        <div className="relative z-20 flex w-full shrink-0 flex-wrap items-center gap-2.5 sm:w-auto">
          {filter && (
            <div className={cn("min-w-[160px] flex-1 sm:w-[190px] sm:flex-none", filter.className)}>
              <Dropdown
                value={filter.value}
                options={filter.options}
                triggerClassName="w-full min-h-[44px]"
                onChange={filter.onChange}
              />
            </div>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}
