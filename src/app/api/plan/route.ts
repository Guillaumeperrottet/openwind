import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchForecastRange, analyzeMultiDay } from "@/lib/wind";
import { haversineKm } from "@/lib/utils";
import type { SportType } from "@/types";

/**
 * Trip planner endpoint.
 * Query: ?lat=...&lng=...&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&radius=150&sport=KITE
 * Returns nearest spots with per-day scoring + best day.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const today = new Date().toISOString().split("T")[0];
  const startDate = searchParams.get("startDate") || today;
  const endDate = searchParams.get("endDate") || startDate;
  const radius = parseFloat(searchParams.get("radius") || "150");
  const sport = (searchParams.get("sport") as SportType) || undefined;

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 },
    );
  }

  // Fetch all spots with optional sport filter
  const allSpots = await prisma.spot.findMany({
    where: sport ? { sportType: sport } : undefined,
    include: { images: true },
  });

  // Compute distance and filter by radius
  const nearby = allSpots
    .map((spot) => ({
      ...spot,
      distanceKm: haversineKm(lat, lng, spot.latitude, spot.longitude),
    }))
    .filter((s) => s.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 15);

  // Fetch multi-day forecasts in parallel (single Open-Meteo call per spot)
  const spotsWithForecast = await Promise.all(
    nearby.map(async (spot) => {
      try {
        const forecast = await fetchForecastRange(
          spot.latitude,
          spot.longitude,
          startDate,
          endDate,
        );
        const sportType = (spot.sportType as SportType) || "KITE";
        const days = analyzeMultiDay(forecast, sportType);
        const bestDayIndex = days.reduce(
          (best, d, i) => (d.score > (days[best]?.score ?? 0) ? i : best),
          0,
        );
        return {
          ...spot,
          forecast: days[bestDayIndex]?.forecast ?? [],
          days,
          bestScore: days[bestDayIndex]?.score ?? 0,
          bestDayIndex,
        };
      } catch {
        return {
          ...spot,
          forecast: [],
          days: [],
          bestScore: 0,
          bestDayIndex: 0,
        };
      }
    }),
  );

  return NextResponse.json(spotsWithForecast);
}
