"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, Wind, Waves, ExternalLink, Star } from "lucide-react";
import type { Spot, WindData, WindLive } from "@/types";
import { WindProvenance } from "@/components/spot/WindProvenance";
import {
  windArrow,
  windDirectionLabel,
} from "@/lib/utils";
import { useFavContext } from "@/lib/FavContext";
import {
  Badge,
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  WATER_LABELS,
} from "@/components/ui/Badge";

interface SpotPopupProps {
  spot: Spot;
  wind: WindData | null;
  live: WindLive | null;
  loadingWind: boolean;
  useKnots?: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export function SpotPopup({
  spot,
  wind,
  live,
  loadingWind,
  useKnots = true,
  position,
  onClose,
}: SpotPopupProps) {
  const { favoriteIds, toggleFavorite } = useFavContext();
  const isFav = favoriteIds.has(spot.id);

  /** Format a km/h value in the preferred unit */
  const fmt = (kmh: number) =>
    useKnots ? `${Math.round(kmh / 1.852)} kts` : `${Math.round(kmh)} km/h`;
  const ref = useRef<HTMLDivElement>(null);
  const [flipBelow, setFlipBelow] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(mobileViewport.matches);
    updateViewport();
    mobileViewport.addEventListener("change", updateViewport);
    return () => mobileViewport.removeEventListener("change", updateViewport);
  }, []);

  // Measure popup height and flip below if not enough room above
  useEffect(() => {
    if (!ref.current) return;
    const h = ref.current.offsetHeight;
    // Check against parent container height (absolute positioned within map)
    setFlipBelow(position.y - 8 - h < 10);
  }, [position.y, wind, loadingWind]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("pointerdown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [onClose]);

  const style: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        left: "50%",
        bottom: "calc(var(--mobile-nav-height) + 16px)",
        transform: "translateX(-50%)",
        zIndex: 100,
      }
    : {
        position: "absolute",
        left: position.x,
        top: flipBelow ? position.y + 12 : position.y - 8,
        transform: flipBelow ? "translate(-50%, 0)" : "translate(-50%, -100%)",
        zIndex: 100,
      };

  return (
    <div
      ref={ref}
      style={style}
      className="ow-map-popup"
    >
      {/* Image */}
      {spot.images[0] && (
        <div className="h-28 overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={spot.images[0].url}
            alt={spot.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="ow-popup-content">
        {/* Header */}
        <div className="flex items-start justify-between mb-2 gap-2">
          <div>
            <h3 className="font-semibold text-base leading-tight">
              {spot.name}
            </h3>
            {(spot.country || spot.region) && (
              <p className="text-gray-500 text-xs mt-0.5">
                {[spot.region, spot.country].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            <button
              type="button"
              aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
              aria-pressed={isFav}
              onClick={() => toggleFavorite(spot.id)}
              className="ow-icon-button"
              title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Star
                className="h-4 w-4"
                fill={isFav ? "currentColor" : "none"}
                strokeWidth={isFav ? 0 : 2}
              />
            </button>
            <button
              type="button"
              aria-label="Fermer"
              onClick={onClose}
              className="ow-icon-button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge className={DIFFICULTY_COLORS[spot.difficulty]}>
            {DIFFICULTY_LABELS[spot.difficulty]}
          </Badge>
          <Badge className="bg-gray-100 text-gray-600">
            <Waves className="h-3 w-3 mr-1" />
            {WATER_LABELS[spot.waterType]}
          </Badge>
          <Badge className="bg-gray-100 text-gray-600">
            <Wind className="h-3 w-3 mr-1" />
            {useKnots
              ? `${Math.round(spot.minWindKmh / 1.852)}–${Math.round(spot.maxWindKmh / 1.852)} kts`
              : `${spot.minWindKmh}–${spot.maxWindKmh} km/h`}
          </Badge>
        </div>

        {/* Wind NOW */}
        <div className="ow-popup-reading">
          {live && <div className="mb-2"><WindProvenance compact live={live} /></div>}
          {loadingWind ? (
            <div className="text-gray-400 text-xs animate-pulse">
              Chargement…
            </div>
          ) : wind ? (
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-xl border-2 shrink-0"
                style={{
                  background: wind.color + "22",
                  borderColor: wind.color,
                  color: "var(--ow-ink-secondary)",
                }}
              >
                {windArrow(wind.windDirection)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="font-bold text-xl tabular-nums"
                    style={{ color: "var(--ow-ink)" }}
                  >
                    {fmt(wind.windSpeedKmh)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {windDirectionLabel(wind.windDirection)} · rafales{" "}
                  {fmt(wind.gustsKmh)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-xs">Données non disponibles</div>
          )}
        </div>

        {spot.description && (
          <p className="text-gray-500 text-xs mb-3 line-clamp-2">
            {spot.description}
          </p>
        )}

        <Link
          href={`/spots/${spot.id}`}
          className="ow-primary w-full"
        >
          Voir le spot <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
