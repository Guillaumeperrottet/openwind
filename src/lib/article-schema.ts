import { z } from "zod";
import { ARTICLE_STATUSES } from "@/lib/articles";

const optionalUrl = z
  .union([z.literal(""), z.string().url("URL invalide").max(1000)])
  .default("");

export const articleInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "Le slug est trop court")
    .max(140)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Utilise uniquement des minuscules, chiffres et tirets",
    ),
  title: z.string().trim().min(5).max(180),
  excerpt: z.string().trim().min(30).max(600),
  content: z.string().trim().min(300, "L’article est trop court").max(50000),
  coverImage: optionalUrl,
  coverAlt: z.string().trim().max(220).default(""),
  category: z.string().trim().min(2).max(80),
  location: z.string().trim().max(120).default(""),
  readTime: z.number().int().min(1).max(60),
  status: z.enum(ARTICLE_STATUSES),
  seoTitle: z.string().trim().max(70).default(""),
  seoDescription: z.string().trim().max(180).default(""),
  authorName: z.string().trim().min(2).max(100),
  sources: z
    .array(
      z.object({
        label: z.string().trim().min(2).max(160),
        url: z.string().url("URL de source invalide").max(1000),
      }),
    )
    .max(30),
});

export type ArticleInput = z.infer<typeof articleInputSchema>;
