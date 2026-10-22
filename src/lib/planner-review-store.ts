import { prisma } from "@/lib/prisma";
import {
  REVIEW_PREFIX,
  reviewSchema,
  qualifyReview,
  type PlannerReview,
} from "@/lib/planner-review";
import { starterReviews } from "@/lib/planner-review-seeds";
import type { SiteLocale } from "@/lib/site";

export {
  spotFingerprint,
  type ReviewableSpot,
} from "./planner-spot-fingerprint";
import {
  spotFingerprint,
  type ReviewableSpot,
} from "./planner-spot-fingerprint";

export async function loadReviews(
  ids: string[],
): Promise<Map<string, PlannerReview>> {
  const reviews = new Map<string, PlannerReview>();
  for (const id of ids) {
    const parsed = reviewSchema.safeParse(starterReviews[id]);
    if (parsed.success) reviews.set(id, parsed.data);
  }
  if (!ids.length) return reviews;
  const stored = await prisma.systemConfig.findMany({
    where: { key: { in: ids.map((id) => REVIEW_PREFIX + id) } },
    select: { key: true, value: true },
  });
  for (const row of stored) {
    const id = row.key.slice(REVIEW_PREFIX.length);
    // A malformed newer review must not silently restore an older approval.
    reviews.delete(id);
    try {
      const parsed = reviewSchema.safeParse(JSON.parse(row.value));
      if (parsed.success) reviews.set(id, parsed.data);
    } catch {
      /* stays unqualified */
    }
  }
  return reviews;
}
export async function qualificationsFor(
  spots: ReviewableSpot[],
  start: string,
  end: string,
  today: string,
  locale: SiteLocale,
) {
  const reviews = await loadReviews(spots.map((s) => s.id));
  return new Map(
    spots.map((s) => [
      s.id,
      qualifyReview(
        reviews.get(s.id) ?? null,
        spotFingerprint(s),
        s.sportType,
        start,
        end,
        today,
        locale,
      ),
    ]),
  );
}
