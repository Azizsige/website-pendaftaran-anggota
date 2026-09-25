import React from "react";

type Props = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  isPending: boolean;
};

export default function ApplicantsPagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  isPending,
}: Props) {
  return (
    <div className="p-4 border-t border-outline-variant/10 bg-surface flex flex-col sm:flex-row items-center justify-between gap-4 relative z-0">
      <span className="font-body-sm text-body-sm text-on-surface-variant">
        Showing <span className="font-medium text-on-surface">{totalCount === 0 ? 0 : (currentPage - 1) * 10 + 1}</span> to{" "}
        <span className="font-medium text-on-surface">{Math.min(totalCount, currentPage * 10)}</span> of{" "}
        <span className="font-medium text-on-surface">{totalCount}</span> results
      </span>
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isPending}
          className="p-1.5 rounded text-on-surface-variant hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <div className="flex items-center gap-1 font-body-sm text-body-sm">
          {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isPending}
              className={`w-8 h-8 rounded flex items-center justify-center font-medium transition-colors ${
                page === currentPage
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0 || isPending}
          className="p-1.5 rounded text-on-surface-variant hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </nav>
    </div>
  );
}
