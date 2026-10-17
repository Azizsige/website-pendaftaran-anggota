import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminRole, SETTINGS_FORBIDDEN_ROLES } from "@/lib/constants/roles";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;
  const userRole = token?.role as string | undefined;

  // 1. Proteksi Halaman Admin: Hanya role admin yang bisa akses /admin/*
  if (path.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(url);
    }

    if (!isAdminRole(userRole)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/admin/settings")) {
      if ((SETTINGS_FORBIDDEN_ROLES as readonly (string | undefined)[]).includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
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
