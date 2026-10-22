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
  const dateLabel = (value: string, annual: boolean) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: "UTC",
      day: "numeric",
      month: "short",
      ...(annual ? {} : { year: "numeric" as const }),
    }).format(new Date(`${annual ? "2000-" : ""}${value}T12:00:00Z`));
  const timeLabel = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  return (
    <div className="space-y-2 text-xs leading-relaxed text-slate-600">
      <p className="font-semibold text-slate-900">
        {c.status[q?.status ?? "MISSING"]}
      </p>
      <p>{q?.note || c.missing}</p>
      {!!q?.sectors.length && (
        <p>{q.sectors.map((s) => `${s.from}°–${s.to}°`).join(" · ")}</p>
      )}
      {!!q?.closures?.length && (
        <div data-planner-restrictions>
          <p className="font-semibold text-slate-900">{c.restrictions}</p>
          <ul className="space-y-2">
            {q.closures.map((closure, i) => (
              <li key={i}>
                <p>
                  {closure.kind === "ANNUAL" ? c.annual : c.dated} ·{" "}
                  {dateLabel(closure.start, closure.kind === "ANNUAL")}–
                  {dateLabel(closure.end, closure.kind === "ANNUAL")}
                </p>
                <a
                  href={closure.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center text-sky-800 underline"
                >
                  {closure.reason[locale]} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {q?.dailyHours && (
        <p>
          {c.accessHours} : {timeLabel(q.dailyHours.from)}–
          {timeLabel(q.dailyHours.to)}
        </p>
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
