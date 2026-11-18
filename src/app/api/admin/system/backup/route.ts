import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth/guards";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function sanitizeStoredAsset(value: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("data:")) {
    return "[BASE64_OMITTED_FOR_SNAPSHOT]";
  }
  return value;
}

export async function GET() {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [systemSettings, users, memberProfiles, activityLogs] = await Promise.all([
      prisma.systemSetting.findMany({
        orderBy: { key: "asc" },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.memberProfile.findMany({
        select: {
          id: true,
          userId: true,
          nim: true,
          phoneNumber: true,
          placeOfBirth: true,
          dateOfBirth: true,
          gender: true,
          address: true,
          faculty: true,
          major: true,
          batchYear: true,
          photoUrl: true,
          ktmImageUrl: true,
          documentUrl: true,
          joinDate: true,
          status: true,
          adminNotes: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.activityLog.findMany({
        take: 500,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          action: true,
          entityType: true,
          entityId: true,
          details: true,
          createdAt: true,
        },
      }),
    ]);

    const snapshot = {
      exportedAt: new Date().toISOString(),
      counts: {
        systemSettings: systemSettings.length,
        users: users.length,
        memberProfiles: memberProfiles.length,
        activityLogsIncluded: activityLogs.length,
      },
      systemSettings,
      users,
      memberProfiles: memberProfiles.map((profile) => ({
        ...profile,
        photoUrl: sanitizeStoredAsset(profile.photoUrl),
        ktmImageUrl: sanitizeStoredAsset(profile.ktmImageUrl),
        documentUrl: sanitizeStoredAsset(profile.documentUrl),
      })),
      activityLogs,
    };

    const dateStamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(JSON.stringify(snapshot, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="backup-snapshot-sistem-${dateStamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logger.error("Gagal membuat backup snapshot sistem", error);
    return NextResponse.json(
      { error: "Gagal menghasilkan backup snapshot sistem." },
      { status: 500 }
    );
  }
}
