import crypto from "node:crypto";
import dotenv from "dotenv";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env", override: false });

const { Pool } = pg;
const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "spot-images";
const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!databaseUrl || !supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required",
  );
}

const pool = new Pool({ connectionString: databaseUrl });
const storage = createClient(supabaseUrl, serviceRoleKey).storage.from(bucket);

const images = [
  {
    spotId: "cmnr30vtl0003ijf6ylndlqlf",
    spotName: "Portalban",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Port_de_Portalban_%2843430186691%29.jpg/1280px-Port_de_Portalban_%2843430186691%29.jpg",
    caption: "Le port de Portalban et le lac de Neuchâtel.",
    credit: "Thomas Woodtli",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Port_de_Portalban_(43430186691).jpg",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
  },
  {
    spotId: "cmnr30p5d0002ijf6366oi6lz",
    spotName: "Cheyres",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Gde_Cari%C3%A7aie_vers_Cheyres_1.JPG/1280px-Gde_Cari%C3%A7aie_vers_Cheyres_1.JPG",
    caption: "La Grande Cariçaie à Cheyres, au bord du lac de Neuchâtel.",
    credit: "Cú Faoil",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Gde_Cari%C3%A7aie_vers_Cheyres_1.JPG",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  {
    spotId: "cmnr307uv0000ijf6j8zqjyis",
    spotName: "Estavayer-le-Lac",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Estavayer-le-lac_panorama.jpg/1280px-Estavayer-le-lac_panorama.jpg",
    caption: "Estavayer-le-Lac vue depuis le lac.",
    credit: "Türke Andras",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Estavayer-le-lac_panorama.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  {
    spotId: "cmnr32jo00009ijf6k6kjqgsp",
    spotName: "Morat – Murtenstrand",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Aerial_image_of_Lake_Murten_%28view_from_the_northeast%29.jpg/1280px-Aerial_image_of_Lake_Murten_%28view_from_the_northeast%29.jpg",
    caption: "Vue aérienne du lac de Morat depuis le nord-est.",
    credit: "Carsten Steger",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Aerial_image_of_Lake_Murten_(view_from_the_northeast).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  {
    spotId: "cmnpsrv4t0008haf6wb2u0lgc",
    spotName: "Lac de Joux",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/040_Dent_de_Vaulion_and_Lac_de_Joux_at_Sunset_Photo_by_Giles_Laurent.jpg/1280px-040_Dent_de_Vaulion_and_Lac_de_Joux_at_Sunset_Photo_by_Giles_Laurent.jpg",
    caption: "La Dent de Vaulion et le lac de Joux au coucher du soleil.",
    credit: "Giles Laurent",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:040_Dent_de_Vaulion_and_Lac_de_Joux_at_Sunset_Photo_by_Giles_Laurent.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  {
    spotId: "cmnpsrv1j0004haf6wrq773k8",
    spotName: "Silvaplana",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2011-08-01_13-29-34_Switzerland_Silvaplana.jpg/1280px-2011-08-01_13-29-34_Switzerland_Silvaplana.jpg",
    caption: "Kitesurf et windsurf sur le lac de Silvaplana.",
    credit: "Hansueli Krapf",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:2011-08-01_13-29-34_Switzerland_Silvaplana.jpg",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  {
    spotId: "cmnpsrx4e002mhaf6b2ci5prq",
    spotName: "Moléson",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Moleson_from_north-east.jpg/1280px-Moleson_from_north-east.jpg",
    caption: "Le Moléson vu depuis le nord-est.",
    credit: "Christian David",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Moleson_from_north-east.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  {
    spotId: "cmnpsrx61002ohaf6o3usub3d",
    spotName: "Schwarzsee – Kaiseregg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Black_lake_Schwarzsee_02.JPG/1280px-Black_lake_Schwarzsee_02.JPG",
    caption: "Le Schwarzsee, ou lac Noir, dans les Préalpes fribourgeoises.",
    credit: "Norbert Aepli",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Black_lake_Schwarzsee_02.JPG",
    license: "CC BY 2.5",
    licenseUrl: "https://creativecommons.org/licenses/by/2.5/",
  },
  {
    spotId: "cmnr31n570007ijf6q33aez75",
    spotName: "Saint-Blaise",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Port_de_Saint-Blaise_%28lac_de_Neuch%C3%A2tel%29_02.jpg/1280px-Port_de_Saint-Blaise_%28lac_de_Neuch%C3%A2tel%29_02.jpg",
    caption: "Le port de Saint-Blaise sur le lac de Neuchâtel.",
    credit: "Arkelin",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Port_de_Saint-Blaise_(lac_de_Neuch%C3%A2tel)_02.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },
];

function extensionFor(contentType) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  return "jpg";
}

async function importImage(entry) {
  const spotResult = await pool.query(
    'SELECT "id", "name" FROM "Spot" WHERE "id" = $1',
    [entry.spotId],
  );
  if (spotResult.rowCount !== 1) {
    throw new Error(`Spot not found: ${entry.spotName}`);
  }

  const existing = await pool.query(
    'SELECT "id" FROM "SpotImage" WHERE "spotId" = $1 LIMIT 1',
    [entry.spotId],
  );
  if (existing.rowCount > 0) {
    return { status: "skipped", spot: entry.spotName };
  }

  const response = await fetch(entry.imageUrl, {
    headers: { "User-Agent": "Openwind/1.0 (https://www.openwind.ch)" },
  });
  if (!response.ok) {
    throw new Error(`Download failed for ${entry.spotName}: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error(`Unexpected media type for ${entry.spotName}: ${contentType}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const storagePath = `${entry.spotId}/${Date.now()}-commons.${extensionFor(contentType)}`;
  const { error: uploadError } = await storage.upload(storagePath, bytes, {
    contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (uploadError) {
    throw new Error(`Upload failed for ${entry.spotName}: ${uploadError.message}`);
  }

  const { data } = storage.getPublicUrl(storagePath);
  try {
    await pool.query(
      `INSERT INTO "SpotImage"
        ("id", "spotId", "url", "caption", "credit", "sourceUrl", "license", "licenseUrl", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        crypto.randomUUID(),
        entry.spotId,
        data.publicUrl,
        entry.caption,
        entry.credit,
        entry.sourceUrl,
        entry.license,
        entry.licenseUrl,
      ],
    );
  } catch (error) {
    await storage.remove([storagePath]);
    throw error;
  }

  return { status: "imported", spot: entry.spotName };
}

try {
  for (const entry of images) {
    const result = await importImage(entry);
    console.log(`${result.status}: ${result.spot}`);
  }
} finally {
  await pool.end();
}
