import DashboardClient from "./_components/DashboardClient";

export default async function AdminDashboard(props: { searchParams: Promise<{ from?: string; to?: string; chart_range?: string }> }) {
  const searchParams = await props.searchParams;
  
  // Parse initial params if they somehow exist, though they shouldn't in this new SPA approach
  const initialFrom = searchParams.from || undefined;
  const initialTo = searchParams.to || undefined;
  const initialChartRange = searchParams.chart_range || undefined;

  // We pass dummy empty data so that the Server Component doesn't block navigation.
  // DashboardClient will fetch the actual data on mount.
  const emptyData = {
    stats: { totalAnggota: 0, pending: 0, approvedInRange: 0, rejected: 0 },
    recentApplicants: [],
    chart: { labels: [], data: [] }
  };

  return (
    <DashboardClient 
      initialData={emptyData} 
      initialFrom={initialFrom}
      initialTo={initialTo}
      initialChartRange={initialChartRange}
    />
  );
}
