import React from 'react';
import { getApplicants, ApplicantsClient } from '@/features/applicants';
import { requireAdmin } from '@/lib/auth/guards';

export default async function ApplicantsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await requireAdmin();
  const role = user.role;

  const searchParams = await props.searchParams;
  const search = typeof searchParams?.search === 'string' ? searchParams.search : '';
  const status = typeof searchParams?.status === 'string' ? searchParams.status : 'all';
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page) : 1;

  // Fetch real data on server!
  const { data, totalCount, totalPages, currentPage } = await getApplicants(search, status, page, 10);

  return (
    <div className="flex-1 overflow-y-auto bg-surface-container-low p-4 md:p-6 lg:p-8">
      <div className="max-w-container-max mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface tracking-tight mb-1">
              Manajemen Calon Anggota
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Tinjau dan proses pendaftaran anggota baru
            </p>
          </div>
        </div>

        {/* Client Component for Data Table and Interactivity */}
        <ApplicantsClient 
          initialApplicants={data} 
          totalCount={totalCount} 
          totalPages={totalPages} 
          currentPage={currentPage} 
          userRole={role}
          search={search}
          status={status}
        />
      </div>
    </div>
  );
}
