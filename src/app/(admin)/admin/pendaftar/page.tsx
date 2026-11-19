import React from "react";
import { getApplicants, ApplicantsClient } from "@/features/applicants";
import { requireAdmin } from "@/lib/auth/guards";

export default async function ApplicantsPage(props: {
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

  const { data, totalCount, totalPages, currentPage } = await getApplicants(search, status, page, 10);

  return (
    <div className="flex-1 bg-[#f4f6f8] dark:bg-[#0d1412] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#0f172a] dark:text-[#eef2f4] sm:text-2xl">
              Manajemen Calon Anggota
            </h1>
            <p className="mt-1 text-sm text-[#475569] dark:text-[#cbd6d0]">
              Tinjau berkas pendaftaran, verifikasi identitas mahasiswa, dan proses status calon anggota.
            </p>
          </div>
        </div>

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
