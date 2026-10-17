/**
 * Status anggota/pendaftar & akun. Kolom di DB bertipe String,
 * jadi union type ini dipakai sebagai kontrak di seluruh aplikasi.
 */
export const MEMBER_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
  INACTIVE: "INACTIVE",
} as const;

export type MemberStatus = (typeof MEMBER_STATUS)[keyof typeof MEMBER_STATUS];

/** Status yang tampil di halaman "Anggota" (sudah pernah diterima). */
export const MEMBER_LIST_STATUSES = [
  MEMBER_STATUS.ACTIVE,
  MEMBER_STATUS.INACTIVE,
  MEMBER_STATUS.SUSPENDED,
] as const;

export type MemberListStatus = (typeof MEMBER_LIST_STATUSES)[number];

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

const ALL_MEMBER_STATUSES = Object.values(MEMBER_STATUS) as string[];

export function parseMemberStatus(value: string | undefined | null): MemberStatus | undefined {
  const upper = value?.toUpperCase();
  return upper && ALL_MEMBER_STATUSES.includes(upper) ? (upper as MemberStatus) : undefined;
}
