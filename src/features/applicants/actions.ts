"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManager, requireSuperAdmin } from "@/lib/auth/guards";
import { safeAction, ok } from "@/lib/action-result";
import { ACTIVITY_ACTIONS, recordActivityLog } from "@/lib/activity-log";
import { type MemberStatus } from "@/lib/constants/status";

function resolveApplicantAction(newStatus: string): string {
  if (newStatus === "ACTIVE") return ACTIVITY_ACTIONS.APPROVE_APPLICANT;
  if (newStatus === "REJECTED") return ACTIVITY_ACTIONS.REJECT_APPLICANT;
  if (newStatus === "SUSPENDED") return ACTIVITY_ACTIONS.SUSPEND_APPLICANT;
  return ACTIVITY_ACTIONS.UPDATE_APPLICANT_STATUS;
}

function formatApplicantTarget(name: string | null | undefined, nim: string): string {
  return name ? `${name} (NIM ${nim})` : `NIM ${nim}`;
}

export async function updateApplicantStatus(
  id: string, 
  newStatus: Extract<MemberStatus, "ACTIVE" | "REJECTED" | "PENDING" | "SUSPENDED">, 
  notes?: string
) {
  return safeAction("updateApplicantStatus", async () => {
    const admin = await requireManager();

    const profile = await prisma.memberProfile.findUnique({
      where: { id },
      select: {
        userId: true,
        nim: true,
        status: true,
        user: { select: { name: true } },
      },
    });

    if (!profile) throw new Error("Applicant not found");

    const targetLabel = formatApplicantTarget(profile.user?.name, profile.nim);
    const trimmedNotes = notes?.trim();
    const notesInfo = trimmedNotes ? `, catatan: ${trimmedNotes}` : "";

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

      await recordActivityLog(
        {
          actor: admin,
          action: resolveApplicantAction(newStatus),
          entityType: "MemberProfile",
          entityId: id,
          details: `Mengubah status calon anggota ${targetLabel} dari ${profile.status} menjadi ${newStatus}${notesInfo}`,
        },
        tx
      );
    });

    revalidatePath("/admin/pendaftar");
    revalidatePath("/admin/logs");
    return ok();
  });
}

export async function updateAdminNotes(id: string, notes: string) {
  return safeAction("updateAdminNotes", async () => {
    const admin = await requireManager();

    const updated = await prisma.memberProfile.update({
      where: { id },
      data: { adminNotes: notes },
      select: {
        nim: true,
        user: { select: { name: true } },
      },
    });

    const targetLabel = formatApplicantTarget(updated.user?.name, updated.nim);
    await recordActivityLog({
      actor: admin,
      action: ACTIVITY_ACTIONS.UPDATE_APPLICANT_NOTES,
      entityType: "MemberProfile",
      entityId: id,
      details: `Memperbarui catatan verifikasi untuk ${targetLabel}`,
    });
    
    revalidatePath("/admin/pendaftar");
    revalidatePath("/admin/logs");
    return ok();
  });
}

export async function deleteApplicant(id: string) {
  return safeAction("deleteApplicant", async () => {
    const admin = await requireSuperAdmin();

    const profile = await prisma.memberProfile.findUnique({
      where: { id },
      select: {
        userId: true,
        nim: true,
        user: { select: { name: true } },
      },
    });

    if (!profile) throw new Error("Applicant not found");

    const targetLabel = formatApplicantTarget(profile.user?.name, profile.nim);

    await prisma.user.delete({
      where: { id: profile.userId },
    });

    await recordActivityLog({
      actor: admin,
      action: ACTIVITY_ACTIONS.DELETE_APPLICANT,
      entityType: "MemberProfile",
      entityId: id,
      details: `Menghapus permanen data calon anggota ${targetLabel}`,
    });

    revalidatePath("/admin/pendaftar");
    revalidatePath("/admin/logs");
    return ok();
  });
}
