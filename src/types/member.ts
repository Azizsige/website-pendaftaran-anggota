import type { Prisma } from "@prisma/client";
import type { MemberStatus, UserStatus } from "@/lib/constants/status";
import type { Role } from "@/lib/constants/roles";
import type {
  PublicRejectionHistoryItem,
  RejectionHistoryItem,
} from "@/lib/rejection-history";
import type { StatusChangeHistoryItem } from "@/lib/status-history";

export type {
  MemberStatus,
  UserStatus,
  Role,
  RejectionHistoryItem,
  PublicRejectionHistoryItem,
  StatusChangeHistoryItem,
};

/** Member dengan user yang memiliki status akun (digunakan di halaman data anggota) */
export type MemberWithUser = Prisma.MemberProfileGetPayload<{
  include: {
    user: {
      select: { name: true; email: true; status: true };
    };
  };
}> & {
  suspendedUntil?: Date | null;
  rejectionHistories?: RejectionHistoryItem[];
  statusChangeHistories?: StatusChangeHistoryItem[];
};

/** Pendaftar dengan user (digunakan di halaman verifikasi calon anggota) */
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

/** Member profile lengkap dengan seluruh relasi user */
export type MemberProfileWithUser = Prisma.MemberProfileGetPayload<{
  include: {
    user: true;
  };
}>;

/** Data status pendaftaran yang dikembalikan ke pencari status publik */
export type RegistrationStatusData = {
  name: string | null;
  email: string | null;
  nim: string;
  status: string;
  adminNotes: string | null;
  joinDate: Date;
  faculty: string | null;
  major: string | null;
  photoUrl: string | null;
  ktmImageUrl: string | null;
  userId: string;
  phoneNumber: string | null;
  placeOfBirth: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  address: string | null;
  batchYear: string | null;
  updatedAt: Date;
  suspendedUntil?: Date | null;
  verificationCode?: string;
  rejectionHistories?: PublicRejectionHistoryItem[];
};

/** Summary statistik laporan anggota */
export type ReportSummary = {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
};
