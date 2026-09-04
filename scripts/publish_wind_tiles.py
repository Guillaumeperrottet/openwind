#!/usr/bin/env python3
"""Publish a validated Openwind wind dataset atomically to S3 or Cloudflare R2."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import struct
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Protocol
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen


MODEL_ID = "dwd_icon_eu"
OWW_HEADER = struct.Struct("<4sBBHHHfffff")
OWW_MAGIC = b"OWW1"
OWW_VERSION = 1
OWW_GUST_FLAG = 1
IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable"
LATEST_CACHE_CONTROL = "public, max-age=60, stale-while-revalidate=300"
DEFAULT_RETENTION = 12
MAX_VALID_TIME_DISTANCE = timedelta(hours=6)
DATASET_ID_PATTERN = re.compile(
    rf"^{MODEL_ID}:(?P<run>\d{{10}}):(?P<lead>\d{{3}})$"
)


class S3Client(Protocol):
    def head_object(self, **kwargs: Any) -> dict[str, Any]: ...

    def get_object(self, **kwargs: Any) -> dict[str, Any]: ...

    def put_object(self, **kwargs: Any) -> dict[str, Any]: ...

    def list_objects_v2(self, **kwargs: Any) -> dict[str, Any]: ...

    def delete_objects(self, **kwargs: Any) -> dict[str, Any]: ...


@dataclass(frozen=True)
class TileAsset:
    path: Path
    relative_key: str
    public_url: str
    size: int
    sha256: str


@dataclass(frozen=True)
class WindDataset:
    manifest: dict[str, Any]
    manifest_bytes: bytes
    dataset_id: str
    run_id: str
    lead_hours: int
    relative_prefix: str
    tiles: tuple[TileAsset, ...]


@dataclass(frozen=True)
class PublicationConfig:
    endpoint_url: str
    bucket: str
    access_key_id: str
    secret_access_key: str
    public_base_url: str
    region: str = "auto"
    key_prefix: str = ""
    retain_datasets: int = DEFAULT_RETENTION
    cors_origin: str | None = None
    verify_public: bool = True

    def key(self, relative_key: str) -> str:
        return "/".join(part for part in (self.key_prefix, relative_key) if part)


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalize_https_url(value: str, name: str) -> str:
    normalized = value.rstrip("/")
    parsed = urlparse(normalized)
    if parsed.scheme != "https" or not parsed.netloc or parsed.query or parsed.fragment:
        raise RuntimeError(f"{name} must be an HTTPS base URL")
    return normalized


def normalize_key_prefix(value: str) -> str:
    normalized = value.strip("/")
    if ".." in normalized.split("/") or "//" in normalized:
        raise RuntimeError("WIND_TILE_S3_PREFIX is invalid")
    return normalized


def parse_iso8601(value: Any, field: str) -> datetime:
    if not isinstance(value, str):
        raise RuntimeError(f"Manifest field {field} is invalid")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as error:
        raise RuntimeError(f"Manifest field {field} is invalid") from error
    if parsed.tzinfo is None:
        raise RuntimeError(f"Manifest field {field} must include a timezone")
    return parsed.astimezone(timezone.utc)


def require_integer(value: Any, field: str, minimum: int = 1) -> int:
    if not isinstance(value, int) or isinstance(value, bool) or value < minimum:
        raise RuntimeError(f"Manifest field {field} is invalid")
    return value


def require_number(value: Any, field: str) -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise RuntimeError(f"Manifest field {field} is invalid")
    number = float(value)
    if not math.isfinite(number):
        raise RuntimeError(f"Manifest field {field} is invalid")
    return number


def validate_tile(
    path: Path,
    *,
    expected_width: int,
    expected_height: int,
    expected_west: float,
    expected_north: float,
    longitude_step: float,
    latitude_step: float,
    gusts_available: bool,
) -> tuple[int, str]:
    payload = path.read_bytes()
    if len(payload) < OWW_HEADER.size:
        raise RuntimeError(f"Truncated wind tile: {path}")
    magic, version, flags, width, height, reserved, west, north, dx, dy, scale = (
        OWW_HEADER.unpack_from(payload)
    )
    channel_count = 3 if flags & OWW_GUST_FLAG else 2
    tolerance = max(longitude_step, latitude_step) * 0.01
    expected_size = OWW_HEADER.size + width * height * channel_count * 2
    if (
        magic != OWW_MAGIC
        or version != OWW_VERSION
        or reserved != 0
        or width != expected_width
        or height != expected_height
        or bool(flags & OWW_GUST_FLAG) != gusts_available
        or flags & ~OWW_GUST_FLAG
        or not math.isclose(west, expected_west, abs_tol=tolerance)
        or not math.isclose(north, expected_north, abs_tol=tolerance)
        or not math.isclose(dx, longitude_step, abs_tol=tolerance)
        or not math.isclose(dy, latitude_step, abs_tol=tolerance)
        or not 0 < scale <= 0.1
        or len(payload) != expected_size
    ):
        raise RuntimeError(f"Invalid wind tile: {path}")
    return len(payload), sha256_bytes(payload)


def load_dataset(
    output_directory: Path,
    public_base_url: str,
    *,
    now: datetime | None = None,
) -> WindDataset:
    public_base_url = normalize_https_url(public_base_url, "public base URL")
    manifest_path = output_directory / MODEL_ID / "latest.json"
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise RuntimeError(f"Could not read {manifest_path}") from error
    if not isinstance(manifest, dict):
        raise RuntimeError("Wind manifest must be a JSON object")

    dataset_id = manifest.get("datasetId")
    match = DATASET_ID_PATTERN.fullmatch(str(dataset_id))
    if not match:
        raise RuntimeError("Wind manifest datasetId is invalid")
    run_id = match.group("run")
    lead_hours = int(match.group("lead"))
    if lead_hours > 120 or manifest.get("runId") != run_id:
        raise RuntimeError("Wind manifest run is invalid")
    if manifest.get("schemaVersion") != OWW_VERSION or manifest.get("encoding") != "oww1":
        raise RuntimeError("Wind manifest schema is unsupported")
    model = manifest.get("model")
    if not isinstance(model, dict) or model.get("id") != MODEL_ID:
        raise RuntimeError("Wind manifest model is invalid")
    if manifest.get("stale") is not False or manifest.get("gustsAvailable") is not True:
        raise RuntimeError("Refusing to publish a stale or incomplete wind dataset")

    reference_at = parse_iso8601(manifest.get("referenceAt"), "referenceAt")
    valid_at = parse_iso8601(manifest.get("validAt"), "validAt")
    parse_iso8601(manifest.get("updatedAt"), "updatedAt")
    expected_reference = datetime.strptime(run_id, "%Y%m%d%H").replace(
        tzinfo=timezone.utc
    )
    if reference_at != expected_reference or valid_at != reference_at + timedelta(
        hours=lead_hours
    ):
        raise RuntimeError("Wind manifest timestamps do not match its run")
    current_time = (now or datetime.now(timezone.utc)).astimezone(timezone.utc)
    if abs(current_time - valid_at) > MAX_VALID_TIME_DISTANCE:
        raise RuntimeError("Refusing to publish a wind dataset more than six hours away")

    grid = manifest.get("grid")
    if not isinstance(grid, dict):
        raise RuntimeError("Wind manifest grid is invalid")
    columns = require_integer(grid.get("columns"), "grid.columns")
    rows = require_integer(grid.get("rows"), "grid.rows")
    tile_size = require_integer(grid.get("tileSize"), "grid.tileSize")
    tile_columns = require_integer(grid.get("tileColumns"), "grid.tileColumns")
    tile_rows = require_integer(grid.get("tileRows"), "grid.tileRows")
    if tile_size > 512 or tile_columns != math.ceil(columns / tile_size) or tile_rows != math.ceil(rows / tile_size):
        raise RuntimeError("Wind manifest tile dimensions are inconsistent")
    west = require_number(grid.get("west"), "grid.west")
    north = require_number(grid.get("north"), "grid.north")
    dx = require_number(grid.get("longitudeStep"), "grid.longitudeStep")
    dy = require_number(grid.get("latitudeStep"), "grid.latitudeStep")
    if dx <= 0 or dy <= 0:
        raise RuntimeError("Wind manifest grid steps are invalid")

    relative_prefix = f"{MODEL_ID}/runs/{run_id}/{lead_hours:03d}"
    expected_template = f"{public_base_url}/{relative_prefix}/{{x}}/{{y}}.oww"
    if manifest.get("tileUrlTemplate") != expected_template:
        raise RuntimeError(
            "Wind manifest tileUrlTemplate does not match WIND_TILE_PUBLIC_BASE_URL"
        )

    dataset_directory = output_directory / relative_prefix
    expected_paths: set[Path] = set()
    tiles: list[TileAsset] = []
    for tile_y in range(tile_rows):
        for tile_x in range(tile_columns):
            path = dataset_directory / str(tile_x) / f"{tile_y}.oww"
            expected_paths.add(path)
            if not path.is_file() or path.is_symlink():
                raise RuntimeError(f"Missing or unsafe wind tile: {path}")
            expected_width = min(tile_size, columns - tile_x * tile_size)
            expected_height = min(tile_size, rows - tile_y * tile_size)
            expected_west = west + tile_x * tile_size * dx
            expected_north = north - tile_y * tile_size * dy
            size, digest = validate_tile(
                path,
                expected_width=expected_width,
                expected_height=expected_height,
                expected_west=expected_west,
                expected_north=expected_north,
                longitude_step=dx,
                latitude_step=dy,
                gusts_available=True,
            )
            relative_key = f"{relative_prefix}/{tile_x}/{tile_y}.oww"
            tiles.append(
                TileAsset(
                    path=path,
                    relative_key=relative_key,
                    public_url=f"{public_base_url}/{relative_key}",
                    size=size,
                    sha256=digest,
                )
            )

    discovered_paths = set(dataset_directory.glob("*/*.oww"))
    if discovered_paths != expected_paths:
        raise RuntimeError("Wind dataset contains unexpected tile files")
    manifest_bytes = (
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    ).encode("utf-8")
    return WindDataset(
        manifest=manifest,
        manifest_bytes=manifest_bytes,
        dataset_id=str(dataset_id),
        run_id=run_id,
        lead_hours=lead_hours,
        relative_prefix=relative_prefix,
        tiles=tuple(tiles),
    )


def is_not_found(error: Exception) -> bool:
    response = getattr(error, "response", None)
    if not isinstance(response, dict):
        return False
    details = response.get("Error")
    return isinstance(details, dict) and str(details.get("Code")) in {
        "404",
        "NoSuchKey",
        "NotFound",
    }


def object_matches(
    client: S3Client,
    config: PublicationConfig,
    key: str,
    size: int,
    digest: str,
) -> bool:
    try:
        response = client.head_object(Bucket=config.bucket, Key=key)
    except Exception as error:
        if is_not_found(error):
            return False
        raise
    metadata = response.get("Metadata") or {}
    return response.get("ContentLength") == size and metadata.get("sha256") == digest


def read_object(client: S3Client, config: PublicationConfig, key: str) -> bytes:
    response = client.get_object(Bucket=config.bucket, Key=key)
    body = response.get("Body")
    if body is None or not hasattr(body, "read"):
        raise RuntimeError(f"S3 returned no body for {key}")
    return body.read()


def upload_and_verify_tile(
    client: S3Client,
    config: PublicationConfig,
    tile: TileAsset,
) -> bool:
    key = config.key(tile.relative_key)
    uploaded = False
    if not object_matches(client, config, key, tile.size, tile.sha256):
        client.put_object(
            Bucket=config.bucket,
            Key=key,
            Body=tile.path.read_bytes(),
            ContentType="application/octet-stream",
            CacheControl=IMMUTABLE_CACHE_CONTROL,
            Metadata={"sha256": tile.sha256},
        )
        uploaded = True
    payload = read_object(client, config, key)
    if len(payload) != tile.size or sha256_bytes(payload) != tile.sha256:
        raise RuntimeError(f"Remote verification failed for {key}")
    return uploaded


def put_json_object(
    client: S3Client,
    config: PublicationConfig,
    key: str,
    payload: bytes,
    cache_control: str,
    dataset_id: str,
) -> None:
    digest = sha256_bytes(payload)
    if not object_matches(client, config, key, len(payload), digest):
        client.put_object(
            Bucket=config.bucket,
            Key=key,
            Body=payload,
            ContentType="application/json; charset=utf-8",
            CacheControl=cache_control,
            Metadata={"sha256": digest, "dataset-id": dataset_id},
        )
    if read_object(client, config, key) != payload:
        raise RuntimeError(f"Remote verification failed for {key}")


def fetch_public_bytes(
    url: str,
    *,
    cors_origin: str | None = None,
    attempts: int = 3,
) -> bytes:
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            headers = {"User-Agent": "Openwind wind tile publisher/1"}
            if cors_origin:
                headers["Origin"] = cors_origin
            with urlopen(Request(url, headers=headers), timeout=20) as response:
                payload = response.read()
                if cors_origin and response.headers.get(
                    "Access-Control-Allow-Origin"
                ) not in {cors_origin, "*"}:
                    raise RuntimeError(f"Missing CORS permission for {cors_origin}")
                return payload
        except Exception as error:
            last_error = error
            if attempt + 1 < attempts:
                time.sleep(1.5 * (2**attempt))
    raise RuntimeError(f"Public verification failed for {url}: {last_error}")


def verify_public_tiles(dataset: WindDataset, config: PublicationConfig) -> None:
    def verify(tile: TileAsset) -> None:
        payload = fetch_public_bytes(tile.public_url, cors_origin=config.cors_origin)
        if len(payload) != tile.size or sha256_bytes(payload) != tile.sha256:
            raise RuntimeError(f"Public checksum mismatch for {tile.public_url}")

    with ThreadPoolExecutor(max_workers=8) as executor:
        list(executor.map(verify, dataset.tiles))


def list_keys(client: S3Client, config: PublicationConfig, prefix: str) -> list[str]:
    keys: list[str] = []
    continuation_token: str | None = None
    while True:
        arguments: dict[str, Any] = {
            "Bucket": config.bucket,
            "Prefix": prefix,
            "MaxKeys": 1000,
        }
        if continuation_token:
            arguments["ContinuationToken"] = continuation_token
        response = client.list_objects_v2(**arguments)
        keys.extend(
            item["Key"]
            for item in response.get("Contents", [])
            if isinstance(item, dict) and isinstance(item.get("Key"), str)
        )
        if not response.get("IsTruncated"):
            return keys
        continuation_token = response.get("NextContinuationToken")
        if not continuation_token:
            raise RuntimeError("S3 listing was truncated without a continuation token")


def cleanup_old_datasets(
    client: S3Client,
    config: PublicationConfig,
    current: WindDataset,
) -> tuple[int, int]:
    model_root = config.key(MODEL_ID)
    run_root = f"{model_root}/runs/"
    keys = list_keys(client, config, run_root)
    pattern = re.compile(
        rf"^{re.escape(run_root)}(?P<run>\d{{10}})/(?P<lead>\d{{3}})/"
    )
    grouped: dict[tuple[str, int], list[str]] = {}
    for key in keys:
        match = pattern.match(key)
        if match:
            grouped.setdefault(
                (match.group("run"), int(match.group("lead"))), []
            ).append(key)

    def valid_time(item: tuple[str, int]) -> datetime:
        run_id, lead_hours = item
        return datetime.strptime(run_id, "%Y%m%d%H").replace(
            tzinfo=timezone.utc
        ) + timedelta(hours=lead_hours)

    ordered = sorted(grouped, key=valid_time, reverse=True)
    current_key = (current.run_id, current.lead_hours)
    retained = set(ordered[: config.retain_datasets]) | {current_key}
    obsolete_keys = [
        key
        for dataset_key, dataset_keys in grouped.items()
        if dataset_key not in retained
        for key in dataset_keys
    ]
    for offset in range(0, len(obsolete_keys), 1000):
        batch = obsolete_keys[offset : offset + 1000]
        response = client.delete_objects(
            Bucket=config.bucket,
            Delete={"Objects": [{"Key": key} for key in batch], "Quiet": True},
        )
        if response.get("Errors"):
            raise RuntimeError(f"Could not delete old wind objects: {response['Errors']}")
    return len(grouped) - len(retained & set(grouped)), len(obsolete_keys)


def publish_dataset(
    client: S3Client,
    config: PublicationConfig,
    dataset: WindDataset,
) -> dict[str, int]:
    with ThreadPoolExecutor(max_workers=8) as executor:
        uploaded = sum(executor.map(lambda tile: upload_and_verify_tile(client, config, tile), dataset.tiles))

    snapshot_relative_key = f"{dataset.relative_prefix}/manifest.json"
    snapshot_key = config.key(snapshot_relative_key)
    put_json_object(
        client,
        config,
        snapshot_key,
        dataset.manifest_bytes,
        IMMUTABLE_CACHE_CONTROL,
        dataset.dataset_id,
    )

    if config.verify_public:
        verify_public_tiles(dataset, config)
        snapshot_url = f"{config.public_base_url}/{snapshot_relative_key}"
        if fetch_public_bytes(snapshot_url) != dataset.manifest_bytes:
            raise RuntimeError("Public dataset manifest verification failed")

    # This mutable pointer is deliberately the final write. Until this point,
    # readers continue receiving the previously verified dataset.
    latest_relative_key = f"{MODEL_ID}/latest.json"
    put_json_object(
        client,
        config,
        config.key(latest_relative_key),
        dataset.manifest_bytes,
        LATEST_CACHE_CONTROL,
        dataset.dataset_id,
    )

    if config.verify_public:
        cache_buster = quote(dataset.dataset_id, safe="")
        latest_url = (
            f"{config.public_base_url}/{latest_relative_key}"
            f"?openwind_dataset={cache_buster}"
        )
        public_manifest = json.loads(fetch_public_bytes(latest_url))
        if public_manifest.get("datasetId") != dataset.dataset_id:
            raise RuntimeError("Public latest manifest did not switch atomically")

    removed_datasets, removed_objects = cleanup_old_datasets(
        client, config, dataset
    )
    return {
        "tiles": len(dataset.tiles),
        "uploaded_tiles": uploaded,
        "removed_datasets": removed_datasets,
        "removed_objects": removed_objects,
    }


def make_s3_client(config: PublicationConfig) -> S3Client:
    try:
        import boto3
        from botocore.config import Config
    except ImportError as error:
        raise RuntimeError(
            "Missing boto3. Run: python3 -m pip install -r scripts/requirements-wind.txt"
        ) from error
    return boto3.client(
        service_name="s3",
        endpoint_url=config.endpoint_url,
        aws_access_key_id=config.access_key_id,
        aws_secret_access_key=config.secret_access_key,
        region_name=config.region,
        config=Config(
            signature_version="s3v4",
            retries={"mode": "standard", "max_attempts": 5},
        ),
    )


def required_environment(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable {name}")
    return value


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=Path("public/wind-data"))
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--skip-public-verification", action="store_true")
    parser.add_argument(
        "--retain-datasets",
        type=int,
        default=int(os.environ.get("WIND_TILE_RETAIN_DATASETS", DEFAULT_RETENTION)),
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not 2 <= args.retain_datasets <= 168:
        raise RuntimeError("--retain-datasets must be between 2 and 168")
    public_base_url = normalize_https_url(
        required_environment("WIND_TILE_PUBLIC_BASE_URL"),
        "WIND_TILE_PUBLIC_BASE_URL",
    )
    dataset = load_dataset(args.output_dir, public_base_url)
    print(
        f"Validated {dataset.dataset_id}: {len(dataset.tiles)} tiles, "
        f"{sum(tile.size for tile in dataset.tiles) / 1024 / 1024:.2f} MiB"
    )
    if args.validate_only:
        return 0

    config = PublicationConfig(
        endpoint_url=normalize_https_url(
            required_environment("WIND_TILE_S3_ENDPOINT"),
            "WIND_TILE_S3_ENDPOINT",
        ),
        bucket=required_environment("WIND_TILE_S3_BUCKET"),
        access_key_id=required_environment("WIND_TILE_S3_ACCESS_KEY_ID"),
        secret_access_key=required_environment("WIND_TILE_S3_SECRET_ACCESS_KEY"),
        public_base_url=public_base_url,
        region=os.environ.get("WIND_TILE_S3_REGION", "auto").strip() or "auto",
        key_prefix=normalize_key_prefix(os.environ.get("WIND_TILE_S3_PREFIX", "")),
        retain_datasets=args.retain_datasets,
        cors_origin=os.environ.get("WIND_TILE_CORS_ORIGIN", "").strip() or None,
        verify_public=not args.skip_public_verification,
    )
    result = publish_dataset(make_s3_client(config), config, dataset)
    print(
        f"Published {dataset.dataset_id}: {result['uploaded_tiles']}/"
        f"{result['tiles']} tiles uploaded, {result['removed_datasets']} old "
        f"datasets removed ({result['removed_objects']} objects)"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"Wind tile publication failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error
