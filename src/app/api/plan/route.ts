import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { qualificationsFor } from "@/lib/planner-review-store";
import { toSiteLocale } from "@/lib/site";
import {
  fetchPlannerForecasts,
  fetchPlannerSeasonal,
} from "@/lib/planner-forecast";
import {
  addDays,
  candidatesInRadius,
  evaluateSpot,
  localDate,
  parsePlannerCriteria,
  rankResults,
  type PlannerResult,
  type PlannerResponse,
} from "@/lib/planner";

export const maxDuration = 60;
export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams,
    now = new Date(),
    today = localDate(now);
  const criteria = parsePlannerCriteria(params, today);
  if (!criteria)
    return NextResponse.json({ error: "INVALID_CRITERIA" }, { status: 400 });
  const locale = params.get("locale");
  try {
    // The whole catalogue in the radius is considered before weather ranking.
    const records = await prisma.spot.findMany({
      where: { sportType: criteria.sport },
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        difficulty: true,
        waterType: true,
        bestMonths: true,
        latitude: true,
        longitude: true,
        region: true,
        country: true,
        sportType: true,
        minWindKmh: true,
        maxWindKmh: true,
        bestWindDirections: true,
        access: true,
        accessDe: true,
        accessIt: true,
        accessEn: true,
        hazards: true,
        hazardsDe: true,
        hazardsIt: true,
        hazardsEn: true,
      },
    });
    const scoped = candidatesInRadius(records, criteria);
    const qualifications = await qualificationsFor(
      scoped,
      criteria.startDate,
      criteria.endDate,
      today,
      toSiteLocale(locale || "fr"),
    );
    const candidates = scoped.map((s) => ({
      id: s.id,
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude,
      region: s.region,
      country: s.country,
      sportType: s.sportType,
      minWindKmh: s.minWindKmh,
      maxWindKmh: s.maxWindKmh,
      bestWindDirections: s.bestWindDirections,
      distanceKm: s.distanceKm,
      qualification: qualifications.get(s.id)!,
      access:
        (locale === "de"
          ? s.accessDe
          : locale === "it"
            ? s.accessIt
            : locale === "en"
              ? s.accessEn
              : s.access) || s.access,
      hazards:
        (locale === "de"
          ? s.hazardsDe
          : locale === "it"
            ? s.hazardsIt
            : locale === "en"
              ? s.hazardsEn
              : s.hazards) || s.hazards,
    }));
    const mode =
      criteria.endDate <= addDays(today, 15) ? "forecast" : "seasonal";
    let spots: PlannerResult[];
    if (mode === "forecast") {
      const forecasts = await fetchPlannerForecasts(
        candidates,
        criteria.startDate,
        criteria.endDate,
      );
      spots = rankResults(
        candidates.map((s, i) =>
          evaluateSpot(s, forecasts[i], criteria, now.getTime()),
        ),
      );
    } else {
      // Historical daily maxima are context, never invented future sessions.
      const months = new Set<number>();
      for (
        let date = criteria.startDate;
        date <= criteria.endDate;
        date = addDays(date, 1)
      )
        months.add(Number(date.slice(5, 7)));
      const archives = await fetchPlannerSeasonal(
        candidates,
        months,
        now.getUTCFullYear(),
      );
      spots = candidates.map((spot, i) => ({
        ...spot,
        windows: [],
        reasons: {},
        unavailable: !archives[i],
        ...(archives[i] ? { seasonal: archives[i]! } : {}),
      }));
      spots = rankResults(spots);
    }
    const failed = spots.filter((s) => s.unavailable).length;
    const body: PlannerResponse = {
      mode,
      spots,
      meta: {
        candidates: spots.length,
        available: spots.length - failed,
        failed,
        recommended: spots.filter((s) => s.windows.length).length,
        qualified: spots.filter((s) => s.qualification?.eligible).length,
        needsReview: spots.filter((s) => !s.qualification?.eligible).length,
      },
    };
    return NextResponse.json(body, {
      status: spots.length && failed === spots.length ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}
