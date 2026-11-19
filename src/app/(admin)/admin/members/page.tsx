import React from "react";
import { getMembers, MembersClient } from "@/features/members";
import { requireAdmin } from "@/lib/auth/guards";

export default async function MembersPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireAdmin();
  const role = user.role;

  const searchParams = await props.searchParams;
  const search = typeof searchParams?.search === "string" ? searchParams.search : "";
  const status = typeof searchParams?.status === "string" ? searchParams.status : "all";
  const parsedPage =
    typeof searchParams?.page === "string" ? Number.parseInt(searchParams.page, 10) : 1;
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const { data, totalCount, totalPages, currentPage } = await getMembers(search, status, page, 10);

  return (
    <div className="flex-1 bg-[#f4f6f8] dark:bg-[#0d1412] p-4 sm:p-6 lg:p-8">
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
