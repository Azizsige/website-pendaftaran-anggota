"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

/** Pagination tunggal bergaya kapsul bundar untuk semua tabel admin. */
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
        "relative z-0 flex flex-col items-center justify-between gap-4 border-t border-[#f1f5f9] dark:border-[#3c4d46] bg-white dark:bg-[#131d1a] px-5 py-4 sm:flex-row sm:px-6",
        className
      )}
    >
      <span className="text-[13px] text-[#475569] dark:text-[#cbd6d0] tabular-nums">
        Menampilkan <span className="font-semibold text-[#0f172a] dark:text-[#eef2f4]">{from}</span> hingga{" "}
        <span className="font-semibold text-[#0f172a] dark:text-[#eef2f4]">{to}</span> dari{" "}
        <span className="font-semibold text-[#0f172a] dark:text-[#eef2f4]">{totalCount}</span> data
      </span>

      <nav aria-label="Navigasi halaman" className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          aria-label="Halaman sebelumnya"
          onClick={() => go(currentPage - 1)}
          disabled={currentPage <= 1 || isPending}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#e6f4ee] dark:bg-[#0c3528] text-[#005236] dark:text-[#6ee7b7] transition-colors hover:bg-[#cde9dc] dark:hover:bg-[#104736] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] disabled:cursor-not-allowed disabled:bg-[#f1f5f9] dark:disabled:bg-[#1a2723] disabled:text-[#94a3b8] dark:disabled:text-[#5f736b]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <div className="flex items-center gap-1">
          {buildPages(currentPage, safeTotal).map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                aria-current={item === currentPage ? "page" : undefined}
                onClick={() => go(item)}
                disabled={isPending}
                className={cn(
                  "flex h-11 min-w-[44px] cursor-pointer items-center justify-center rounded-full px-3 text-[13px] font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] disabled:cursor-not-allowed disabled:opacity-60",
                  item === currentPage
                    ? "bg-[#006c49] dark:bg-[#057a55] text-white shadow-sm"
                    : "text-[#475569] dark:text-[#cbd6d0] hover:bg-[#f1f5f9] dark:hover:bg-[#1a2723] hover:text-[#0f172a] dark:hover:text-[#eef2f4]"
                )}
              >
                {String(item).padStart(2, "0")}
              </button>
            ) : (
              <span key={item} className="px-1.5 text-xs font-semibold text-[#64748b] dark:text-[#94a89e]" aria-hidden>
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
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#e6f4ee] dark:bg-[#0c3528] text-[#005236] dark:text-[#6ee7b7] transition-colors hover:bg-[#cde9dc] dark:hover:bg-[#104736] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] disabled:cursor-not-allowed disabled:bg-[#f1f5f9] dark:disabled:bg-[#1a2723] disabled:text-[#94a3b8] dark:disabled:text-[#5f736b]"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </nav>
    </div>
  );
}
