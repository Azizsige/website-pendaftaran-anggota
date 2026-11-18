import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

type NextAuthRouteContext = {
  params: Promise<{ nextauth: string[] }>;
};

export async function GET(req: NextRequest, context: NextAuthRouteContext) {
  return handler(req, context);
}

async function shouldPersistRememberMe(req: NextRequest): Promise<boolean> {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    const bodyText = await req.clone().text();
    if (!bodyText) return false;

    if (contentType.includes("application/json")) {
      const parsed = JSON.parse(bodyText) as { rememberMe?: unknown };
      return parsed.rememberMe === true || parsed.rememberMe === "true";
    }

    const params = new URLSearchParams(bodyText);
    return params.get("rememberMe") === "true";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest, context: NextAuthRouteContext) {
  const isCredentialsCallback = req.nextUrl.pathname.endsWith(
    "/callback/credentials"
  );

  if (!isCredentialsCallback) {
    return handler(req, context);
  }

  const rememberMe = await shouldPersistRememberMe(req);
  const res: Response = await handler(req, context);

  // Bila "Ingat saya" tidak dicentang, jadikan cookie sesi (hilang saat browser ditutup).
  if (rememberMe) {
    return res;
  }

  const headers = new Headers(res.headers);
  const setCookies =
    typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];

  if (setCookies.length === 0) {
    return res;
  }

  headers.delete("set-cookie");
  for (const cookie of setCookies) {
    const isSessionCookie = /^(__Secure-)?next-auth\.session-token(\.\d+)?=/.test(
      cookie
    );
    const isClearing = /;\s*Max-Age=0\b/i.test(cookie);

    if (isSessionCookie && !isClearing) {
      headers.append(
        "set-cookie",
        cookie.replace(/;\s*(Max-Age|Expires)=[^;]*/gi, "")
      );
    } else {
      headers.append("set-cookie", cookie);
    }
  }

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}
