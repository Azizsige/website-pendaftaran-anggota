import "server-only";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants/roles";
import { USER_STATUS } from "@/lib/constants/status";

export const OWNER_DEVICE_COOKIE = "owner_device_lock";

export interface OwnerIpAccessResult {
  allowed: boolean;
  currentIp: string;
  ipRestrictionEnabled: boolean;
}

export interface OwnerEnvironmentAccessResult {
  allowed: boolean;
  reason?: "IP_NOT_ALLOWED" | "DEVICE_NOT_AUTHORIZED";
  currentIp: string;
  ipRestrictionEnabled: boolean;
  deviceLockEnabled: boolean;
}

export interface EnsuredOwnerUser {
  id: string;
  email: string;
  name: string | null;
  role: typeof ROLES.OWNER;
}

export function normalizeIp(rawIp: string): string {
  const trimmed = rawIp.trim().toLowerCase();
  const withoutZone = trimmed.split("%")[0] ?? trimmed;
  if (withoutZone.startsWith("::ffff:")) {
    return withoutZone.slice(7);
  }
  if (withoutZone === "localhost") {
    return "127.0.0.1";
  }
  return withoutZone;
}

export function isLoopbackIp(ip: string): boolean {
  const normalized = normalizeIp(ip);
  return normalized === "127.0.0.1" || normalized === "::1";
}

export function isIpMatch(currentIp: string, allowedPattern: string): boolean {
  const normalizedCurrent = normalizeIp(currentIp);
  const normalizedPattern = normalizeIp(allowedPattern);
  if (!normalizedPattern) return false;

  if (normalizedPattern.endsWith("*")) {
    const prefix = normalizedPattern.slice(0, -1);
    return normalizedCurrent.startsWith(prefix);
  }

  return normalizedCurrent === normalizedPattern;
}

export async function getDetectedClientIp(): Promise<string> {
  try {
    const h = await headers();
    const cfIp = h.get("cf-connecting-ip");
    if (cfIp?.trim()) return normalizeIp(cfIp);

    const realIp = h.get("x-real-ip");
    if (realIp?.trim()) return normalizeIp(realIp);

    const forwarded = h.get("x-forwarded-for");
    if (forwarded?.trim()) {
      const first = forwarded.split(",")[0] ?? "";
      if (first.trim()) return normalizeIp(first);
    }

    return "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

export function computeOwnerDeviceToken(secret: string): string {
  const signingKey =
    process.env.NEXTAUTH_SECRET?.trim() || "owner-device-signing-fallback";
  return crypto.createHmac("sha256", signingKey).update(secret).digest("hex");
}

export function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Memvalidasi daftar IP yang diizinkan untuk akun OWNER dari OWNER_ALLOWED_IPS.
 */
export async function verifyOwnerIpAccess(): Promise<OwnerIpAccessResult> {
  const allowedIpsRaw = process.env.OWNER_ALLOWED_IPS?.trim() ?? "";
  const ipRestrictionEnabled = allowedIpsRaw.length > 0;
  const currentIp = await getDetectedClientIp();

  if (!ipRestrictionEnabled) {
    return { allowed: true, currentIp, ipRestrictionEnabled };
  }

  const patterns = allowedIpsRaw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const isDevLoopback =
    process.env.NODE_ENV !== "production" && isLoopbackIp(currentIp);
  const allowed =
    isDevLoopback || patterns.some((pattern) => isIpMatch(currentIp, pattern));

  return { allowed, currentIp, ipRestrictionEnabled };
}

/**
 * Memvalidasi akses environment khusus OWNER berdasarkan IP whitelist (OWNER_ALLOWED_IPS)
 * dan cookie pengikat perangkat laptop (OWNER_DEVICE_SECRET).
 */
export async function verifyOwnerEnvironmentAccess(): Promise<OwnerEnvironmentAccessResult> {
  const deviceSecret = process.env.OWNER_DEVICE_SECRET?.trim() ?? "";
  const deviceLockEnabled = deviceSecret.length > 0;
  const ipCheck = await verifyOwnerIpAccess();

  if (!ipCheck.allowed) {
    return {
      allowed: false,
      reason: "IP_NOT_ALLOWED",
      currentIp: ipCheck.currentIp,
      ipRestrictionEnabled: ipCheck.ipRestrictionEnabled,
      deviceLockEnabled,
    };
  }

  let deviceAllowed = true;
  if (deviceLockEnabled) {
    try {
      const cookieStore = await cookies();
      const deviceToken = cookieStore.get(OWNER_DEVICE_COOKIE)?.value ?? "";
      const expectedToken = computeOwnerDeviceToken(deviceSecret);
      deviceAllowed =
        deviceToken.length > 0 &&
        timingSafeEqualStrings(deviceToken, expectedToken);
    } catch {
      deviceAllowed = false;
    }
  }

  if (!deviceAllowed) {
    return {
      allowed: false,
      reason: "DEVICE_NOT_AUTHORIZED",
      currentIp: ipCheck.currentIp,
      ipRestrictionEnabled: ipCheck.ipRestrictionEnabled,
      deviceLockEnabled,
    };
  }

  return {
    allowed: true,
    currentIp: ipCheck.currentIp,
    ipRestrictionEnabled: ipCheck.ipRestrictionEnabled,
    deviceLockEnabled,
  };
}

export function getConfiguredOwnerCredentials() {
  return {
    email: (process.env.OWNER_EMAIL?.trim() || "owner@system.local").toLowerCase(),
    password: process.env.OWNER_PASSWORD?.trim() || "admin123",
  };
}

/**
 * Memastikan akun OWNER tersedia di basis data dan sinkron dengan OWNER_EMAIL serta OWNER_PASSWORD.
 */
export async function ensureOwnerUserInDb(): Promise<EnsuredOwnerUser> {
  const { email: ownerEmail, password: ownerRawPassword } =
    getConfiguredOwnerCredentials();
  const formatOwnerUser = (row: {
    id: string;
    email: string | null;
    name: string | null;
  }): EnsuredOwnerUser => ({
    id: row.id,
    email: row.email ?? ownerEmail,
    name: row.name,
    role: ROLES.OWNER,
  });

  const byEmail = await prisma.user.findUnique({ where: { email: ownerEmail } });
  const existing =
    byEmail ?? (await prisma.user.findFirst({ where: { role: ROLES.OWNER } }));

  if (existing) {
    const passwordMatches = existing.password
      ? await bcrypt.compare(ownerRawPassword, existing.password)
      : false;
    const needsUpdate =
      existing.email !== ownerEmail ||
      existing.role !== ROLES.OWNER ||
      existing.status !== USER_STATUS.ACTIVE ||
      !passwordMatches;

    if (needsUpdate) {
      const nextPassword = passwordMatches
        ? undefined
        : await bcrypt.hash(ownerRawPassword, 10);
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          email: ownerEmail,
          role: ROLES.OWNER,
          status: USER_STATUS.ACTIVE,
          ...(nextPassword ? { password: nextPassword } : {}),
        },
        select: { id: true, email: true, name: true },
      });
      return formatOwnerUser(updated);
    }

    return formatOwnerUser(existing);
  }

  const hashedPassword = await bcrypt.hash(ownerRawPassword, 10);
  const created = await prisma.user.create({
    data: {
      email: ownerEmail,
      name: "Developer / Maintainer",
      password: hashedPassword,
      role: ROLES.OWNER,
      status: USER_STATUS.ACTIVE,
    },
    select: { id: true, email: true, name: true },
  });

  return formatOwnerUser(created);
}
