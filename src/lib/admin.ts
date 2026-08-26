import "server-only";

import { createClient } from "@/lib/supabase/server";

export function isAdminUserId(userId: string): boolean {
  const adminIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  return adminIds.includes(userId);
}

export async function getAuthenticatedAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user && isAdminUserId(user.id) ? user : null;
}
