import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function parseAdminIds() {
  return (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ isAdmin: false });
  }

  const adminIds = parseAdminIds();
  return NextResponse.json({ isAdmin: adminIds.includes(user.id) });
}
