"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  isPending?: boolean;
  className?: string;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function buildPages(current: number, total: number): PageItem[] {
  const items: PageItem[] = [];
  for (let page = 1; page <= total; page++) {
    if (page === 1 || page === total || (page >= current - 1 && page <= current + 1)) {
      items.push(page);
    } else if (page === current - 2) {
      items.push("ellipsis-start");
    } else if (page === current + 2) {
      items.push("ellipsis-end");
    }
  }
  return items;
}

/** Pagination tunggal untuk semua tabel (anggota, pendaftar, laporan, dst.). */
export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize = 10,
  onPageChange,
  isPending = false,
  className,
}: PaginationProps) {
  const safeTotal = Math.max(totalPages, 1);
  const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(totalCount, currentPage * pageSize);

  const go = (page: number) => {
    if (page < 1 || page > safeTotal || page === currentPage || isPending) return;
    onPageChange(page);
  };

  return (
    <div
      className={cn(
        "relative z-0 flex flex-col items-center justify-between gap-4 border-t border-outline-variant/10 bg-surface p-4 sm:flex-row",
        className
      )}
    >
      <span className="text-body-sm text-on-surface-variant">
        Menampilkan <span className="font-medium text-on-surface">{from}</span> hingga{" "}
        <span className="font-medium text-on-surface">{to}</span> dari{" "}
        <span className="font-medium text-on-surface">{totalCount}</span> data
      </span>

      <nav aria-label="Navigasi halaman" className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Halaman sebelumnya"
          onClick={() => go(currentPage - 1)}
          disabled={currentPage <= 1 || isPending}
          className="cursor-pointer rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden>
            chevron_left
          </span>
        </button>

        <div className="flex items-center gap-1 text-body-sm">
          {buildPages(currentPage, safeTotal).map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                aria-current={item === currentPage ? "page" : undefined}
                onClick={() => go(item)}
                disabled={isPending}
                className={cn(
                  "flex h-8 w-8 cursor-pointer items-center justify-center rounded font-medium transition-colors",
                  item === currentPage
                    ? "bg-primary text-white"
                    : "text-on-surface-variant hover:bg-surface-container-highest"
                )}
              >
                {item}
              </button>
            ) : (
              <span key={item} className="px-1 text-on-surface-variant" aria-hidden>
                ...
              </span>
            )
          )}
        </div>

        <button
          type="button"
          aria-label="Halaman berikutnya"
          onClick={() => go(currentPage + 1)}
          disabled={currentPage >= safeTotal || isPending}
          className="cursor-pointer rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden>
            chevron_right
          </span>
        </button>
      </nav>
    </div>
  );
}
