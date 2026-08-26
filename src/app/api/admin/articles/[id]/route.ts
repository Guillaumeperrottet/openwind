import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/admin";
import { articleInputSchema } from "@/lib/article-schema";
import { articleToDto } from "@/lib/articles";
import { deleteArticleCover } from "@/lib/article-storage";

function forbidden() {
  return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAuthenticatedAdmin())) return forbidden();

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });

  if (!article) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  return NextResponse.json(articleToDto(article));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAuthenticatedAdmin())) return forbidden();

  const { id } = await params;
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  const parsed = articleInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;

  try {
    const article = await prisma.article.update({
      where: { id },
      data: {
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        coverImage: input.coverImage || null,
        coverAlt: input.coverAlt || null,
        category: input.category,
        location: input.location || null,
        readTime: input.readTime,
        status: input.status,
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
        sources: input.sources,
        authorName: input.authorName,
        publishedAt:
          input.status === "PUBLISHED"
            ? existing.publishedAt ?? new Date()
            : null,
      },
    });

    revalidatePath("/fr/carnet");
    revalidatePath(`/fr/carnet/${existing.slug}`);
    revalidatePath(`/fr/carnet/${article.slug}`);

    if (existing.coverImage !== article.coverImage) {
      await deleteArticleCover(existing.coverImage).catch(() => undefined);
    }

    return NextResponse.json(articleToDto(article));
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé par un autre article" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Impossible de modifier l’article" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAuthenticatedAdmin())) return forbidden();

  const { id } = await params;
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  await prisma.article.delete({ where: { id } });
  await deleteArticleCover(existing.coverImage).catch(() => undefined);
  revalidatePath("/fr/carnet");
  revalidatePath(`/fr/carnet/${existing.slug}`);

  return NextResponse.json({ ok: true });
}
