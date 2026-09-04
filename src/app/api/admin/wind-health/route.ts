import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin";
import { checkWindHealth } from "@/lib/windHealth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await getAuthenticatedAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const report = await checkWindHealth();
  return NextResponse.json(report, {
    headers: { "Cache-Control": "no-store" },
  });
}
