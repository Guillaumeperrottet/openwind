import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const BANNER_KEY = "ad_banner";

interface BannerConfig {
  text: string;
  url: string;
  active: boolean;
}

const defaultBanner: BannerConfig = { text: "", url: "", active: false };

function isAdmin(userId: string) {
  const ids = (process.env.ADMIN_USER_IDS ?? "").split(",").filter(Boolean);
  return ids.includes(userId);
}

const bannerSchema = z.object({
  text: z.string().min(1).max(300),
  url: z.string().url().max(500),
  active: z.boolean(),
});

/** Public — read current banner config */
export async function GET() {
  try {
    const row = await prisma.systemConfig.findUnique({
      where: { key: BANNER_KEY },
    });
    if (!row) {
      return NextResponse.json(defaultBanner);
    }
    return NextResponse.json(JSON.parse(row.value) as BannerConfig);
  } catch {
    return NextResponse.json(defaultBanner);
  }
}

/** Admin only — update banner config */
export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.id)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const value = JSON.stringify(parsed.data);
  await prisma.systemConfig.upsert({
    where: { key: BANNER_KEY },
    update: { value },
    create: { key: BANNER_KEY, value },
  });

  return NextResponse.json(parsed.data);
}
