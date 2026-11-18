import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { encode } from "next-auth/jwt";
import { REMEMBER_SESSION_SECONDS } from "@/lib/auth";
import { isDatabaseUnavailableError } from "@/lib/db-health";
import { logger } from "@/lib/logger";
import {
  OWNER_DEVICE_COOKIE,
  computeOwnerDeviceToken,
  ensureOwnerUserInDb,
  timingSafeEqualStrings,
  verifyOwnerIpAccess,
} from "@/lib/owner-access";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const providedKey = searchParams.get("key")?.trim() ?? "";
  const configuredSecret = process.env.OWNER_DEVICE_SECRET?.trim() ?? "";

  if (action === "revoke") {
    const response = NextResponse.json(
      {
        ok: true,
        message: "Akses perangkat laptop Owner pada browser ini telah dicabut.",
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
    response.cookies.delete(OWNER_DEVICE_COOKIE);
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
    return response;
  }

  if (!configuredSecret) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "OWNER_DEVICE_SECRET belum dikonfigurasi pada environment server (.env).",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!providedKey || !timingSafeEqualStrings(providedKey, configuredSecret)) {
    return NextResponse.json(
      { error: "Forbidden: kunci aktivasi perangkat Owner tidak valid." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const ipCheck = await verifyOwnerIpAccess();
  if (!ipCheck.allowed) {
    logger.warn("Aktivasi perangkat Owner ditolak karena IP tidak diizinkan", {
      currentIp: ipCheck.currentIp,
    });
    return NextResponse.json(
      { error: "Forbidden: alamat IP tidak diizinkan untuk aktivasi perangkat Owner." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const authSecret =
    process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim() || "";
  if (!authSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: "NEXTAUTH_SECRET belum dikonfigurasi pada environment server (.env).",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  let ownerUser;
  try {
    ownerUser = await ensureOwnerUserInDb();
  } catch (err) {
    logger.error("Gagal menyinkronkan akun Owner saat aktivasi perangkat", err);
    const status = isDatabaseUnavailableError(err) ? 503 : 500;
    const errorMessage = isDatabaseUnavailableError(err)
      ? "Basis data sedang tidak aktif atau tidak dapat dijangkau."
      : "Gagal menyiapkan sesi akun Owner.";
    return NextResponse.json(
      { error: errorMessage },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const sessionToken = await encode({
    secret: authSecret,
    maxAge: REMEMBER_SESSION_SECONDS,
    token: {
      id: ownerUser.id,
      sub: ownerUser.id,
      name: ownerUser.name,
      email: ownerUser.email,
      role: ownerUser.role,
      rememberMe: true,
      sessionExp: nowSeconds + REMEMBER_SESSION_SECONDS,
    },
  });

  const isSecure =
    request.nextUrl.protocol === "https:" ||
    Boolean(process.env.NEXTAUTH_URL?.startsWith("https://")) ||
    Boolean(process.env.VERCEL);
  const sessionCookieName = isSecure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const deviceToken = computeOwnerDeviceToken(configuredSecret);
  const redirectUrl = new URL("/admin", request.url);
  const response = NextResponse.redirect(redirectUrl, {
    headers: { "Cache-Control": "no-store" },
  });

  response.cookies.set({
    name: OWNER_DEVICE_COOKIE,
    value: deviceToken,
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  response.cookies.set({
    name: sessionCookieName,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: REMEMBER_SESSION_SECONDS,
  });

  return response;
}
