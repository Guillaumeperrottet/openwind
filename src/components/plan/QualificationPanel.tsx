import type { PlannerQualification } from "@/lib/planner-review";
import type { SiteLocale } from "@/lib/site";
import { plannerUiCopy } from "@/lib/planner-ui-copy";

export function QualificationPanel({
  qualification: q,
  locale,
}: {
  qualification?: PlannerQualification;
  locale: SiteLocale;
}) {
  const c = plannerUiCopy[locale];
  return (
    <div className="space-y-2 text-xs leading-relaxed text-slate-600">
      <p className="font-semibold text-slate-900">
        {c.status[q?.status ?? "MISSING"]}
      </p>
      <p>{q?.note || c.missing}</p>
      {!!q?.sectors.length && (
        <p>{q.sectors.map((s) => `${s.from}°–${s.to}°`).join(" · ")}</p>
      )}
      {q?.reviewedAt && (
        <p>
          {c.reviewed} : <time dateTime={q.reviewedAt}>{q.reviewedAt}</time> ·{" "}
          {c.until} <time dateTime={q.expiresAt}>{q.expiresAt}</time>
        </p>
      )}
      {!!q?.sources.length && (
        <div>
          <p className="font-medium">{c.sources}</p>
          <ul>
            {q.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center text-sky-800 underline"
                >
                  {s.title} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {q?.eligible && <p>{c.scope}</p>}
    </div>
  );
}
