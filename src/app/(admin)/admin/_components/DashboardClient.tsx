"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { DateRange } from "react-day-picker";
import RegistrationChart from "./RegistrationChart";
import DashboardFilter from "./DashboardFilter";
import ChartFilter from "./ChartFilter";
import NewMemberButton from "./NewMemberButton";
import { getDashboardData, DashboardData } from "../actions";

interface DashboardClientProps {
  initialData: DashboardData;
  initialFrom?: string;
  initialTo?: string;
  initialChartRange?: string;
}

import { useSession } from "next-auth/react";

export default function DashboardClient({
  initialData,
  initialFrom,
  initialTo,
  initialChartRange,
}: DashboardClientProps) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const [data, setData] = useState<DashboardData>(initialData);
  const [isPending, startTransition] = useTransition();
  
  // Track if we're on the very first render to prevent double-fetching on mount
  const [isInitialMount, setIsInitialMount] = useState(true);

  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (initialFrom) {
      return {
        from: new Date(initialFrom),
        to: initialTo ? new Date(initialTo) : undefined,
      };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      from: today,
      to: today,
    };
  });

  const [chartRange, setChartRange] = useState(initialChartRange || "6_months");

  // Fetch new data when filters change
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    const fromStr = date?.from?.toISOString();
    const toStr = date?.to?.toISOString();

    startTransition(async () => {
      try {
        const newData = await getDashboardData({
          from: fromStr,
          to: toStr,
          chartRange,
        });
        setData(newData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    });
  }, [date?.from, date?.to, chartRange, isInitialMount]);

  const { stats, recentApplicants, chart } = data;

  return (
    <div className="flex-1 p-md md:p-lg max-w-container-max mx-auto w-full flex flex-col gap-lg animate-fade-in-up relative">
      {/* Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-surface-lowest/50 backdrop-blur-[2px] rounded-xl transition-all">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full shadow-lg border border-outline-variant text-on-surface">
            <span className="material-symbols-outlined text-primary animate-spin">progress_activity</span>
            <span className="font-label-md text-sm">Memperbarui Data...</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-md">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Overview</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Monitor key metrics and recent activity.</p>
        </div>
        <div className="flex gap-sm">
          <DashboardFilter date={date} onDateChange={setDate} />
          {(userRole === "OWNER" || userRole === "SUPER_ADMIN") && <NewMemberButton />}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Stat Card 1 */}
        <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/20 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Anggota Baru</span>
            <div className="p-1.5 bg-primary-container/20 text-primary rounded-lg">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>
          <div className="font-headline-xl text-headline-xl text-on-surface">{stats.totalAnggota.toLocaleString()}</div>
          <div className="mt-auto pt-sm flex items-center gap-xs text-primary font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>Update</span>
            <span className="text-on-surface-variant font-body-sm text-body-sm font-normal ml-1">real-time</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/20 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Pending</span>
            <div className="p-1.5 bg-secondary-container/50 text-secondary rounded-lg">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
          </div>
          <div className="font-headline-xl text-headline-xl text-on-surface">{stats.pending.toLocaleString()}</div>
          <div className="mt-auto pt-sm flex items-center gap-xs text-secondary font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Needs Review</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/20 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Approved</span>
            <div className="p-1.5 bg-primary-container/20 text-primary rounded-lg">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
          </div>
          <div className="font-headline-xl text-headline-xl text-on-surface">{stats.approvedInRange.toLocaleString()}</div>
          <div className="mt-auto pt-sm flex items-center gap-xs text-primary font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">event</span>
            <span>In Period</span>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/20 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Rejected</span>
            <div className="p-1.5 bg-error-container/50 text-error rounded-lg">
              <span className="material-symbols-outlined text-[20px]">cancel</span>
            </div>
          </div>
          <div className="font-headline-xl text-headline-xl text-on-surface">{stats.rejected.toLocaleString()}</div>
          <div className="mt-auto pt-sm flex items-center gap-xs text-error font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>In Period</span>
          </div>
        </div>
      </div>

      {/* Chart & Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-md flex flex-col">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Registration Trends</h3>
            <ChartFilter value={chartRange} onChange={setChartRange} />
          </div>
          <RegistrationChart labels={chart.labels} data={chart.data} />
        </div>

        {/* Quick Actions / KTA */}
        <div className="flex flex-col gap-md">
          <div className="bg-primary rounded-xl p-md shadow-sm text-on-primary flex flex-col justify-between h-full relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
            <div>
              <h3 className="font-headline-md text-headline-md mb-xs relative z-10">Pending Reviews</h3>
              <p className="font-body-sm text-body-sm text-on-primary/80 relative z-10 mb-md">You have {stats.pending} applications awaiting your approval.</p>
              <div className="text-4xl font-headline-xl relative z-10 mb-md">{stats.pending}</div>
            </div>
            <Link href="/admin/pendaftar" className="w-full block text-center bg-white text-primary font-label-md text-label-md py-sm rounded-lg hover:bg-surface-variant transition-colors relative z-10">
              Review Now
            </Link>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-md flex-1">
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-sm">
              {(userRole === "OWNER" || userRole === "SUPER_ADMIN") && (
                <button className="p-sm border border-outline-variant/30 rounded-lg flex flex-col items-center justify-center gap-xs hover:bg-surface-container transition-colors group cursor-pointer">
                  <div className="p-2 bg-secondary-container/30 text-secondary rounded-full group-hover:bg-secondary-container group-hover:text-on-secondary-container transition-colors">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface text-center">Add<br/>Member</span>
                </button>
              )}
              <button className="p-sm border border-outline-variant/30 rounded-lg flex flex-col items-center justify-center gap-xs hover:bg-surface-container transition-colors group cursor-pointer">
                <div className="p-2 bg-secondary-container/30 text-secondary rounded-full group-hover:bg-secondary-container group-hover:text-on-secondary-container transition-colors">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface text-center">Send<br/>Broadcast</span>
              </button>
              {userRole !== "STAFF" && (
                <button className="p-sm border border-outline-variant/30 rounded-lg flex flex-col items-center justify-center gap-xs hover:bg-surface-container transition-colors group cursor-pointer">
                  <div className="p-2 bg-secondary-container/30 text-secondary rounded-full group-hover:bg-secondary-container group-hover:text-on-secondary-container transition-colors">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface text-center">Export<br/>Data</span>
                </button>
              )}
              {(userRole === "OWNER" || userRole === "SUPER_ADMIN") && (
                <button className="p-sm border border-outline-variant/30 rounded-lg flex flex-col items-center justify-center gap-xs hover:bg-surface-container transition-colors group cursor-pointer">
                  <div className="p-2 bg-secondary-container/30 text-secondary rounded-full group-hover:bg-secondary-container group-hover:text-on-secondary-container transition-colors">
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface text-center">Manage<br/>Roles</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden flex flex-col">
        <div className="p-md border-b border-outline-variant/20 flex justify-between items-center bg-surface-bright">
          <h3 className="font-headline-md text-headline-md text-on-surface">Recent Applicants</h3>
          <Link href="/admin/pendaftar" className="text-primary font-label-md text-label-md hover:underline flex items-center gap-xs">
            View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20">
                <th className="p-sm px-md font-label-md text-label-md text-on-surface-variant font-semibold">Applicant</th>
                <th className="p-sm px-md font-label-md text-label-md text-on-surface-variant font-semibold">Date Applied</th>
                <th className="p-sm px-md font-label-md text-label-md text-on-surface-variant font-semibold">Plan Type</th>
                <th className="p-sm px-md font-label-md text-label-md text-on-surface-variant font-semibold">Status</th>
                <th className="p-sm px-md font-label-md text-label-md text-on-surface-variant font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface">
              {recentApplicants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-md text-center text-on-surface-variant">No recent applicants.</td>
                </tr>
              ) : (
                recentApplicants.map((applicant: any) => (
                  <tr key={applicant.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors group">
                    <td className="p-sm px-md py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
                        {applicant.user?.name ? applicant.user.name.substring(0, 2).toUpperCase() : "NA"}
                      </div>
                      <div>
                        <div className="font-medium">{applicant.user?.name || "Unknown"}</div>
                        <div className="text-on-surface-variant text-xs">{applicant.user?.email || "-"}</div>
                      </div>
                    </td>
                    <td className="p-sm px-md">{new Date(applicant.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="p-sm px-md">Member</td>
                    <td className="p-sm px-md">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
                        ${applicant.status === "PENDING" ? "bg-secondary-container/50 text-on-secondary-container border-secondary-container" : 
                          applicant.status === "ACTIVE" ? "bg-primary-container/20 text-primary border-primary/20" : 
                          "bg-error-container/50 text-error border-error/20"}
                      `}>
                        {applicant.status.charAt(0) + applicant.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="p-sm px-md text-right">
                      <Link href={`/admin/pendaftar`} className="text-primary bg-primary/5 hover:bg-primary-container/20 px-2 py-1 rounded transition-colors focus:opacity-100 cursor-pointer inline-block">
                        {applicant.status === "PENDING" ? "Review" : "View"}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
