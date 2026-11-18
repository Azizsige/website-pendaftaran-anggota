import { DashboardClient, getDashboardData } from "@/features/dashboard";
import { requireAdmin } from "@/lib/auth/guards";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ringkasan Admin | Portal Pendaftaran",
  description:
    "Ringkasan statistik pendaftaran, antrean verifikasi, dan aktivitas pendaftar terbaru.",
};

export default async function AdminDashboard(props: {
  searchParams?: Promise<{ from?: string; to?: string; chart_range?: string }>;
}) {
  const admin = await requireAdmin();
  const adminName = admin.name?.trim() || "Admin Panitia";
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
      initialChartRange={initialChartRange || "6_months"}
      adminName={adminName}
    />
  );
}
