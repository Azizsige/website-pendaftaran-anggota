"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManager, requireSuperAdmin } from "@/lib/auth/guards";
import { safeAction, ok } from "@/lib/action-result";
import { type MemberStatus } from "@/lib/constants/status";

export async function updateApplicantStatus(
  id: string, 
  newStatus: Extract<MemberStatus, "ACTIVE" | "REJECTED" | "PENDING" | "SUSPENDED">, 
  notes?: string
) {
  return safeAction("updateApplicantStatus", async () => {
    await requireManager();

    const profile = await prisma.memberProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!profile) throw new Error("Applicant not found");

    await prisma.$transaction(async (tx) => {
      // Update MemberProfile
      await tx.memberProfile.update({
        where: { id },
        data: {
          status: newStatus,
          ...(notes !== undefined && { adminNotes: notes }),
        },
      });

      // Update User based on status
      if (newStatus === "ACTIVE") {
        await tx.user.update({
          where: { id: profile.userId },
          data: {
            role: "MEMBER",
            status: "ACTIVE",
          },
        });
      } else if (newStatus === "REJECTED" || newStatus === "SUSPENDED") {
         await tx.user.update({
          where: { id: profile.userId },
          data: {
            status: "INACTIVE", 
          },
        });
      }
    });

    revalidatePath("/admin/pendaftar");
    return ok();
  });
}

export async function updateAdminNotes(id: string, notes: string) {
  return safeAction("updateAdminNotes", async () => {
    await requireManager();

    await prisma.memberProfile.update({
      where: { id },
      data: { adminNotes: notes },
    });
    
    revalidatePath("/admin/pendaftar");
    return ok();
  });
}

export async function deleteApplicant(id: string) {
  return safeAction("deleteApplicant", async () => {
    await requireSuperAdmin();

    const profile = await prisma.memberProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!profile) throw new Error("Applicant not found");

    await prisma.user.delete({
      where: { id: profile.userId },
    });

    revalidatePath("/admin/pendaftar");
    return ok();
  });
}
