import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "spot-images";
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

function optionalText(formData: FormData, key: string, maxLength: number) {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function optionalHttpUrl(formData: FormData, key: string) {
  const value = optionalText(formData, key, 2_000);
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Verify spot exists
  const spot = await prisma.spot.findUnique({ where: { id } });
  if (!spot) {
    return NextResponse.json({ error: "Spot not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: "Image invalide ou supérieure à 8 Mo" },
      { status: 400 },
    );
  }

  // Upload to Supabase Storage with service role key
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${id}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type });

  if (uploadErr) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadErr.message}` },
      { status: 500 },
    );
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  const caption = optionalText(formData, "caption", 300);
  const credit = optionalText(formData, "credit", 300);
  const sourceUrl = optionalHttpUrl(formData, "sourceUrl");
  const license = optionalText(formData, "license", 100);
  const licenseUrl = optionalHttpUrl(formData, "licenseUrl");
  const image = await prisma.spotImage.create({
    data: {
      spotId: id,
      url: publicUrl,
      caption,
      credit,
      sourceUrl,
      license,
      licenseUrl,
    },
  });

  return NextResponse.json(image, { status: 201 });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const images = await prisma.spotImage.findMany({ where: { spotId: id } });
  return NextResponse.json(images);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { imageIds } = (await request.json()) as { imageIds?: string[] };

  if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
    return NextResponse.json(
      { error: "imageIds array required" },
      { status: 400 },
    );
  }

  // Fetch the images to get their storage paths
  const images = await prisma.spotImage.findMany({
    where: { id: { in: imageIds }, spotId: id },
  });

  // Delete from Supabase Storage
  const storagePaths = images
    .map((img: { url: string }) => {
      // URL format: .../storage/v1/object/public/spot-images/SPOT_ID/FILENAME
      const bucketPrefix = `/storage/v1/object/public/${BUCKET}/`;
      const idx = img.url.indexOf(bucketPrefix);
      return idx >= 0 ? img.url.slice(idx + bucketPrefix.length) : null;
    })
    .filter((p: string | null): p is string => p !== null);

  if (storagePaths.length > 0) {
    await supabaseAdmin.storage.from(BUCKET).remove(storagePaths);
  }

  // Delete from DB
  await prisma.spotImage.deleteMany({
    where: { id: { in: imageIds }, spotId: id },
  });

  return NextResponse.json({ ok: true, deleted: images.length });
}
