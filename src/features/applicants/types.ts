import type { Prisma } from "@prisma/client";

/** Pendaftar dengan user (digunakan di verifikasi calon anggota) */
export type ApplicantWithUser = Prisma.MemberProfileGetPayload<{
  include: {
    user: {
      select: { name: true; email: true };
    };
  };
}>;

export type Applicant = ApplicantWithUser;
