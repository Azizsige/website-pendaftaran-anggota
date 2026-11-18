import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { ROLES } from "@/lib/constants/roles";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ACTION_LABELS,
  type ActivityAction,
} from "@/features/logs/types";

export { ACTIVITY_ACTIONS, ACTIVITY_ACTION_LABELS, type ActivityAction };

export interface ActivityActor {
  id: string;
  role: string;
}

export interface RecordActivityLogInput {
  actor: ActivityActor;
  action: ActivityAction | string;
  entityType?: string | null;
  entityId?: string | null;
  details?: string | null;
}

type ActivityLogWriter = Pick<Prisma.TransactionClient, "activityLog"> | typeof prisma;

/**
 * Mencatat aktivitas pengelola ke tabel ActivityLog hanya bila pelakunya bukan OWNER.
 * Kegagalan penulisan log ditangani secara aman agar tidak membatalkan aksi utama.
 */
export async function recordActivityLog(
  input: RecordActivityLogInput,
  db?: ActivityLogWriter
): Promise<void> {
  if (!input.actor?.id || input.actor.role === ROLES.OWNER) {
    return;
  }

  const client = db ?? prisma;
  if (!client?.activityLog?.create) {
    return;
  }

  try {
    await client.activityLog.create({
      data: {
        userId: input.actor.id,
        action: input.action,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        details: input.details ?? null,
      },
    });
  } catch (error) {
    logger.warn("Gagal mencatat log aktivitas", {
      action: input.action,
      userId: input.actor.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
