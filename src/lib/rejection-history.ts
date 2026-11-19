import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export type RejectionHistoryItem = {
  id: string;
  memberProfileId: string;
  reason: string;
  rejectedByName: string | null;
  rejectedAt: Date;
};

export type PublicRejectionHistoryItem = {
  id: string;
  reason: string;
  rejectedAt: Date;
};

type RawSqlClient = Pick<Prisma.TransactionClient, "$executeRaw" | "$queryRaw"> | typeof prisma;

export interface RecordRejectionHistoryInput {
  memberProfileId: string;
  reason: string;
  rejectedByName?: string | null;
  rejectedAt?: Date;
}

export async function recordRejectionHistory(
  input: RecordRejectionHistoryInput,
  db?: RawSqlClient
): Promise<void> {
  const client = db ?? prisma;
  if (!client || typeof client.$executeRaw !== "function") {
    return;
  }

  const id = `rej_${crypto.randomBytes(10).toString("hex")}`;
  const cleanReason = input.reason.trim() || "Pendaftaran ditolak tanpa catatan tambahan.";
  const rejectedAt = input.rejectedAt ?? new Date();

  await client.$executeRaw`
    INSERT INTO "RejectionHistory" ("id", "memberProfileId", "reason", "rejectedByName", "rejectedAt")
    VALUES (${id}, ${input.memberProfileId}, ${cleanReason}, ${input.rejectedByName ?? null}, ${rejectedAt})
  `;
}

/**
 * Mencatat penolakan lama (sebelum tabel riwayat ada) agar tidak hilang saat pendaftar daftar ulang.
 */
export async function backfillLegacyRejectionIfMissing(
  input: {
    memberProfileId: string;
    reason?: string | null;
    rejectedAt: Date;
  },
  db?: RawSqlClient
): Promise<void> {
  const client = db ?? prisma;
  if (!client || typeof client.$queryRaw !== "function") {
    return;
  }

  const existing = await client.$queryRaw<Array<{ total: number }>>`
    SELECT COUNT(*)::int AS total
    FROM "RejectionHistory"
    WHERE "memberProfileId" = ${input.memberProfileId}
  `;

  if ((existing[0]?.total ?? 0) === 0) {
    await recordRejectionHistory(
      {
        memberProfileId: input.memberProfileId,
        reason: input.reason?.trim() || "Pendaftaran pernah ditolak sebelumnya.",
        rejectedByName: "Panitia",
        rejectedAt: input.rejectedAt,
      },
      client
    );
  }
}

export async function getRejectionHistoryMap(
  memberProfileIds: string[]
): Promise<Map<string, RejectionHistoryItem[]>> {
  const result = new Map<string, RejectionHistoryItem[]>();
  const uniqueIds = Array.from(new Set(memberProfileIds.filter(Boolean)));
  if (uniqueIds.length === 0 || typeof prisma?.$queryRaw !== "function") {
    return result;
  }

  try {
    const rows = await prisma.$queryRaw<RejectionHistoryItem[]>`
      SELECT "id", "memberProfileId", "reason", "rejectedByName", "rejectedAt"
      FROM "RejectionHistory"
      WHERE "memberProfileId" IN (${Prisma.join(uniqueIds)})
      ORDER BY "rejectedAt" DESC
    `;

    for (const row of rows) {
      const list = result.get(row.memberProfileId) ?? [];
      list.push({
        ...row,
        rejectedAt: new Date(row.rejectedAt),
      });
      result.set(row.memberProfileId, list);
    }
  } catch (error) {
    logger.warn("Gagal memuat peta riwayat penolakan", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return result;
}

export async function getRejectionHistoryForProfile(
  memberProfileId: string
): Promise<RejectionHistoryItem[]> {
  if (!memberProfileId || typeof prisma?.$queryRaw !== "function") {
    return [];
  }

  try {
    const rows = await prisma.$queryRaw<RejectionHistoryItem[]>`
      SELECT "id", "memberProfileId", "reason", "rejectedByName", "rejectedAt"
      FROM "RejectionHistory"
      WHERE "memberProfileId" = ${memberProfileId}
      ORDER BY "rejectedAt" DESC
    `;

    return rows.map((row) => ({
      ...row,
      rejectedAt: new Date(row.rejectedAt),
    }));
  } catch (error) {
    logger.warn("Gagal memuat riwayat penolakan pendaftar", {
      memberProfileId,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
