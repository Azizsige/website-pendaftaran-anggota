import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { encode } from "next-auth/jwt";
import { REMEMBER_SESSION_SECONDS } from "@/lib/auth";
import { isDatabaseUnavailableError } from "@/lib/db-health";
import { normalizeNextAuthUrlEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import {
  OWNER_DEVICE_COOKIE,
  OWNER_DEVICE_IP_COOKIE,
  computeOwnerAuthorizedIpToken,
  computeOwnerDeviceToken,
  ensureOwnerUserInDb,
  getDetectedClientIp,
  timingSafeEqualStrings,
} from "@/lib/owner-access";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  normalizeNextAuthUrlEnv();
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
    response.cookies.delete(OWNER_DEVICE_IP_COOKIE);
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

  const currentIp = await getDetectedClientIp();
  logger.info("Aktivasi perangkat Owner melalui kunci perangkat", { currentIp });

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

  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const isSecure =
    forwardedProto === "https" ||
    request.nextUrl.protocol === "https:" ||
    Boolean(process.env.NEXTAUTH_URL?.startsWith("https://")) ||
    Boolean(process.env.VERCEL);
  const sessionCookieName = isSecure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
  const staleSessionCookieName = isSecure
    ? "next-auth.session-token"
    : "__Secure-next-auth.session-token";

  const deviceToken = computeOwnerDeviceToken(configuredSecret);
  const authorizedIpToken = computeOwnerAuthorizedIpToken(configuredSecret, currentIp);
  const redirectUrl = new URL("/admin", request.url);
  const response = NextResponse.redirect(redirectUrl, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });

  response.cookies.delete(staleSessionCookieName);

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
    name: OWNER_DEVICE_IP_COOKIE,
    value: authorizedIpToken,
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
