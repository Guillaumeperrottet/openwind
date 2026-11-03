import { getGruyereWaterTemperature } from "@/lib/alplakes";
import { toSiteLocale } from "@/lib/site";
import { WATER_COPY } from "@/lib/water-temperature-copy";
import { WaterTemperatureCard } from "./WaterTemperatureCard";
import { lakePageEnabled } from "@/lib/lake-page-enabled";

export async function WaterTemperature({ locale }: { locale: string }) {
  const series = await getGruyereWaterTemperature();
  const lakeHref = lakePageEnabled() ? `/${locale}/lacs/gruyere` : undefined;
  return <WaterTemperatureCard key="alplakes-gruyere" series={series} locale={toSiteLocale(locale)} initialNow={new Date().getTime()} lakeHref={lakeHref} />;
}

export function WaterTemperatureLoading({ locale }: { locale: string }) {
  const c = WATER_COPY[toSiteLocale(locale)];
  return <section className="ow-water-card ow-water-pending" aria-label={c.title}>
    <p role="status" className="text-sm text-slate-600">{c.loading}</p>
  </section>;
}
