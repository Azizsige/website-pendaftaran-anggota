import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { ACTIVITY_ACTIONS, recordActivityLog } from "@/lib/activity-log";
import { verifyOwnerEnvironmentAccess } from "@/lib/owner-access";
import {
  ADMIN_ROLES,
  MANAGER_ROLES,
  OWNER_ROLES,
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
export async function requireRole(
  allowedRoles: readonly string[],
  actionContext?: string
): Promise<AuthUser> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Catatan: `getServerSession` pada RSC menghapus `session.expires` secara bawaan di NextAuth v4,
  // sehingga validasi kedaluwarsa `token.sessionExp` dilakukan di `authOptions.callbacks.session`
  // yang mengosongkan `session.user.id` bila sesi telah berakhir.
  if (!userId) throw new UnauthorizedError();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, status: true, name: true, email: true },
  });

  if (!user || user.status !== USER_STATUS.ACTIVE) {
    throw new UnauthorizedError("Sesi tidak valid atau akun tidak aktif.");
  }

  if (!allowedRoles.includes(user.role)) {
    const contextSuffix = actionContext ? ` pada '${actionContext}'` : "";
    await recordActivityLog({
      actor: { id: user.id, role: user.role },
      action: ACTIVITY_ACTIONS.UNAUTHORIZED_ACCESS,
      entityType: "Security",
      entityId: actionContext ?? null,
      details: `Ditolak oleh guard server: peran ${user.role} mencoba mengakses operasi${contextSuffix} yang membutuhkan peran [${allowedRoles.join(", ")}]`,
    });
    throw new ForbiddenError();
  }

  return { id: user.id, role: user.role as Role, name: user.name, email: user.email };
}

/** Semua admin (OWNER, SUPER_ADMIN, COORDINATOR, STAFF). */
export const requireAdmin = () => requireRole(ADMIN_ROLES);

/** OWNER, SUPER_ADMIN, COORDINATOR: boleh memproses data (STAFF read-only). */
export const requireManager = () => requireRole(MANAGER_ROLES);

/** OWNER & SUPER_ADMIN: pengaturan sistem, hapus data krusial, kelola admin. */
export const requireSuperAdmin = () => requireRole(SUPER_ADMIN_ROLES);

/** Hanya OWNER: melihat audit log aktivitas seluruh akun non-owner & diagnostik sistem. */
export const requireOwner = async (): Promise<AuthUser> => {
  const user = await requireRole(OWNER_ROLES);
  const envAccess = await verifyOwnerEnvironmentAccess();
  if (!envAccess.allowed) {
    throw new ForbiddenError(
      "Akses Owner dibatasi hanya untuk perangkat dan alamat IP yang diizinkan."
    );
  }
  return user;
};
