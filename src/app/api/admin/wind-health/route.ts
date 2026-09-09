import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin";
import { checkWindSystemHealth } from "@/lib/windSystemHealth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await getAuthenticatedAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const report = await checkWindSystemHealth();
  return NextResponse.json(report, {
    headers: { "Cache-Control": "no-store" },
  });
}
