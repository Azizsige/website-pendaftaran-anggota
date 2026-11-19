import type { Prisma } from "@prisma/client";
import type { RejectionHistoryItem } from "@/lib/rejection-history";
import type { StatusChangeHistoryItem } from "@/lib/status-history";

/** Pendaftar dengan user (digunakan di verifikasi calon anggota) */
export type ApplicantWithUser = Prisma.MemberProfileGetPayload<{
  include: {
    user: {
      select: { name: true; email: true };
    };
  };
}> & {
  suspendedUntil?: Date | null;
  rejectionHistories?: RejectionHistoryItem[];
  statusChangeHistories?: StatusChangeHistoryItem[];
};

export type Applicant = ApplicantWithUser;
