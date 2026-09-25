import { create } from 'zustand';
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

interface ReportState {
  date: DateRange | undefined;
  status: string;
  faculty: string;
  page: number;
  loading: boolean;
  members: any[];
  totalPages: number;
  totalCount: number;
  summary: { total: number; approved: number; pending: number; rejected: number };
  
  setDate: (date: DateRange | undefined) => void;
  setStatus: (status: string) => void;
  setFaculty: (faculty: string) => void;
  setPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setMembers: (members: any[]) => void;
  setTotalPages: (pages: number) => void;
  setTotalCount: (count: number) => void;
  setSummary: (summary: any) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  date: { from: subDays(new Date(), 7), to: new Date() },
  status: "all",
  faculty: "all_faculty",
  page: 1,
  loading: true,
  members: [],
  totalPages: 1,
  totalCount: 0,
  summary: { total: 0, approved: 0, pending: 0, rejected: 0 },
  
  setDate: (date) => set({ date, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setFaculty: (faculty) => set({ faculty, page: 1 }),
  setPage: (page) => set({ page }),
  setLoading: (loading) => set({ loading }),
  setMembers: (members) => set({ members }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setTotalCount: (totalCount) => set({ totalCount }),
  setSummary: (summary) => set({ summary }),
}));
