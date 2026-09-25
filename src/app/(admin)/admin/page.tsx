import { getDashboardData } from "./actions";
import DashboardClient from "./_components/DashboardClient";

export default async function AdminDashboard(props: { searchParams: Promise<{ from?: string; to?: string; chart_range?: string }> }) {
  const searchParams = await props.searchParams;
  
  // Parse initial params if they somehow exist, though they shouldn't in this new SPA approach
  const initialFrom = searchParams.from || undefined;
  const initialTo = searchParams.to || undefined;
  const initialChartRange = searchParams.chart_range || undefined;

  // Fetch initial data directly on the server
  const initialData = await getDashboardData({
    from: initialFrom,
    to: initialTo,
    chartRange: initialChartRange
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
