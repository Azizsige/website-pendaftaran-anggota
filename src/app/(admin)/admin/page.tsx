import { DashboardClient, getDashboardData } from "@/features/dashboard";
import { requireAdmin } from "@/lib/auth/guards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview Admin | Portal Pendaftaran",
  description: "Dashboard ringkasan statistik dan aktivitas pendaftar terbaru.",
};

export default async function AdminDashboard(props: {
  searchParams?: Promise<{ from?: string; to?: string; chart_range?: string }>;
}) {
  await requireAdmin();
  const searchParams = (await props.searchParams) || {};

  const initialFrom = searchParams.from || undefined;
  const initialTo = searchParams.to || undefined;
  const initialChartRange = searchParams.chart_range || undefined;

  const initialData = await getDashboardData({
    from: initialFrom,
    to: initialTo,
    chartRange: initialChartRange,
  });

  return (
    <DashboardClient
      initialData={initialData}
      initialFrom={initialFrom}
      initialTo={initialTo}
      initialChartRange={initialChartRange}
    />
  );
}
