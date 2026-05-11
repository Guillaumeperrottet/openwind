"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Camera,
  X,
  MapPin,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import type { WindyWebcam } from "@/app/api/webcams/route";

interface Props {
  webcams: WindyWebcam[];
  locationName: string;
  backUrl: string;
  lat: number;
  lng: number;
}

/** Haversine distance en km */
function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Temps relatif court depuis une date ISO */
function timeAgoShort(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

/** Date/heure formatée depuis une date ISO — locale injectée par le composant */
function formatTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WebcamsClient({
  webcams: initial,
  locationName,
  backUrl,
  lat,
  lng,
}: Props) {
  const t = useTranslations("WebcamsPage");
  const locale = useLocale();
  const [webcams, setWebcams] = useState<WindyWebcam[]>(initial);
  const [selected, setSelected] = useState<number | null>(null);
  const [radius, setRadius] = useState(15);
  const [loading, setLoading] = useState(false);

  const fetchWithRadius = useCallback(
    async (r: number) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/webcams?lat=${lat}&lng=${lng}&radius=${r}`,
        );
        if (res.ok) {
          const data = (await res.json()) as { webcams: WindyWebcam[] };
          setWebcams(data.webcams ?? []);
        }
      } catch {
        /* silencieux */
      } finally {
        setLoading(false);
      }
    },
    [lat, lng],
  );

  // Navigation clavier dans le modal
  useEffect(() => {
    if (selected === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setSelected((i) =>
          i !== null ? Math.min(i + 1, webcams.length - 1) : 0,
        );
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setSelected((i) => (i !== null ? Math.max(i - 1, 0) : 0));
      } else if (e.key === "Escape") {
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, webcams.length]);

  const cam = selected !== null ? webcams[selected] : null;
  const embedUrl = cam?.player?.live ?? cam?.player?.day ?? null;
  const camDist =
    cam !== null
      ? distanceKm(lat, lng, cam.location.latitude, cam.location.longitude)
      : null;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-5"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backTo", { name: locationName })}
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Camera className="h-6 w-6 text-gray-500" />
              {t("title")}
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {locationName} · {t("inRadius", { radius })}
            </p>
          </div>

          {/* Sélecteur de rayon */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">{t("radiusLabel")}</span>
            {[10, 15, 25, 50].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRadius(r);
                  fetchWithRadius(r);
                }}
                className={`px-3 py-1 rounded-full border transition-colors ${
                  radius === r
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grille ─────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-8">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && webcams.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-gray-400">
            <AlertCircle className="h-10 w-10" />
            <p className="text-base font-medium">{t("noWebcams")}</p>
            <p className="text-sm">{t("tryExpand")}</p>
          </div>
        )}

        {!loading && webcams.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {webcams.map((w, i) => (
              <button
                key={w.webcamId}
                onClick={() => setSelected(i)}
                className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video hover:border-gray-400 transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
              >
                {/* Thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={w.images.current.preview}
                  alt={w.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Overlay titre */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2">
                  <p className="text-white text-xs font-medium leading-tight line-clamp-2 text-left">
                    {w.title}
                  </p>
                  {w.location.city && (
                    <p className="text-white/70 text-[10px] mt-0.5 text-left">
                      {w.location.city}
                    </p>
                  )}
                </div>
                {/* Badge live */}
                {w.player?.live && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                    Live
                  </span>
                )}
                {/* Heure de màj */}
                {w.lastUpdatedOn && (
                  <span className="absolute top-2 left-2 bg-black/60 text-white/80 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {timeAgoShort(w.lastUpdatedOn)}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal viewer ───────────────────────────────────────── */}
      {selected !== null && cam && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Player ou image */}
            <div className="aspect-video w-full bg-black">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title={cam.title}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cam.images.current.preview}
                  alt={cam.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Barre info + navigation */}
            <div className="flex items-center justify-between gap-4 px-4 py-4 bg-white border-t border-gray-100">
              {/* Navigation gauche */}
              <button
                onClick={() =>
                  setSelected((i) => (i !== null ? Math.max(i - 1, 0) : 0))
                }
                disabled={selected === 0}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Titre + infos */}
              <div className="flex-1 text-center min-w-0 px-1">
                <p className="text-gray-900 text-sm font-semibold truncate">
                  {cam.title}
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap mt-1">
                  <span className="text-gray-600 text-xs">
                    {[cam.location.city, cam.location.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                  {camDist !== null && (
                    <span className="text-gray-500 text-xs flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      {camDist < 1
                        ? `${Math.round(camDist * 1000)} m`
                        : `${camDist.toFixed(1)} km`}
                    </span>
                  )}
                  {cam.lastUpdatedOn && (
                    <span
                      className="text-gray-500 text-xs flex items-center gap-0.5"
                      title={formatTime(cam.lastUpdatedOn, locale)}
                    >
                      <Clock className="h-2.5 w-2.5" />
                      {formatTime(cam.lastUpdatedOn, locale)}
                    </span>
                  )}
                  {cam.urls?.detail && (
                    <a
                      href={cam.urls.detail}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-700 text-xs flex items-center gap-0.5 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      Windy
                    </a>
                  )}
                  <span className="text-gray-400 text-xs">
                    {selected + 1}/{webcams.length}
                  </span>
                </div>
              </div>

              {/* Navigation droite */}
              <button
                onClick={() =>
                  setSelected((i) =>
                    i !== null ? Math.min(i + 1, webcams.length - 1) : 0,
                  )
                }
                disabled={selected === webcams.length - 1}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-800 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
