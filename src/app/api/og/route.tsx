import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

/**
 * Dynamic OG Image Generator
 * Generates unique og:image for each spot with satori + sharp
 * 
 * Usage: /api/og?id={spotId}
 * Returns: 1200x630 PNG image optimized for social sharing
 * 
 * Cache strategy: 30 days (spots rarely change)
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const spotId = searchParams.get("id");

    if (!spotId) {
      return new Response("Missing spot ID", { status: 400 });
    }

    // Fetch spot from DB (cached via React cache() in page.tsx)
    const spot = await prisma.spot.findUnique({
      where: { id: spotId },
      select: {
        name: true,
        region: true,
        country: true,
        sportType: true,
        difficulty: true,
      },
    });

    if (!spot) {
      return new Response("Spot not found", { status: 404 });
    }

    const sport = spot.sportType === "KITE" ? "Kitesurf" : "Parapente";
    const location = [spot.region, spot.country].filter(Boolean).join(", ");
    const difficultyColor: Record<string, string> = {
      BEGINNER: "#10b981",
      INTERMEDIATE: "#f59e0b",
      ADVANCED: "#ef4444",
      EXPERT: "#7c3aed",
    };
    const difficultyLabel: Record<string, string> = {
      BEGINNER: "Débutant",
      INTERMEDIATE: "Intermédiaire",
      ADVANCED: "Avancé",
      EXPERT: "Expert",
    };

    const bgColor = difficultyColor[spot.difficulty] || "#0ea5e9";
    const diffLabel = difficultyLabel[spot.difficulty] || "Intermédiaire";

    // Generate image using Next.js ImageResponse (satori internally)
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "space-between",
            background: `linear-gradient(135deg, ${bgColor} 0%, ${adjustBrightness(bgColor, -20)} 100%)`,
            padding: "40px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Top Section: Sport Badge + Logo */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "16px",
                fontWeight: "600",
                backdropFilter: "blur(10px)",
              }}
            >
              {sport}
            </div>
            <div
              style={{
                color: "white",
                fontSize: "24px",
                fontWeight: "700",
                letterSpacing: "-1px",
              }}
            >
              openwind
            </div>
          </div>

          {/* Center Section: Spot Name + Location */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h1
              style={{
                color: "white",
                fontSize: "48px",
                fontWeight: "700",
                margin: "0",
                lineHeight: "1.2",
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              {spot.name}
            </h1>
            {location && (
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "24px",
                  margin: "0",
                  fontWeight: "500",
                }}
              >
                {location}
              </p>
            )}
          </div>

          {/* Bottom Section: Difficulty + CTA */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                backdropFilter: "blur(10px)",
              }}
            >
              Niveau: {diffLabel}
            </div>
            <div
              style={{
                color: "white",
                fontSize: "14px",
                fontWeight: "500",
                opacity: "0.9",
              }}
            >
              Prévisions vent 7j • Archives • Communauté
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}

/**
 * Helper: Adjust color brightness
 * Used for gradient variations
 */
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// Cache for 30 days (spots rarely change significantly)
export const revalidate = 2592000; // 30 days in seconds
