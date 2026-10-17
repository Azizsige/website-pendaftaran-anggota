"use client";

import React from "react";
import { Pagination } from "@/components/ui/pagination";

type Props = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  isPending?: boolean;
};

/**
 * Adapter kompatibilitas yang meneruskan ke komponen generic Pagination.
 */
export default function ApplicantsPagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  isPending,
}: Props) {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
      isPending={isPending}
    />
  );
}
