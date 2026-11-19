"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, Clock, History } from "lucide-react";

import { formatDateTime } from "@/lib/format";
import type { PublicRejectionHistoryItem } from "@/lib/rejection-history";

interface RejectionHistoryEntry extends PublicRejectionHistoryItem {
  rejectedByName?: string | null;
}

interface RejectionHistorySectionProps {
  items: RejectionHistoryEntry[];
  variant?: "admin" | "public";
  title?: string;
  compact?: boolean;
  defaultOpenDesktop?: boolean;
  emptyMessage?: string;
}

const DEFAULT_VISIBLE_ITEMS = 3;

export function RejectionHistorySection({
  items,
  variant = "admin",
  title = "Riwayat penolakan",
  compact = false,
  defaultOpenDesktop = true,
  emptyMessage,
}: RejectionHistorySectionProps) {
  const [isOpen, setIsOpen] = useState(compact ? false : defaultOpenDesktop);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (variant !== "public" || compact || !defaultOpenDesktop) return;
    const syncTimer = window.setTimeout(() => {
      if (window.innerWidth <= 760) {
        setIsOpen(false);
      }
    }, 0);
    return () => window.clearTimeout(syncTimer);
  }, [variant, compact, defaultOpenDesktop]);

  if (!items || items.length === 0) {
    if (variant === "public" && emptyMessage) {
      return (
        <section
          aria-label={title}
          className="flex flex-col gap-3 min-w-0"
        >
          <h2 className="text-[13px] font-bold text-[#ba1a1a] dark:text-[#f87171]">
            {title} (0)
          </h2>
          <div className="rounded-[10px] border border-[#5c6b62]/20 dark:border-[#2a3b36] bg-[#f7f9fb] dark:bg-[#1a2824] p-3.5 text-[13px] text-[#3c4a42] dark:text-[#9fb3ac] leading-relaxed">
            {emptyMessage}
          </div>
        </section>
      );
    }
    return null;
  }

  if (variant === "admin") {
    return (
      <section
        aria-label="Riwayat Penolakan"
        className="rounded-xl border border-[#fecaca] bg-white p-5 dark:border-[#f87171]/35 dark:bg-[#131d1a]"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-[#0f172a] dark:text-[#eef2f4]">
            <History
              className="h-4 w-4 text-[#b91c1c] dark:text-[#fca5a5]"
              aria-hidden="true"
            />
            <span>Riwayat Penolakan ({items.length})</span>
          </h4>
        </div>

        <ol className="space-y-2.5">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="rounded-lg border border-[#fecaca]/80 bg-[#fef2f2] p-3 dark:border-[#f87171]/30 dark:bg-[#3b1214]"
            >
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-[#7f1d1d] dark:text-[#fecaca]">
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {formatDateTime(item.rejectedAt)} WIB
                </span>
                <span className="rounded bg-white/80 px-1.5 py-0.5 font-semibold text-[#991b1b] dark:bg-[#1a0b0d] dark:text-[#fca5a5]">
                  Penolakan #{items.length - index}
                  {item.rejectedByName ? ` (${item.rejectedByName})` : ""}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-[#7f1d1d] dark:text-[#fee2e2]">
                {item.reason}
              </p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const hasMore = items.length > DEFAULT_VISIBLE_ITEMS;
  const visibleItems = showAll ? items : items.slice(0, DEFAULT_VISIBLE_ITEMS);
  const hiddenCount = items.length - DEFAULT_VISIBLE_ITEMS;

  return (
    <section
      aria-label={title}
      className={
        compact
          ? "rounded-[10px] border border-[#5c6b62]/25 dark:border-[#2a3b36] bg-[#f7f9fb] dark:bg-[#1a2824]/80 px-3.5 py-2.5"
          : "flex flex-col gap-3.5 min-h-0"
      }
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 text-left cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] ${
          compact ? "min-h-[36px]" : "min-h-[32px]"
        }`}
      >
        <span className="inline-flex items-center gap-2 min-w-0">
          {compact && (
            <History
              className="h-4 w-4 text-[#991b1b] dark:text-[#f87171] shrink-0"
              aria-hidden="true"
            />
          )}
          <span
            className={`font-sans text-[13px] font-bold truncate ${
              compact
                ? "text-[#191c1e] dark:text-[#e9f1ee]"
                : "text-[#ba1a1a] dark:text-[#f87171]"
            }`}
          >
            {title} ({items.length})
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[#4b5850] dark:text-[#9fb3ac] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className={compact ? "mt-2.5 flex flex-col gap-2" : "flex flex-col gap-2.5 min-h-0"}>
          <ol
            className={`list-none m-0 p-0 grid gap-2.5 overflow-y-auto pr-0.5 ${
              compact ? "max-h-[210px]" : "max-h-[280px]"
            }`}
          >
            {visibleItems.map((item, index) => (
              <li
                key={item.id}
                className={`px-3 py-2.5 rounded-[10px] bg-[#f7f9fb] dark:bg-[#1a2824] border grid gap-1 ${
                  index === 0
                    ? "border-[#ba1a1a]/45 dark:border-[#f87171]/40"
                    : "border-[#5c6b62]/20 dark:border-[#2a3b36]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <time className="text-[12px] text-[#4b5850] dark:text-[#9fb3ac] tabular-nums">
                    {formatDateTime(item.rejectedAt)} WIB
                  </time>
                  <span className="text-[11.5px] font-bold text-[#991b1b] bg-[#fef2f2] border border-[#ba1a1a]/30 dark:text-[#f87171] dark:bg-[#f87171]/10 dark:border-[#f87171]/40 px-2 py-0.5 rounded-full whitespace-nowrap">
                    Penolakan #{items.length - index}
                  </span>
                </div>
                <p className="text-[13.5px] font-semibold text-[#191c1e] dark:text-[#e9f1ee] leading-snug break-words">
                  {item.reason}
                </p>
              </li>
            ))}
          </ol>

          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="self-start min-h-[36px] cursor-pointer px-2.5 py-1 rounded-lg text-[12.5px] font-semibold text-[#005236] hover:bg-[#e6f4ee] dark:text-[#34d399] dark:hover:bg-[#34d399]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] transition-colors"
            >
              {showAll
                ? `Ringkas (${DEFAULT_VISIBLE_ITEMS} terbaru)`
                : `Tampilkan semua (+${hiddenCount} riwayat lainnya)`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
