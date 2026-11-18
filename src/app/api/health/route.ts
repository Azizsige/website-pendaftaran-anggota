import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkDatabaseAvailable } from "@/lib/db-health";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const refresh = req.nextUrl.searchParams.get("refresh") === "1";
  const strict = req.nextUrl.searchParams.get("strict") === "1";
  const available = await checkDatabaseAvailable({ bypassCache: refresh });

  if (!available) {
    return NextResponse.json(
      { ok: false, status: "maintenance" },
      {
        status: strict ? 503 : 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  return NextResponse.json(
    { ok: true, status: "connected" },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
