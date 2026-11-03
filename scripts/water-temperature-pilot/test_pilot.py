"""Offline checks for leakage, timing, data quality and paired scoring."""
import copy
import json
import unittest

import pilot


class PilotTests(unittest.TestCase):
    def setUp(self):
        self.protocol = json.loads(pilot.PROTOCOL.read_text())

    def test_timestamps_require_explicit_timezone_and_distinguish_dst(self):
        with self.assertRaises(ValueError):
            pilot.timestamp("2026-10-25T02:30:00")
        a = pilot.timestamp("2026-10-25T02:30:00+02:00")
        b = pilot.timestamp("2026-10-25T02:30:00+01:00")
        self.assertEqual(b - a, 3600)

    def test_sensor_null_is_not_zero_bad_status_and_conflicts_removed(self):
        def row(t, value, status="ok"):
            return {"station": "a", "timestamp": pilot.iso(t), "values": {"water_temperature": {"value": value, "status": status, "unit": "°C"}}}
        rows = [row(0, None), row(600, 0), row(1200, 12, "error"), row(1800, 11), row(1800, 12), row(2400, 13), row(2400, 13)]
        accepted, quality = pilot.observations(rows, "a", 0, 3000, self.protocol)
        self.assertEqual(accepted, [(600, 0), (2400, 13)])
        self.assertEqual(quality["conflicting_timestamps_removed"], 1)
        self.assertEqual(quality["invalid_temperature"], 1)

    def test_actual_returned_depth_used_and_no_extrapolation(self):
        low = {"latitude": 47.3, "longitude": 8.5, "depth_m": .75}
        high = {**low, "depth_m": 1.25}
        self.assertEqual(pilot.vertical_at_one_m({0: 12, 1: 13}, {0: 14}, low, high), [(0, 13)])
        with self.assertRaises(ValueError):
            pilot.vertical_at_one_m({0: 12}, {0: 14}, low, {**high, "latitude": 47.4})
        with self.assertRaises(ValueError):
            pilot.vertical_at_one_m({0: 12}, {0: 14}, low, high, target=2)

    def test_model_units_distance_and_missing_values_are_checked(self):
        response = {"time": [pilot.iso(0), pilot.iso(10800)], "lat": 47.3, "lng": 8.5,
                    "depth": {"data": .7575, "unit": "m"}, "distance": {"data": 135, "unit": "m"},
                    "variables": {"temperature": {"unit": "degC", "data": [None, 12]}}}
        series, grid = pilot.model_response(response, .76, self.protocol)
        self.assertEqual(series, {10800: 12})
        self.assertEqual(grid["depth_m"], .7575)
        response["distance"]["data"] = 501
        with self.assertRaises(ValueError):
            pilot.model_response(response, .76, self.protocol)
        response["distance"]["data"] = 135
        response["variables"]["temperature"]["unit"] = "K"
        with self.assertRaises(ValueError):
            pilot.model_response(response, .76, self.protocol)

    def test_sensor_match_does_not_bridge_outages(self):
        self.assertEqual(pilot.aligned_observation([(0, 10), (600, 20)], 300, 300), (0, 10))
        self.assertIsNone(pilot.aligned_observation([(0, 10), (6000, 20)], 3000, 300))
        # JSON snapshots round-trip tuples as arrays; offline replay must work.
        self.assertEqual(pilot.aligned_observation([[0, 10], [600, 20]], 300, 300), [0, 10])

    def synthetic_snapshot(self):
        p = copy.deepcopy(self.protocol)
        p.update(start=pilot.iso(0), holdout_start=pilot.iso(10800), end_exclusive=pilot.iso(32400))
        return {"protocol": p, "stations": {
            "a": {"model": [(0, 10), (10800, 10), (21600, 10)], "observations": [(0, 11), (10800, 11), (21600, 11)]},
            "b": {"model": [(0, 10), (10800, 10), (21600, 10)], "observations": [(0, 12), (10800, 13), (21600, 30)]}
        }}

    def test_cross_station_correction_excludes_target_and_future_measurements(self):
        snapshot = self.synthetic_snapshot()
        rows, _ = pilot.build_pairs(snapshot, 60)
        target = [r for r in rows if r["station"] == "a"]
        self.assertEqual([r["source_residual"] for r in target], [2, 3])
        self.assertTrue(all(r["source_observation_time"] <= r["time"] - 3600 for r in rows))
        self.assertTrue(all(r["source_station"] != r["station"] for r in rows))
        # Altering the target station cannot alter its correction input.
        snapshot["stations"]["a"]["observations"] = [(0, 20), (10800, 21), (21600, 22)]
        other_rows, _ = pilot.build_pairs(snapshot, 60)
        self.assertEqual([r["source_residual"] for r in other_rows if r["station"] == "a"], [2, 3])

    def test_source_observation_just_after_cutoff_cannot_enter(self):
        snapshot = self.synthetic_snapshot()
        snapshot["stations"]["b"]["observations"][0] = (120, 12)
        rows, _ = pilot.build_pairs(snapshot, 180)
        self.assertFalse(any(r["station"] == "a" and r["time"] == 10800 for r in rows))

    def test_stale_source_is_excluded(self):
        snapshot = self.synthetic_snapshot()
        snapshot["protocol"]["max_residual_age_minutes"] = 100
        rows, _ = pilot.build_pairs(snapshot, 60)
        self.assertEqual(rows, [])

    def test_coverage_denominator_includes_missing_model_slots(self):
        snapshot = self.synthetic_snapshot()
        snapshot["protocol"]["end_exclusive"] = pilot.iso(43200)
        rows, coverage = pilot.build_pairs(snapshot, 60)
        self.assertEqual(coverage["a"]["holdout_expected_native_slots"], 3)
        self.assertEqual(coverage["a"]["holdout_model_slots"], 2)

    def test_holdout_cannot_change_selected_alpha(self):
        rows = [dict(period="development", model=10, observed=11, source_residual=1), dict(period="holdout", model=10, observed=0, source_residual=100)]
        alpha, _ = pilot.select_alpha(rows, self.protocol["alpha_candidates"])
        self.assertEqual(alpha, 1)
        rows[1]["observed"] = 1000
        self.assertEqual(pilot.select_alpha(rows, self.protocol["alpha_candidates"])[0], alpha)

    def test_paired_metrics_and_day_block_bootstrap(self):
        rows = [{"time": d * 86400 + h * 3600, "model": 10, "observed": 11, "source_residual": 1} for d in range(14) for h in [0, 3]]
        raw = pilot.metrics(rows, lambda r: r["model"])
        self.assertEqual(raw["mae_c"], 1)
        self.assertEqual(raw["bias_c"], -1)
        summary = pilot.daily_bootstrap(rows, 1)
        self.assertEqual(summary["day_blocks"], 14)
        self.assertEqual(summary["mae_gain_95_ci_c"], [1, 1])


if __name__ == "__main__":
    unittest.main()
