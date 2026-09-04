import { parseOpenwindWindTileManifest } from "../src/lib/windTiles";
import { checkWindHealth } from "../src/lib/windHealth";

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
  const report = await checkWindHealth({
    source,
    origin: productionUrl,
  });

  console.log(`Wind status: ${report.status}`);
  for (const check of report.checks) {
    console.log(
      `${check.status.toUpperCase()} ${check.label}: ${check.message}`,
    );
  }

  if (report.status === "outage") {
    annotation("error", "The live wind tile service is unavailable or stale");
    process.exitCode = 1;
    return;
  }
  if (report.status === "degraded") {
    annotation("warning", "The live wind tile service needs attention");
  }

  await checkProductionApi(report.dataset?.id);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  annotation("error", message);
  console.error(message);
  process.exitCode = 1;
});
