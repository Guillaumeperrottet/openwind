import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

function isAdmin(userId: string) {
  const ids = (process.env.ADMIN_USER_IDS ?? "").split(",").filter(Boolean);
  return ids.includes(userId);
}

export async function GET() {
  const categories = await prisma.forumCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { topics: true } },
      topics: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { posts: true } },
        },
      },
    },
  });

  return NextResponse.json(categories);
}

/** POST /api/forum/categories — create category (admin only) */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.id)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { name, description, icon } = (await req.json()) as {
    name?: string;
    description?: string;
    icon?: string;
  };

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }

  const slug = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const maxOrder = await prisma.forumCategory.aggregate({
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? -1) + 1;

  const category = await prisma.forumCategory.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      icon: icon?.trim() || null,
      order,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
