from __future__ import annotations

import io
import json
import struct
import tempfile
import threading
import unittest
from datetime import datetime, timezone
from pathlib import Path

from scripts.publish_wind_tiles import (
    IMMUTABLE_CACHE_CONTROL,
    LATEST_CACHE_CONTROL,
    PublicationConfig,
    load_dataset,
    publish_dataset,
)


PUBLIC_BASE_URL = "https://wind-data.openwind.test"
FIXED_NOW = datetime(2026, 9, 4, 5, tzinfo=timezone.utc)


class FakeNotFound(Exception):
    response = {"Error": {"Code": "NoSuchKey"}}


class FakeS3:
    def __init__(self) -> None:
        self.objects: dict[str, dict[str, object]] = {}
        self.operations: list[tuple[str, str]] = []
        self.lock = threading.Lock()
        self.corrupt_get_key: str | None = None

    def seed(self, key: str, payload: bytes = b"old") -> None:
        self.objects[key] = {
            "Body": payload,
            "Metadata": {},
            "ContentLength": len(payload),
        }

    def head_object(self, *, Bucket: str, Key: str) -> dict[str, object]:
        del Bucket
        with self.lock:
            self.operations.append(("head", Key))
            if Key not in self.objects:
                raise FakeNotFound()
            value = self.objects[Key]
            return {
                "ContentLength": value["ContentLength"],
                "Metadata": value["Metadata"],
            }

    def get_object(self, *, Bucket: str, Key: str) -> dict[str, object]:
        del Bucket
        with self.lock:
            self.operations.append(("get", Key))
            if Key not in self.objects:
                raise FakeNotFound()
            payload = self.objects[Key]["Body"]
            if Key == self.corrupt_get_key:
                payload = bytes(payload) + b"corrupt"
            return {"Body": io.BytesIO(bytes(payload))}

    def put_object(self, **kwargs: object) -> dict[str, object]:
        key = str(kwargs["Key"])
        payload = bytes(kwargs["Body"])
        with self.lock:
            self.operations.append(("put", key))
            self.objects[key] = {
                "Body": payload,
                "Metadata": dict(kwargs.get("Metadata", {})),
                "ContentLength": len(payload),
                "CacheControl": kwargs.get("CacheControl"),
                "ContentType": kwargs.get("ContentType"),
            }
        return {}

    def list_objects_v2(self, **kwargs: object) -> dict[str, object]:
        prefix = str(kwargs["Prefix"])
        with self.lock:
            self.operations.append(("list", prefix))
            keys = sorted(key for key in self.objects if key.startswith(prefix))
        return {
            "IsTruncated": False,
            "Contents": [{"Key": key} for key in keys],
        }

    def delete_objects(self, **kwargs: object) -> dict[str, object]:
        delete = kwargs["Delete"]
        assert isinstance(delete, dict)
        objects = delete["Objects"]
        assert isinstance(objects, list)
        with self.lock:
            for item in objects:
                key = str(item["Key"])
                self.operations.append(("delete", key))
                self.objects.pop(key, None)
        return {"Errors": []}


def write_tile(path: Path, width: int, height: int, west: float) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    header = struct.pack(
        "<4sBBHHHfffff",
        b"OWW1",
        1,
        1,
        width,
        height,
        0,
        west,
        1.0,
        1.0,
        1.0,
        0.01,
    )
    path.write_bytes(header + bytes(width * height * 3 * 2))


def write_dataset(root: Path) -> None:
    relative_prefix = "dwd_icon_eu/runs/2026090403/002"
    write_tile(root / relative_prefix / "0/0.oww", 2, 2, 0.0)
    write_tile(root / relative_prefix / "1/0.oww", 1, 2, 2.0)
    manifest = {
        "schemaVersion": 1,
        "encoding": "oww1",
        "datasetId": "dwd_icon_eu:2026090403:002",
        "runId": "2026090403",
        "model": {
            "id": "dwd_icon_eu",
            "label": "ICON-EU",
            "source": "DWD",
            "resolutionKm": 6.5,
        },
        "referenceAt": "2026-09-04T03:00:00.000Z",
        "validAt": "2026-09-04T05:00:00.000Z",
        "updatedAt": "2026-09-04T05:01:00.000Z",
        "stale": False,
        "gustsAvailable": True,
        "attribution": {
            "name": "Deutscher Wetterdienst (DWD)",
            "url": "https://www.dwd.de/DE/leistungen/opendata/opendata.html",
        },
        "grid": {
            "bounds": [0.0, 0.0, 2.0, 1.0],
            "west": 0.0,
            "north": 1.0,
            "columns": 3,
            "rows": 2,
            "longitudeStep": 1.0,
            "latitudeStep": 1.0,
            "tileSize": 2,
            "tileColumns": 2,
            "tileRows": 1,
        },
        "tileUrlTemplate": (
            f"{PUBLIC_BASE_URL}/{relative_prefix}/{{x}}/{{y}}.oww"
        ),
        "source": {},
    }
    manifest_path = root / "dwd_icon_eu/latest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")


def config() -> PublicationConfig:
    return PublicationConfig(
        endpoint_url="https://account.r2.cloudflarestorage.test",
        bucket="wind",
        access_key_id="test",
        secret_access_key="test",
        public_base_url=PUBLIC_BASE_URL,
        retain_datasets=2,
        verify_public=False,
    )


class PublishWindTilesTests(unittest.TestCase):
    def test_publishes_latest_only_after_every_tile_is_verified(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            write_dataset(root)
            dataset = load_dataset(root, PUBLIC_BASE_URL, now=FIXED_NOW)
            client = FakeS3()

            result = publish_dataset(client, config(), dataset)

        self.assertEqual(result["tiles"], 2)
        self.assertEqual(result["uploaded_tiles"], 2)
        put_keys = [key for operation, key in client.operations if operation == "put"]
        self.assertEqual(put_keys[-1], "dwd_icon_eu/latest.json")
        latest_put_index = client.operations.index(("put", "dwd_icon_eu/latest.json"))
        tile_keys = {tile.relative_key for tile in dataset.tiles}
        verified_before_latest = {
            key
            for operation, key in client.operations[:latest_put_index]
            if operation == "get" and key.endswith(".oww")
        }
        self.assertEqual(verified_before_latest, tile_keys)
        self.assertEqual(
            client.objects["dwd_icon_eu/latest.json"]["CacheControl"],
            LATEST_CACHE_CONTROL,
        )
        self.assertEqual(
            client.objects[
                "dwd_icon_eu/runs/2026090403/002/manifest.json"
            ]["CacheControl"],
            IMMUTABLE_CACHE_CONTROL,
        )

    def test_does_not_publish_latest_when_remote_verification_fails(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            write_dataset(root)
            dataset = load_dataset(root, PUBLIC_BASE_URL, now=FIXED_NOW)
            client = FakeS3()
            client.corrupt_get_key = dataset.tiles[0].relative_key

            with self.assertRaisesRegex(RuntimeError, "Remote verification failed"):
                publish_dataset(client, config(), dataset)

        self.assertNotIn("dwd_icon_eu/latest.json", client.objects)

    def test_rejects_a_corrupt_local_tile_before_upload(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            write_dataset(root)
            tile = root / "dwd_icon_eu/runs/2026090403/002/0/0.oww"
            tile.write_bytes(b"broken")

            with self.assertRaisesRegex(RuntimeError, "Truncated wind tile"):
                load_dataset(root, PUBLIC_BASE_URL, now=FIXED_NOW)

    def test_retention_keeps_current_and_most_recent_dataset(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            write_dataset(root)
            dataset = load_dataset(root, PUBLIC_BASE_URL, now=FIXED_NOW)
            client = FakeS3()
            for day in (1, 2, 3):
                client.seed(
                    f"dwd_icon_eu/runs/2026090{day}00/000/0/0.oww"
                )

            result = publish_dataset(client, config(), dataset)

        self.assertEqual(result["removed_datasets"], 2)
        self.assertNotIn(
            "dwd_icon_eu/runs/2026090100/000/0/0.oww", client.objects
        )
        self.assertNotIn(
            "dwd_icon_eu/runs/2026090200/000/0/0.oww", client.objects
        )
        self.assertIn(
            "dwd_icon_eu/runs/2026090300/000/0/0.oww", client.objects
        )
        self.assertIn(dataset.tiles[0].relative_key, client.objects)


if __name__ == "__main__":
    unittest.main()
