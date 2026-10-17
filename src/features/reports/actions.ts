"use server";

import { getReportMembers as queryGetReportMembers } from "./queries";

export async function getReportMembers(
  status: string = "all",
  faculty: string = "all_faculty",
  dateFrom?: Date,
  dateTo?: Date,
  page: number = 1,
  limit: number = 10
) {
  return queryGetReportMembers(status, faculty, dateFrom, dateTo, page, limit);
}
