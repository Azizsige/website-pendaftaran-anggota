import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminRole, ROLES, SETTINGS_FORBIDDEN_ROLES } from "@/lib/constants/roles";
import { normalizeNextAuthUrlEnv } from "@/lib/env";

export async function proxy(req: NextRequest) {
  normalizeNextAuthUrlEnv();
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const secureCookie =
    forwardedProto === "https" ||
    req.nextUrl.protocol === "https:" ||
    Boolean(process.env.NEXTAUTH_URL?.startsWith("https://")) ||
    Boolean(process.env.VERCEL);
  const secret =
    process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
  const rawToken = await getToken({ req, secureCookie, secret });
  const nowSeconds = Math.floor(Date.now() / 1000);
  const isExpired =
    typeof rawToken?.sessionExp === "number" && nowSeconds > rawToken.sessionExp;
  const token = rawToken && !isExpired ? rawToken : null;

  const path = req.nextUrl.pathname;
  const userRole = token?.role as string | undefined;

  // 1. Proteksi Halaman Admin: Hanya role admin yang bisa akses /admin/*
  if (path.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", `${req.nextUrl.pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(url);
    }

    if (!isAdminRole(userRole)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/admin/settings")) {
      if ((SETTINGS_FORBIDDEN_ROLES as readonly (string | undefined)[]).includes(userRole)) {
        const unauthorizedUrl = new URL("/unauthorized", req.url);
        unauthorizedUrl.searchParams.set("from", path);
        return NextResponse.redirect(unauthorizedUrl);
      }
    }

    if (path.startsWith("/admin/logs")) {
      if (userRole !== ROLES.OWNER) {
        const unauthorizedUrl = new URL("/unauthorized", req.url);
        unauthorizedUrl.searchParams.set("from", path);
        return NextResponse.redirect(unauthorizedUrl);
      }
    }
  }

  // 2. Proteksi Halaman Member (diblokir karena fitur ditunda)
  if (path.startsWith("/member")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 3. Redirect jika sudah login tapi mencoba akses halaman auth
  if (path === "/login" || path === "/daftar") {
    if (token) {
      if (isAdminRole(userRole)) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*", "/login", "/daftar"],
};
