import React from "react";

interface ReportTableProps {
  loading: boolean;
  members: any[];
  page: number;
  totalCount: number;
  totalPages: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export function ReportTable({ loading, members, page, totalCount, totalPages, limit, onPageChange }: ReportTableProps) {
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pages.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`w-7 h-7 flex items-center justify-center text-body-sm font-medium rounded transition-colors cursor-pointer ${
              page === i 
                ? "bg-primary text-on-primary" 
                : "text-on-surface hover:bg-surface-container-highest"
            }`}
          >
            {i}
          </button>
        );
      } else if (i === page - 2 || i === page + 2) {
        pages.push(<span key={i} className="text-on-surface-variant px-1">...</span>);
      }
    }
    return pages;
  };

  return (
    <div className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-medium">Tanggal Mendaftar</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-medium">NIM</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-medium">Nama Lengkap</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-medium">Fakultas / Jurusan</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-medium">Status</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-medium">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-outline-variant/10">
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-surface-variant/50 animate-pulse rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-20 bg-surface-variant/50 animate-pulse rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-32 bg-surface-variant/50 animate-pulse rounded"></div></td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="h-4 w-28 bg-surface-variant/50 animate-pulse rounded"></div>
                      <div className="h-3 w-20 bg-surface-variant/40 animate-pulse rounded"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><div className="h-6 w-16 bg-surface-variant/50 animate-pulse rounded-full"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-surface-variant/50 animate-pulse rounded"></div></td>
                </tr>
              ))
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-on-surface-variant">Tidak ada data yang cocok dengan filter.</td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-surface-container-lowest transition-colors group">
                  <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface">
                    {new Date(member.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 font-body-sm text-on-surface-variant">{member.nim || '-'}</td>
                  <td className="px-6 py-4 font-body-sm text-body-sm font-medium text-on-surface">{member.user?.name || '-'}</td>
                  <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">
                    {member.faculty || '-'}<br/>
                    <span className="text-xs">{member.major || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      member.status === 'ACTIVE' || member.status === 'APPROVED' ? 'bg-primary-container/20 text-primary border border-primary-container/30' :
                      member.status === 'PENDING' ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                      'bg-error/20 text-error border border-error/30'
                    }`}>
                      {member.status === 'ACTIVE' ? 'Aktif' : member.status === 'INACTIVE' ? 'Tidak Aktif' : member.status === 'PENDING' ? 'Menunggu' : member.status === 'SUSPENDED' ? 'Dibekukan' : 'Ditolak'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{member.adminNotes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {!loading && members.length > 0 && (
        <div className="p-4 border-t border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest">
          <span className="text-body-sm text-on-surface-variant">
            Menampilkan {Math.min((page - 1) * limit + 1, totalCount)} hingga {Math.min(page * limit, totalCount)} dari {totalCount} data
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1 text-on-surface-variant hover:bg-surface-container-highest rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {renderPagination()}
            <button 
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1 text-on-surface-variant hover:bg-surface-container-highest rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
