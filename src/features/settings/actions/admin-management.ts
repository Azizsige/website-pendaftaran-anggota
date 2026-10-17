"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { safeAction, ok, fail } from "@/lib/action-result";
import { logger } from "@/lib/logger";

import type { Prisma } from "@prisma/client";
import type { Role } from "@/lib/constants/roles";
import type { UserStatus } from "@/lib/constants/status";
import { USER_STATUS } from "@/lib/constants/status";

export async function getAdmins() {
  const user = await requireSuperAdmin().catch(() => null);
  if (!user) return { data: [] };

  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ["OWNER", "SUPER_ADMIN", "COORDINATOR", "STAFF"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return { data: admins as { id: string; name: string | null; email: string | null; role: Role; status: UserStatus }[] };
  } catch (error) {
    logger.error("Error fetching admins:", error);
    return { data: [] };
  }
}

export async function createAdmin(data: { fullName: string; email: string; role: Role; password?: string }) {
  return safeAction("createAdmin", async () => {
    const user = await requireSuperAdmin();

    // SUPER_ADMIN cannot create another SUPER_ADMIN or OWNER, only OWNER can.
    if (user.role === "SUPER_ADMIN" && (data.role === "OWNER" || data.role === "SUPER_ADMIN")) {
      return fail("SUPER_ADMIN cannot create SUPER_ADMIN or OWNER roles.");
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return fail("Email sudah terdaftar.");

    const hashedPassword = await bcrypt.hash(data.password || "admin123", 10);
    await prisma.user.create({
      data: {
        name: data.fullName,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        status: USER_STATUS.ACTIVE,
      },
    });

    revalidatePath("/admin/settings");
    return ok();
  });
}

export async function updateAdmin(id: string, data: { fullName: string; email: string; role: Role; status: UserStatus; password?: string }) {
  return safeAction("updateAdmin", async () => {
    const user = await requireSuperAdmin();

    const targetAdmin = await prisma.user.findUnique({ where: { id } });
    if (!targetAdmin) return fail("Admin tidak ditemukan.");

    // Role restrictions:
    // OWNER can edit anyone.
    // SUPER_ADMIN can edit themselves, COORDINATOR, and STAFF.
    if (user.role === "SUPER_ADMIN") {
      if (targetAdmin.role === "OWNER") {
        return fail("Cannot edit OWNER.");
      }
      if (targetAdmin.role === "SUPER_ADMIN" && targetAdmin.id !== user.id) {
        return fail("Cannot edit other SUPER_ADMINs.");
      }
      // SUPER_ADMIN cannot promote someone to SUPER_ADMIN or OWNER
      if (data.role === "OWNER" || (data.role === "SUPER_ADMIN" && targetAdmin.role !== "SUPER_ADMIN")) {
        return fail("Cannot assign SUPER_ADMIN or OWNER role.");
      }
    }

    const updateData: Prisma.UserUpdateInput = {
      name: data.fullName,
      email: data.email,
      role: data.role,
      status: data.status,
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/settings");
    return ok();
  });
}

export async function deleteAdmin(id: string) {
  return safeAction("deleteAdmin", async () => {
    const user = await requireSuperAdmin();
  
    const targetAdmin = await prisma.user.findUnique({ where: { id } });
    if (!targetAdmin) return fail("Admin tidak ditemukan.");

    if (targetAdmin.id === user.id) {
      return fail("Cannot delete yourself.");
    }

    if (targetAdmin.role === "OWNER") {
      return fail("Cannot delete OWNER.");
    }

    if (user.role === "SUPER_ADMIN" && targetAdmin.role === "SUPER_ADMIN") {
      return fail("Cannot delete other SUPER_ADMINs.");
    }

    await prisma.user.delete({ where: { id } });

    revalidatePath("/admin/settings");
    return ok();
  });
}
