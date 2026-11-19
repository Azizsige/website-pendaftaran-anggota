import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  ACTIVITY_LOGS_PAGE_SIZE,
  LogsClient,
  getActivityLogsData,
} from "@/features/logs";
import { requireAdmin } from "@/lib/auth/guards";
import { ROLES } from "@/lib/constants/roles";
import { verifyOwnerEnvironmentAccess } from "@/lib/owner-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log Aktivitas & Diagnostik | Portal Pendaftaran",
  description:
    "Audit trail aktivitas pengelola non-Owner dan ringkasan kesehatan basis data sistem.",
};

export default async function ActivityLogsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const admin = await requireAdmin();

  if (admin.role !== ROLES.OWNER) {
    redirect("/unauthorized?from=/admin/logs");
  }

  const envAccess = await verifyOwnerEnvironmentAccess();
  if (!envAccess.allowed) {
    redirect("/unauthorized?from=/admin/logs");
  }

  const searchParams = await props.searchParams;
  const search = typeof searchParams?.search === "string" ? searchParams.search : "";
  const role = typeof searchParams?.role === "string" ? searchParams.role : "all";
  const category = typeof searchParams?.category === "string" ? searchParams.category : "all";
  const parsedPage =
    typeof searchParams?.page === "string" ? Number.parseInt(searchParams.page, 10) : 1;
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const { data, totalCount, totalPages, currentPage, diagnostics } =
    await getActivityLogsData({
      search,
      role,
      category,
      page,
      limit: ACTIVITY_LOGS_PAGE_SIZE,
    });

  return (
    <div className="flex-1 bg-[#f4f6f8] p-4 sm:p-6 lg:p-8 dark:bg-[#0d1412]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl dark:text-[#eef2f4]">
              Log Aktivitas &amp; Diagnostik Sistem
            </h1>
            <p className="mt-1 text-sm text-[#475569] dark:text-[#cbd6d0]">
              Pantau jejak audit seluruh pengelola selain akun Owner beserta kondisi koneksi basis data secara langsung.
            </p>
          </div>
        </div>

        <LogsClient
          initialLogs={data}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          diagnostics={diagnostics}
          search={search}
          role={role}
          category={category}
        />
      </div>
    </div>
  );
}
