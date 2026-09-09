import { parseOpenwindWindTileManifest } from "../src/lib/windTiles";
import { checkWindSystemHealth } from "../src/lib/windSystemHealth";

const source =
  process.env.WIND_TILE_PUBLIC_BASE_URL?.trim() ||
  "https://tiles.openwind.ch";
const productionUrl =
  process.env.OPENWIND_PRODUCTION_URL?.trim() || "https://www.openwind.ch";

function annotation(level: "error" | "warning", message: string) {
  console.log(`::${level} title=Wind health::${message}`);
}

async function checkProductionApi(expectedDatasetId: string | undefined) {
  const url = new URL("/api/wind/tiles/manifest", productionUrl);
  url.searchParams.set("model", "dwd_icon_eu");
  const startedAt = Date.now();
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Production API returned ${response.status}`);
  const manifest = parseOpenwindWindTileManifest(
    (await response.json()) as unknown,
  );
  const tileOrigin = new URL(
    manifest.tileUrlTemplate.replace("{x}", "0").replace("{y}", "0"),
  ).origin;
  if (tileOrigin !== new URL(source).origin) {
    throw new Error("Production API points to an unexpected tile origin");
  }
  if (expectedDatasetId && manifest.datasetId !== expectedDatasetId) {
    annotation(
      "warning",
      `Production API serves ${manifest.datasetId} while R2 serves ${expectedDatasetId}`,
    );
  }
  console.log(
    `Production API: ${manifest.datasetId} (${Date.now() - startedAt} ms)`,
  );
}

async function main() {
  const report = await checkWindSystemHealth({
    source,
    origin: productionUrl,
  });

  console.log(`Wind status: ${report.status}`);
  console.log(`Active provider: ${report.activeProvider}`);
  for (const check of report.primary.checks) {
    console.log(
      `${check.status.toUpperCase()} Open-Meteo / ${check.label}: ${check.message}`,
    );
  }
  for (const check of report.fallback.checks) {
    console.log(
      `${check.status.toUpperCase()} R2 / ${check.label}: ${check.message}`,
    );
  }
  console.log(
    `${report.consistency.status.toUpperCase()} Cohérence: ${report.consistency.message}`,
  );

  if (report.status === "outage") {
    annotation("error", "Both live wind providers are unavailable or stale");
    process.exitCode = 1;
    return;
  }
  if (report.status === "degraded") {
    annotation("warning", "The live wind service is running without full redundancy");
  }

  await checkProductionApi(report.fallback.dataset?.id);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  annotation("error", message);
  console.error(message);
  process.exitCode = 1;
});
