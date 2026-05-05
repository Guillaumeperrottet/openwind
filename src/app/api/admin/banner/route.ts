import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const BANNER_KEY = "ad_banner";

interface BannerConfig {
  text: string;
  url: string;
  active: boolean;
  speedSec: number;
  paused: boolean;
}

const defaultBanner: BannerConfig = {
  text: "",
  url: "",
  active: false,
  speedSec: 45,
  paused: false,
};

function isAdmin(userId: string) {
  const ids = (process.env.ADMIN_USER_IDS ?? "").split(",").filter(Boolean);
  return ids.includes(userId);
}

const bannerConfigSchema = z.object({
  text: z.string().max(300).default(""),
  url: z.string().max(500).default(""),
  active: z.boolean().default(false),
  speedSec: z.number().int().min(10).max(120).default(45),
  paused: z.boolean().default(false),
});

const bannerUpdateSchema = bannerConfigSchema.superRefine((value, ctx) => {
  if (!value.active) return;

  if (!value.text.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le texte est requis quand le bandeau est actif",
      path: ["text"],
    });
  }

  if (!value.url.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "L'URL est requise quand le bandeau est actif",
      path: ["url"],
    });
    return;
  }

  try {
    // Ensure we only save clickable absolute links.
    // eslint-disable-next-line no-new
    new URL(value.url);
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "URL invalide",
      path: ["url"],
    });
  }
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
    const raw = JSON.parse(row.value) as unknown;
    const parsed = bannerConfigSchema.safeParse(raw);
    return NextResponse.json(parsed.success ? parsed.data : defaultBanner);
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
  const parsed = bannerUpdateSchema.safeParse(body);
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
