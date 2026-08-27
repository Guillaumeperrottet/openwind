import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  parseMeteoSwissCurrentCsv,
  parseMeteoSwissHistoryCsv,
} from "@/lib/meteoswissWeather";

const currentCsv = `Station/Location;Date;tre200s0;rre150z0;sre000z0;gre000z0;ure200s0;tde200s0;dkl010z0;fu3010z0;fu3010z1;prestas0;pp0qffs0;pp0qnhs0
BER;202608270550;18.2;0;0;40;70;12;180;8;14;950;1015;1017
MAS;202608270550;16.1;0.00;-;-;84.5;13.5;206;2.9;6.1;-;-;-
`;

const stationHistoryHeader =
  "station_abbr;reference_timestamp;tre200s0;ure200s0;tde200s0;prestas0;pp0qnhs0;pp0qffs0;dkl010z0;fu3010z0;fu3010z1;rre150z0;htoauts0;gre000z0;sre000z0";

describe("MeteoSwiss weather CSV parsing", () => {
  it("reads the latest all-stations feed without inventing missing values", () => {
    const point = parseMeteoSwissCurrentCsv(currentCsv, "MAS");

    expect(point).toMatchObject({
      time: "2026-08-27T05:50:00.000Z",
      temperatureC: 16.1,
      precipitation10MinMm: 0,
      humidityPct: 84.5,
      dewPointC: 13.5,
      windDirection: 206,
      windSpeedKmh: 2.9,
      gustsKmh: 6.1,
      pressureQnhHpa: null,
      globalRadiationWm2: null,
    });
  });

  it("merges and sorts 48-hour station rows using Swiss local time", () => {
    const nowCsv = `${stationHistoryHeader}\nMAS;27.08.2026 07:40;15.8;86;13.4;;;1018;210;4.1;7.2;0;-1;;\n`;
    const recentCsv = `partial ranged row\nMAS;27.08.2026 07:20;15.6;87;13.3;;;1018;205;3.8;6.4;0;-1;;\nMAS;27.08.2026 07:30;15.7;86.5;13.3;;;1018;208;4;6.8;0;-1;;\n`;

    const points = parseMeteoSwissHistoryCsv(
      nowCsv,
      recentCsv,
      "MAS",
      Date.parse("2026-08-27T00:00:00Z"),
    );

    expect(points).toHaveLength(3);
    expect(points.map((point) => point.time)).toEqual([
      "2026-08-27T05:20:00.000Z",
      "2026-08-27T05:30:00.000Z",
      "2026-08-27T05:40:00.000Z",
    ]);
    expect(points[2]).toMatchObject({
      temperatureC: 15.8,
      humidityPct: 86,
      pressureSeaLevelHpa: 1018,
      snowDepthCm: null,
    });
  });
});
