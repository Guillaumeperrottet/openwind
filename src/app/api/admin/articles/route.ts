import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/admin";
import { articleInputSchema } from "@/lib/article-schema";
import { articlePublicPath, articleToDto } from "@/lib/articles";

function forbidden() {
  return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
}

export async function GET() {
  if (!(await getAuthenticatedAdmin())) return forbidden();

  const articles = await prisma.article.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });

  return NextResponse.json(articles.map(articleToDto));
}

export async function POST(request: NextRequest) {
  if (!(await getAuthenticatedAdmin())) return forbidden();

  const parsed = articleInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;

  try {
    const article = await prisma.article.create({
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
        linkedSpotIds: [...new Set(input.linkedSpotIds)],
        linkedStationIds: [...new Set(input.linkedStationIds)],
        relatedArticleIds: [...new Set(input.relatedArticleIds)],
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      },
    });

    revalidatePath("/fr/carnet");
    revalidatePath(`/fr${articlePublicPath(article)}`);

    return NextResponse.json(articleToDto(article), { status: 201 });
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé par un autre article" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Impossible de créer l’article" },
      { status: 500 },
    );
  }
}
