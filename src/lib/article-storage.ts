import "server-only";

import { createClient } from "@supabase/supabase-js";

const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "spot-images";

function getStorageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function uploadArticleCover(file: File): Promise<string> {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensions[file.type];
  if (!extension) throw new Error("Format d’image non pris en charge");

  const path = `articles/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const storage = getStorageClient();
  const { error } = await storage.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: "31536000",
  });

  if (error) throw new Error(error.message);

  return storage.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function deleteArticleCover(url: string | null) {
  if (!url) return;

  const prefix = `/storage/v1/object/public/${BUCKET}/articles/`;
  const prefixIndex = url.indexOf(prefix);
  if (prefixIndex < 0) return;

  const path = `articles/${url.slice(prefixIndex + prefix.length)}`;
  await getStorageClient().storage.from(BUCKET).remove([path]);
}
