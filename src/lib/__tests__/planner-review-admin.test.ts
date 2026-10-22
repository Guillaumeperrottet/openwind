import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({
  admin: vi.fn(),
  spot: vi.fn(),
  upsert: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/lib/admin", () => ({ getAuthenticatedAdmin: mocks.admin }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    spot: { findUnique: mocks.spot },
    systemConfig: { upsert: mocks.upsert },
  },
}));
import { PUT, GET } from "@/app/api/admin/planner-reviews/route";
import { spotFingerprint } from "@/lib/planner-review-store";
import { starterReviews } from "@/lib/planner-review-seeds";
const spot = {
  id: "test",
  name: "Test",
  latitude: 46,
  longitude: 7,
  sportType: "KITE",
  description: null,
  difficulty: "INTERMEDIATE",
  waterType: "CHOP",
  minWindKmh: 20,
  maxWindKmh: 40,
  bestMonths: [],
  bestWindDirections: ["N"],
  access: null,
  hazards: null,
};
const review = {
  ...starterReviews.cmnr312220004ijf6l2oobbhb,
  fingerprint: spotFingerprint(spot),
};
const put = (r = review) =>
  PUT(
    new NextRequest("https://www.openwind.ch/api/admin/planner-reviews", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotId: spot.id, review: r }),
    }),
  );
beforeEach(() => {
  vi.clearAllMocks();
  mocks.admin.mockResolvedValue({ id: "admin" });
  mocks.spot.mockResolvedValue(spot);
  mocks.upsert.mockResolvedValue({});
});
describe("private documentary review write boundary", () => {
  it("requires administrator authorization before any catalogue read or write", async () => {
    mocks.admin.mockResolvedValue(null);
    expect((await put()).status).toBe(403);
    expect(
      (
        await GET(
          new NextRequest(
            "https://www.openwind.ch/api/admin/planner-reviews?q=Yvonand",
          ),
        )
      ).status,
    ).toBe(403);
    expect(mocks.spot).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it("rejects an approval based on an obsolete catalogue snapshot", async () => {
    mocks.spot.mockResolvedValue({ ...spot, access: "Changed rule" });
    expect((await put()).status).toBe(409);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it("requires source coverage, four translated notes and precise sectors", async () => {
    expect((await put({ ...review, sources: [] })).status).toBe(400);
    expect(
      (await put({ ...review, notes: { ...review.notes, it: "" } })).status,
    ).toBe(400);
    expect(
      (await put({ ...review, sectors: [{ from: 0, to: 360 }] })).status,
    ).toBe(400);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it("saves a versioned review independently of public user accounts and refreshes translated spot pages", async () => {
    expect((await put()).status).toBe(200);
    expect(mocks.upsert.mock.calls[0][0].where.key).toBe(
      "planner-review:v1:test",
    );
    expect(JSON.parse(mocks.upsert.mock.calls[0][0].update.value)).toEqual(
      review,
    );
    expect(mocks.revalidate.mock.calls.map((c) => c[0])).toEqual([
      "/fr/spots/test",
      "/de/spots/test",
      "/it/spots/test",
      "/en/spots/test",
    ]);
  });
});
