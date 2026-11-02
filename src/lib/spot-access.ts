import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminUserId } from "@/lib/admin";

/** Authenticate before reading a request body or touching catalogue/storage data. */
export async function requireSpotContributor(adminOnly = false) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Connectez-vous pour contribuer aux spots." },
        { status: 401 },
      ),
    };
  }
  if (adminOnly && !isAdminUserId(user.id)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "La modification et la suppression sont réservées aux administrateurs." },
        { status: 403 },
      ),
    };
  }
  return { user, error: null };
}
