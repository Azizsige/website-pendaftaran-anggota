import React from 'react';
import { getMembers, MembersClient } from '@/features/members';
import { requireAdmin } from '@/lib/auth/guards';

export default async function MembersPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await requireAdmin();
  const role = user.role;

  const searchParams = await props.searchParams;
  const search = typeof searchParams?.search === 'string' ? searchParams.search : '';
  const status = typeof searchParams?.status === 'string' ? searchParams.status : 'all';
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page) : 1;

  // Fetch data on server
  const { data, totalCount, totalPages, currentPage } = await getMembers(search, status, page, 10);

  return (
    <div className="min-h-screen bg-surface-container-lowest p-4 md:p-6 lg:p-8">
      <MembersClient 
        initialMembers={data}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        search={search}
        status={status}
        userRole={role}
      />
    </div>
  );
}
