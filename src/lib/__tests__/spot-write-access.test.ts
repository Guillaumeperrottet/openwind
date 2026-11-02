import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(),
  images: vi.fn(), deleteImages: vi.fn(), createImage: vi.fn(), upload: vi.fn(), remove: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: mocks.getUser } }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: {
  spot: { findUnique: mocks.findUnique, create: mocks.create, update: mocks.update, delete: mocks.delete },
  spotImage: { findMany: mocks.images, deleteMany: mocks.deleteImages, create: mocks.createImage },
} }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ storage: { from: () => ({
  upload: mocks.upload, remove: mocks.remove,
  getPublicUrl: () => ({ data: { publicUrl: "https://example.com/photo" } }),
}) } }) }));

import { POST } from "@/app/api/spots/route";
import { PATCH, DELETE } from "@/app/api/spots/[id]/route";
import { POST as uploadPhoto, DELETE as deletePhotos } from "@/app/api/spots/[id]/images/route";

const context = () => ({ params: Promise.resolve({ id: "spot-1" }) });
function request(method: string, body: unknown = {}) {
  return new NextRequest("https://www.openwind.ch/api/spots/spot-1", {
    method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}
const input = { name: "Lac test", latitude: 46.8, longitude: 6.7 };
const asUser = (id: string | null, error: unknown = null) => mocks.getUser.mockResolvedValue({ data: { user: id ? { id } : null }, error });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("ADMIN_USER_IDS", "admin");
  asUser("member");
  mocks.findUnique.mockResolvedValue({ id: "spot-1", minWindKmh: 15, maxWindKmh: 35 });
  mocks.create.mockResolvedValue({ id: "spot-1" });
  mocks.update.mockResolvedValue({ id: "spot-1" });
  mocks.images.mockResolvedValue([]);
  mocks.upload.mockResolvedValue({ error: null });
  mocks.remove.mockResolvedValue({ error: null });
  mocks.createImage.mockResolvedValue({ id: "image-1" });
});
afterEach(() => vi.unstubAllEnvs());

describe("spot write authorization", () => {
  it.each(["anonymous", "expired"])("rejects %s creation before any database operation", async (session) => {
    asUser(session === "expired" ? "member" : null, session === "expired" ? new Error("Expired") : null);
    expect((await POST(request("POST", input))).status).toBe(401);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("allows a verified account to create a spot", async () => {
    expect((await POST(request("POST", input))).status).toBe(201);
    expect(mocks.create).toHaveBeenCalledOnce();
  });
  it.each([null, "member"])("denies edits and deletion for %s before any catalogue read", async (id) => {
    asUser(id);
    const expected = id ? 403 : 401;
    expect((await PATCH(request("PATCH", { name: "Changed" }), context())).status).toBe(expected);
    expect((await DELETE(request("DELETE"), context())).status).toBe(expected);
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.delete).not.toHaveBeenCalled();
  });
  it("allows administrators to edit and delete", async () => {
    asUser("admin");
    expect((await PATCH(request("PATCH", { name: "Updated" }), context())).status).toBe(200);
    expect((await DELETE(request("DELETE"), context())).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledOnce();
    expect(mocks.delete).toHaveBeenCalledOnce();
  });
  it("rejects invalid wind ranges, including a partial edit against stored bounds", async () => {
    expect((await POST(request("POST", { ...input, minWindKmh: 50, maxWindKmh: 20 }))).status).toBe(400);
    asUser("admin");
    expect((await PATCH(request("PATCH", { minWindKmh: 40 }), context())).status).toBe(400);
    expect((await PATCH(request("PATCH", { maxWindKmh: 10 }), context())).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("returns a validation error for malformed JSON", async () => {
    const req = new NextRequest("https://www.openwind.ch/api/spots", { method: "POST", body: "{" });
    expect((await POST(req)).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});

describe("spot photo permissions", () => {
  it("rejects anonymous uploads before reading files or accessing storage", async () => {
    asUser(null);
    expect((await uploadPhoto(request("POST"), context())).status).toBe(401);
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.upload).not.toHaveBeenCalled();
  });
  it("lets a signed-in contributor append a new photo", async () => {
    const form = new FormData();
    form.set("file", new File(["image"], "photo.jpg", { type: "image/jpeg" }));
    const req = new NextRequest("https://www.openwind.ch/api/spots/spot-1/images", { method: "POST", body: form });
    expect((await uploadPhoto(req, context())).status).toBe(201);
    expect(mocks.upload).toHaveBeenCalledWith(expect.stringMatching(/^spot-1\/[a-f0-9-]+$/), expect.any(Buffer), { contentType: "image/jpeg" });
  });
  it.each([null, "member"])("denies photo deletion for %s before storage or database access", async (id) => {
    asUser(id);
    expect((await deletePhotos(request("DELETE", { imageIds: ["image-1"] }), context())).status).toBe(id ? 403 : 401);
    expect(mocks.images).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(mocks.deleteImages).not.toHaveBeenCalled();
  });
  it("allows administrators to delete only photos belonging to the requested spot", async () => {
    asUser("admin");
    expect((await deletePhotos(request("DELETE", { imageIds: ["image-1"] }), context())).status).toBe(200);
    expect(mocks.deleteImages).toHaveBeenCalledWith({ where: { id: { in: ["image-1"] }, spotId: "spot-1" } });
  });
  it("preserves photo records when storage deletion fails", async () => {
    asUser("admin");
    mocks.images.mockResolvedValue([{ url: "https://test.supabase.co/storage/v1/object/public/spot-images/spot-1/photo.jpg" }]);
    mocks.remove.mockResolvedValue({ error: new Error("Storage unavailable") });
    expect((await deletePhotos(request("DELETE", { imageIds: ["image-1"] }), context())).status).toBe(502);
    expect(mocks.deleteImages).not.toHaveBeenCalled();
  });
});
