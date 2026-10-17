/**
 * Satu-satunya sumber kebenaran untuk role & hak akses.
 * Dipakai oleh proxy, guards, server actions, dan komponen UI.
 */
export const ROLES = {
  OWNER: "OWNER",
  SUPER_ADMIN: "SUPER_ADMIN",
  COORDINATOR: "COORDINATOR",
  STAFF: "STAFF",
  MEMBER: "MEMBER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type AdminRole = Exclude<Role, "MEMBER">;

/** Semua role yang boleh masuk ke area /admin. */
export const ADMIN_ROLES: readonly AdminRole[] = [
  ROLES.OWNER,
  ROLES.SUPER_ADMIN,
  ROLES.COORDINATOR,
  ROLES.STAFF,
];

/** Role dengan hak penuh (pengaturan sistem, hapus data krusial, kelola admin). */
export const SUPER_ADMIN_ROLES: readonly AdminRole[] = [ROLES.OWNER, ROLES.SUPER_ADMIN];

/** Role yang boleh memproses pendaftar & mengubah data anggota (STAFF hanya melihat). */
export const MANAGER_ROLES: readonly AdminRole[] = [
  ROLES.OWNER,
  ROLES.SUPER_ADMIN,
  ROLES.COORDINATOR,
];

/** Role yang dilarang membuka /admin/settings. */
export const SETTINGS_FORBIDDEN_ROLES: readonly Role[] = [ROLES.COORDINATOR, ROLES.STAFF];

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}

export function isSuperAdminRole(role: string | null | undefined): boolean {
  return !!role && (SUPER_ADMIN_ROLES as readonly string[]).includes(role);
}

export function isManagerRole(role: string | null | undefined): boolean {
  return !!role && (MANAGER_ROLES as readonly string[]).includes(role);
}
