"use client";

import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Upload,
  X,
  Wind,
  Sailboat,
  Mountain,
  Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { WindDirectionPicker } from "@/components/spot/WindDirectionRose";

const KiteMap = dynamic(
  () => import("@/components/map/KiteMap").then((m) => m.KiteMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl" />
    ),
  },
);
import { MONTHS } from "@/lib/utils";
import {
  useSpotImages,
  type ExistingImage,
} from "@/components/spot/useSpotImages";
import { useNearbyStations } from "@/components/spot/useNearbyStations";

// ─── Schema ────────────────────────────────────────────────────────────────────

const schema = z
  .object({
    name: z.string().min(2),
    description: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
    country: z.string().optional(),
    region: z.string().optional(),
    sportType: z.enum(["KITE", "PARAGLIDE"]),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
    waterType: z.enum(["FLAT", "CHOP", "WAVES", "MIXED"]),
    minWindKmh: z.number().min(0).max(100),
    maxWindKmh: z.number().min(0).max(150),
    bestMonths: z.array(z.string()),
    bestWindDirections: z.array(z.string()),
    hazards: z.string().optional(),
    access: z.string().optional(),
    nearestStationId: z.string().optional(),
  })
  .refine((d) => d.maxWindKmh >= d.minWindKmh, {
    path: ["maxWindKmh"],
  });

type FormData = z.infer<typeof schema>;

// ─── Helpers ───────────────────────────────────────────────────────────────────

const toKts = (kmh: number) => Math.round(kmh / 1.852);
const toKmh = (kts: number) => Math.round(kts * 1.852);

export type { ExistingImage } from "@/components/spot/useSpotImages";

export interface SpotInitialData {
  id: string;
  name: string;
  description: string | null;
  descriptionEn?: string | null;
  descriptionDe?: string | null;
  descriptionIt?: string | null;
  latitude: number;
  longitude: number;
  country: string | null;
  region: string | null;
  sportType: "KITE" | "PARAGLIDE";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  waterType: "FLAT" | "CHOP" | "WAVES" | "MIXED";
  minWindKmh: number;
  maxWindKmh: number;
  bestMonths: string[];
  bestWindDirections: string[];
  hazards: string | null;
  hazardsEn?: string | null;
  hazardsDe?: string | null;
  hazardsIt?: string | null;
  access: string | null;
  accessEn?: string | null;
  accessDe?: string | null;
  accessIt?: string | null;
  nearestStationId: string | null;
  existingImages?: ExistingImage[];
}

interface Props {
  initialData?: SpotInitialData;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function CreateSpotForm({ initialData }: Props = {}) {
  const isEditMode = Boolean(initialData);
  const router = useRouter();
  const t = useTranslations("CreateSpotForm");
  const tBadge = useTranslations("Badge");
  const tCommon = useTranslations("Common");
  const {
    images,
    imagePreviews,
    existingImages,
    deletedImageIds,
    handleImageChange,
    removeNewImage,
    removeExistingImage,
  } = useSpotImages(initialData?.existingImages);
  const {
    nearbyStations,
    loadingStations,
    refresh: refreshStations,
  } = useNearbyStations(initialData?.latitude, initialData?.longitude);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useKnots, setUseKnots] = useState(true);
  const [langTab, setLangTab] = useState<"fr" | "en" | "de" | "it">("fr");
  const [descriptionEn, setDescriptionEn] = useState(
    initialData?.descriptionEn ?? "",
  );
  const [descriptionDe, setDescriptionDe] = useState(
    initialData?.descriptionDe ?? "",
  );
  const [descriptionIt, setDescriptionIt] = useState(
    initialData?.descriptionIt ?? "",
  );
  const [hazardsEn, setHazardsEn] = useState(initialData?.hazardsEn ?? "");
  const [hazardsDe, setHazardsDe] = useState(initialData?.hazardsDe ?? "");
  const [hazardsIt, setHazardsIt] = useState(initialData?.hazardsIt ?? "");
  const [accessEn, setAccessEn] = useState(initialData?.accessEn ?? "");
  const [accessDe, setAccessDe] = useState(initialData?.accessDe ?? "");
  const [accessIt, setAccessIt] = useState(initialData?.accessIt ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description ?? undefined,
          latitude: initialData.latitude,
          longitude: initialData.longitude,
          country: initialData.country ?? undefined,
          region: initialData.region ?? undefined,
          sportType: initialData.sportType,
          difficulty: initialData.difficulty,
          waterType: initialData.waterType,
          minWindKmh: initialData.minWindKmh,
          maxWindKmh: initialData.maxWindKmh,
          bestMonths: initialData.bestMonths,
          bestWindDirections: initialData.bestWindDirections,
          hazards: initialData.hazards ?? undefined,
          access: initialData.access ?? undefined,
          nearestStationId: initialData.nearestStationId ?? undefined,
        }
      : {
          sportType: "KITE",
          difficulty: "INTERMEDIATE",
          waterType: "CHOP",
          minWindKmh: 15,
          maxWindKmh: 35,
          bestMonths: [],
          bestWindDirections: [],
        },
  });

  const lat = watch("latitude");
  const lng = watch("longitude");
  const sportType = watch("sportType");
  const minWind = watch("minWindKmh");
  const maxWind = watch("maxWindKmh");

  // ── Handle map click ─────────────────────────────────────────────────────
  const handlePickLocation = useCallback(
    async (latitude: number, longitude: number) => {
      setValue("latitude", parseFloat(latitude.toFixed(6)), {
        shouldValidate: true,
      });
      setValue("longitude", parseFloat(longitude.toFixed(6)), {
        shouldValidate: true,
      });

      // Reverse geocode with Nominatim
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
          { headers: { "Accept-Language": "fr" } },
        );
        const data = await res.json();
        const addr = data.address || {};
        const country = addr.country || "";
        const region =
          addr.state || addr.county || addr.city || addr.town || "";
        if (country) setValue("country", country);
        if (region) setValue("region", region);
      } catch {
        // silent — user can fill manually
      }

      refreshStations(latitude, longitude);
    },
    [setValue, refreshStations],
  );

  // ── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError(null);
    try {
      const url = isEditMode ? `/api/spots/${initialData!.id}` : "/api/spots";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          descriptionEn: descriptionEn || undefined,
          descriptionDe: descriptionDe || undefined,
          descriptionIt: descriptionIt || undefined,
          hazardsEn: hazardsEn || undefined,
          hazardsDe: hazardsDe || undefined,
          hazardsIt: hazardsIt || undefined,
          accessEn: accessEn || undefined,
          accessDe: accessDe || undefined,
          accessIt: accessIt || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(
          typeof err.error === "string"
            ? err.error
            : isEditMode
              ? t("saveError")
              : t("createError"),
        );
        return;
      }

      const spot = await res.json();

      // Delete removed images
      if (deletedImageIds.length > 0) {
        await fetch(`/api/spots/${spot.id}/images`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageIds: deletedImageIds }),
        });
      }

      // Upload new images via server-side API route
      if (images.length > 0) {
        for (const file of images) {
          const formData = new FormData();
          formData.append("file", file);
          await fetch(`/api/spots/${spot.id}/images`, {
            method: "POST",
            body: formData,
          });
        }
      }

      router.push(`/spots/${spot.id}`);
    } catch {
      setError(t("networkError"));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const windDisplay = (kmh: number) => (useKnots ? toKts(kmh) : kmh);
  const windUnit = useKnots ? "kts" : "km/h";

  // ── Delete spot ──────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!initialData?.id) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/spots/${initialData.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        setError(typeof err.error === "string" ? err.error : t("deleteError"));
        return;
      }
      router.push("/");
    } catch {
      setError(t("networkError"));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const inputClass =
    "w-full rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-sky-500 transition-colors";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <div
      className="flex flex-col lg:flex-row bg-white text-gray-900"
      style={{ height: "calc(100vh - 56px)" }}
    >
      {/* ── LEFT: Map ────────────────────────────────────────────────────── */}
      <div className="lg:flex-1 h-64 lg:h-full relative">
        <KiteMap
          spots={[]}
          pickMode={true}
          onPickLocation={handlePickLocation}
          initialCenter={
            initialData
              ? [initialData.longitude, initialData.latitude]
              : undefined
          }
          initialZoom={13}
        />
        {lat && lng && (
          <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 shadow-lg">
            <MapPin className="inline h-3 w-3 mr-1 text-sky-500" />
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </div>
        )}
      </div>

      {/* ── RIGHT: Form ──────────────────────────────────────────────────── */}
      <div className="w-full lg:w-120 overflow-y-auto border-l border-gray-100">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isEditMode ? t("editTitle") : t("title")}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {isEditMode ? initialData!.name : t("clickToPlace")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Sport type toggle */}
          <div>
            <label className={labelClass}>{t("sport")}</label>
            <Controller
              control={control}
              name="sportType"
              render={({ field }) => (
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  <button
                    type="button"
                    onClick={() => field.onChange("KITE")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                      field.value === "KITE"
                        ? "bg-sky-600 text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Sailboat className="h-4 w-4" />
                    {tCommon("kitesurf")}
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("PARAGLIDE")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                      field.value === "PARAGLIDE"
                        ? "bg-sky-600 text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Mountain className="h-4 w-4" />
                    {tCommon("paragliding")}
                  </button>
                </div>
              )}
            />
          </div>

          {/* Name */}
          <div>
            <label className={labelClass}>{t("name")} *</label>
            <input
              {...register("name")}
              placeholder="Ex: Tarifa Est"
              className={inputClass}
            />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>

          {/* Description + Hazards + Access — shared language tabs */}
          <div className="space-y-3">
            {/* Language tab selector */}
            <div className="flex items-center justify-between">
              <span className={labelClass + " mb-0"}>
                {t("descriptionTab")}
              </span>
              <div className="flex gap-1">
                {(["fr", "en", "de", "it"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLangTab(l)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${langTab === l ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>{t("description")}</label>
              {langTab === "fr" && (
                <textarea
                  {...register("description")}
                  rows={2}
                  placeholder="Décris le spot, l'ambiance, les conditions..."
                  className={inputClass}
                />
              )}
              {langTab === "en" && (
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={2}
                  placeholder="Describe the spot, atmosphere, conditions..."
                  className={inputClass}
                />
              )}
              {langTab === "de" && (
                <textarea
                  value={descriptionDe}
                  onChange={(e) => setDescriptionDe(e.target.value)}
                  rows={2}
                  placeholder="Beschreibe den Spot, Stimmung, Bedingungen..."
                  className={inputClass}
                />
              )}
              {langTab === "it" && (
                <textarea
                  value={descriptionIt}
                  onChange={(e) => setDescriptionIt(e.target.value)}
                  rows={2}
                  placeholder="Descrivi lo spot, l'atmosfera, le condizioni..."
                  className={inputClass}
                />
              )}
            </div>

            {/* Hazards */}
            <div>
              <label className={labelClass}>{t("hazards")}</label>
              {langTab === "fr" && (
                <input
                  {...register("hazards")}
                  placeholder="Rochers, courant fort..."
                  className={inputClass}
                />
              )}
              {langTab === "en" && (
                <input
                  value={hazardsEn}
                  onChange={(e) => setHazardsEn(e.target.value)}
                  placeholder="Rocks, strong current..."
                  className={inputClass}
                />
              )}
              {langTab === "de" && (
                <input
                  value={hazardsDe}
                  onChange={(e) => setHazardsDe(e.target.value)}
                  placeholder="Felsen, starke Strömung..."
                  className={inputClass}
                />
              )}
              {langTab === "it" && (
                <input
                  value={hazardsIt}
                  onChange={(e) => setHazardsIt(e.target.value)}
                  placeholder="Rocce, corrente forte..."
                  className={inputClass}
                />
              )}
            </div>

            {/* Access */}
            <div>
              <label className={labelClass}>{t("access")}</label>
              {langTab === "fr" && (
                <input
                  {...register("access")}
                  placeholder="Parking, temps de marche..."
                  className={inputClass}
                />
              )}
              {langTab === "en" && (
                <input
                  value={accessEn}
                  onChange={(e) => setAccessEn(e.target.value)}
                  placeholder="Parking, walking time..."
                  className={inputClass}
                />
              )}
              {langTab === "de" && (
                <input
                  value={accessDe}
                  onChange={(e) => setAccessDe(e.target.value)}
                  placeholder="Parkplatz, Gehzeit..."
                  className={inputClass}
                />
              )}
              {langTab === "it" && (
                <input
                  value={accessIt}
                  onChange={(e) => setAccessIt(e.target.value)}
                  placeholder="Parcheggio, tempo a piedi..."
                  className={inputClass}
                />
              )}
            </div>
          </div>

          {/* Country / Region (auto-filled) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t("country")}</label>
              <input
                {...register("country")}
                placeholder={t("autoFilled")}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("region")}</label>
              <input
                {...register("region")}
                placeholder={t("autoFilled")}
                className={inputClass}
              />
            </div>
          </div>
          {/* Coordinates (manual edit) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t("latitude")}</label>
              <Controller
                control={control}
                name="latitude"
                render={({ field }) => (
                  <input
                    type="number"
                    step="0.000001"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) field.onChange(v);
                    }}
                    placeholder="46.9500"
                    className={inputClass}
                  />
                )}
              />
            </div>
            <div>
              <label className={labelClass}>{t("longitude")}</label>
              <Controller
                control={control}
                name="longitude"
                render={({ field }) => (
                  <input
                    type="number"
                    step="0.000001"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) field.onChange(v);
                    }}
                    placeholder="7.0160"
                    className={inputClass}
                  />
                )}
              />
            </div>
          </div>
          {errors.latitude && (
            <p className={errorClass}>
              <MapPin className="inline h-3 w-3 mr-1" />
              {errors.latitude.message}
            </p>
          )}

          {/* Difficulty + Water type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t("difficulty")}</label>
              <select {...register("difficulty")} className={inputClass}>
                <option value="BEGINNER">
                  {tBadge("difficulty.BEGINNER")}
                </option>
                <option value="INTERMEDIATE">
                  {tBadge("difficulty.INTERMEDIATE")}
                </option>
                <option value="ADVANCED">
                  {tBadge("difficulty.ADVANCED")}
                </option>
                <option value="EXPERT">{tBadge("difficulty.EXPERT")}</option>
              </select>
            </div>
            {sportType === "KITE" && (
              <div>
                <label className={labelClass}>{t("waterType")}</label>
                <select {...register("waterType")} className={inputClass}>
                  <option value="FLAT">{tBadge("waterType.FLAT")}</option>
                  <option value="CHOP">{tBadge("waterType.CHOP")}</option>
                  <option value="WAVES">{tBadge("waterType.WAVES")}</option>
                  <option value="MIXED">{tBadge("waterType.MIXED")}</option>
                </select>
              </div>
            )}
          </div>

          {/* Wind range with unit toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelClass + " mb-0"}>{t("windRange")}</label>
              <div className="flex rounded-full overflow-hidden border border-gray-200 text-[10px]">
                <button
                  type="button"
                  onClick={() => setUseKnots(false)}
                  className={`px-2 py-0.5 transition-colors ${
                    !useKnots
                      ? "bg-sky-600 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  km/h
                </button>
                <button
                  type="button"
                  onClick={() => setUseKnots(true)}
                  className={`px-2 py-0.5 transition-colors ${
                    useKnots
                      ? "bg-sky-600 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  kts
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Controller
                  control={control}
                  name="minWindKmh"
                  render={({ field }) => (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={windDisplay(field.value)}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 0;
                        field.onChange(useKnots ? toKmh(v) : v);
                      }}
                      className={inputClass}
                      placeholder={`Min (${windUnit})`}
                    />
                  )}
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  {t("windMin")} : {windDisplay(minWind)} {windUnit}
                </span>
              </div>
              <div>
                <Controller
                  control={control}
                  name="maxWindKmh"
                  render={({ field }) => (
                    <input
                      type="number"
                      min={0}
                      max={150}
                      value={windDisplay(field.value)}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 0;
                        field.onChange(useKnots ? toKmh(v) : v);
                      }}
                      className={inputClass}
                      placeholder={`Max (${windUnit})`}
                    />
                  )}
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  {t("windMax")} : {windDisplay(maxWind)} {windUnit}
                </span>
              </div>
            </div>
            {errors.maxWindKmh && (
              <p className={errorClass}>{errors.maxWindKmh.message}</p>
            )}
          </div>

          {/* Nearest station picker */}
          <div>
            <label className={labelClass}>
              {t("nearestStation")}
              <span className="text-gray-400 font-normal ml-1">
                ({t("nearestStationDesc")})
              </span>
            </label>
            {!lat || !lng ? (
              <p className="text-xs text-gray-400 italic">
                {t("placeSpotFirst")}
              </p>
            ) : loadingStations ? (
              <p className="text-xs text-gray-400 animate-pulse">
                {t("searchingStations")}
              </p>
            ) : nearbyStations.length === 0 ? (
              <p className="text-xs text-gray-400">{t("noStationFound")}</p>
            ) : (
              <Controller
                control={control}
                name="nearestStationId"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    {nearbyStations.map((s) => {
                      const selected = field.value === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() =>
                            field.onChange(selected ? undefined : s.id)
                          }
                          className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                            selected
                              ? "border-sky-500 bg-sky-50"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <Wind
                            className={`h-4 w-4 shrink-0 ${selected ? "text-sky-500" : "text-gray-400"}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-medium truncate ${selected ? "text-sky-700" : "text-gray-700"}`}
                            >
                              {s.name}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {s.dist < 1
                                ? `${Math.round(s.dist * 1000)} m`
                                : `${s.dist.toFixed(1)} km`}{" "}
                              · {s.altitudeM}m alt. ·{" "}
                              {Math.round(s.windSpeedKmh / 1.852)} kts ·{" "}
                              {s.source === "pioupiou"
                                ? "OpenwindMap"
                                : s.source === "netatmo"
                                  ? "Netatmo"
                                  : s.source === "meteofrance"
                                    ? "Météo-France"
                                    : s.source === "windball"
                                      ? "Windball"
                                      : "MeteoSwiss"}
                            </div>
                          </div>
                          {selected && (
                            <span className="text-xs text-sky-600 font-medium shrink-0">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            )}
          </div>

          {/* Best wind directions */}
          <div>
            <label className={labelClass}>{t("bestWindDirections")}</label>
            <Controller
              control={control}
              name="bestWindDirections"
              render={({ field }) => (
                <WindDirectionPicker
                  value={field.value}
                  onChange={field.onChange}
                  size={130}
                />
              )}
            />
          </div>

          {/* Best months */}
          <div>
            <label className={labelClass}>{t("bestMonths")}</label>
            <Controller
              control={control}
              name="bestMonths"
              render={({ field }) => (
                <div className="flex flex-wrap gap-1.5">
                  {MONTHS.map((month, i) => {
                    const val = String(i + 1);
                    const selected = field.value.includes(val);
                    return (
                      <button
                        key={month}
                        type="button"
                        onClick={() => {
                          field.onChange(
                            selected
                              ? field.value.filter((m) => m !== val)
                              : [...field.value, val],
                          );
                        }}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          selected
                            ? "bg-sky-600 text-white"
                            : "bg-gray-100 text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        {month.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Images */}
          <div>
            <label className={labelClass}>{t("imagesMax", { count: 5 })}</label>
            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-3 hover:border-sky-500 transition-colors text-gray-500 hover:text-gray-900 text-sm">
              <Upload className="h-4 w-4" />
              {t("addPhotos")}
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            {(existingImages.length > 0 || imagePreviews.length > 0) && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.caption || ""}
                      className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-white border border-gray-200 p-0.5 text-gray-400 hover:text-gray-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {imagePreviews.map((src, i) => (
                  <div key={`new-${i}`} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-white border border-gray-200 p-0.5 text-gray-400 hover:text-gray-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting || deleting}
            size="lg"
            className="w-full"
          >
            {submitting
              ? t("saving")
              : isEditMode
                ? t("submitEdit")
                : t("submit")}
          </Button>

          {/* Delete spot (edit mode only) */}
          {isEditMode && (
            <div className="pt-4 border-t border-gray-200">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={submitting || deleting}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("deleteSpot")}
                </button>
              ) : (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-3">
                  <p className="text-sm text-red-700 font-medium">
                    {t("deleteConfirm", { name: initialData!.name })}
                  </p>
                  <p className="text-xs text-red-600">{t("deleteWarning")}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {tCommon("cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleting ? t("deleting") : tCommon("confirm")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-[10px] text-gray-400 text-center">
            Toutes les informations sont publiques et modifiables par tous.
          </p>
        </form>
      </div>
    </div>
  );
}
