import * as React from "react";

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
  "h-[18px] w-[18px] cursor-pointer rounded-[4px] border-outline-variant/50 accent-primary transition-colors";

/**
 * Tabel generik dengan state loading (skeleton), kosong, dan pilihan baris.
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
            <tr className="border-b border-outline-variant/20 bg-surface-container-low text-label-md font-medium text-on-surface-variant">
              {selection && (
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    aria-label="Pilih semua baris"
                    className={checkboxClass}
                    checked={allSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn("px-4 py-4 font-medium", column.headerClassName)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface">
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td colSpan={colSpan} className="px-4 py-4">
                    <div className="h-5 w-full animate-pulse rounded bg-surface-variant/50" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-8 text-center text-on-surface-variant">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const key = getRowKey(row);
                return (
                  <tr key={key} className="group transition-colors hover:bg-surface-container-lowest">
                    {selection && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label="Pilih baris"
                          className={checkboxClass}
                          checked={selection.selectedIds.includes(key)}
                          onChange={() => toggleOne(key)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className={cn("px-4 py-3", column.className)}>
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
