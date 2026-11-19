import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export type StatusChangeHistoryItem = {
  id: string;
  memberProfileId: string;
  previousStatus: string;
  newStatus: string;
  reason: string | null;
  suspendedUntil: Date | null;
  changedById: string | null;
  changedByName: string | null;
  changedByRole: string | null;
  changedAt: Date;
};

type RawSqlClient =
  | Pick<Prisma.TransactionClient, "$executeRaw" | "$queryRaw">
  | typeof prisma;

export interface RecordStatusChangeInput {
  memberProfileId: string;
  previousStatus: string;
  newStatus: string;
  reason?: string | null;
  suspendedUntil?: Date | null;
  changedById?: string | null;
  changedByName?: string | null;
  changedByRole?: string | null;
  changedAt?: Date;
}

export async function recordStatusChange(
  input: RecordStatusChangeInput,
  db?: RawSqlClient
): Promise<void> {
  const client = db ?? prisma;
  if (!client || typeof client.$executeRaw !== "function") {
    return;
  }

  const id = `sts_${crypto.randomBytes(10).toString("hex")}`;
  const cleanReason = input.reason?.trim() || null;
  const changedAt = input.changedAt ?? new Date();

  await client.$executeRaw`
    INSERT INTO "StatusChangeHistory" (
      "id",
      "memberProfileId",
      "previousStatus",
      "newStatus",
      "reason",
      "suspendedUntil",
      "changedById",
      "changedByName",
      "changedByRole",
      "changedAt"
    )
    VALUES (
      ${id},
      ${input.memberProfileId},
      ${input.previousStatus},
      ${input.newStatus},
      ${cleanReason},
      ${input.suspendedUntil ?? null},
      ${input.changedById ?? null},
      ${input.changedByName ?? null},
      ${input.changedByRole ?? null},
      ${changedAt}
    )
  `;
}

export async function setMemberSuspendedUntil(
  memberProfileId: string,
  suspendedUntil: Date | null,
  db?: RawSqlClient
): Promise<void> {
  const client = db ?? prisma;
  if (!client || typeof client.$executeRaw !== "function") {
    return;
  }

  await client.$executeRaw`
    UPDATE "MemberProfile"
    SET "suspendedUntil" = ${suspendedUntil}
    WHERE "id" = ${memberProfileId}
  `;
}

export async function getSuspendedUntilMap(
  memberProfileIds: string[]
): Promise<Map<string, Date | null>> {
  const result = new Map<string, Date | null>();
  const uniqueIds = Array.from(new Set(memberProfileIds.filter(Boolean)));
  if (uniqueIds.length === 0 || typeof prisma?.$queryRaw !== "function") {
    return result;
  }

  try {
    const rows = await prisma.$queryRaw<
      Array<{ id: string; suspendedUntil: Date | string | null }>
    >`
      SELECT "id", "suspendedUntil"
      FROM "MemberProfile"
      WHERE "id" IN (${Prisma.join(uniqueIds)})
    `;
    for (const row of rows) {
      result.set(
        row.id,
        row.suspendedUntil ? new Date(row.suspendedUntil) : null
      );
    }
  } catch (error) {
    logger.warn("Gagal memuat suspendedUntil anggota", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return result;
}

export async function getSuspendedUntilForProfile(
  memberProfileId: string
): Promise<Date | null> {
  if (!memberProfileId || typeof prisma?.$queryRaw !== "function") {
    return null;
  }

  try {
    const rows = await prisma.$queryRaw<
      Array<{ suspendedUntil: Date | string | null }>
    >`
      SELECT "suspendedUntil"
      FROM "MemberProfile"
      WHERE "id" = ${memberProfileId}
      LIMIT 1
    `;
    return rows[0]?.suspendedUntil ? new Date(rows[0].suspendedUntil) : null;
  } catch (error) {
    logger.warn("Gagal memuat batas pembekuan profil", {
      memberProfileId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function getStatusHistoryMap(
  memberProfileIds: string[]
): Promise<Map<string, StatusChangeHistoryItem[]>> {
  const result = new Map<string, StatusChangeHistoryItem[]>();
  const uniqueIds = Array.from(new Set(memberProfileIds.filter(Boolean)));
  if (uniqueIds.length === 0 || typeof prisma?.$queryRaw !== "function") {
    return result;
  }

  try {
    const rows = await prisma.$queryRaw<StatusChangeHistoryItem[]>`
      SELECT
        "id",
        "memberProfileId",
        "previousStatus",
        "newStatus",
        "reason",
        "suspendedUntil",
        "changedById",
        "changedByName",
        "changedByRole",
        "changedAt"
      FROM "StatusChangeHistory"
      WHERE "memberProfileId" IN (${Prisma.join(uniqueIds)})
      ORDER BY "changedAt" DESC
    `;

    for (const row of rows) {
      const list = result.get(row.memberProfileId) ?? [];
      list.push({
        ...row,
        suspendedUntil: row.suspendedUntil ? new Date(row.suspendedUntil) : null,
        changedAt: new Date(row.changedAt),
      });
      result.set(row.memberProfileId, list);
    }
  } catch (error) {
    logger.warn("Gagal memuat peta riwayat perubahan status", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return result;
}

export async function getStatusHistoryForProfile(
  memberProfileId: string
): Promise<StatusChangeHistoryItem[]> {
  const map = await getStatusHistoryMap([memberProfileId]);
  return map.get(memberProfileId) ?? [];
}

/**
 * Mengaktifkan kembali akun anggota yang masa pembekuannya telah berakhir dan mencatat jejak auditnya.
 */
export async function expireElapsedSuspensions(
  memberProfileIds?: string[]
): Promise<number> {
  if (
    typeof prisma?.$queryRaw !== "function" ||
    typeof prisma?.$transaction !== "function"
  ) {
    return 0;
  }

  try {
    const filterIds = memberProfileIds
      ? Array.from(new Set(memberProfileIds.filter(Boolean)))
      : null;
    if (filterIds && filterIds.length === 0) return 0;

    const expiredRows = filterIds
      ? await prisma.$queryRaw<Array<{ id: string; userId: string }>>`
          SELECT "id", "userId"
          FROM "MemberProfile"
          WHERE "status" = 'SUSPENDED'
            AND "suspendedUntil" IS NOT NULL
            AND "suspendedUntil" <= NOW()
            AND "id" IN (${Prisma.join(filterIds)})
        `
      : await prisma.$queryRaw<Array<{ id: string; userId: string }>>`
          SELECT "id", "userId"
          FROM "MemberProfile"
          WHERE "status" = 'SUSPENDED'
            AND "suspendedUntil" IS NOT NULL
            AND "suspendedUntil" <= NOW()
        `;

    if (expiredRows.length === 0) return 0;

    await prisma.$transaction(async (tx) => {
      for (const row of expiredRows) {
        await tx.memberProfile.update({
          where: { id: row.id },
          data: { status: "ACTIVE" },
        });
        await setMemberSuspendedUntil(row.id, null, tx);
        await tx.user.update({
          where: { id: row.userId },
          data: { status: "ACTIVE" },
        });
        await recordStatusChange(
          {
            memberProfileId: row.id,
            previousStatus: "SUSPENDED",
            newStatus: "ACTIVE",
            reason: "Masa pembekuan telah berakhir otomatis sesuai durasi.",
            changedByName: "Sistem",
            changedByRole: "SYSTEM",
          },
          tx
        );
      }
    });

    return expiredRows.length;
  } catch (error) {
    logger.warn("Gagal memproses kadaluarsa masa pembekuan", {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}
