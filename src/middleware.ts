import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;

  // 1. Proteksi Halaman Admin: Hanya SUPER_ADMIN yang bisa akses /admin/*
  if (path.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(url);
    }
    if (token.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 2. Proteksi Halaman Member (contoh /dashboard)
  // if (path.startsWith("/dashboard")) {
  //   if (!token) {
  //     const url = new URL("/login", req.url);
  //     url.searchParams.set("callbackUrl", req.url);
  //     return NextResponse.redirect(url);
  //   }
  //   if (token.role !== "MEMBER") {
  //     return NextResponse.redirect(new URL("/", req.url));
  //   }
  // }

  // 3. Redirect jika sudah login tapi mencoba akses halaman auth
  if (path === "/login" || path === "/daftar") {
    if (token) {
      if (token.role === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url)); // Ganti dengan path dashboard member jika ada
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/daftar"],
};
