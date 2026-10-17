import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import {
  ADMIN_ROLES,
  MANAGER_ROLES,
  SUPER_ADMIN_ROLES,
  type Role,
} from "@/lib/constants/roles";
import { USER_STATUS } from "@/lib/constants/status";

export type AuthUser = {
  id: string;
  role: Role;
  name: string | null;
  email: string | null;
};

/**
 * Pastikan request datang dari user login dengan role yang diizinkan.
 *
 * Role & status dibaca ulang dari DB (bukan dari JWT) sehingga perubahan role,
 * akun dinonaktifkan, atau akun dihapus langsung berlaku tanpa menunggu token expired.
 *
 * Melempar `UnauthorizedError` / `ForbiddenError` (pesan aman untuk client).
 * Gunakan di dalam `safeAction()` atau tangkap oleh caller.
 */
export async function requireRole(allowedRoles: readonly string[]): Promise<AuthUser> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) throw new UnauthorizedError();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, status: true, name: true, email: true },
  });

  if (!user || user.status !== USER_STATUS.ACTIVE) {
    throw new UnauthorizedError("Sesi tidak valid atau akun tidak aktif.");
  }

  if (!allowedRoles.includes(user.role)) throw new ForbiddenError();

  return { id: user.id, role: user.role as Role, name: user.name, email: user.email };
}

/** Semua admin (OWNER, SUPER_ADMIN, COORDINATOR, STAFF). */
export const requireAdmin = () => requireRole(ADMIN_ROLES);

/** OWNER, SUPER_ADMIN, COORDINATOR: boleh memproses data (STAFF read-only). */
export const requireManager = () => requireRole(MANAGER_ROLES);

/** OWNER & SUPER_ADMIN: pengaturan sistem, hapus data krusial, kelola admin. */
export const requireSuperAdmin = () => requireRole(SUPER_ADMIN_ROLES);
