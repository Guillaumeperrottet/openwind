import type { WindBounds, WindModelMetadata } from "@/lib/windField";

export const OPENWIND_WIND_TILE_ENCODING = "oww1" as const;
export const OPENWIND_WIND_TILE_SCHEMA_VERSION = 1 as const;
export const OPENWIND_WIND_TILE_HEADER_BYTES = 32;
export const OPENWIND_WIND_TILE_MISSING_VALUE = -32_768;

const MAGIC = [0x4f, 0x57, 0x57, 0x31] as const; // OWW1
const FLAG_GUSTS = 1;
const MAX_TILES_PER_FIELD = 96;

export type OpenwindWindTileModelId = "dwd_icon_eu";

export type OpenwindWindTileManifest = {
  schemaVersion: typeof OPENWIND_WIND_TILE_SCHEMA_VERSION;
  encoding: typeof OPENWIND_WIND_TILE_ENCODING;
  datasetId: string;
  runId: string;
  model: WindModelMetadata & {
    id: OpenwindWindTileModelId;
    resolutionKm: number;
  };
  referenceAt: string;
  validAt: string;
  updatedAt: string;
  stale: boolean;
  gustsAvailable: boolean;
  attribution: {
    name: string;
    url: string;
  };
  grid: {
    bounds: WindBounds;
    west: number;
    north: number;
    columns: number;
    rows: number;
    longitudeStep: number;
    latitudeStep: number;
    tileSize: number;
    tileColumns: number;
    tileRows: number;
  };
  tileUrlTemplate: string;
};

export type OpenwindWindTile = {
  width: number;
  height: number;
  west: number;
  north: number;
  longitudeStep: number;
  latitudeStep: number;
  scaleMps: number;
  gustsAvailable: boolean;
  values: Int16Array;
};

export type OpenwindWindTileCoordinate = {
  x: number;
  y: number;
};

export type OpenwindWindTileSet = {
  manifest: OpenwindWindTileManifest;
  tiles: Map<string, OpenwindWindTile>;
};

export type OpenwindWindVectorSample = {
  uMps: number;
  vMps: number;
  gustMps: number;
};

type EncodableWindTile = Omit<OpenwindWindTile, "values"> & {
  uMps: ArrayLike<number>;
  vMps: ArrayLike<number>;
  gustMps?: ArrayLike<number>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(new Date(value).getTime());
}

function assertBounds(value: unknown): asserts value is WindBounds {
  if (
    !Array.isArray(value) ||
    value.length !== 4 ||
    !value.every(isFiniteNumber) ||
    value[2] <= value[0] ||
    value[3] <= value[1]
  ) {
    throw new Error("Invalid Openwind wind tile bounds");
  }
}

/** Validate the manifest before any untrusted URL or dimension reaches the client. */
export function parseOpenwindWindTileManifest(
  raw: unknown,
): OpenwindWindTileManifest {
  if (!isRecord(raw)) throw new Error("Invalid Openwind wind tile manifest");
  if (raw.schemaVersion !== OPENWIND_WIND_TILE_SCHEMA_VERSION)
    throw new Error("Unsupported Openwind wind tile schema");
  if (raw.encoding !== OPENWIND_WIND_TILE_ENCODING)
    throw new Error("Unsupported Openwind wind tile encoding");
  if (
    typeof raw.datasetId !== "string" ||
    raw.datasetId.length === 0 ||
    typeof raw.runId !== "string" ||
    raw.runId.length === 0 ||
    !isIsoDate(raw.referenceAt) ||
    !isIsoDate(raw.validAt) ||
    !isIsoDate(raw.updatedAt) ||
    typeof raw.stale !== "boolean" ||
    typeof raw.gustsAvailable !== "boolean" ||
    typeof raw.tileUrlTemplate !== "string" ||
    !raw.tileUrlTemplate.includes("{x}") ||
    !raw.tileUrlTemplate.includes("{y}")
  ) {
    throw new Error("Incomplete Openwind wind tile manifest");
  }

  const model = raw.model;
  if (
    !isRecord(model) ||
    model.id !== "dwd_icon_eu" ||
    typeof model.label !== "string" ||
    typeof model.source !== "string" ||
    !isFiniteNumber(model.resolutionKm) ||
    model.resolutionKm <= 0
  ) {
    throw new Error("Invalid Openwind wind tile model");
  }

  const attribution = raw.attribution;
  if (
    !isRecord(attribution) ||
    typeof attribution.name !== "string" ||
    attribution.name.length === 0 ||
    typeof attribution.url !== "string"
  ) {
    throw new Error("Invalid Openwind wind tile attribution");
  }
  try {
    const attributionUrl = new URL(attribution.url);
    if (attributionUrl.protocol !== "https:") throw new Error();
  } catch {
    throw new Error("Invalid Openwind wind tile attribution URL");
  }

  const grid = raw.grid;
  if (!isRecord(grid)) throw new Error("Invalid Openwind wind tile grid");
  assertBounds(grid.bounds);
  if (
    !isFiniteNumber(grid.west) ||
    !isFiniteNumber(grid.north) ||
    !isPositiveInteger(grid.columns) ||
    !isPositiveInteger(grid.rows) ||
    !isFiniteNumber(grid.longitudeStep) ||
    grid.longitudeStep <= 0 ||
    !isFiniteNumber(grid.latitudeStep) ||
    grid.latitudeStep <= 0 ||
    !isPositiveInteger(grid.tileSize) ||
    grid.tileSize > 512 ||
    !isPositiveInteger(grid.tileColumns) ||
    !isPositiveInteger(grid.tileRows) ||
    grid.tileColumns !== Math.ceil(grid.columns / grid.tileSize) ||
    grid.tileRows !== Math.ceil(grid.rows / grid.tileSize)
  ) {
    throw new Error("Invalid Openwind wind tile grid dimensions");
  }

  const expectedEast = grid.west + (grid.columns - 1) * grid.longitudeStep;
  const expectedSouth = grid.north - (grid.rows - 1) * grid.latitudeStep;
  const tolerance = Math.max(grid.longitudeStep, grid.latitudeStep) * 0.01;
  if (
    Math.abs(grid.bounds[0] - grid.west) > tolerance ||
    Math.abs(grid.bounds[1] - expectedSouth) > tolerance ||
    Math.abs(grid.bounds[2] - expectedEast) > tolerance ||
    Math.abs(grid.bounds[3] - grid.north) > tolerance
  ) {
    throw new Error("Openwind wind tile bounds do not match the grid");
  }

  return raw as OpenwindWindTileManifest;
}

function quantize(value: number, scaleMps: number): number {
  if (!Number.isFinite(value)) return OPENWIND_WIND_TILE_MISSING_VALUE;
  return Math.max(-32_767, Math.min(32_767, Math.round(value / scaleMps)));
}

/** Encoder used by tests and non-Python producers of the compact OWW1 format. */
export function encodeOpenwindWindTile(tile: EncodableWindTile): ArrayBuffer {
  const cellCount = tile.width * tile.height;
  const gustsAvailable = Boolean(tile.gustsAvailable && tile.gustMps);
  const channelCount = gustsAvailable ? 3 : 2;
  if (
    !isPositiveInteger(tile.width) ||
    !isPositiveInteger(tile.height) ||
    tile.width > 512 ||
    tile.height > 512 ||
    !isFiniteNumber(tile.west) ||
    !isFiniteNumber(tile.north) ||
    !isFiniteNumber(tile.longitudeStep) ||
    tile.longitudeStep <= 0 ||
    !isFiniteNumber(tile.latitudeStep) ||
    tile.latitudeStep <= 0 ||
    !isFiniteNumber(tile.scaleMps) ||
    tile.scaleMps <= 0 ||
    tile.uMps.length !== cellCount ||
    tile.vMps.length !== cellCount ||
    (gustsAvailable && tile.gustMps?.length !== cellCount)
  ) {
    throw new Error("Invalid Openwind wind tile values");
  }

  const buffer = new ArrayBuffer(
    OPENWIND_WIND_TILE_HEADER_BYTES + cellCount * channelCount * 2,
  );
  const header = new DataView(buffer);
  MAGIC.forEach((byte, index) => header.setUint8(index, byte));
  header.setUint8(4, OPENWIND_WIND_TILE_SCHEMA_VERSION);
  header.setUint8(5, gustsAvailable ? FLAG_GUSTS : 0);
  header.setUint16(6, tile.width, true);
  header.setUint16(8, tile.height, true);
  header.setUint16(10, 0, true);
  header.setFloat32(12, tile.west, true);
  header.setFloat32(16, tile.north, true);
  header.setFloat32(20, tile.longitudeStep, true);
  header.setFloat32(24, tile.latitudeStep, true);
  header.setFloat32(28, tile.scaleMps, true);

  const values = new Int16Array(
    buffer,
    OPENWIND_WIND_TILE_HEADER_BYTES,
    cellCount * channelCount,
  );
  for (let index = 0; index < cellCount; index++) {
    const offset = index * channelCount;
    values[offset] = quantize(Number(tile.uMps[index]), tile.scaleMps);
    values[offset + 1] = quantize(Number(tile.vMps[index]), tile.scaleMps);
    if (gustsAvailable) {
      values[offset + 2] = quantize(
        Number(tile.gustMps![index]),
        tile.scaleMps,
      );
    }
  }
  return buffer;
}

export function decodeOpenwindWindTile(buffer: ArrayBuffer): OpenwindWindTile {
  if (buffer.byteLength < OPENWIND_WIND_TILE_HEADER_BYTES)
    throw new Error("Truncated Openwind wind tile");
  const header = new DataView(buffer);
  if (MAGIC.some((byte, index) => header.getUint8(index) !== byte))
    throw new Error("Invalid Openwind wind tile magic");
  if (header.getUint8(4) !== OPENWIND_WIND_TILE_SCHEMA_VERSION)
    throw new Error("Unsupported Openwind wind tile version");

  const flags = header.getUint8(5);
  const width = header.getUint16(6, true);
  const height = header.getUint16(8, true);
  const gustsAvailable = (flags & FLAG_GUSTS) !== 0;
  const channelCount = gustsAvailable ? 3 : 2;
  const expectedBytes =
    OPENWIND_WIND_TILE_HEADER_BYTES + width * height * channelCount * 2;
  const longitudeStep = header.getFloat32(20, true);
  const latitudeStep = header.getFloat32(24, true);
  const scaleMps = header.getFloat32(28, true);
  if (
    width === 0 ||
    height === 0 ||
    width > 512 ||
    height > 512 ||
    expectedBytes !== buffer.byteLength ||
    !Number.isFinite(longitudeStep) ||
    longitudeStep <= 0 ||
    !Number.isFinite(latitudeStep) ||
    latitudeStep <= 0 ||
    !Number.isFinite(scaleMps) ||
    scaleMps <= 0
  ) {
    throw new Error("Invalid Openwind wind tile header");
  }

  return {
    width,
    height,
    west: header.getFloat32(12, true),
    north: header.getFloat32(16, true),
    longitudeStep,
    latitudeStep,
    scaleMps,
    gustsAvailable,
    values: new Int16Array(
      buffer,
      OPENWIND_WIND_TILE_HEADER_BYTES,
      width * height * channelCount,
    ),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function openwindWindTileCoordinatesForBounds(
  manifest: OpenwindWindTileManifest,
  bounds: WindBounds,
): OpenwindWindTileCoordinate[] {
  const { grid } = manifest;
  const west = Math.max(bounds[0], grid.bounds[0]);
  const south = Math.max(bounds[1], grid.bounds[1]);
  const east = Math.min(bounds[2], grid.bounds[2]);
  const north = Math.min(bounds[3], grid.bounds[3]);
  if (west > east || south > north) return [];

  // One-cell padding guarantees bilinear sampling at every tile boundary.
  const minColumn = clamp(
    Math.floor((west - grid.west) / grid.longitudeStep) - 1,
    0,
    grid.columns - 1,
  );
  const maxColumn = clamp(
    Math.ceil((east - grid.west) / grid.longitudeStep) + 1,
    0,
    grid.columns - 1,
  );
  const minRow = clamp(
    Math.floor((grid.north - north) / grid.latitudeStep) - 1,
    0,
    grid.rows - 1,
  );
  const maxRow = clamp(
    Math.ceil((grid.north - south) / grid.latitudeStep) + 1,
    0,
    grid.rows - 1,
  );

  const coordinates: OpenwindWindTileCoordinate[] = [];
  for (
    let y = Math.floor(minRow / grid.tileSize);
    y <= Math.floor(maxRow / grid.tileSize);
    y++
  ) {
    for (
      let x = Math.floor(minColumn / grid.tileSize);
      x <= Math.floor(maxColumn / grid.tileSize);
      x++
    ) {
      coordinates.push({ x, y });
    }
  }
  if (coordinates.length > MAX_TILES_PER_FIELD) {
    throw new Error("Openwind wind tile request is too large");
  }
  return coordinates;
}

export function openwindWindTileUrl(
  manifest: OpenwindWindTileManifest,
  coordinate: OpenwindWindTileCoordinate,
): string {
  return manifest.tileUrlTemplate
    .replaceAll("{x}", String(coordinate.x))
    .replaceAll("{y}", String(coordinate.y));
}

function tileKey(x: number, y: number): string {
  return `${x}:${y}`;
}

export async function loadOpenwindWindTileSet(
  manifest: OpenwindWindTileManifest,
  bounds: WindBounds,
  options: {
    signal: AbortSignal;
    fetcher?: typeof fetch;
    concurrency?: number;
  },
): Promise<OpenwindWindTileSet> {
  const coordinates = openwindWindTileCoordinatesForBounds(manifest, bounds);
  if (coordinates.length === 0)
    throw new Error("Requested bounds are outside the wind tile grid");
  const fetcher = options.fetcher ?? fetch;
  const tiles = new Map<string, OpenwindWindTile>();
  const concurrency = clamp(options.concurrency ?? 6, 1, 12);
  let cursor = 0;

  const worker = async () => {
    while (cursor < coordinates.length) {
      const coordinate = coordinates[cursor++];
      const response = await fetcher(openwindWindTileUrl(manifest, coordinate), {
        cache: "force-cache",
        signal: options.signal,
      });
      if (!response.ok) {
        throw new Error(
          `Openwind wind tile ${coordinate.x}/${coordinate.y} returned ${response.status}`,
        );
      }
      const tile = decodeOpenwindWindTile(await response.arrayBuffer());
      const expectedWidth = Math.min(
        manifest.grid.tileSize,
        manifest.grid.columns - coordinate.x * manifest.grid.tileSize,
      );
      const expectedHeight = Math.min(
        manifest.grid.tileSize,
        manifest.grid.rows - coordinate.y * manifest.grid.tileSize,
      );
      const expectedWest =
        manifest.grid.west +
        coordinate.x * manifest.grid.tileSize * manifest.grid.longitudeStep;
      const expectedNorth =
        manifest.grid.north -
        coordinate.y * manifest.grid.tileSize * manifest.grid.latitudeStep;
      const tolerance =
        Math.max(manifest.grid.longitudeStep, manifest.grid.latitudeStep) *
        0.01;
      if (
        tile.width !== expectedWidth ||
        tile.height !== expectedHeight ||
        Math.abs(tile.west - expectedWest) > tolerance ||
        Math.abs(tile.north - expectedNorth) > tolerance ||
        Math.abs(tile.longitudeStep - manifest.grid.longitudeStep) > tolerance ||
        Math.abs(tile.latitudeStep - manifest.grid.latitudeStep) > tolerance
      ) {
        throw new Error(
          `Openwind wind tile ${coordinate.x}/${coordinate.y} does not match its manifest`,
        );
      }
      tiles.set(tileKey(coordinate.x, coordinate.y), tile);
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, coordinates.length) },
      worker,
    ),
  );
  return { manifest, tiles };
}

function sampleCell(
  tileSet: OpenwindWindTileSet,
  column: number,
  row: number,
): OpenwindWindVectorSample | null {
  const { grid } = tileSet.manifest;
  if (column < 0 || row < 0 || column >= grid.columns || row >= grid.rows)
    return null;
  const tileX = Math.floor(column / grid.tileSize);
  const tileY = Math.floor(row / grid.tileSize);
  const tile = tileSet.tiles.get(tileKey(tileX, tileY));
  if (!tile) return null;
  const localColumn = column - tileX * grid.tileSize;
  const localRow = row - tileY * grid.tileSize;
  const channelCount = tile.gustsAvailable ? 3 : 2;
  const offset = (localRow * tile.width + localColumn) * channelCount;
  const quantizedU = tile.values[offset];
  const quantizedV = tile.values[offset + 1];
  if (
    quantizedU === OPENWIND_WIND_TILE_MISSING_VALUE ||
    quantizedV === OPENWIND_WIND_TILE_MISSING_VALUE
  ) {
    return null;
  }
  const uMps = quantizedU * tile.scaleMps;
  const vMps = quantizedV * tile.scaleMps;
  const quantizedGust = tile.gustsAvailable
    ? tile.values[offset + 2]
    : OPENWIND_WIND_TILE_MISSING_VALUE;
  return {
    uMps,
    vMps,
    gustMps:
      quantizedGust === OPENWIND_WIND_TILE_MISSING_VALUE
        ? Math.hypot(uMps, vMps)
        : Math.max(Math.hypot(uMps, vMps), quantizedGust * tile.scaleMps),
  };
}

export function sampleOpenwindWindTileSet(
  tileSet: OpenwindWindTileSet,
  longitude: number,
  latitude: number,
): OpenwindWindVectorSample | null {
  const { grid } = tileSet.manifest;
  const x = (longitude - grid.west) / grid.longitudeStep;
  const y = (grid.north - latitude) / grid.latitudeStep;
  if (x < 0 || y < 0 || x > grid.columns - 1 || y > grid.rows - 1)
    return null;

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(grid.columns - 1, x0 + 1);
  const y1 = Math.min(grid.rows - 1, y0 + 1);
  const samples = [
    sampleCell(tileSet, x0, y0),
    sampleCell(tileSet, x1, y0),
    sampleCell(tileSet, x0, y1),
    sampleCell(tileSet, x1, y1),
  ];
  if (samples.some((sample) => sample === null)) return null;
  const [northWest, northEast, southWest, southEast] = samples as [
    OpenwindWindVectorSample,
    OpenwindWindVectorSample,
    OpenwindWindVectorSample,
    OpenwindWindVectorSample,
  ];
  const tx = x - x0;
  const ty = y - y0;
  const interpolate = (
    key: keyof OpenwindWindVectorSample,
  ): number =>
    northWest[key] * (1 - tx) * (1 - ty) +
    northEast[key] * tx * (1 - ty) +
    southWest[key] * (1 - tx) * ty +
    southEast[key] * tx * ty;
  return {
    uMps: interpolate("uMps"),
    vMps: interpolate("vMps"),
    gustMps: interpolate("gustMps"),
  };
}

const DWD_ICON_EU_COVERAGE: WindBounds = [-23.5, 29.5, 62.5, 70.5];

/** Use the independent feed only where its complete regular grid is available. */
export function selectOpenwindWindTileModel(
  bounds: WindBounds,
): OpenwindWindTileModelId | null {
  return bounds[0] >= DWD_ICON_EU_COVERAGE[0] &&
    bounds[1] >= DWD_ICON_EU_COVERAGE[1] &&
    bounds[2] <= DWD_ICON_EU_COVERAGE[2] &&
    bounds[3] <= DWD_ICON_EU_COVERAGE[3]
    ? "dwd_icon_eu"
    : null;
}
