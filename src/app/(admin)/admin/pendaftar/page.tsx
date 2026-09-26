import React from 'react';
import { getApplicants } from '@/actions/admin-pendaftar';
import ApplicantsClient from '@/components/admin/ApplicantsClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ApplicantsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  // Fetch initial data for the first page, no filters
  const { data, totalCount, totalPages, currentPage } = await getApplicants("", "all", 1);

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
          initialApplicants={data as any} 
          totalCount={totalCount} 
          totalPages={totalPages} 
          currentPage={currentPage} 
          userRole={role}
        />
      </div>
    </div>
  );
}
