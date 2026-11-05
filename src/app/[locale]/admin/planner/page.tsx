import { PlannerReviewEditor } from "./PlannerReviewEditor";
export default async function PlannerReviewsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <PlannerReviewEditor initialQuery={typeof q === "string" ? q.slice(0, 200) : ""} />;
}
