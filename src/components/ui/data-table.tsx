import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  /** Kelas untuk sel `<td>`. */
  className?: string;
  /** Kelas untuk header `<th>` (mis. lebar, rata kanan). */
  headerClassName?: string;
}

export interface DataTableSelection {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  loadingRows?: number;
  emptyMessage?: string;
  /** Kelas tambahan untuk `<table>`, mis. `min-w-[900px]`. */
  tableClassName?: string;
  selection?: DataTableSelection;
  className?: string;
  /** Tampil di bawah tabel (mis. `<Pagination />`). */
  footer?: React.ReactNode;
}

const checkboxClass =
  "h-[18px] w-[18px] cursor-pointer rounded border border-[#85929f] dark:border-[#5f736b] bg-white dark:bg-[#1a2723] accent-[#006c49] dark:accent-[#10b981] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49]/30 dark:focus-visible:ring-[#34d399]/35";

/**
 * Tabel generik dengan state loading terstruktur, kosong, dan pilihan baris.
 * Dipakai oleh tabel anggota, pendaftar, laporan, dan admin.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  loadingRows = 5,
  emptyMessage = "Tidak ada data.",
  tableClassName = "min-w-[800px]",
  selection,
  className,
  footer,
}: DataTableProps<T>) {
  const colSpan = columns.length + (selection ? 1 : 0);
  const allSelected =
    !!selection && rows.length > 0 && selection.selectedIds.length === rows.length;

  const toggleAll = (checked: boolean) => {
    selection?.onChange(checked ? rows.map(getRowKey) : []);
  };

  const toggleOne = (id: string) => {
    if (!selection) return;
    const { selectedIds, onChange } = selection;
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative z-0 overflow-x-auto">
        <table
          className={cn("w-full border-collapse text-left", tableClassName)}
          aria-busy={isLoading}
        >
          <thead>
            <tr className="border-y border-[#e2e8f0] dark:border-[#3c4d46] bg-[#f8fafc] dark:bg-[#1a2723] text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
              {selection && (
                <th className="w-12 px-4 py-3.5">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      aria-label="Pilih semua baris"
                      className={checkboxClass}
                      checked={allSelected}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  </div>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3.5 font-semibold whitespace-nowrap",
                    column.headerClassName
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9] dark:divide-[#24332d] bg-white dark:bg-[#131d1a] text-[14px] text-[#0f172a] dark:text-[#eef2f4]">
            {isLoading ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12">
                  <div
                    role="status"
                    aria-live="polite"
                    className="flex flex-col items-center justify-center gap-2.5 text-center"
                  >
                    <Loader2 className="h-5 w-5 animate-spin text-[#006c49] dark:text-[#34d399]" aria-hidden />
                    <span className="text-sm font-medium text-[#475569] dark:text-[#cbd6d0]">
                      Memuat data tabel...
                    </span>
                    <span className="sr-only">Menunggu {loadingRows} baris data</span>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12 text-center text-sm text-[#475569] dark:text-[#cbd6d0]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const key = getRowKey(row);
                const isSelected = !!selection?.selectedIds.includes(key);
                return (
                  <tr
                    key={key}
                    className={cn(
                      "group transition-colors",
                      isSelected ? "bg-[#e6f4ee]/45 dark:bg-[#0c3528]/70" : "hover:bg-[#f8fafc] dark:hover:bg-[#1a2723]"
                    )}
                  >
                    {selection && (
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            aria-label="Pilih baris"
                            className={checkboxClass}
                            checked={isSelected}
                            onChange={() => toggleOne(key)}
                          />
                        </div>
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className={cn("px-4 py-3.5 align-middle", column.className)}>
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
